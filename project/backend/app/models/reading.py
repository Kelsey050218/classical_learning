from sqlalchemy import Column, Integer, ForeignKey, Boolean, DateTime, Text, String, UniqueConstraint
from app.models.base import BaseModel
from datetime import datetime


class ReadingProgress(BaseModel):
    __tablename__ = "reading_progress"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    current_position = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    is_unlocked = Column(Boolean, default=False)
    last_read_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint('user_id', 'chapter_id', name='uix_user_chapter'),
    )


class Annotation(BaseModel):
    __tablename__ = "annotations"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    position_start = Column(Integer, nullable=False)
    position_end = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    annotation_type = Column(String(20), nullable=False)  # mark, question, connection, insight
    mark_symbol = Column(String(20), nullable=True)       # circle, dot, underline, box (for mark type)
