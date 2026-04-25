from datetime import datetime
from typing import Optional, List, Any

from pydantic import BaseModel, ConfigDict

from app.models.learning import ProjectStatus, TopicStatus


# Forum Schemas

class ForumTopicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    status: TopicStatus
    created_by: int
    created_at: datetime
    updated_at: datetime


class ForumTopicListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    status: TopicStatus
    post_count: int = 0
    created_at: datetime


class ForumPostCreate(BaseModel):
    content: str
    stance: Optional[str] = None  # support, oppose, neutral


class ForumPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    topic_id: int
    user_id: int
    content: str
    stance: Optional[str] = None
    upvotes: int = 0
    downvotes: int = 0
    score: int = 0
    created_at: datetime
    updated_at: datetime


class ForumPostWithUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    topic_id: int
    user_id: int
    username: str
    content: str
    stance: Optional[str] = None
    upvotes: int = 0
    downvotes: int = 0
    score: int = 0
    user_vote: Optional[str] = None  # up, down, or None
    created_at: datetime
    updated_at: datetime


# Vote Schemas

class VoteCreate(BaseModel):
    vote_type: str  # up, down


class VoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    user_id: int
    vote_type: str
    created_at: datetime
    updated_at: datetime


class VoteSummaryResponse(BaseModel):
    post_id: int
    upvotes: int
    downvotes: int
    score: int
    user_vote: Optional[str] = None


# Timeline Schemas

class TimelineCreate(BaseModel):
    title: str
    content: Optional[Any] = None
    image_url: Optional[str] = None


class TimelineUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Any] = None
    image_url: Optional[str] = None


class TimelineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    content: Optional[Any] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# Learning Progress Schemas

class LearningProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    project_id: int
    sub_project_id: int
    status: ProjectStatus
    unlocked_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class LearningProgressUpdate(BaseModel):
    status: Optional[ProjectStatus] = None


class SubProjectProgress(BaseModel):
    sub_project_id: int
    status: ProjectStatus
    unlocked_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class ProjectProgress(BaseModel):
    project_id: int
    sub_projects: List[SubProjectProgress]
    completed_count: int
    total_count: int
