from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, Boolean, Float
from app.models.base import BaseModel


class Quiz(BaseModel):
    __tablename__ = "quizzes"

    title = Column(String(200), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    level = Column(Integer, default=1)  # 1-4
    sort_order = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    pass_score = Column(Integer, default=60)


class Question(BaseModel):
    __tablename__ = "questions"

    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_type = Column(String(20), nullable=False)  # choice, fill, short
    content = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  # For choice questions
    answer = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    score = Column(Integer, default=10)
    sort_order = Column(Integer, default=0)


class QuizAttempt(BaseModel):
    __tablename__ = "quiz_attempts"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    answers = Column(JSON, nullable=True, default=dict)
    score = Column(Integer, default=0)
    is_passed = Column(Boolean, default=False)
