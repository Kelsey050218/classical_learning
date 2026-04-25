from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.bookmark import Bookmark
from app.models.chapter import Chapter
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/bookmarks", tags=["书签"])


@router.post("", response_model=dict)
def create_bookmark(
    chapter_id: int,
    position_start: int,
    position_end: int,
    note: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    bookmark = Bookmark(
        user_id=current_user.id,
        chapter_id=chapter_id,
        position_start=position_start,
        position_end=position_end,
        note=note
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return {"id": bookmark.id, "message": "书签已添加"}


@router.get("", response_model=List[dict])
def get_bookmarks(
    chapter_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Bookmark).filter(Bookmark.user_id == current_user.id)
    if chapter_id:
        query = query.filter(Bookmark.chapter_id == chapter_id)
    bookmarks = query.order_by(Bookmark.created_at.desc()).all()
    return [
        {
            "id": b.id,
            "chapter_id": b.chapter_id,
            "position_start": b.position_start,
            "position_end": b.position_end,
            "note": b.note,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        }
        for b in bookmarks
    ]


@router.delete("/{bookmark_id}")
def delete_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookmark = db.query(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == current_user.id
    ).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="书签不存在")
    db.delete(bookmark)
    db.commit()
    return {"message": "书签已删除"}
