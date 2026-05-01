from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config.database import get_db
from app.models.work import Work, WorkType, WorkStatus
from app.models.user import User
from app.routers.auth import get_current_user
from app.routers.admin import require_admin
from app.services import badge_service
from app.models.work_like import WorkLike
from app.models.work_vote import WorkVote, AwardType
from app.models.work_comment import WorkComment
from app.models.vote_settings import VoteSettings
from app.models.notification import Notification, NotificationType
from app.schemas.work import (
    WorkCreate, WorkUpdate, WorkResponse, WorkListResponse,
    WorkVoteResponse, VoteSettingsResponse, VoteSettingsUpdate,
    WorkCommentCreate, WorkCommentResponse,
)

router = APIRouter(prefix="/works", tags=["works"])


@router.post("", response_model=WorkResponse, status_code=status.HTTP_201_CREATED)
def create_work(
    work_create: WorkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new work (video, audio, or script)."""
    db_work = Work(
        user_id=current_user.id,
        work_type=work_create.work_type,
        title=work_create.title,
        description=work_create.description,
        content=work_create.content,
        chapter_id=work_create.chapter_id,
        status=WorkStatus.draft
    )

    db.add(db_work)
    db.commit()
    db.refresh(db_work)

    return db_work


@router.get("", response_model=List[WorkListResponse])
def list_works(
    work_type: Optional[WorkType] = None,
    status: Optional[WorkStatus] = None,
    sort_by: Optional[str] = "latest",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List works with optional filtering and sorting. Published works are visible to all,
    draft works only to the owner. Admin-unlisted works are hidden from students."""
    query = db.query(Work)

    # Apply filters
    if work_type:
        query = query.filter(Work.work_type == work_type)
    if status:
        query = query.filter(Work.status == status)
    else:
        # Default: show published works from all users + all works from current user
        query = query.filter(
            (Work.status == WorkStatus.published) | (Work.user_id == current_user.id)
        )

    # Hide admin-unlisted works unless viewing own drafts
    query = query.filter(
        (Work.is_unlisted == False) | (Work.user_id == current_user.id)
    )

    # Sorting: pinned first, then by selected criteria
    if sort_by == "hottest":
        query = query.order_by(Work.is_pinned.desc(), Work.view_count.desc())
    elif sort_by == "most_liked":
        query = query.order_by(Work.is_pinned.desc(), Work.like_count.desc())
    else:
        query = query.order_by(Work.is_pinned.desc(), Work.created_at.desc())

    works = query.all()

    # Attach user_liked flag for current user
    liked_work_ids = set(
        row[0] for row in db.query(WorkLike.work_id).filter(
            WorkLike.user_id == current_user.id
        ).all()
    )

    # Attach user_real_name
    user_ids = {w.user_id for w in works}
    users = db.query(User.id, User.real_name).filter(User.id.in_(user_ids)).all()
    user_map = {u.id: u.real_name for u in users}

    for work in works:
        work.user_liked = work.id in liked_work_ids
        work.user_real_name = user_map.get(work.user_id)

    return works


@router.get("/my", response_model=List[WorkListResponse])
def list_my_works(
    work_type: Optional[WorkType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List current user's works."""
    query = db.query(Work).filter(Work.user_id == current_user.id)

    if work_type:
        query = query.filter(Work.work_type == work_type)

    works = query.order_by(Work.created_at.desc()).all()

    for work in works:
        work.user_real_name = current_user.real_name

    return works


@router.get("/{work_id}", response_model=WorkResponse)
def get_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific work by ID."""
    work = db.query(Work).filter(Work.id == work_id).first()

    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found"
        )

    # Check permission: published works are public, drafts only for owner
    if work.status == WorkStatus.draft and work.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this work"
        )

    # Increment view count
    work.view_count += 1
    db.commit()

    # Attach user_liked flag
    user_like = db.query(WorkLike).filter(
        WorkLike.work_id == work_id,
        WorkLike.user_id == current_user.id
    ).first()
    work.user_liked = user_like is not None

    # Attach vote counts per award
    vote_counts = db.query(WorkVote.award_type, func.count(WorkVote.id)).filter(
        WorkVote.work_id == work_id
    ).group_by(WorkVote.award_type).all()
    work.vote_counts = {award.value: count for award, count in vote_counts}

    # Attach user_real_name
    work_user = db.query(User).filter(User.id == work.user_id).first()
    work.user_real_name = work_user.real_name if work_user else None

    return work


@router.put("/{work_id}", response_model=WorkResponse)
def update_work(
    work_id: int,
    work_update: WorkUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a work. Only the owner can update."""
    work = db.query(Work).filter(
        Work.id == work_id,
        Work.user_id == current_user.id
    ).first()

    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found or you don't have permission"
        )

    # Update fields if provided
    if work_update.title is not None:
        work.title = work_update.title
    if work_update.description is not None:
        work.description = work_update.description
    if work_update.content is not None:
        work.content = work_update.content
    if work_update.chapter_id is not None:
        work.chapter_id = work_update.chapter_id
    if work_update.status is not None:
        work.status = work_update.status

    db.commit()
    db.refresh(work)

    return work


@router.delete("/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a work. Only the owner can delete."""
    work = db.query(Work).filter(
        Work.id == work_id,
        Work.user_id == current_user.id
    ).first()

    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found or you don't have permission"
        )

    db.delete(work)
    db.commit()

    return None


@router.put("/{work_id}/pin", response_model=WorkResponse)
def pin_work(
    work_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Toggle pin status for a work (admin only)."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found"
        )
    work.is_pinned = not work.is_pinned
    db.commit()
    db.refresh(work)

    # Notify work owner
    db.add(Notification(
        user_id=work.user_id,
        notification_type=NotificationType.pinned,
        title="你的作品被置顶了" if work.is_pinned else "你的作品被取消置顶",
        content=f"管理员{'' if work.is_pinned else '取消'}置顶了你的作品《{work.title}》",
        related_id=work.id,
        related_type="work",
    ))
    db.commit()

    return work


@router.put("/{work_id}/unlist", response_model=WorkResponse)
def unlist_work(
    work_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Toggle unlist status for a work (admin only)."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found"
        )
    work.is_unlisted = not work.is_unlisted
    db.commit()
    db.refresh(work)

    # Notify work owner
    db.add(Notification(
        user_id=work.user_id,
        notification_type=NotificationType.unlisted,
        title="你的作品被下架了" if work.is_unlisted else "你的作品重新上架了",
        content=f"管理员{'' if work.is_unlisted else '取消'}下架了你的作品《{work.title}》",
        related_id=work.id,
        related_type="work",
    ))
    db.commit()

    return work


@router.post("/{work_id}/publish", response_model=WorkResponse)
def publish_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish a work to the exhibition hall."""
    work = db.query(Work).filter(
        Work.id == work_id,
        Work.user_id == current_user.id
    ).first()

    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found or you don't have permission"
        )

    work.status = WorkStatus.published
    db.commit()
    db.refresh(work)

    # Check badge eligibility
    badge_service.check_creation_star(db, current_user.id)
    badge_service.check_recitation_star(db, current_user.id)
    badge_service.check_appreciation_star(db, current_user.id)

    return work


# -------------------- Likes --------------------

@router.post("/{work_id}/like")
def like_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle like on a work."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")

    existing = db.query(WorkLike).filter(
        WorkLike.work_id == work_id,
        WorkLike.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        work.like_count = max(0, work.like_count - 1)
        db.commit()
        return {"liked": False, "like_count": work.like_count}
    else:
        db.add(WorkLike(work_id=work_id, user_id=current_user.id))
        work.like_count += 1
        db.commit()

        # Notify work owner (skip if liking own work)
        if work.user_id != current_user.id:
            db.add(Notification(
                user_id=work.user_id,
                notification_type=NotificationType.like,
                title="有人点赞了你的作品",
                content=f"用户 {current_user.username} 点赞了你的作品《{work.title}》",
                related_id=work.id,
                related_type="work",
            ))
            db.commit()

        return {"liked": True, "like_count": work.like_count}


# -------------------- Voting --------------------

@router.get("/{work_id}/votes")
def get_work_votes(
    work_id: int,
    db: Session = Depends(get_db)
):
    """Get vote counts for a work per award type."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")

    counts = db.query(WorkVote.award_type, func.count(WorkVote.id)).filter(
        WorkVote.work_id == work_id
    ).group_by(WorkVote.award_type).all()

    return {award.value: count for award, count in counts}


@router.post("/{work_id}/vote")
def vote_work(
    work_id: int,
    award_type: AwardType,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vote for a work in a specific award category."""
    settings = db.query(VoteSettings).first()
    if not settings or not settings.is_voting_open:
        raise HTTPException(status_code=403, detail="Voting is currently closed")

    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")

    # Validate award matches work type
    type_to_award = {
        WorkType.video: AwardType.best_video,
        WorkType.audio: AwardType.best_audio,
        WorkType.script: AwardType.best_script,
    }
    if type_to_award.get(work.work_type) != award_type:
        raise HTTPException(status_code=400, detail="Award type does not match work type")

    # Remove any existing vote by this user for this award
    existing = db.query(WorkVote).filter(
        WorkVote.user_id == current_user.id,
        WorkVote.award_type == award_type
    ).first()
    if existing:
        if existing.work_id == work_id:
            # Toggle off
            db.delete(existing)
            db.commit()
            return {"voted": False}
        else:
            # Switch vote to new work
            db.delete(existing)

    db.add(WorkVote(work_id=work_id, user_id=current_user.id, award_type=award_type))
    db.commit()
    return {"voted": True}


@router.get("/vote/settings", response_model=VoteSettingsResponse)
def get_vote_settings(
    db: Session = Depends(get_db)
):
    """Get current voting settings."""
    settings = db.query(VoteSettings).first()
    if not settings:
        settings = VoteSettings(is_voting_open=False)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/vote/settings", response_model=VoteSettingsResponse)
def update_vote_settings(
    data: VoteSettingsUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Toggle voting open/closed (admin only)."""
    settings = db.query(VoteSettings).first()
    if not settings:
        settings = VoteSettings(is_voting_open=data.is_voting_open)
        db.add(settings)
    else:
        settings.is_voting_open = data.is_voting_open
    db.commit()
    db.refresh(settings)
    return settings


# -------------------- Comments --------------------

@router.get("/{work_id}/comments", response_model=List[WorkCommentResponse])
def list_comments(
    work_id: int,
    db: Session = Depends(get_db)
):
    """List comments for a work."""
    comments = db.query(
        WorkComment.id,
        WorkComment.work_id,
        WorkComment.user_id,
        User.username.label("username"),
        WorkComment.content,
        WorkComment.created_at,
    ).join(User, User.id == WorkComment.user_id).filter(
        WorkComment.work_id == work_id
    ).order_by(WorkComment.created_at.desc()).all()

    return comments


@router.post("/{work_id}/comments", response_model=WorkCommentResponse)
def create_comment(
    work_id: int,
    data: WorkCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a comment to a work."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")

    comment = WorkComment(
        work_id=work_id,
        user_id=current_user.id,
        content=data.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Notify work owner (skip if commenting on own work)
    if work.user_id != current_user.id:
        db.add(Notification(
            user_id=work.user_id,
            notification_type=NotificationType.comment,
            title="有人评论了你的作品",
            content=f"用户 {current_user.username} 评论了你的作品《{work.title}》：{data.content[:50]}{'...' if len(data.content) > 50 else ''}",
            related_id=work.id,
            related_type="work",
        ))
        db.commit()

    return {
        "id": comment.id,
        "work_id": comment.work_id,
        "user_id": comment.user_id,
        "username": current_user.username,
        "content": comment.content,
        "created_at": comment.created_at,
    }


@router.delete("/{work_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    work_id: int,
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment. Admin or comment owner can delete."""
    comment = db.query(WorkComment).filter(
        WorkComment.id == comment_id,
        WorkComment.work_id == work_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You don't have permission to delete this comment")

    db.delete(comment)
    db.commit()
    return None
