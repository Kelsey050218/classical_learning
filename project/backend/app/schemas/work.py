from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.work import WorkType, WorkStatus
from app.models.work_vote import AwardType


class WorkCreate(BaseModel):
    work_type: WorkType
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    chapter_id: Optional[int] = None


class WorkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    chapter_id: Optional[int] = None
    status: Optional[WorkStatus] = None


class WorkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    work_type: WorkType
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    cover_url: Optional[str] = None
    content: Optional[str] = None
    chapter_id: Optional[int] = None
    status: WorkStatus
    is_pinned: bool = False
    is_unlisted: bool = False
    view_count: int = 0
    like_count: int = 0
    user_liked: bool = False
    vote_counts: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


class WorkListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    work_type: WorkType
    title: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    status: WorkStatus
    is_pinned: bool = False
    is_unlisted: bool = False
    view_count: int = 0
    like_count: int = 0
    user_liked: bool = False
    created_at: datetime


class WorkVoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    award_type: AwardType
    count: int


class VoteSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_voting_open: bool


class VoteSettingsUpdate(BaseModel):
    is_voting_open: bool


class WorkCommentCreate(BaseModel):
    content: str


class WorkCommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    work_id: int
    user_id: int
    username: str
    content: str
    created_at: datetime
