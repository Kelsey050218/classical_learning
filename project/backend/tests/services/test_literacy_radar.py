from app.services.literacy_radar import (
    DIMENSION_KEYS,
    DIMENSION_LABELS,
    STANDARD_TO_DIMENSION,
    BEHAVIOR_NORMALIZERS,
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
