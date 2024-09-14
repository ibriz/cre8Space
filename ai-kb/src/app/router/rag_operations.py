import requests
from config import Config
from fastapi import APIRouter, status
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from impl import LoggerImpl
from models import IngestModel, QueryModel
from services.agent import categorize_agent, rag_agent
from services.vectordb.utils import add_chunks_to_vector_db
from utils.file_operations import (get_blob_content, process_file_content,
                                   u256_to_blob_id)
from utils.langchain_utils import create_chunks

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()

router = APIRouter(prefix="/kb", tags=["RAG Operations"])

_config = Config()
SUI_WALRUS_BACKEND_URL = _config.get_config()["SUI_WALRUS"]["URL"]


@router.post("/ingest")
async def ingest_data(data: IngestModel):
    try:
        data = data.model_dump()
        blob_id_u256 = data["blob_id"]
        file_type = data["file_type"]

        blob_id = u256_to_blob_id(blob_id_u256)

        data["blob_id_u256"] = blob_id_u256
        data["blob_id"] = blob_id

        url = f"{SUI_WALRUS_BACKEND_URL}/api/getBlobContent/{blob_id}"
        response = get_blob_content(url)

        text = await process_file_content(file_type, response)

        chunks = create_chunks(document=text, metadata=data)

        if chunks:
            response = await categorize_agent.ainvoke(
                {"documents": chunks, "tags": []}, {"recursion_limit": 100}
            )
            if response.get("tags"):
                tags = set(response["tags"])
                data["tags"] = tags
                chunks = create_chunks(document=text, metadata=data)

            await add_chunks_to_vector_db(collection_name="kb_walrus", chunks=chunks)

            # TODO : update status in db for blob_id updated to "processed"

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Document ingestion completed"},
        )
    except Exception as e:
        logger.error(f"Error ingesting data: {str(e)}")
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/query")
async def query(data: QueryModel):
    try:
        data = data.model_dump()

        response = await rag_agent.ainvoke(
            {
                "messages": [
                    (
                        "system",
                        """As a Question Answering agent your task is to respond to user question by retrieveing the context from the db.
                        You can choose whether to use tool to retrieve from db or not based on user query.
                        DONOT generate response to question apart from greetings and jumbled words if you donot retrieve the context from db.
                        """,
                    ),
                    ("user", data["query"]),
                ]
            }
        )

        docs = response.get("documents", [])
        if docs:
            top2_docs_blobid = list(
                set([doc["metadata"]["blob_id_u256"] for doc in docs])
            )
            if len(top2_docs_blobid) == 1:
                docs = [docs[0]]

            logger.info(f"Sending request to incentivize service: {top2_docs_blobid}")

            url = f"{SUI_WALRUS_BACKEND_URL}/api/incentivizeContent"

            requests.post(url, json={"blob_id": top2_docs_blobid})

            logger.info("Call to incentivize service successfull")

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Query response generated successfully",
                "data": {
                    "response": response.get("answer", ""),
                    "references": docs,
                },
            },
        )
    except Exception as e:
        logger.error(f"Error querying: {str(e)}")
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
