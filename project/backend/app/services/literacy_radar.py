"""阅读素养雷达图聚合服务。

依据 JY/T 0663—2026《中国青少年阅读素养框架》8 个二级指标，
混合 evaluations.scores 自评数据与系统行为数据，输出可视化所需的雷达 payload。
"""

import re
from datetime import date, timedelta, datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.evaluation import Evaluation
from app.models.reading import ReadingProgress, Annotation
from app.models.reading_card import ReadingCard
from app.models.work import Work, WorkStatus
from app.models.note import Note
from app.models.checkin import CheckIn
from app.models.study_time import StudyTimeLog
from app.models.learning import ForumPost, ForumVote
from app.models.quiz import Quiz, QuizAttempt
from app.models.restoration import RestorationProgress, RestorationDiagnostic, RestorationNode


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

_SCORE_KEY_PATTERN = re.compile(r"^(.+?)_(\d+)$")


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


def _normalize(raw: float, denom: float) -> float:
    """线性截断归一化到 [0, 100]。"""
    if denom <= 0:
        return 0.0
    return max(0.0, min(100.0, raw / denom * 100))


def _compute_behavior_scores(user_id: int, db: Session) -> dict[str, Optional[float]]:
    """每维行为信号归一化均值；维度内全部信号为 0 时维度值为 None。"""
    # ----- 收集原始计数 -----
    annotations = db.query(func.count(Annotation.id)).filter(
        Annotation.user_id == user_id
    ).scalar() or 0

    notes = db.query(func.count(Note.id)).filter(
        Note.user_id == user_id
    ).scalar() or 0

    cards = db.query(ReadingCard).filter(ReadingCard.user_id == user_id).all()
    template_coverage = len({c.card_template for c in cards})
    eval_card_count = sum(1 for c in cards if c.card_template == 11)
    creative_card_count = sum(1 for c in cards if c.card_template in {9, 10, 12})

    chapters_completed = db.query(func.count(ReadingProgress.id)).filter(
        ReadingProgress.user_id == user_id,
        ReadingProgress.is_completed == True,
    ).scalar() or 0

    works_published = db.query(func.count(Work.id)).filter(
        Work.user_id == user_id,
        Work.status == WorkStatus.published,
    ).scalar() or 0

    thirty_days_ago = date.today() - timedelta(days=30)
    study_seconds_30d = db.query(func.coalesce(func.sum(StudyTimeLog.duration_seconds), 0)).filter(
        StudyTimeLog.user_id == user_id,
        StudyTimeLog.session_date >= thirty_days_ago,
    ).scalar() or 0
    study_hours_30d = study_seconds_30d / 3600.0

    checkin_total = db.query(func.count(CheckIn.id)).filter(
        CheckIn.user_id == user_id
    ).scalar() or 0

    forum_posts = db.query(func.count(ForumPost.id)).filter(
        ForumPost.user_id == user_id
    ).scalar() or 0

    forum_vote_count = db.query(func.count(ForumVote.id)).join(
        ForumPost, ForumPost.id == ForumVote.post_id
    ).filter(ForumPost.user_id == user_id).scalar() or 0

    evaluations_filled = db.query(func.count(Evaluation.id)).filter(
        Evaluation.user_id == user_id
    ).scalar() or 0

    # 测验通过率
    quiz_total = db.query(func.count(Quiz.id)).scalar() or 0
    quiz_passed = db.query(func.count(QuizAttempt.id)).filter(
        QuizAttempt.user_id == user_id,
        QuizAttempt.is_passed == True,
    ).scalar() or 0
    quiz_pass_rate = (quiz_passed / quiz_total) if quiz_total > 0 else 0.0

    # 复原诊断/排序正确率
    diag_total = db.query(func.count(RestorationDiagnostic.id)).scalar() or 0
    sort_total = db.query(func.count(RestorationNode.id)).scalar() or 0
    diag_correct_sum = db.query(func.coalesce(func.sum(RestorationProgress.diagnostic_correct), 0)).filter(
        RestorationProgress.user_id == user_id
    ).scalar() or 0
    sort_correct_sum = db.query(func.coalesce(func.sum(RestorationProgress.sorting_correct), 0)).filter(
        RestorationProgress.user_id == user_id
    ).scalar() or 0
    diag_rate = (diag_correct_sum / diag_total) if diag_total > 0 else 0.0
    sort_rate = (sort_correct_sum / sort_total) if sort_total > 0 else 0.0

    # ----- 每维原始 raw 列表（同时记录是否所有 raw 都为 0）-----
    n = BEHAVIOR_NORMALIZERS

    dim_signals: dict[str, list[tuple[float, float]]] = {
        "basic_knowledge": [
            (quiz_pass_rate * 100, 100),
            (diag_rate * 100, 100),
        ],
        "strategic_knowledge": [
            (annotations, n["annotations"]),
            (template_coverage, n["card_template_coverage"]),
        ],
        "comprehension": [
            (chapters_completed, n["chapters_completed"]),
            (sort_rate * 100, 100),
        ],
        "evaluation": [
            (eval_card_count, n["evaluation_card_count"]),
            (forum_vote_count, n["forum_votes"]),
        ],
        "creation": [
            (works_published, n["works_published"]),
            (creative_card_count, n["creative_card_count"]),
        ],
        "emotional_value": [
            (study_hours_30d, n["study_time_30d_hours"]),
            (chapters_completed, n["chapters_completed"]),
        ],
        "practice_value": [
            (checkin_total, n["checkin_total_days"]),
            (annotations + notes, n["annotations_plus_notes"]),
        ],
        "belief_value": [
            (forum_posts, n["forum_posts"]),
            (evaluations_filled, n["evaluations_filled"]),
        ],
    }

    result: dict[str, Optional[float]] = {}
    for key in DIMENSION_KEYS:
        signals = dim_signals[key]
        raw_total = sum(raw for raw, _ in signals)
        if raw_total <= 0:
            result[key] = None
            continue
        normalized = [_normalize(raw, denom) for raw, denom in signals]
        result[key] = round(sum(normalized) / len(normalized), 2)
    return result


