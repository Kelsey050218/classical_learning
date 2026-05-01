from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.learning import UserBadge, BadgeType
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/badges", tags=["badges"])


BADGE_DEFINITIONS = [
    {
        "type": "reading_star",
        "name": "阅读之星",
        "description": "完成所有章节的阅读",
        "icon": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/badges/%E9%98%85%E8%AF%BB%E4%B9%8B%E6%98%9F.png",
    },
    {
        "type": "thinking_star",
        "name": "思辨之星",
        "description": "在论坛发表3篇以上观点",
        "icon": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/badges/%E6%80%9D%E8%BE%A8%E4%B9%8B%E6%98%9F.png",
    },
    {
        "type": "creation_star",
        "name": "创作之星",
        "description": "发布第一件作品",
        "icon": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/badges/%E5%88%9B%E4%BD%9C%E4%B9%8B%E6%98%9F.png",
    },
    {
        "type": "recitation_star",
        "name": "朗诵之星",
        "description": "发布音频作品",
        "icon": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/badges/%E6%9C%97%E8%AF%B5%E4%B9%8B%E6%98%9F.png",
    },
    {
        "type": "appreciation_star",
        "name": "鉴赏之星",
        "description": "发布视频作品",
        "icon": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/badges/%E9%89%B4%E8%B5%8F%E4%B9%8B%E6%98%9F.png",
    },
    {
        "type": "checkin_star",
        "name": "打卡之星",
        "description": "连续打卡7天",
        "icon": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/badges/%E6%89%93%E5%8D%A1%E4%B9%8B%E6%98%9F.png",
    },
]


@router.get("", response_model=List[dict])
def get_all_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all badge definitions with user's unlock status."""
    # Get user's badges
    user_badges = db.query(UserBadge).filter(
        UserBadge.user_id == current_user.id
    ).all()
    badge_map = {b.badge_type.value: b for b in user_badges}

    result = []
    for badge_def in BADGE_DEFINITIONS:
        user_badge = badge_map.get(badge_def["type"])
        result.append({
            **badge_def,
            "is_unlocked": user_badge is not None,
            "awarded_at": user_badge.awarded_at if user_badge else None,
            "reason": user_badge.reason if user_badge else None,
        })

    return result


@router.get("/my", response_model=List[dict])
def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's unlocked badges."""
    badges = db.query(UserBadge).filter(
        UserBadge.user_id == current_user.id
    ).order_by(UserBadge.awarded_at.desc()).all()

    badge_map = {b["type"]: b for b in BADGE_DEFINITIONS}

    return [
        {
            "type": b.badge_type.value,
            "name": badge_map.get(b.badge_type.value, {}).get("name", b.badge_type.value),
            "description": badge_map.get(b.badge_type.value, {}).get("description", ""),
            "icon": badge_map.get(b.badge_type.value, {}).get("icon", ""),
            "awarded_at": b.awarded_at,
            "reason": b.reason,
        }
        for b in badges
    ]
