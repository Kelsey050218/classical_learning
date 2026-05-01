import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Boolean, ForeignKey, JSON, UniqueConstraint
from app.models.base import BaseModel


class Difficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class FragmentCategory(str, enum.Enum):
    era = "era"
    author = "author"
    content = "content"
    style = "style"
    impact = "impact"


class QuestionType(str, enum.Enum):
    choice = "choice"
    fill_blank = "fill_blank"


class RepairStep(str, enum.Enum):
    locked = "locked"
    diagnostic = "diagnostic"
    sorting = "sorting"
    sequencing = "sequencing"
    archive = "archive"
    completed = "completed"


class RestorationChapter(BaseModel):
    __tablename__ = "restoration_chapters"

    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    name = Column(String(50), nullable=False)
    alias = Column(String(50), nullable=False)
    description = Column(String(200), nullable=False)
    difficulty = Column(Enum(Difficulty, native_enum=False), nullable=False)
    sort_order = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    era_quote = Column(Text, nullable=False)
    positioning = Column(String(200), nullable=False)
    archive_summary = Column(Text, nullable=False)
    archive_impact = Column(Text, nullable=False)


class RestorationFragment(BaseModel):
    __tablename__ = "restoration_fragments"

    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    content = Column(String(300), nullable=False)
    category = Column(Enum(FragmentCategory, native_enum=False), nullable=False)
    sort_order = Column(Integer, default=0)


class RestorationDiagnostic(BaseModel):
    __tablename__ = "restoration_diagnostics"

    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    question_type = Column(Enum(QuestionType, native_enum=False), nullable=False)
    content = Column(String(500), nullable=False)
    options = Column(JSON, nullable=True)
    correct_answer = Column(String(200), nullable=False)
    hint = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)


class RestorationNode(BaseModel):
    __tablename__ = "restoration_nodes"

    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    content = Column(String(200), nullable=False)
    correct_order = Column(Integer, nullable=False)
    sort_order = Column(Integer, default=0)


class RestorationProgress(BaseModel):
    __tablename__ = "restoration_progress"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    current_step = Column(Enum(RepairStep, native_enum=False), default=RepairStep.locked)
    diagnostic_correct = Column(Integer, default=0)
    sorting_correct = Column(Integer, default=0)
    sorting_completed = Column(Boolean, default=False)
    sequencing_attempts = Column(Integer, default=0)
    sequencing_completed = Column(Boolean, default=False)
    archive_completed = Column(Boolean, default=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'chapter_id', name='uix_user_chapter_progress'),
    )


class RestorationNote(BaseModel):
    __tablename__ = "restoration_notes"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    note = Column(String(200), nullable=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'chapter_id', name='uix_user_chapter_note'),
    )
