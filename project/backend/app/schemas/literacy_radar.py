from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class RadarDimension(BaseModel):
    key: str                    # e.g. "basic_knowledge"
    framework_code: str         # e.g. "5.2"
    label: str                  # 二级指标全称
    score: Optional[int]        # 0-100 整数；缺数据时为 None
    self_score: Optional[float]
    behavior_score: Optional[float]
    highlights: List[str] = []  # 该维度的简短行为亮点描述（备用字段，本期可为空）

    model_config = ConfigDict(from_attributes=True)


class RadarPayload(BaseModel):
    level_text: Optional[str]           # "二阶 · 拓展期" 等；总分为 None 时为 None
    overall_score: Optional[int]        # 0-100 整数；8 维全 null 时为 None
    dimensions: List[RadarDimension]    # 长度恒为 8，按 DIMENSION_KEYS 顺序
    summary_text: Optional[str]         # 1-2 句的亮点/短板提示；空态为 None
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)
