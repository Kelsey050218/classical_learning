from datetime import date, timedelta
from app.models.evaluation import Evaluation
from app.models.reading import ReadingProgress, Annotation
from app.models.reading_card import ReadingCard
from app.models.work import Work, WorkType, WorkStatus
from app.models.checkin import CheckIn
from app.models.study_time import StudyTimeLog
from app.models.learning import ForumPost, ForumVote, ForumTopic
from app.services.literacy_radar import (
    DIMENSION_KEYS,
    DIMENSION_LABELS,
    STANDARD_TO_DIMENSION,
    BEHAVIOR_NORMALIZERS,
    _compute_self_scores,
    _compute_behavior_scores,
)


def test_eight_dimension_keys_present():
    expected = {
        "basic_knowledge",          # 5.2
        "strategic_knowledge",      # 5.3
        "comprehension",            # 6.2
        "evaluation",               # 6.3
        "creation",                 # 6.4
        "emotional_value",          # 7.2
        "practice_value",           # 7.3
        "belief_value",             # 7.4
    }
    assert set(DIMENSION_KEYS) == expected
    assert len(DIMENSION_KEYS) == 8


def test_each_dimension_has_label():
    for key in DIMENSION_KEYS:
        assert key in DIMENSION_LABELS
        assert DIMENSION_LABELS[key]


def test_standard_tags_map_to_valid_dimensions():
    for tag, dim in STANDARD_TO_DIMENSION.items():
        assert dim in DIMENSION_KEYS, f"{tag} maps to unknown dim {dim}"
    assert "5.2基础性阅读知识" in STANDARD_TO_DIMENSION
    assert "7.4观念性阅读价值" in STANDARD_TO_DIMENSION


def test_behavior_normalizers_positive():
    for key, value in BEHAVIOR_NORMALIZERS.items():
        assert value > 0, f"normalizer {key} must be positive"


def test_self_scores_empty_when_no_evaluations(db_session, test_user):
    result = _compute_self_scores(test_user.id, db_session)
    for dim in DIMENSION_KEYS:
        assert result[dim] is None


def test_self_scores_average_and_normalize(db_session, test_user):
    eval_record = Evaluation(
        user_id=test_user.id,
        project_id=1,
        form_type="sub_project_1",
        scores={
            "5.2基础性阅读知识_0": 5,   # 满分 → 100
            "5.2基础性阅读知识_1": 3,   # 中分 → 50
            "6.2理解性阅读能力_0": 4,   # → 75
        },
    )
    db_session.add(eval_record)
    db_session.commit()

    result = _compute_self_scores(test_user.id, db_session)
    # 5.2 两条均值 4 → (4-1)/4*100 = 75
    assert result["basic_knowledge"] == 75.0
    # 6.2 一条 4 → 75
    assert result["comprehension"] == 75.0
    # 其他维度无数据
    assert result["strategic_knowledge"] is None
    assert result["belief_value"] is None


def test_self_scores_handle_unknown_keys_safely(db_session, test_user):
    eval_record = Evaluation(
        user_id=test_user.id,
        project_id=1,
        form_type="sub_project_1",
        scores={
            "未知字段": 4,
            "5.2基础性阅读知识_0": 5,
        },
    )
    db_session.add(eval_record)
    db_session.commit()

    result = _compute_self_scores(test_user.id, db_session)
    assert result["basic_knowledge"] == 100.0


def test_behavior_scores_all_none_when_no_activity(db_session, test_user):
    result = _compute_behavior_scores(test_user.id, db_session)
    for dim in DIMENSION_KEYS:
        assert result[dim] is None


def test_behavior_scores_rich_activity(db_session, test_user):
    # 完成 13 章中的 6 章
    for cid in range(1, 7):
        db_session.add(ReadingProgress(
            user_id=test_user.id, chapter_id=cid, is_completed=True
        ))
    # 25 条批注
    for i in range(25):
        db_session.add(Annotation(
            user_id=test_user.id, chapter_id=1,
            position_start=i, position_end=i + 1,
            content=f"批注{i}", annotation_type="mark",
        ))
    # 6 类读书卡模板被覆盖（1, 2, 9, 10, 11, 12）
    for tpl in [1, 2, 9, 10, 11, 12]:
        db_session.add(ReadingCard(
            user_id=test_user.id, chapter_id=1,
            card_template=tpl, fields={"a": "b"},
        ))
    # 2 个已发布作品
    for i in range(2):
        db_session.add(Work(
            user_id=test_user.id,
            work_type=WorkType.script,
            title=f"作品{i}",
            status=WorkStatus.published,
        ))
    # 近 30 天 15 小时学习时长
    db_session.add(StudyTimeLog(
        user_id=test_user.id, chapter_id=1,
        duration_seconds=15 * 3600, session_date=date.today(),
    ))
    # 15 天打卡
    for i in range(15):
        db_session.add(CheckIn(
            user_id=test_user.id,
            checkin_date=date.today() - timedelta(days=i),
            consecutive_days=i + 1,
        ))
    # 论坛 3 帖
    topic = ForumTopic(title="测试议题", created_by=test_user.id)
    db_session.add(topic)
    db_session.commit()
    for i in range(3):
        db_session.add(ForumPost(
            topic_id=topic.id, user_id=test_user.id, content=f"观点{i}",
        ))
    # 已填 1 份评价
    db_session.add(Evaluation(
        user_id=test_user.id, project_id=1, form_type="sub_project_1",
        scores={"5.2基础性阅读知识_0": 4},
    ))
    db_session.commit()

    result = _compute_behavior_scores(test_user.id, db_session)
    # 至少这几个维度应有非空值
    assert result["strategic_knowledge"] is not None  # 25/50 + 6/12 都有
    assert result["comprehension"] is not None        # 6/13
    assert result["creation"] is not None             # 2/3 published works
    assert result["emotional_value"] is not None      # 15/30 hours
    assert result["practice_value"] is not None       # 15/30 days checkin
    assert result["belief_value"] is not None         # 论坛 + 评价
    # 所有非空值都在 [0, 100]
    for dim, value in result.items():
        if value is not None:
            assert 0 <= value <= 100, f"{dim}={value} out of bounds"


def test_behavior_scores_none_when_dimension_signals_all_zero(db_session, test_user):
    # 只触发 comprehension 相关行为，看其他维度是否为 None
    db_session.add(ReadingProgress(
        user_id=test_user.id, chapter_id=1, is_completed=True
    ))
    db_session.commit()
    result = _compute_behavior_scores(test_user.id, db_session)
    assert result["comprehension"] is not None
    assert result["belief_value"] is None
    assert result["practice_value"] is None
