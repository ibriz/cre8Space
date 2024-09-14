from typing import List

from langchain.docstore.document import Document
from langgraph.graph.message import MessagesState


class RAGGraphState(MessagesState):
    documents: List[dict]
    answer: str


class IngestGraphState(MessagesState):
    documents: List[Document]
    tags: List[str]
