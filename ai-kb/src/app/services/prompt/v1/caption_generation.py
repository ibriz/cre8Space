from langchain.schema.messages import HumanMessage


def get_messages_from_url(img_base64):
    return [
        (
            "system",
            "You are an AI assistant who is good at generating caption of images",
        ),
        HumanMessage(
            content=[
                {"type": "text", "text": "What do you see on this image? Explain without mentioning this image shows and other preamble"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{img_base64}",
                        "detail": "auto",
                    },
                },
            ]
        ),
    ]
