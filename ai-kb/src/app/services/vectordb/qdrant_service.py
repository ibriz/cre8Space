from typing import List

from config import Config
from impl import LoggerImpl
from langchain_community.vectorstores import Qdrant
from langchain_core.documents import Document
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()

_config = Config()


class QdrantService:
    def __init__(self, embedding_model):
        self.client = self._get_vector_db_client()
        self.embedding_model = embedding_model
        self.vector_size = embedding_model.client[1].word_embedding_dimension

    def _get_vector_db_client(self):
        try:
            url = _config.get_config()["VECTOR_DB"]["URL"]
            if url is None:
                raise Exception("VECTOR_DB_URL is not set")
            client = AsyncQdrantClient(url, prefer_grpc=True, timeout=5)
            return client
        except Exception as e:
            logger.error(f"Vector db client creation failed {str(e)}")
            raise (e)

    async def create_collection(self, collection_name: str):
        try:
            _existing_collection = await self.get_collections()
            if collection_name not in _existing_collection:
                await self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=models.VectorParams(
                        size=self.vector_size, distance=models.Distance.COSINE
                    ),
                )
        except Exception as e:
            logger.error(f"Vector db collection creation failed: {str(e)}")
            raise (e)

    async def get_collections(self):
        try:
            _collections = await self.client.get_collections()
            collections = [collection.name for collection in _collections.collections]
            return collections
        except Exception as e:
            logger.error(f"Vector db collection retrieval failed: {str(e)}")
            raise (e)

    async def insert_documents(self, collection_name: str, documents: List[Document]):
        try:
            return await Qdrant.afrom_documents(
                collection_name=collection_name,
                embedding=self.embedding_model,
                documents=documents,
            )
        except Exception as e:
            logger.error(f"Vector db document insertion failed: {str(e)}")
            raise (e)

    async def similarity_search(
        self, collection_name: str, query: str, threshold: float = 0.6, limit: int = 2
    ):
        try:
            collections = await self.get_collections()
            if collection_name not in collections:
                return []

            query_vector = self.embedding_model.embed_query(query)
            _documents = await self.client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=threshold,
            )
            return _documents
        except Exception as e:
            logger.error(f"Vector db similarity search failed: {str(e)}")
            raise (e)