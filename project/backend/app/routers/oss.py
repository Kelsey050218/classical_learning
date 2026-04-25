import os
import hmac
import hashlib
import base64
import json
import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/oss", tags=["OSS"])

OSS_ACCESS_KEY_ID = os.getenv("OSS_ACCESS_KEY_ID", "")
OSS_ACCESS_KEY_SECRET = os.getenv("OSS_ACCESS_KEY_SECRET", "")
OSS_BUCKET = os.getenv("OSS_BUCKET", "fuzhou-lite")
OSS_ENDPOINT = os.getenv("OSS_ENDPOINT", "oss-cn-hangzhou.aliyuncs.com")


class SignatureRequest(BaseModel):
    filename: str
    dir_prefix: str = "audio/"


@router.post("/signature")
def get_oss_signature(
    req: SignatureRequest,
    current_user: User = Depends(get_current_user),
):
    if not OSS_ACCESS_KEY_ID or not OSS_ACCESS_KEY_SECRET:
        raise HTTPException(status_code=500, detail="OSS 凭证未配置")

    expire_time = int(time.time()) + 600  # 10分钟有效期
    policy = {
        "expiration": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime(expire_time)),
        "conditions": [
            {"bucket": OSS_BUCKET},
            ["starts-with", "$key", req.dir_prefix]
        ]
    }
    policy_str = base64.b64encode(json.dumps(policy).encode())
    signature = base64.b64encode(
        hmac.new(
            OSS_ACCESS_KEY_SECRET.encode(),
            policy_str,
            hashlib.sha1
        ).digest()
    )

    key = f"{req.dir_prefix}{req.filename}"
    return {
        "accessKeyId": OSS_ACCESS_KEY_ID,
        "policy": policy_str.decode(),
        "signature": signature.decode(),
        "host": f"https://{OSS_BUCKET}.{OSS_ENDPOINT}",
        "key": key,
        "url": f"https://{OSS_BUCKET}.{OSS_ENDPOINT}/{key}",
    }
