from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.evaluation import Evaluation
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


class EvaluationCreate(BaseModel):
    project_id: int
    form_type: str
    scores: dict
    self_comment: Optional[str] = None


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_evaluation(
    req: EvaluationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update an evaluation."""
    evaluation = db.query(Evaluation).filter(
        Evaluation.user_id == current_user.id,
        Evaluation.project_id == req.project_id,
        Evaluation.form_type == req.form_type
    ).first()

    if evaluation:
        evaluation.scores = req.scores
        evaluation.self_comment = req.self_comment
    else:
        evaluation = Evaluation(
            user_id=current_user.id,
            project_id=req.project_id,
            form_type=req.form_type,
            scores=req.scores,
            self_comment=req.self_comment
        )
        db.add(evaluation)

    db.commit()
    db.refresh(evaluation)
    return {
        "id": evaluation.id,
        "project_id": evaluation.project_id,
        "form_type": evaluation.form_type,
        "scores": evaluation.scores,
        "self_comment": evaluation.self_comment,
        "evaluator_comment": evaluation.evaluator_comment,
        "created_at": evaluation.created_at,
        "updated_at": evaluation.updated_at,
    }


@router.get("/my", response_model=List[dict])
def list_my_evaluations(
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List current user's evaluations."""
    query = db.query(Evaluation).filter(Evaluation.user_id == current_user.id)
    if project_id:
        query = query.filter(Evaluation.project_id == project_id)

    evaluations = query.order_by(Evaluation.created_at.desc()).all()
    return [
        {
            "id": e.id,
            "project_id": e.project_id,
            "form_type": e.form_type,
            "scores": e.scores,
            "self_comment": e.self_comment,
            "evaluator_comment": e.evaluator_comment,
            "created_at": e.created_at,
            "updated_at": e.updated_at,
        }
        for e in evaluations
    ]
