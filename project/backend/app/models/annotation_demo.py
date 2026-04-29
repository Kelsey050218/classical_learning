from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.models.base import BaseModel


class AnnotationDemo(BaseModel):
    __tablename__ = "annotation_demos"

    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    demo_type = Column(String(20), nullable=False)  # mark, question, connection, insight
    selected_text = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
