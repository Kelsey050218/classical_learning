import enum
from sqlalchemy import Column, Integer, ForeignKey, Enum, UniqueConstraint
from app.models.base import BaseModel


class AwardType(str, enum.Enum):
    best_video = "best_video"       # 最佳视频奖
    best_audio = "best_audio"       # 最佳音频奖
    best_script = "best_script"     # 最佳脚本奖


class WorkVote(BaseModel):
    __tablename__ = "work_votes"

    work_id = Column(Integer, ForeignKey("works.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    award_type = Column(Enum(AwardType), nullable=False)

    __table_args__ = (
        UniqueConstraint('work_id', 'user_id', 'award_type', name='uix_work_user_award'),
    )
