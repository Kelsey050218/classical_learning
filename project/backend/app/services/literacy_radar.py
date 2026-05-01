"""阅读素养雷达图聚合服务。

依据 JY/T 0663—2026《中国青少年阅读素养框架》8 个二级指标，
混合 evaluations.scores 自评数据与系统行为数据，输出可视化所需的雷达 payload。
"""

from typing import Optional


DIMENSION_KEYS: list[str] = [
    "basic_knowledge",
    "strategic_knowledge",
    "comprehension",
    "evaluation",
    "creation",
    "emotional_value",
    "practice_value",
    "belief_value",
]

DIMENSION_LABELS: dict[str, str] = {
    "basic_knowledge":     "基础性阅读知识",
    "strategic_knowledge": "策略性阅读知识",
    "comprehension":       "理解性阅读能力",
    "evaluation":          "评鉴性阅读能力",
    "creation":            "创造性阅读能力",
    "emotional_value":     "情感性阅读价值",
    "practice_value":      "践行性阅读价值",
    "belief_value":        "观念性阅读价值",
}

DIMENSION_FRAMEWORK_CODES: dict[str, str] = {
    "basic_knowledge":     "5.2",
    "strategic_knowledge": "5.3",
    "comprehension":       "6.2",
    "evaluation":          "6.3",
    "creation":            "6.4",
    "emotional_value":     "7.2",
    "practice_value":      "7.3",
    "belief_value":        "7.4",
}

# EvaluationForm rubric 中 standard 字符串 → 维度 key
STANDARD_TO_DIMENSION: dict[str, str] = {
    "5.2基础性阅读知识": "basic_knowledge",
    "5.3策略性阅读知识": "strategic_knowledge",
    "6.2理解性阅读能力": "comprehension",
    "6.3评鉴性阅读能力": "evaluation",
    "6.4创造性阅读能力": "creation",
    "7.2情感性阅读价值": "emotional_value",
    "7.3践行性阅读价值": "practice_value",
    "7.4观念性阅读价值": "belief_value",
}

import re
from sqlalchemy.orm import Session

from app.models.evaluation import Evaluation


_SCORE_KEY_PATTERN = re.compile(r"^(.+?)_(\d+)$")


def _compute_self_scores(user_id: int, db: Session) -> dict[str, Optional[float]]:
    """对每个维度，从 evaluations.scores 中取相关条目均值并归一化到 0-100。

    Evaluation.scores 的 key 形如 "5.2基础性阅读知识_0"，值是 1-5。
    某维度无任何条目时返回 None。
    """
    bucket: dict[str, list[float]] = {key: [] for key in DIMENSION_KEYS}

    rows = db.query(Evaluation).filter(Evaluation.user_id == user_id).all()
    for row in rows:
        scores = row.scores or {}
        for raw_key, raw_value in scores.items():
            match = _SCORE_KEY_PATTERN.match(raw_key)
            standard = match.group(1) if match else raw_key
            dim = STANDARD_TO_DIMENSION.get(standard)
            if dim is None:
                continue
            try:
                numeric = float(raw_value)
            except (TypeError, ValueError):
                continue
            bucket[dim].append(numeric)

    result: dict[str, Optional[float]] = {}
    for key in DIMENSION_KEYS:
        values = bucket[key]
        if not values:
            result[key] = None
            continue
        avg_1_to_5 = sum(values) / len(values)
        # 线性归一化 1-5 → 0-100
        result[key] = round((avg_1_to_5 - 1) / 4 * 100, 2)
    return result


# 行为信号归一化分母（按学情可调）
BEHAVIOR_NORMALIZERS: dict[str, float] = {
    "annotations":               50,    # 批注总条数
    "card_template_coverage":    12,    # 12 类读书卡模板
    "chapters_completed":        13,    # 13 章
    "evaluation_card_count":     3,     # 评价鉴赏卡（模板 11）
    "forum_votes":               20,    # 论坛获得的投票数
    "works_published":           3,     # 已发布作品数
    "creative_card_count":       6,     # 感悟/写作借鉴/总结卡（9/10/12）总数
    "study_time_30d_hours":      30,    # 近 30 天学习时长（小时）
    "checkin_total_days":        30,    # 总打卡天数
    "annotations_plus_notes":    30,    # 笔记 + 批注
    "forum_posts":               5,     # 论坛贴文数
    "evaluations_filled":        4,     # 已填评价表数
}
