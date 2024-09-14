from config import Config
from impl import LoggerImpl
from langchain_community.embeddings.huggingface import \
    HuggingFaceInstructEmbeddings

from .qdrant_service import QdrantService

_config = Config()
embedding_config = _config.get_config()["EMBEDDING_MODEL"]

embedding_function = HuggingFaceInstructEmbeddings(**embedding_config)

vector_db = QdrantService(embedding_model=embedding_function)

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()


async def check_collection_exists(collection_name):
    collections = await vector_db.get_collections()
    if collection_name not in collections:
        logger.error(
                f"Vector db collection with name {collection_name} doesnot exist"
            )
        raise Exception(f"Collection {collection_name} doesnot exist")


async def create_if_not_exists(collection_name: str):
    collections = await vector_db.get_collections()
    if collection_name not in collections:
        await vector_db.create_collection(collection_name=collection_name)
        logger.info(f"Collection {collection_name} created successfully")


async def get_similar_documents(collection_name: str, query: str):
    try:
        await check_collection_exists(collection_name)
        similar_docs = await vector_db.similarity_search(
            collection_name=collection_name, 
            query=query
        )
        response = [
            {
                "content": doc.payload["page_content"],
                "metadata": doc.payload["metadata"],
            }
            for doc in similar_docs
        ]
        return response
    except Exception as e:
        logger.error(f"Error fetching similar documents {str(e)}")
        raise e


async def add_chunks_to_vector_db(collection_name: str, chunks):
    try:
        await create_if_not_exists(collection_name=collection_name)
        await vector_db.insert_documents(
            collection_name=collection_name, documents=chunks
        )
    except Exception as e:
        logger.error(f"Error adding documents to vector db {str(e)}")
        raise e

