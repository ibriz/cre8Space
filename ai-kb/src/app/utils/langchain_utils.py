from langchain.docstore.document import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


def create_langchain_document_obj(metadata, content):
    return Document(metadata=metadata, page_content=content)


def create_chunks(document, metadata):
    _chunks = RecursiveCharacterTextSplitter(
        separators=[
            "\n\n",
            "\n",
            " ",
            ".",
            ",",
            "\u200b",
            "\uff0c",
            "\u3001",
            "\uff0e",
            "\u3002",
            "",
        ],
        chunk_size=1024,
        chunk_overlap=100,
    ).split_documents(
        [create_langchain_document_obj(content=document, metadata=metadata)]
    )
    return _chunks
