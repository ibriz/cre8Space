from pydantic import BaseModel


class IngestModel(BaseModel):
    _id: str
    blob_id: str
    file_type: str
    description: str
    owner: str
    title: str
    tag: str
    __v: str
