from config import Config
from impl import LoggerImpl
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from .base import LLMClient

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()

config_obj = Config()
openai_config = config_obj.get_config()["OPENAI"]


class OpenAIClient(LLMClient):
    def __init__(
        self,
        api_key: str = openai_config["API_KEY"],
        model: str = "gpt-4o-mini",
        temperature: float = 0.5,
    ):
        self.model = model
        self.temperature = temperature
        self.api_key = api_key

    def initialize_model(self, **kwargs):
        try:
            model = kwargs.get("model") or self.model
            temperature = kwargs.get("temperature") or self.temperature
            return ChatOpenAI(
                api_key=self.api_key, model=model, temperature=temperature
            )
        except Exception as e:
            logger.error(f"Error initializing model: {str(e)}")
            raise (e)

    def _initialize_runner(self, prompt_template, output_schema=None, **kwargs) -> str:
        try:
            chat_model = self.initialize_model(**kwargs)
            if output_schema:
                runner = prompt_template | chat_model.with_structured_output(
                    schema=output_schema
                )
            else:
                runner = prompt_template | chat_model
            return runner
        except Exception as e:
            logger.error(f"Error initializing runner: {str(e)}")
            raise (e)

    def generate(
        self,
        prompt_template: ChatPromptTemplate,
        query: dict,
        output_schema=None,
        **kwargs,
    ) -> str:
        try:
            runner = self._initialize_runner(
                prompt_template=prompt_template, output_schema=output_schema, **kwargs
            )
            output = runner.invoke(query)
            return output
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise (e)

    async def async_generate(
        self,
        prompt_template: ChatPromptTemplate,
        query: dict,
        output_schema=None,
        **kwargs,
    ) -> str:
        try:
            runner = self._initialize_runner(
                prompt_template=prompt_template, output_schema=output_schema, **kwargs
            )
            output = await runner.ainvoke(query)
            return output
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise (e)
