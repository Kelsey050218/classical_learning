from sqlalchemy import Column, Integer, ForeignKey, Text, String
from app.models.base import BaseModel


class Highlight(BaseModel):
    __tablename__ = "highlights"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    position_start = Column(Integer, nullable=False)
    position_end = Column(Integer, nullable=False)
    color = Column(String(20), default="yellow")
    quote_text = Column(Text, nullable=False)
