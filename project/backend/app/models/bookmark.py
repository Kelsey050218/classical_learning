from sqlalchemy import Column, Integer, ForeignKey, Text
from app.models.base import BaseModel


class Bookmark(BaseModel):
    __tablename__ = "bookmarks"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    position_start = Column(Integer, nullable=False)
    position_end = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
