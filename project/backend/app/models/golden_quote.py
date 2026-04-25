from sqlalchemy import Column, Integer, ForeignKey, Text, String
from sqlalchemy.dialects.sqlite import JSON
from app.models.base import BaseModel


class GoldenQuote(BaseModel):
    __tablename__ = "golden_quotes"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    position_start = Column(Integer, nullable=True)
    position_end = Column(Integer, nullable=True)
    quote_text = Column(Text, nullable=False)
    source_chapter = Column(String(200), nullable=True)
    tags = Column(JSON, nullable=True)
    note = Column(Text, nullable=True)
