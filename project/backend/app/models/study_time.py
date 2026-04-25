from sqlalchemy import Column, Integer, Date, ForeignKey
from datetime import date
from app.models.base import BaseModel


class StudyTimeLog(BaseModel):
    __tablename__ = "study_time_logs"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    duration_seconds = Column(Integer, default=0, nullable=False)
    session_date = Column(Date, nullable=False, default=date.today)
