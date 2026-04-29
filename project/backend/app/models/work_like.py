from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.models.base import BaseModel


class WorkLike(BaseModel):
    __tablename__ = "work_likes"

    work_id = Column(Integer, ForeignKey("works.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint('work_id', 'user_id', name='uix_work_user_like'),
    )
