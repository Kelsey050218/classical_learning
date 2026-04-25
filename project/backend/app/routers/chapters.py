from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.chapter import Chapter
from app.models.reading import ReadingProgress
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.reading import ChapterResponse, ChapterListResponse

router = APIRouter(prefix="/chapters", tags=["chapters"])


@router.get("/", response_model=List[ChapterListResponse])
def get_all_chapters(
    include_content: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all chapters with user's completion status. Optionally include full content."""
    # Get all chapters ordered by sort_order
    chapters = db.query(Chapter).order_by(Chapter.sort_order).all()

    # Get user's reading progress for all chapters
    progress_records = db.query(ReadingProgress).filter(
        ReadingProgress.user_id == current_user.id
    ).all()
    progress_map = {p.chapter_id: p.is_completed for p in progress_records}

    # Build response with completion status
    result = []
    for chapter in chapters:
        item = {
            "id": chapter.id,
            "title": chapter.title,
            "sort_order": chapter.sort_order,
            "is_completed": progress_map.get(chapter.id, False)
        }
        if include_content:
            item["content"] = chapter.content
        result.append(ChapterListResponse(**item))

    return result


@router.get("/{chapter_id}", response_model=ChapterResponse)
def get_chapter_detail(
    chapter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chapter detail with content."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()

    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    return chapter