def _compose_dimension_score(
    self_score: Optional[float],
    behavior_score: Optional[float],
) -> Optional[int]:
    if self_score is not None and behavior_score is not None:
        return round(0.5 * self_score + 0.5 * behavior_score)
    if self_score is not None:
        return round(self_score)
    if behavior_score is not None:
        return round(behavior_score)
    return None


def _level_text_for(overall: Optional[int]) -> Optional[str]:
    if overall is None:
        return None
    if overall < 50:
        return "一阶 · 奠基期"
    if overall < 80:
        return "二阶 · 拓展期"
    return "三阶 · 深化期"


def _compose_summary(dimensions: list[dict]) -> Optional[str]:
    """两句以内：报亮点；差值显著时报短板。"""
    scored = [d for d in dimensions if d["score"] is not None]
    if not scored:
        return None
    high = max(scored, key=lambda d: d["score"])
    low = min(scored, key=lambda d: d["score"])

    sentences = [f"你的「{high['label']}」表现最亮，已达 {high['score']} 分，继续保持。"]
    if high["key"] != low["key"] and (high["score"] - low["score"]) >= 5:
        sentences.append(f"建议多在「{low['label']}」上发力，当前 {low['score']} 分，可通过相关学习活动提升。")
    return "".join(sentences)


def compute_radar(user_id: int, db: Session) -> dict:
    """雷达图聚合入口。返回符合 RadarPayload 结构的字典。"""
    self_scores = _compute_self_scores(user_id, db)
    behavior_scores = _compute_behavior_scores(user_id, db)

    dimensions: list[dict] = []
    for key in DIMENSION_KEYS:
        s_val = self_scores[key]
        b_val = behavior_scores[key]
        score = _compose_dimension_score(s_val, b_val)
        dimensions.append({
            "key": key,
            "framework_code": DIMENSION_FRAMEWORK_CODES[key],
            "label": DIMENSION_LABELS[key],
            "score": score,
            "self_score": s_val,
            "behavior_score": b_val,
            "highlights": [],
        })

    valid_scores = [d["score"] for d in dimensions if d["score"] is not None]
    overall = round(sum(valid_scores) / len(valid_scores)) if valid_scores else None

    return {
        "level_text": _level_text_for(overall),
        "overall_score": overall,
        "dimensions": dimensions,
        "summary_text": _compose_summary(dimensions),
        "generated_at": datetime.utcnow(),
    }
