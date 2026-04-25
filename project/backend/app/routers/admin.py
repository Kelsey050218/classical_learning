from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.models.chapter import Chapter
from app.routers.auth import get_current_user
from app.schemas.reading import ChapterResponse

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to ensure current user is an admin."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.put("/chapters/{chapter_id}", response_model=ChapterResponse)
def update_chapter_content(
    chapter_id: int,
    content: str,
    title: str = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update chapter content (admin only)."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    if title:
        chapter.title = title
    chapter.content = content

    db.commit()
    db.refresh(chapter)
    return chapter


@router.get("/chapters", response_model=List[ChapterResponse])
def list_all_chapters_admin(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all chapters with full content (admin only)."""
    chapters = db.query(Chapter).order_by(Chapter.sort_order).all()
    return chapters
