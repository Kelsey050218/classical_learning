from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random

from app.config.database import get_db
from app.models.user import User
from app.models.restoration import (
    RestorationChapter, RestorationFragment, RestorationDiagnostic,
    RestorationNode, RestorationProgress, RestorationNote
)
from app.schemas.restoration import (
    ChapterOut, FragmentOut, DiagnosticOut, NodeOut,
    ProgressOut, ArchiveOut, NoteOut
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/restoration", tags=["restoration"])


@router.get("/chapters", response_model=List[ChapterOut])
def list_chapters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chapters = db.query(RestorationChapter).order_by(RestorationChapter.sort_order).all()
    return chapters


@router.get("/chapters/{chapter_id}", response_model=ChapterOut)
def get_chapter(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chapter = db.query(RestorationChapter).filter(RestorationChapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


@router.get("/chapters/{chapter_id}/diagnostic", response_model=List[DiagnosticOut])
def get_diagnostics(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diagnostics = (
        db.query(RestorationDiagnostic)
        .filter(RestorationDiagnostic.chapter_id == chapter_id)
        .order_by(RestorationDiagnostic.sort_order)
        .limit(3)
        .all()
    )
    return diagnostics


@router.get("/chapters/{chapter_id}/fragments", response_model=List[FragmentOut])
def get_fragments(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fragments = (
        db.query(RestorationFragment)
        .filter(RestorationFragment.chapter_id == chapter_id)
        .order_by(RestorationFragment.sort_order)
        .all()
    )
    result = [FragmentOut.model_validate(f) for f in fragments]
    random.shuffle(result)
    return result


@router.get("/chapters/{chapter_id}/nodes", response_model=List[NodeOut])
def get_nodes(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    nodes = (
        db.query(RestorationNode)
        .filter(RestorationNode.chapter_id == chapter_id)
        .order_by(RestorationNode.sort_order)
        .all()
    )
    result = [NodeOut.model_validate(n) for n in nodes]
    random.shuffle(result)
    return result


@router.get("/chapters/{chapter_id}/archive", response_model=ArchiveOut)
def get_archive(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chapter = db.query(RestorationChapter).filter(RestorationChapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    note = (
        db.query(RestorationNote)
        .filter(
            RestorationNote.user_id == current_user.id,
            RestorationNote.chapter_id == chapter_id
        )
        .first()
    )

    return ArchiveOut(
        chapter=ChapterOut.model_validate(chapter),
        archive_summary=chapter.archive_summary,
        archive_impact=chapter.archive_impact,
        note=note.note if note else None
    )


@router.get("/progress", response_model=List[ProgressOut])
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progress = (
        db.query(RestorationProgress)
        .filter(RestorationProgress.user_id == current_user.id)
        .all()
    )
    return progress


@router.get("/notes/{chapter_id}", response_model=NoteOut)
def get_note(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = (
        db.query(RestorationNote)
        .filter(
            RestorationNote.user_id == current_user.id,
            RestorationNote.chapter_id == chapter_id
        )
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteOut(chapter_id=chapter_id, note=note.note)
