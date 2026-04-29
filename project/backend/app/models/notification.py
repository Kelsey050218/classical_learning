import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Boolean, ForeignKey
from app.models.base import BaseModel


class NotificationType(str, enum.Enum):
    like = "like"               # 有人点赞了你的作品
    comment = "comment"         # 有人评论了你的作品
    pinned = "pinned"           # 你的作品被置顶
    unlisted = "unlisted"       # 你的作品被下架
    vote_open = "vote_open"     # 投票开启
    vote_close = "vote_close"   # 投票关闭
    system = "system"           # 系统通知


class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    related_id = Column(Integer, nullable=True)   # 关联的作品ID等
    related_type = Column(String(50), nullable=True)
