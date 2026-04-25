from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from app.models.base import BaseModel


class ReadingCard(BaseModel):
    __tablename__ = "reading_cards"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    card_template = Column(Integer, nullable=False)  # 1-12
    fields = Column(JSON, nullable=False, default=dict)
    status = Column(String(20), default="draft")  # draft, submitted
