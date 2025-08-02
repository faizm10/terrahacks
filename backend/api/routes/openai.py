from fastapi import APIRouter, HTTPException
import openai
import os
from dotenv import load_dotenv
from api.types.openai_types import (
    ChatCompletionRequest, 
    ChatCompletionResponse,
    Message,
    Choice,
    Usage
)

load_dotenv()

router = APIRouter()

DEFAULT_MODEL = "gpt-4"
openai.api_key = os.getenv("OPENAI_API_KEY")


@router.post("/chat/completions")
async def create_chat_completion(request: ChatCompletionRequest) -> ChatCompletionResponse:
    try:
        client = openai.OpenAI()
        
        completion = client.chat.completions.create(
            model=request.model,
            messages=[{"role": msg.role, "content": msg.content} for msg in request.messages],
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        return ChatCompletionResponse(
            id=completion.id,
            object=completion.object,
            created=completion.created,
            model=completion.model,
            choices=[
                Choice(
                    index=choice.index,
                    message=Message(
                        role=choice.message.role,
                        content=choice.message.content
                    ),
                    finish_reason=choice.finish_reason
                ) for choice in completion.choices
            ],
            usage=Usage(
                prompt_tokens=completion.usage.prompt_tokens,
                completion_tokens=completion.usage.completion_tokens,
                total_tokens=completion.usage.total_tokens
            )
        )

    except openai.OpenAIError as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")