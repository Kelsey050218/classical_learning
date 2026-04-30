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
    ProgressOut, ArchiveOut, NoteOut,
    DiagnosticSubmit, DiagnosticResult,
    FragmentSubmit, FragmentResult,
    NodeSubmit, NodeResult,
    NoteIn
)
from app.models.restoration import RepairStep
from app.routers.auth import get_current_user

router = APIRouter(prefix="/restoration", tags=["restoration"])


def get_or_create_progress(db: Session, user_id: int, chapter_id: int):
    progress = db.query(RestorationProgress).filter(
        RestorationProgress.user_id == user_id,
        RestorationProgress.chapter_id == chapter_id
    ).first()
    if not progress:
        progress = RestorationProgress(user_id=user_id, chapter_id=chapter_id)
        db.add(progress)
        db.commit()
        db.refresh(progress)
    return progress


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


@router.post("/chapters/{chapter_id}/diagnostic/submit", response_model=DiagnosticResult)
def submit_diagnostic(
    chapter_id: int,
    payload: DiagnosticSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diagnostics = (
        db.query(RestorationDiagnostic)
        .filter(RestorationDiagnostic.chapter_id == chapter_id)
        .order_by(RestorationDiagnostic.sort_order)
        .all()
    )
    correct = 0
    for diag in diagnostics:
        submitted = payload.answers.get(diag.id, "").strip()
        if submitted == diag.correct_answer.strip():
            correct += 1

    progress = get_or_create_progress(db, current_user.id, chapter_id)
    progress.diagnostic_correct = correct
    if correct == len(diagnostics):
        progress.current_step = RepairStep.sorting
    db.commit()

    return DiagnosticResult(correct_count=correct, total=len(diagnostics))


@router.post("/chapters/{chapter_id}/fragments/submit", response_model=FragmentResult)
def submit_fragments(
    chapter_id: int,
    payload: FragmentSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fragments = (
        db.query(RestorationFragment)
        .filter(RestorationFragment.chapter_id == chapter_id)
        .all()
    )
    correct = 0
    for frag in fragments:
        submitted = payload.placements.get(frag.id, "").strip()
        if frag.category.value == submitted:
            correct += 1

    progress = get_or_create_progress(db, current_user.id, chapter_id)
    progress.sorting_correct = correct
    progress.sorting_completed = (correct == len(fragments))
    if correct == len(fragments):
        progress.current_step = RepairStep.sequencing
    db.commit()

    return FragmentResult(correct_count=correct, total=len(fragments))


@router.post("/chapters/{chapter_id}/nodes/submit", response_model=NodeResult)
def submit_nodes(
    chapter_id: int,
    payload: NodeSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    nodes = (
        db.query(RestorationNode)
        .filter(RestorationNode.chapter_id == chapter_id)
        .all()
    )
    node_map = {n.id: n for n in nodes}
    wrong_positions = []
    for idx, node_id in enumerate(payload.order):
        node = node_map.get(node_id)
        if not node or node.correct_order != idx + 1:
            wrong_positions.append(idx)

    is_correct = len(wrong_positions) == 0

    progress = get_or_create_progress(db, current_user.id, chapter_id)
    progress.sequencing_attempts += 1
    if is_correct:
        progress.sequencing_completed = True
        progress.current_step = RepairStep.archive
    db.commit()

    return NodeResult(is_correct=is_correct, wrong_positions=wrong_positions)


@router.post("/chapters/{chapter_id}/archive/note", response_model=NoteOut)
def submit_note(
    chapter_id: int,
    payload: NoteIn,
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
    if note:
        note.note = payload.note
    else:
        note = RestorationNote(
            user_id=current_user.id,
            chapter_id=chapter_id,
            note=payload.note
        )
        db.add(note)

    progress = get_or_create_progress(db, current_user.id, chapter_id)
    progress.archive_completed = True
    progress.current_step = RepairStep.completed
    db.commit()

    return NoteOut(chapter_id=chapter_id, note=payload.note)
