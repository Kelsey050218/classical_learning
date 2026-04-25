from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.annotation_demo import AnnotationDemo
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/annotation-demos", tags=["annotation-demos"])


@router.get("/chapter/{chapter_id}", response_model=List[dict])
def get_chapter_demos(
    chapter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get annotation demos for a chapter."""
    demos = db.query(AnnotationDemo).filter(
        AnnotationDemo.chapter_id == chapter_id
    ).order_by(AnnotationDemo.id).all()

    return [
        {
            "id": d.id,
            "chapter_id": d.chapter_id,
            "demo_type": d.demo_type,
            "selected_text": d.selected_text,
            "content": d.content,
            "explanation": d.explanation,
        }
        for d in demos
    ]
