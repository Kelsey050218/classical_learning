from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from app.models.base import BaseModel


class Evaluation(BaseModel):
    __tablename__ = "evaluations"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, nullable=False)
    form_type = Column(String(50), nullable=False)  # reading_project1, challenge_project2, etc.
    scores = Column(JSON, nullable=True, default=dict)
    self_comment = Column(Text, nullable=True)
    evaluator_comment = Column(Text, nullable=True)
