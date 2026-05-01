import json
import os
import time
import threading
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
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

BAIDU_ASR_API_KEY = os.getenv("BAIDU_ASR_API_KEY", "")
BAIDU_ASR_SECRET_KEY = os.getenv("BAIDU_ASR_SECRET_KEY", "")
BAIDU_TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token"
BAIDU_ASR_URL = "https://vop.baidu.com/server_api"
# 1537 = 普通话（支持简单的英文识别）
BAIDU_ASR_DEV_PID = int(os.getenv("BAIDU_ASR_DEV_PID", "1537"))

_baidu_token_cache = {"token": "", "expires_at": 0.0}
_baidu_token_lock = threading.Lock()


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


class AsrResponse(BaseModel):
    text: str


def _get_baidu_token() -> str:
    """获取百度 access_token，缓存 25 天（官方有效期 30 天，留点余量）。"""
    now = time.time()
    with _baidu_token_lock:
        if _baidu_token_cache["token"] and _baidu_token_cache["expires_at"] > now:
            return _baidu_token_cache["token"]

        if not BAIDU_ASR_API_KEY or not BAIDU_ASR_SECRET_KEY:
            raise HTTPException(status_code=500, detail="百度 ASR 凭证未配置")

        try:
            resp = requests.get(
                BAIDU_TOKEN_URL,
                params={
                    "grant_type": "client_credentials",
                    "client_id": BAIDU_ASR_API_KEY,
                    "client_secret": BAIDU_ASR_SECRET_KEY,
                },
                timeout=10,
            )
            data = resp.json()
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"百度 token 获取失败: {e}")

        token = data.get("access_token")
        if not token:
            raise HTTPException(
                status_code=502,
                detail=f"百度 token 响应异常: {data.get('error_description') or data}",
            )
        expires_in = int(data.get("expires_in", 2592000))
        _baidu_token_cache["token"] = token
        _baidu_token_cache["expires_at"] = now + min(expires_in, 25 * 24 * 3600)
        return token


@router.post("/asr", response_model=AsrResponse)
async def asr(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    短语音识别。前端发送 16kHz 单声道 16-bit PCM WAV 文件。
    返回识别后的中文文本。
    """
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="未收到音频数据")
    if len(audio_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="音频过大，请控制在 60 秒以内")

    token = _get_baidu_token()

    try:
        resp = requests.post(
            BAIDU_ASR_URL,
            params={
                "dev_pid": BAIDU_ASR_DEV_PID,
                "cuid": f"classics-user-{current_user.id}",
                "token": token,
            },
            data=audio_bytes,
            headers={"Content-Type": "audio/wav;rate=16000"},
            timeout=30,
        )
        result = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"百度 ASR 调用失败: {e}")

    err_no = result.get("err_no", 0)
    if err_no != 0:
        err_msg = result.get("err_msg", "unknown")
        print(f"[Baidu ASR Error] err_no={err_no}, err_msg={err_msg}")
        raise HTTPException(
            status_code=502,
            detail=f"语音识别失败 ({err_no}): {err_msg}",
        )

    texts = result.get("result", [])
    text = (texts[0] if texts else "").strip()
    return AsrResponse(text=text)

