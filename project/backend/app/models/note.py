from sqlalchemy import Column, Integer, ForeignKey, Text, String
from sqlalchemy.dialects.sqlite import JSON
from app.models.base import BaseModel


class Note(BaseModel):
    __tablename__ = "notes"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    images = Column(JSON, nullable=True)
    category = Column(String(50), nullable=True)
    tags = Column(JSON, nullable=True)
