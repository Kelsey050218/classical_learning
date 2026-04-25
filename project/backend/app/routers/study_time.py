from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List

from app.config.database import get_db
from app.models.study_time import StudyTimeLog
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/study-time", tags=["学习时长"])


@router.post("/log")
def log_study_time(
    duration_seconds: int,
    chapter_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """记录学习时长（心跳包，每次增量）"""
    if duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="时长必须大于0")

    log = StudyTimeLog(
        user_id=current_user.id,
        chapter_id=chapter_id,
        duration_seconds=duration_seconds,
        session_date=date.today(),
    )
    db.add(log)
    db.commit()
    return {"message": "记录成功", "duration_seconds": duration_seconds}


@router.get("/today")
def get_today_study_time(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取今日累计学习时长（秒）"""
    total = (
        db.query(func.sum(StudyTimeLog.duration_seconds))
        .filter(
            StudyTimeLog.user_id == current_user.id,
            StudyTimeLog.session_date == date.today(),
        )
        .scalar()
    )
    return {"total_seconds": total or 0}


@router.get("/weekly")
def get_weekly_study_time(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取最近7天每日学习时长"""
    today = date.today()
    week_ago = today - timedelta(days=6)

    rows = (
        db.query(
            StudyTimeLog.session_date,
            func.sum(StudyTimeLog.duration_seconds).label("total"),
        )
        .filter(
            StudyTimeLog.user_id == current_user.id,
            StudyTimeLog.session_date >= week_ago,
        )
        .group_by(StudyTimeLog.session_date)
        .order_by(StudyTimeLog.session_date)
        .all()
    )

    result = []
    for i in range(7):
        d = week_ago + timedelta(days=i)
        day_total = next((r.total for r in rows if r.session_date == d), 0)
        result.append({
            "date": d.isoformat(),
            "day_of_week": d.strftime("%a"),
            "total_seconds": day_total,
        })

    return result
