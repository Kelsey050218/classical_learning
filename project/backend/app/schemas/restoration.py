from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict


# Chapter schemas
class ChapterBase(BaseModel):
    name: str
    alias: str
    description: str
    difficulty: str
    sort_order: int


class ChapterCreate(ChapterBase):
    chapter_id: int
    image_url: Optional[str] = None
    era_quote: str
    positioning: str
    archive_summary: str
    archive_impact: str


class ChapterOut(ChapterBase):
    id: int
    chapter_id: int
    image_url: Optional[str]
    positioning: str

    model_config = ConfigDict(from_attributes=True)


# Fragment schemas
class FragmentOut(BaseModel):
    id: int
    content: str
    category: str

    model_config = ConfigDict(from_attributes=True)


# Diagnostic schemas
class DiagnosticOut(BaseModel):
    id: int
    question_type: str
    content: str
    options: Optional[List[str]]
    sort_order: int
    hint: str

    model_config = ConfigDict(from_attributes=True)


class DiagnosticSubmit(BaseModel):
    answers: Dict[int, str]


class DiagnosticResult(BaseModel):
    correct_count: int
    total: int


# Node schemas
class NodeOut(BaseModel):
    id: int
    content: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class NodeSubmit(BaseModel):
    order: List[int]


class NodeResult(BaseModel):
    is_correct: bool
    wrong_positions: List[int]


# Fragment submit schemas
class FragmentSubmit(BaseModel):
    placements: Dict[int, str]


class FragmentResult(BaseModel):
    correct_count: int
    total: int


# Progress schemas
class ProgressOut(BaseModel):
    chapter_id: int
    current_step: str
    diagnostic_correct: int
    sorting_correct: int
    sorting_completed: bool
    sequencing_attempts: int
    sequencing_completed: bool
    archive_completed: bool

    model_config = ConfigDict(from_attributes=True)


# Note schemas
class NoteIn(BaseModel):
    note: str


class NoteOut(BaseModel):
    chapter_id: int
    note: str

    model_config = ConfigDict(from_attributes=True)


# Archive schemas
class ArchiveOut(BaseModel):
    chapter: ChapterOut
    archive_summary: str
    archive_impact: str
    note: Optional[str]
