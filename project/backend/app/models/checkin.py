from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from app.models.base import BaseModel
from datetime import date


class CheckIn(BaseModel):
    __tablename__ = "checkins"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    checkin_date = Column(Date, nullable=False, default=date.today)
    consecutive_days = Column(Integer, default=1)
    content = Column(Text, nullable=True)

    # Note: unique constraint on user_id + checkin_date should be added at DB level
