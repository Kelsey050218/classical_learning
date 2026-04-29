from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.chapter import Chapter
from app.models.reading import ReadingProgress, Annotation
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.reading import (
    ReadingProgressUpdate,
    ReadingProgressResponse,
    AnnotationCreate,
    AnnotationResponse,
    AnnotationListResponse,
)
from app.services import badge_service

router = APIRouter(prefix="/reading", tags=["reading"])


@router.put("/progress/{chapter_id}", response_model=ReadingProgressResponse)
def update_reading_progress(
    chapter_id: int,
    progress_update: ReadingProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update reading progress for a chapter."""
    # Verify chapter exists
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    # Find or create progress record
    progress = db.query(ReadingProgress).filter(
        ReadingProgress.user_id == current_user.id,
        ReadingProgress.chapter_id == chapter_id
    ).first()

    if not progress:
        # First chapter default unlocked
        is_unlocked = chapter.sort_order == 0
        progress = ReadingProgress(
            user_id=current_user.id,
            chapter_id=chapter_id,
            current_position=progress_update.current_position,
            is_completed=progress_update.is_completed,
            is_unlocked=is_unlocked,
            last_read_at=datetime.utcnow()
        )
        db.add(progress)
    else:
        progress.current_position = progress_update.current_position
        progress.is_completed = progress_update.is_completed
        progress.last_read_at = datetime.utcnow()

    db.commit()
    db.refresh(progress)

    # Check badge eligibility
    badge_service.check_reading_star(db, current_user.id)

    return progress


@router.get("/chapters/unlock-status", response_model=List[dict])
def get_unlock_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get unlock status for all chapters."""
    chapters = db.query(Chapter).order_by(Chapter.sort_order).all()
    progress_list = db.query(ReadingProgress).filter(
        ReadingProgress.user_id == current_user.id
    ).all()
    progress_map = {p.chapter_id: p for p in progress_list}

    result = []
    for chapter in chapters:
        progress = progress_map.get(chapter.id)
        # First chapter always unlocked by default
        is_unlocked = (progress.is_unlocked if progress else False) or chapter.sort_order == 0
        result.append({
            "chapter_id": chapter.id,
            "sort_order": chapter.sort_order,
            "title": chapter.title,
            "is_unlocked": is_unlocked,
            "is_completed": progress.is_completed if progress else False,
        })
    return result


@router.get("/progress/", response_model=List[ReadingProgressResponse])
def get_reading_progress_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's reading progress list."""
    progress_list = db.query(ReadingProgress).filter(
        ReadingProgress.user_id == current_user.id
    ).all()

    return progress_list


@router.post("/annotations/{chapter_id}", response_model=AnnotationResponse, status_code=status.HTTP_201_CREATED)
def create_annotation(
    chapter_id: int,
    annotation_create: AnnotationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new annotation for a chapter."""
    # Verify chapter exists
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    # Validate annotation type
    valid_types = ["mark", "question", "connection", "insight"]
    if annotation_create.annotation_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid annotation_type. Must be one of: {', '.join(valid_types)}"
        )

    annotation = Annotation(
        user_id=current_user.id,
        chapter_id=chapter_id,
        position_start=annotation_create.position_start,
        position_end=annotation_create.position_end,
        content=annotation_create.content,
        annotation_type=annotation_create.annotation_type,
        mark_symbol=annotation_create.mark_symbol,
    )

    db.add(annotation)
    db.commit()
    db.refresh(annotation)

    return annotation


@router.get("/annotations/{chapter_id}", response_model=AnnotationListResponse)
def get_chapter_annotations(
    chapter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's annotations for a chapter."""
    # Verify chapter exists
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    annotations = db.query(Annotation).filter(
        Annotation.user_id == current_user.id,
        Annotation.chapter_id == chapter_id
    ).order_by(Annotation.position_start).all()

    return AnnotationListResponse(
        annotations=annotations,
        total=len(annotations)
    )
