from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.note import Note
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["笔记"])


class NoteCreate(BaseModel):
    title: str
    content: str
    chapter_id: Optional[int] = None
    images: Optional[list] = None
    category: Optional[str] = None
    tags: Optional[list] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    images: Optional[list] = None
    category: Optional[str] = None
    tags: Optional[list] = None


@router.post("", response_model=dict)
def create_note(
    req: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = Note(
        user_id=current_user.id,
        chapter_id=req.chapter_id,
        title=req.title,
        content=req.content,
        images=req.images or [],
        category=req.category,
        tags=req.tags or [],
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "message": "笔记已保存"}


@router.get("", response_model=List[dict])
def get_notes(
    chapter_id: int = None,
    category: str = None,
    search: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Note).filter(Note.user_id == current_user.id)
    if chapter_id:
        query = query.filter(Note.chapter_id == chapter_id)
    if category:
        query = query.filter(Note.category == category)
    if search:
        query = query.filter(
            Note.title.contains(search) | Note.content.contains(search)
        )
    notes = query.order_by(Note.updated_at.desc()).all()
    return [
        {
            "id": n.id,
            "chapter_id": n.chapter_id,
            "title": n.title,
            "content": n.content,
            "images": n.images or [],
            "category": n.category,
            "tags": n.tags or [],
            "created_at": n.created_at.isoformat() if n.created_at else None,
            "updated_at": n.updated_at.isoformat() if n.updated_at else None,
        }
        for n in notes
    ]


@router.put("/{note_id}", response_model=dict)
def update_note(
    note_id: int,
    req: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    if req.title is not None:
        note.title = req.title
    if req.content is not None:
        note.content = req.content
    if req.images is not None:
        note.images = req.images
    if req.category is not None:
        note.category = req.category
    if req.tags is not None:
        note.tags = req.tags
    db.commit()
    db.refresh(note)
    return {"id": note.id, "message": "笔记已更新"}


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    db.delete(note)
    db.commit()
    return {"message": "笔记已删除"}
