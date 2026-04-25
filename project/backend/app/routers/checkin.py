from typing import List
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config.database import get_db
from app.models.checkin import CheckIn
from app.models.user import User
from app.routers.auth import get_current_user
from app.services import badge_service

router = APIRouter(prefix="/checkin", tags=["checkin"])


@router.post("", response_model=dict)
def checkin(
    content: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check in for today."""
    today = date.today()

    # Check if already checked in today
    existing = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.checkin_date == today
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today"
        )

    # Calculate consecutive days
    yesterday = today - timedelta(days=1)
    yesterday_checkin = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.checkin_date == yesterday
    ).first()

    consecutive_days = 1
    if yesterday_checkin:
        consecutive_days = yesterday_checkin.consecutive_days + 1

    checkin_record = CheckIn(
        user_id=current_user.id,
        checkin_date=today,
        consecutive_days=consecutive_days,
        content=content
    )
    db.add(checkin_record)
    db.commit()
    db.refresh(checkin_record)

    # Check badge eligibility
    badge_service.check_checkin_star(db, current_user.id)

    return {
        "checkin_date": checkin_record.checkin_date,
        "consecutive_days": checkin_record.consecutive_days,
        "content": checkin_record.content,
    }


@router.get("", response_model=dict)
def get_checkin_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's checkin status and history."""
    checkins = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id
    ).order_by(CheckIn.checkin_date.desc()).all()

    today = date.today()
    is_checked_in_today = any(c.checkin_date == today for c in checkins)

    # Get max consecutive days
    max_consecutive = 0
    if checkins:
        max_consecutive = max(c.consecutive_days for c in checkins)

    return {
        "is_checked_in_today": is_checked_in_today,
        "total_checkins": len(checkins),
        "max_consecutive_days": max_consecutive,
        "current_consecutive_days": checkins[0].consecutive_days if checkins and checkins[0].checkin_date == today else (
            checkins[0].consecutive_days if checkins and checkins[0].checkin_date == today - timedelta(days=1) else 0
        ),
        "checkins": [
            {
                "date": c.checkin_date,
                "consecutive_days": c.consecutive_days,
                "content": c.content,
            }
            for c in checkins
        ]
    }


@router.get("/calendar", response_model=dict)
def get_checkin_calendar(
    year: int = date.today().year,
    month: int = date.today().month,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get checkin calendar for a month."""
    from calendar import monthrange
    _, last_day = monthrange(year, month)

    checkins = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.checkin_date >= date(year, month, 1),
        CheckIn.checkin_date <= date(year, month, last_day)
    ).all()

    checkin_dates = {c.checkin_date.day for c in checkins}

    return {
        "year": year,
        "month": month,
        "checkin_dates": list(checkin_dates),
        "total_days": len(checkin_dates),
    }
