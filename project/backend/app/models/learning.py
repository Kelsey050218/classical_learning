from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime, Text, String, JSON, UniqueConstraint
from app.models.base import BaseModel
from datetime import datetime
import enum


class ProjectStatus(enum.Enum):
    locked = "locked"
    in_progress = "in_progress"
    completed = "completed"


class TopicStatus(enum.Enum):
    active = "active"
    closed = "closed"
    deleted = "deleted"


class BadgeType(str, enum.Enum):
    reading_star = "reading_star"       # 阅读之星
    thinking_star = "thinking_star"     # 思辨之星
    creation_star = "creation_star"     # 创作之星
    recitation_star = "recitation_star" # 朗诵之星
    appreciation_star = "appreciation_star"  # 鉴赏之星
    checkin_star = "checkin_star"       # 打卡之星


class LearningProgress(BaseModel):
    __tablename__ = "learning_progress"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, nullable=False)
    sub_project_id = Column(Integer, nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.locked)
    unlocked_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint('user_id', 'sub_project_id', name='uix_user_subproject'),
    )


class ForumTopic(BaseModel):
    __tablename__ = "forum_topics"

    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TopicStatus), default=TopicStatus.active)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)


class ForumPost(BaseModel):
    __tablename__ = "forum_posts"

    topic_id = Column(Integer, ForeignKey("forum_topics.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    stance = Column(String(20), nullable=True)  # support, oppose, neutral


class ForumVote(BaseModel):
    __tablename__ = "forum_votes"

    post_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vote_type = Column(String(10), nullable=False)  # up, down

    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='uix_post_user_vote'),
    )


class Timeline(BaseModel):
    __tablename__ = "timelines"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(JSON, nullable=True)
    image_url = Column(String(500), nullable=True)


class UserBadge(BaseModel):
    __tablename__ = "user_badges"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_type = Column(Enum(BadgeType), nullable=False)
    awarded_at = Column(DateTime, default=datetime.utcnow)
    reason = Column(String(500), nullable=True)

    __table_args__ = (
        UniqueConstraint('user_id', 'badge_type', name='uix_user_badge'),
    )
