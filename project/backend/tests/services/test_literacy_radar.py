import re
from app.models.evaluation import Evaluation
from app.services.literacy_radar import (
    DIMENSION_KEYS,
    DIMENSION_LABELS,
    STANDARD_TO_DIMENSION,
    BEHAVIOR_NORMALIZERS,
    _compute_self_scores,
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
