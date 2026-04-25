from sqlalchemy.orm import Session

from app.models.learning import UserBadge, BadgeType, ForumPost
from app.models.reading import ReadingProgress
from app.models.work import Work, WorkType, WorkStatus
from app.models.checkin import CheckIn
from app.models.user import User


def award_badge(db: Session, user_id: int, badge_type: BadgeType, reason: str = None):
    """Award a badge to user if not already awarded."""
    existing = db.query(UserBadge).filter(
        UserBadge.user_id == user_id,
        UserBadge.badge_type == badge_type
    ).first()

    if existing:
        return None

    badge = UserBadge(
        user_id=user_id,
        badge_type=badge_type,
        reason=reason
    )
    db.add(badge)
    db.commit()
    return badge


def check_reading_star(db: Session, user_id: int):
    """Award reading_star if all chapters completed."""
    total_chapters = 13  # Total chapters in 经典常谈
    completed = db.query(ReadingProgress).filter(
        ReadingProgress.user_id == user_id,
        ReadingProgress.is_completed == True
    ).count()

    if completed >= total_chapters:
        return award_badge(db, user_id, BadgeType.reading_star, f"完成{completed}章阅读")
    return None


def check_thinking_star(db: Session, user_id: int):
    """Award thinking_star if 3+ forum posts."""
    post_count = db.query(ForumPost).filter(
        ForumPost.user_id == user_id
    ).count()

    if post_count >= 3:
        return award_badge(db, user_id, BadgeType.thinking_star, f"发表{post_count}篇论坛观点")
    return None


def check_creation_star(db: Session, user_id: int):
    """Award creation_star if any published work."""
    work_count = db.query(Work).filter(
        Work.user_id == user_id,
        Work.status == WorkStatus.published
    ).count()

    if work_count >= 1:
        return award_badge(db, user_id, BadgeType.creation_star, f"发布{work_count}件作品")
    return None


def check_recitation_star(db: Session, user_id: int):
    """Award recitation_star if published audio work."""
    audio_count = db.query(Work).filter(
        Work.user_id == user_id,
        Work.work_type == WorkType.audio,
        Work.status == WorkStatus.published
    ).count()

    if audio_count >= 1:
        return award_badge(db, user_id, BadgeType.recitation_star, "发布音频作品")
    return None


def check_appreciation_star(db: Session, user_id: int):
    """Award appreciation_star if published video work."""
    video_count = db.query(Work).filter(
        Work.user_id == user_id,
        Work.work_type == WorkType.video,
        Work.status == WorkStatus.published
    ).count()

    if video_count >= 1:
        return award_badge(db, user_id, BadgeType.appreciation_star, "发布视频作品")
    return None


def check_checkin_star(db: Session, user_id: int):
    """Award checkin_star if 7+ consecutive checkins."""
    from sqlalchemy import func

    max_consecutive = db.query(func.max(CheckIn.consecutive_days)).filter(
        CheckIn.user_id == user_id
    ).scalar()

    if max_consecutive and max_consecutive >= 7:
        return award_badge(db, user_id, BadgeType.checkin_star, f"连续打卡{max_consecutive}天")
    return None


def check_all_badges(db: Session, user_id: int):
    """Check and award all applicable badges."""
    awarded = []

    checks = [
        check_reading_star,
        check_thinking_star,
        check_creation_star,
        check_recitation_star,
        check_appreciation_star,
        check_checkin_star,
    ]

    for check in checks:
        badge = check(db, user_id)
        if badge:
            awarded.append(badge)

    return awarded
