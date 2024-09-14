from impl import LoggerImpl
from langchain_core.runnables import RunnableLambda
from services.prompt.v1.caption_generation import get_messages_from_url
from services.prompt.v1.qa import prompt_template as qa_prompt_tempalte

from .custom_openai_client import OpenAIClient

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()

openai_client = OpenAIClient()


async def generate_qa_response(
    query: str, context: str, model: str = None, temperature: float = None
):
    try:
        response = await openai_client.async_generate(
            prompt_template=qa_prompt_tempalte,
            query={"question": query, "context": context},
            model=model,
            temperature=temperature,
        )
        return response.content
    except Exception as e:
        logger.error(f"Error generating QA response: {str(e)}")
        raise (e)


async def generate_image_captions(
    base64_encoded_image, model: str = "gpt-4o", temperature: float = None
):
    try:
        prompt_template = RunnableLambda(get_messages_from_url)
        response = await openai_client.async_generate(
            prompt_template=prompt_template,
            model=model,
            query=base64_encoded_image,
            temperature=temperature,
        )
        return response.content
    except Exception as e:
        logger.error(f"Error generating image caption: {str(e)}")
        raise (e)
