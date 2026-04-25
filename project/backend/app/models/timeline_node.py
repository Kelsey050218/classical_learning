from sqlalchemy import Column, Integer, String, Text, JSON
from app.models.base import BaseModel


class TimelineNode(BaseModel):
    __tablename__ = "timeline_nodes"

    era = Column(String(50), nullable=False)           # 朝代: 先秦、汉、魏晋南北朝、唐、宋、元
    period = Column(String(100), nullable=False)       # 时期: 西周—战国
    title = Column(String(200), nullable=False)        # 节点标题
    content = Column(Text, nullable=False)             # 核心内容描述
    key_points = Column(JSON, nullable=True)           # 关键知识点列表
    sort_order = Column(Integer, default=0)            # 排序
    image_url = Column(String(500), nullable=True)
