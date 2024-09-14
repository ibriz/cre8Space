from langchain.prompts import ChatPromptTemplate

CATEGORY_TAGS_SYSTEM_MESSAGE = """
    You are an intelligent assistant that helps a human analyze text and generate relevant tags based on the content. 
    Generate multiple tags that accurately reflect the key concepts and themes mentioned in the text. 
    Only include tags that are explicitly supported by the content. 
    No preamble.
    """

prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", CATEGORY_TAGS_SYSTEM_MESSAGE),
        (
            "human",
            """
            Text: {text}
            Tags:""",
        ),
    ]
)
