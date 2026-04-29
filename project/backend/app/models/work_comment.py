from sqlalchemy import Column, Integer, ForeignKey, Text
from app.models.base import BaseModel


class WorkComment(BaseModel):
    __tablename__ = "work_comments"

    work_id = Column(Integer, ForeignKey("works.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
