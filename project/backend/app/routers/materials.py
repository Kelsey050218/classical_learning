from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.reading import Annotation
from app.models.reading_card import ReadingCard
from app.models.work import Work, WorkStatus
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/materials", tags=["materials"])


@router.get("", response_model=dict)
def get_user_materials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregate all user learning materials."""
    annotations = db.query(Annotation).filter(
        Annotation.user_id == current_user.id
    ).order_by(Annotation.created_at.desc()).all()

    reading_cards = db.query(ReadingCard).filter(
        ReadingCard.user_id == current_user.id
    ).order_by(ReadingCard.created_at.desc()).all()

    works = db.query(Work).filter(
        Work.user_id == current_user.id
    ).order_by(Work.created_at.desc()).all()

    return {
        "annotations": [
            {
                "id": a.id,
                "chapter_id": a.chapter_id,
                "content": a.content,
                "annotation_type": a.annotation_type,
                "created_at": a.created_at,
            }
            for a in annotations
        ],
        "reading_cards": [
            {
                "id": c.id,
                "chapter_id": c.chapter_id,
                "card_template": c.card_template,
                "fields": c.fields,
                "status": c.status,
                "created_at": c.created_at,
            }
            for c in reading_cards
        ],
        "works": [
            {
                "id": w.id,
                "work_type": w.work_type.value if hasattr(w.work_type, 'value') else str(w.work_type),
                "title": w.title,
                "description": w.description,
                "status": w.status.value if hasattr(w.status, 'value') else str(w.status),
                "created_at": w.created_at,
            }
            for w in works
        ],
    }
