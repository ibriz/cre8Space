import base64
import io

import requests
from constants import SUPPORTED_IMAGE_FILE_TYPE, SUPPORTED_TEXT_FILE_TYPE
from impl import LoggerImpl
from services.llm.utils import generate_image_captions
from tenacity import retry, stop_after_attempt, wait_exponential

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()


def u256_to_blob_id(u256_value):
    u256_value = int(u256_value)
    hex_value = u256_value.to_bytes(32, byteorder="little").hex()
    hex_bytes = bytes.fromhex(hex_value)
    blob_id = base64.urlsafe_b64encode(hex_bytes).rstrip(b"=").decode("ascii")
    return blob_id


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, max=3))
def get_blob_content(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.content
    except Exception as e:
        logger.error(f"Error fetching blob content {str(e)}")
        raise Exception(f"Error fetching blob content {str(e)}")


def convert_to_bytesio(content):
    return io.BytesIO(content)


def encode_image_from_bytes(image_bytes):
    return base64.b64encode(image_bytes).decode("utf-8")


async def process_file_content(file_type, response):
    if file_type in SUPPORTED_TEXT_FILE_TYPE:
        return response.decode("utf-8")
    elif file_type in SUPPORTED_IMAGE_FILE_TYPE:
        base64_encoded_image = encode_image_from_bytes(response)
        return await generate_image_captions(base64_encoded_image=base64_encoded_image)
    else:
        raise Exception("Unsupported file type")
