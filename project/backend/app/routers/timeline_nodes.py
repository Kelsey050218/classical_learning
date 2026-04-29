from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.timeline_node import TimelineNode
from app.models.user import User
from app.models.learning import Timeline
from app.routers.auth import get_current_user
from app.schemas.learning import TimelineCreate, TimelineResponse

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("/nodes", response_model=List[dict])
def list_timeline_nodes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pre-defined timeline nodes (system nodes)."""
    nodes = db.query(TimelineNode).order_by(TimelineNode.sort_order).all()

    result = []
    for node in nodes:
        result.append({
            "id": node.id,
            "era": node.era,
            "period": node.period,
            "title": node.title,
            "content": node.content,
            "key_points": node.key_points or [],
            "sort_order": node.sort_order,
            "image_url": node.image_url,
            "video_urls": node.video_urls or [],
            "created_at": node.created_at.isoformat() if node.created_at else None,
            "updated_at": node.updated_at.isoformat() if node.updated_at else None,
        })

    return result


@router.get("/nodes/{node_id}", response_model=dict)
def get_timeline_node(
    node_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific timeline node."""
    node = db.query(TimelineNode).filter(TimelineNode.id == node_id).first()

    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline node not found"
        )

    return {
        "id": node.id,
        "era": node.era,
        "period": node.period,
        "title": node.title,
        "content": node.content,
        "key_points": node.key_points or [],
        "sort_order": node.sort_order,
        "image_url": node.image_url,
        "video_urls": node.video_urls or [],
        "created_at": node.created_at.isoformat() if node.created_at else None,
        "updated_at": node.updated_at.isoformat() if node.updated_at else None,
    }


@router.get("/my", response_model=List[TimelineResponse])
def list_my_timelines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's custom timeline entries."""
    timelines = db.query(Timeline).filter(
        Timeline.user_id == current_user.id
    ).order_by(Timeline.created_at.desc()).all()

    return timelines


@router.post("/my", response_model=TimelineResponse, status_code=status.HTTP_201_CREATED)
def create_my_timeline(
    timeline_create: TimelineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a custom timeline entry for the current user."""
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
