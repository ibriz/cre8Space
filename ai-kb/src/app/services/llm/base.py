from abc import ABC, abstractmethod
from typing import Dict

from langchain.prompts import ChatPromptTemplate


class LLMClient(ABC):
    @abstractmethod
    def generate(
        self,
        prompt_template: ChatPromptTemplate,
        query: Dict,
        output_schema: None,
        **kwargs
    ):
        pass
