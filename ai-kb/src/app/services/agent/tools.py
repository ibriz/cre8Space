from typing import List

from impl import LoggerImpl
from langchain.pydantic_v1 import BaseModel
from langchain_core.tools import tool
from services.llm.utils import openai_client
from services.prompt.v1.categorize_text import \
    prompt_template as categorize_text_prompt_template
from services.vectordb.utils import get_similar_documents

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()


@tool
async def documents_retriever(query: str):
    """
    Retrieve documents that is similar to query from the vector store.
    Useful for providing the context to LLM when performing Question-Answering tasks.
    """
    try:
        similar_docs = await get_similar_documents(
            collection_name="kb_walrus", query=query
        )
        return similar_docs
    except Exception as e:
        logger.error(f"Agent Error: Failed to retrieve similar documents {str(e)}")
        raise (e)


@tool
async def generate_category_tags(chunk: str):
    """
    Generate the category for the provided chunk
    """
    try:

        class Tags(BaseModel):
            tags: List[str]

        response = await openai_client.async_generate(
            prompt_template=categorize_text_prompt_template,
            query={"text": chunk},
            output_schema=Tags,
        )

        return response.tags

    except Exception as e:
        logger.error(f"Ingest Agent Error in generating category {str(e)}")
        raise e
