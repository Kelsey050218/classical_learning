from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.golden_quote import GoldenQuote
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/golden-quotes", tags=["金句摘抄"])


class GoldenQuoteCreate(BaseModel):
    quote_text: str
    chapter_id: Optional[int] = None
    position_start: Optional[int] = None
    position_end: Optional[int] = None
    source_chapter: Optional[str] = None
    tags: Optional[list] = None
    note: Optional[str] = None


@router.post("", response_model=dict)
def create_golden_quote(
    req: GoldenQuoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quote = GoldenQuote(
        user_id=current_user.id,
        chapter_id=req.chapter_id,
        position_start=req.position_start,
        position_end=req.position_end,
        quote_text=req.quote_text,
        source_chapter=req.source_chapter,
        tags=req.tags or [],
        note=req.note,
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return {"id": quote.id, "message": "金句已收藏"}


@router.get("", response_model=List[dict])
def get_golden_quotes(
    chapter_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(GoldenQuote).filter(GoldenQuote.user_id == current_user.id)
    if chapter_id:
        query = query.filter(GoldenQuote.chapter_id == chapter_id)
    quotes = query.order_by(GoldenQuote.created_at.desc()).all()
    return [
        {
            "id": q.id,
            "chapter_id": q.chapter_id,
            "position_start": q.position_start,
            "position_end": q.position_end,
            "quote_text": q.quote_text,
            "source_chapter": q.source_chapter,
            "tags": q.tags or [],
            "note": q.note,
            "created_at": q.created_at.isoformat() if q.created_at else None,
        }
        for q in quotes
    ]


@router.delete("/{quote_id}")
def delete_golden_quote(
    quote_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quote = db.query(GoldenQuote).filter(
        GoldenQuote.id == quote_id, GoldenQuote.user_id == current_user.id
    ).first()
    if not quote:
        raise HTTPException(status_code=404, detail="金句不存在")
    db.delete(quote)
    db.commit()
    return {"message": "金句已删除"}
