from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.reading_card import ReadingCard
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/reading-cards", tags=["reading-cards"])


class ReadingCardCreate(BaseModel):
    card_template: int
    fields: dict
    chapter_id: Optional[int] = None


class ReadingCardUpdate(BaseModel):
    fields: dict
    chapter_id: Optional[int] = None
    status: Optional[str] = None


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_reading_card(
    req: ReadingCardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new reading card."""
    card = ReadingCard(
        user_id=current_user.id,
        chapter_id=req.chapter_id,
        card_template=req.card_template,
        fields=req.fields,
        status="draft"
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return {
        "id": card.id,
        "user_id": card.user_id,
        "chapter_id": card.chapter_id,
        "card_template": card.card_template,
        "fields": card.fields,
        "status": card.status,
        "created_at": card.created_at,
        "updated_at": card.updated_at,
    }


@router.get("/my", response_model=List[dict])
def list_my_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List current user's reading cards."""
    cards = db.query(ReadingCard).filter(
        ReadingCard.user_id == current_user.id
    ).order_by(ReadingCard.created_at.desc()).all()

    return [
        {
            "id": c.id,
            "chapter_id": c.chapter_id,
            "card_template": c.card_template,
            "fields": c.fields,
            "status": c.status,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        }
        for c in cards
    ]


@router.get("/{card_id}", response_model=dict)
def get_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific reading card."""
    card = db.query(ReadingCard).filter(
        ReadingCard.id == card_id,
        ReadingCard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    return {
        "id": card.id,
        "chapter_id": card.chapter_id,
        "card_template": card.card_template,
        "fields": card.fields,
        "status": card.status,
        "created_at": card.created_at,
        "updated_at": card.updated_at,
    }


@router.put("/{card_id}", response_model=dict)
def update_card(
    card_id: int,
    req: ReadingCardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a reading card."""
    card = db.query(ReadingCard).filter(
        ReadingCard.id == card_id,
        ReadingCard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    card.fields = req.fields
    if req.chapter_id is not None:
        card.chapter_id = req.chapter_id
    if req.status is not None:
        card.status = req.status

    db.commit()
    db.refresh(card)
    return {
        "id": card.id,
        "chapter_id": card.chapter_id,
        "card_template": card.card_template,
        "fields": card.fields,
        "status": card.status,
        "created_at": card.created_at,
        "updated_at": card.updated_at,
    }


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a reading card."""
    card = db.query(ReadingCard).filter(
        ReadingCard.id == card_id,
        ReadingCard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    db.delete(card)
    db.commit()
    return None
