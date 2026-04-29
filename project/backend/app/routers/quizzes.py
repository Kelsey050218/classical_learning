from typing import List, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.quiz import Quiz, Question, QuizAttempt
from app.models.user import User
from app.models.chapter import Chapter
from app.models.reading import ReadingProgress
from app.models.checkin import CheckIn
from app.routers.auth import get_current_user

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("", response_model=List[dict])
def list_quizzes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all quizzes with user's attempt status."""
    quizzes = db.query(Quiz).order_by(Quiz.sort_order).all()

    # Get user's attempts
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).all()
    attempt_map = {a.quiz_id: a for a in attempts}

    result = []
    for quiz in quizzes:
        attempt = attempt_map.get(quiz.id)
        result.append({
            "id": quiz.id,
            "title": quiz.title,
            "chapter_id": quiz.chapter_id,
            "level": quiz.level,
            "sort_order": quiz.sort_order,
            "description": quiz.description,
            "pass_score": quiz.pass_score,
            "is_attempted": attempt is not None,
            "is_passed": attempt.is_passed if attempt else False,
            "best_score": attempt.score if attempt else None,
        })

    return result


@router.get("/{quiz_id}/questions", response_model=List[dict])
def get_quiz_questions(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get questions for a quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(Question).filter(
        Question.quiz_id == quiz_id
    ).order_by(Question.sort_order).all()

    return [
        {
            "id": q.id,
            "question_type": q.question_type,
            "content": q.content,
            "options": q.options,
            "score": q.score,
            "sort_order": q.sort_order,
        }
        for q in questions
    ]


@router.post("/{quiz_id}/submit", response_model=dict)
def submit_quiz(
    quiz_id: int,
    answers: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit quiz answers and unlock next chapter."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Save attempt (no scoring)
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        answers=answers,
        score=0,
        is_passed=True
    )
    db.add(attempt)

    # Unlock next chapter
    current_chapter = db.query(Chapter).filter(Chapter.id == quiz.chapter_id).first()
    if current_chapter:
        next_chapter = db.query(Chapter).filter(
            Chapter.sort_order == current_chapter.sort_order + 1
        ).first()
        if next_chapter:
            next_progress = db.query(ReadingProgress).filter(
                ReadingProgress.user_id == current_user.id,
                ReadingProgress.chapter_id == next_chapter.id
            ).first()
            if next_progress:
                next_progress.is_unlocked = True
            else:
                next_progress = ReadingProgress(
                    user_id=current_user.id,
                    chapter_id=next_chapter.id,
                    current_position=0,
                    is_completed=False,
                    is_unlocked=True,
                    last_read_at=None
                )
                db.add(next_progress)

    # Auto checkin (silent if already checked in)
    today = date.today()
    existing_checkin = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.checkin_date == today
    ).first()
    if not existing_checkin:
        yesterday = today - timedelta(days=1)
        yesterday_checkin = db.query(CheckIn).filter(
            CheckIn.user_id == current_user.id,
            CheckIn.checkin_date == yesterday
        ).first()
        consecutive_days = 1
        if yesterday_checkin:
            consecutive_days = yesterday_checkin.consecutive_days + 1
        checkin_record = CheckIn(
            user_id=current_user.id,
            checkin_date=today,
            consecutive_days=consecutive_days,
            content=f"完成《{current_chapter.title if current_chapter else '本章'}》闯关"
        )
        db.add(checkin_record)

    db.commit()

    return {
        "quiz_id": quiz_id,
        "is_passed": True,
        "next_chapter_id": next_chapter.id if current_chapter and next_chapter else None,
    }
