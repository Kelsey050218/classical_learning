from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.learning import Timeline
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.learning import TimelineCreate, TimelineUpdate, TimelineResponse

router = APIRouter(prefix="/learning", tags=["timeline"])


@router.post("/timeline", response_model=TimelineResponse, status_code=status.HTTP_201_CREATED)
def create_timeline(
    timeline_create: TimelineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new timeline entry for the user."""
    db_timeline = Timeline(
        user_id=current_user.id,
        title=timeline_create.title,
        content=timeline_create.content,
        image_url=timeline_create.image_url
    )

    db.add(db_timeline)
    db.commit()
    db.refresh(db_timeline)

    return db_timeline


@router.get("/timeline", response_model=List[TimelineResponse])
def list_timelines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all timeline entries for the current user."""
    timelines = db.query(Timeline).filter(
        Timeline.user_id == current_user.id
    ).order_by(Timeline.created_at.desc()).all()

    return timelines


@router.get("/timeline/{timeline_id}", response_model=TimelineResponse)
def get_timeline(
    timeline_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific timeline entry."""
    timeline = db.query(Timeline).filter(
        Timeline.id == timeline_id,
        Timeline.user_id == current_user.id
    ).first()

    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline not found"
        )

    return timeline


@router.put("/timeline/{timeline_id}", response_model=TimelineResponse)
def update_timeline(
    timeline_id: int,
    timeline_update: TimelineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a timeline entry."""
    timeline = db.query(Timeline).filter(
        Timeline.id == timeline_id,
        Timeline.user_id == current_user.id
    ).first()

    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline not found"
        )

    # Update fields if provided
    if timeline_update.title is not None:
        timeline.title = timeline_update.title
    if timeline_update.content is not None:
        timeline.content = timeline_update.content
    if timeline_update.image_url is not None:
        timeline.image_url = timeline_update.image_url

    db.commit()
    db.refresh(timeline)

    return timeline


@router.delete("/timeline/{timeline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timeline(
    timeline_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a timeline entry."""
    timeline = db.query(Timeline).filter(
        Timeline.id == timeline_id,
        Timeline.user_id == current_user.id
    ).first()

    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline not found"
        )

    db.delete(timeline)
    db.commit()

    return None
