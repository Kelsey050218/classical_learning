from datetime import datetime
from typing import Optional, List, Any

from pydantic import BaseModel, ConfigDict


class ChapterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    annotations: Optional[Any] = None
    sort_order: int
    created_at: datetime
    updated_at: datetime


class ChapterListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    sort_order: int
    is_completed: bool = False
    content: Optional[str] = None


class ReadingProgressUpdate(BaseModel):
    current_position: int
    is_completed: bool = False


class ReadingProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    chapter_id: int
    current_position: int
    is_completed: bool
    is_unlocked: bool = False
    last_read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AnnotationCreate(BaseModel):
    position_start: int
    position_end: int
    content: str
    annotation_type: str  # mark, question, connection, insight
    mark_symbol: Optional[str] = None  # circle, dot, underline, box (for mark type)


class AnnotationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    chapter_id: int
    position_start: int
    position_end: int
    content: str
    annotation_type: str
    mark_symbol: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AnnotationListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    annotations: List[AnnotationResponse]
    total: int
