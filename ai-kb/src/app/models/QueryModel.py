from pydantic import BaseModel


class QueryModel(BaseModel):
    query: str
