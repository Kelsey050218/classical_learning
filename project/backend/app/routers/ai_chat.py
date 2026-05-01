import json
import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import requests

from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI 对话"])

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = os.getenv("DEEPSEEK_API_URL", "https://api.deepseek.com/chat/completions")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    stream: bool = False


class ChatResponse(BaseModel):
    reply: str


def _build_api_messages(req_messages: List[ChatMessage]):
    return [
        {"role": "system", "content": "你是经典常谈学习助手，专门帮助中学生理解朱自清《经典常谈》。回答要简洁易懂，适合初中生阅读。"},
    ] + [m.model_dump() for m in req_messages]


@router.post("/chat", response_model=ChatResponse)
def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    if not DEEPSEEK_API_KEY:
        raise HTTPException(status_code=500, detail="DeepSeek API Key 未配置")

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": _build_api_messages(req.messages),
        "stream": False,
    }

    try:
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=60)
        if not response.ok:
            error_text = response.text
            print(f"[DeepSeek API Error] status={response.status_code}, body={error_text}")
            raise HTTPException(
                status_code=502,
                detail=f"DeepSeek API 错误 {response.status_code}: {error_text[:500]}",
            )
        data = response.json()

        reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not reply:
            reply = "抱歉，AI 暂时没有回复。"

        return ChatResponse(reply=reply)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 服务异常: {str(e)}")


@router.post("/chat/stream")
def chat_stream(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """Stream AI response using SSE."""
    if not DEEPSEEK_API_KEY:
        raise HTTPException(status_code=500, detail="DeepSeek API Key 未配置")

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": _build_api_messages(req.messages),
        "stream": True,
    }

    def event_generator():
        try:
            response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, stream=True, timeout=60)
            if not response.ok:
                error_text = response.text
                print(f"[DeepSeek Stream Error] status={response.status_code}, body={error_text}")
                yield f"data: {json.dumps({'error': f'DeepSeek API 错误 {response.status_code}'})}\n\n"
                return

            for line in response.iter_lines():
                if not line:
                    continue
                line_str = line.decode("utf-8")
                if not line_str.startswith("data: "):
                    continue
                data_str = line_str[6:]
                if data_str == "[DONE]":
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    break
                try:
                    chunk = json.loads(data_str)
                    content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                    if content:
                        yield f"data: {json.dumps({'content': content})}\n\n"
                except json.JSONDecodeError:
                    continue
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
