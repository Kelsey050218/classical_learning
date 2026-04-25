from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.highlight import Highlight
from app.models.chapter import Chapter
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/highlights", tags=["高亮"])


@router.post("", response_model=dict)
def create_highlight(
    chapter_id: int,
    position_start: int,
    position_end: int,
    color: str = "yellow",
    quote_text: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    highlight = Highlight(
        user_id=current_user.id,
        chapter_id=chapter_id,
        position_start=position_start,
        position_end=position_end,
        color=color,
        quote_text=quote_text
    )
    db.add(highlight)
    db.commit()
    db.refresh(highlight)
    return {"id": highlight.id, "message": "高亮已添加"}


@router.get("", response_model=List[dict])
def get_highlights(
    chapter_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Highlight).filter(Highlight.user_id == current_user.id)
    if chapter_id:
        query = query.filter(Highlight.chapter_id == chapter_id)
    highlights = query.order_by(Highlight.created_at.desc()).all()
    return [
        {
            "id": h.id,
            "chapter_id": h.chapter_id,
            "position_start": h.position_start,
            "position_end": h.position_end,
            "color": h.color,
            "quote_text": h.quote_text,
            "created_at": h.created_at.isoformat() if h.created_at else None,
        }
        for h in highlights
    ]


@router.delete("/{highlight_id}")
def delete_highlight(
    highlight_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    highlight = db.query(Highlight).filter(
        Highlight.id == highlight_id,
        Highlight.user_id == current_user.id
    ).first()
    if not highlight:
        raise HTTPException(status_code=404, detail="高亮不存在")
    db.delete(highlight)
    db.commit()
    return {"message": "高亮已删除"}
