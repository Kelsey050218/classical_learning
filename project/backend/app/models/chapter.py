from sqlalchemy import Column, String, Integer, Text, JSON
from app.models.base import BaseModel


class Chapter(BaseModel):
    __tablename__ = "chapters"

    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    annotations = Column(JSON, nullable=True)  # Term annotations data
    sort_order = Column(Integer, default=0)
