import enum
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey
from app.models.base import BaseModel


class WorkType(str, enum.Enum):
    video = "video"           # 典籍长视频剪辑
    audio = "audio"           # 经典声演/配乐朗诵
    script = "script"         # AI 短视频脚本


class WorkStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class Work(BaseModel):
    __tablename__ = "works"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    work_type = Column(Enum(WorkType), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)      # 视频/音频文件 URL
    cover_url = Column(String(500), nullable=True)     # 封面图 URL
    content = Column(Text, nullable=True)              # 脚本文本内容
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    status = Column(Enum(WorkStatus), default=WorkStatus.draft)
