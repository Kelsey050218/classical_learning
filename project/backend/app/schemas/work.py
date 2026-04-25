from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.work import WorkType, WorkStatus


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
    created_at: datetime
