import os

from dotenv import find_dotenv, load_dotenv
from impl import LoggerImpl

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()


class Config:
    def __init__(self):
        load_dotenv(find_dotenv())

    def get_config(self):
        try:
            default_config = {
                "EMBEDDING_MODEL": {
                    "model_name": "hkunlp/instructor-base",
                    "model_kwargs": {"device": "cpu"},
                },
                "OPENAI": {"API_KEY": os.environ["OPENAI_API_KEY"]},
                "SUI_WALRUS": {"URL": os.environ["SUI_WALRUS_BACKEND_URL"]},
                "VECTOR_DB": {"URL": os.environ["VECTOR_DB_URL"]},
                "WHITELIST_URL": os.environ["WHITELIST_URL"],
            }
            return default_config
        except Exception as e:
            logger.error(f"Error getting config: {str(e)}")
            raise e
