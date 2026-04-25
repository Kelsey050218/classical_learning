from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.work import Work, WorkType, WorkStatus
from app.models.user import User
from app.routers.auth import get_current_user
from app.services import badge_service
from app.schemas.work import WorkCreate, WorkUpdate, WorkResponse, WorkListResponse

router = APIRouter(prefix="/works", tags=["works"])


@router.post("", response_model=WorkResponse, status_code=status.HTTP_201_CREATED)
def create_work(
    work_create: WorkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new work (video, audio, or script)."""
    db_work = Work(
        user_id=current_user.id,
        work_type=work_create.work_type,
        title=work_create.title,
        description=work_create.description,
        content=work_create.content,
        chapter_id=work_create.chapter_id,
        status=WorkStatus.draft
    )

    db.add(db_work)
    db.commit()
    db.refresh(db_work)

    return db_work


@router.get("", response_model=List[WorkListResponse])
def list_works(
    work_type: Optional[WorkType] = None,
    status: Optional[WorkStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List works with optional filtering. Published works are visible to all,
    draft works only to the owner."""
    query = db.query(Work)

    # Apply filters
    if work_type:
        query = query.filter(Work.work_type == work_type)
    if status:
        query = query.filter(Work.status == status)
    else:
        # Default: show published works from all users + all works from current user
        query = query.filter(
            (Work.status == WorkStatus.published) | (Work.user_id == current_user.id)
        )

    works = query.order_by(Work.created_at.desc()).all()
    return works


@router.get("/my", response_model=List[WorkListResponse])
def list_my_works(
    work_type: Optional[WorkType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List current user's works."""
    query = db.query(Work).filter(Work.user_id == current_user.id)

    if work_type:
        query = query.filter(Work.work_type == work_type)

    works = query.order_by(Work.created_at.desc()).all()
    return works


@router.get("/{work_id}", response_model=WorkResponse)
def get_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific work by ID."""
    work = db.query(Work).filter(Work.id == work_id).first()

    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found"
        )

    # Check permission: published works are public, drafts only for owner
    if work.status == WorkStatus.draft and work.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this work"
        )

    return work


@router.put("/{work_id}", response_model=WorkResponse)
def update_work(
    work_id: int,
    work_update: WorkUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a work. Only the owner can update."""
    work = db.query(Work).filter(
        Work.id == work_id,
        Work.user_id == current_user.id
    ).first()

    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found or you don't have permission"
        )

    # Update fields if provided
    if work_update.title is not None:
        work.title = work_update.title
    if work_update.description is not None:
        work.description = work_update.description
    if work_update.content is not None:
        work.content = work_update.content
    if work_update.chapter_id is not None:
        work.chapter_id = work_update.chapter_id
    if work_update.status is not None:
        work.status = work_update.status

    db.commit()
    db.refresh(work)

    return work


@router.delete("/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a work. Only the owner can delete."""
    work = db.query(Work).filter(
        Work.id == work_id,
        Work.user_id == current_user.id
    ).first()

    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found or you don't have permission"
        )

    db.delete(work)
    db.commit()

    return None


@router.post("/{work_id}/publish", response_model=WorkResponse)
def publish_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish a work to the exhibition hall."""
    work = db.query(Work).filter(
        Work.id == work_id,
        Work.user_id == current_user.id
    ).first()

    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found or you don't have permission"
        )

    work.status = WorkStatus.published
    db.commit()
    db.refresh(work)

    # Check badge eligibility
    badge_service.check_creation_star(db, current_user.id)
    badge_service.check_recitation_star(db, current_user.id)
    badge_service.check_appreciation_star(db, current_user.id)

    return work
