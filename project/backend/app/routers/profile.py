from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.literacy_radar import RadarPayload
from app.services.literacy_radar import compute_radar

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/literacy-radar", response_model=RadarPayload)
def get_literacy_radar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """返回当前学生的 8 维阅读素养雷达 payload。"""
    return compute_radar(current_user.id, db)
