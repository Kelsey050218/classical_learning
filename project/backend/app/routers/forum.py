from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config.database import get_db
from app.models.learning import ForumTopic, ForumPost, ForumVote, TopicStatus
from app.models.user import User
from app.routers.auth import get_current_user
from app.services import badge_service
from app.schemas.learning import (
    ForumTopicResponse,
    ForumTopicListResponse,
    ForumPostCreate,
    ForumPostResponse,
    ForumPostWithUserResponse,
    VoteCreate,
    VoteResponse,
    VoteSummaryResponse,
)

router = APIRouter(prefix="/forum", tags=["forum"])


@router.get("/topics", response_model=List[ForumTopicListResponse])
def list_topics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all active topics with post counts."""
    topics = db.query(ForumTopic).filter(ForumTopic.status == TopicStatus.active).all()

    result = []
    for topic in topics:
        post_count = db.query(ForumPost).filter(ForumPost.topic_id == topic.id).count()
        result.append(ForumTopicListResponse(
            id=topic.id,
            title=topic.title,
            description=topic.description,
            status=topic.status,
            post_count=post_count,
            created_at=topic.created_at
        ))

    return result


@router.post("/topics/{topic_id}/posts", response_model=ForumPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    topic_id: int,
    post_create: ForumPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post in a topic."""
    # Verify topic exists and is active
    topic = db.query(ForumTopic).filter(
        ForumTopic.id == topic_id,
        ForumTopic.status == TopicStatus.active
    ).first()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found or inactive"
        )

    # Validate stance if provided
    if post_create.stance and post_create.stance not in ["support", "oppose", "neutral"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stance must be one of: support, oppose, neutral"
        )

    # Create post
    db_post = ForumPost(
        topic_id=topic_id,
        user_id=current_user.id,
        content=post_create.content,
        stance=post_create.stance
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # Check badge eligibility
    badge_service.check_thinking_star(db, current_user.id)

    return ForumPostResponse(
        id=db_post.id,
        topic_id=db_post.topic_id,
        user_id=db_post.user_id,
        content=db_post.content,
        stance=db_post.stance,
        upvotes=0,
        downvotes=0,
        score=0,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at
    )


@router.get("/topics/{topic_id}/posts", response_model=List[ForumPostWithUserResponse])
def list_posts(
    topic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all posts in a topic with vote counts and user's vote status."""
    # Verify topic exists
    topic = db.query(ForumTopic).filter(ForumTopic.id == topic_id).first()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )

    # Get all posts with user info
    posts = db.query(ForumPost, User.username).join(
        User, ForumPost.user_id == User.id
    ).filter(ForumPost.topic_id == topic_id).all()

    # Get user's votes for these posts
    post_ids = [post.ForumPost.id for post in posts]
    user_votes = db.query(ForumVote).filter(
        ForumVote.post_id.in_(post_ids),
        ForumVote.user_id == current_user.id
    ).all()
    user_vote_map = {v.post_id: v.vote_type for v in user_votes}

    # Calculate vote counts for each post
    vote_counts = db.query(
        ForumVote.post_id,
        ForumVote.vote_type,
        func.count(ForumVote.id).label("count")
    ).filter(ForumVote.post_id.in_(post_ids)).group_by(
        ForumVote.post_id,
        ForumVote.vote_type
    ).all()

    vote_map = {}
    for vc in vote_counts:
        if vc.post_id not in vote_map:
            vote_map[vc.post_id] = {"up": 0, "down": 0}
        vote_map[vc.post_id][vc.vote_type] = vc.count

    # Build response
    result = []
    for post, username in posts:
        votes = vote_map.get(post.id, {"up": 0, "down": 0})
        upvotes = votes.get("up", 0)
        downvotes = votes.get("down", 0)

        result.append(ForumPostWithUserResponse(
            id=post.id,
            topic_id=post.topic_id,
            user_id=post.user_id,
            username=username,
            content=post.content,
            stance=post.stance,
            upvotes=upvotes,
            downvotes=downvotes,
            score=upvotes - downvotes,
            user_vote=user_vote_map.get(post.id),
            created_at=post.created_at,
            updated_at=post.updated_at
        ))

    # Sort by score (descending), then by created_at (descending)
    result.sort(key=lambda x: (-x.score, -x.created_at.timestamp()))

    return result


@router.post("/posts/{post_id}/vote", response_model=VoteSummaryResponse)
def vote_post(
    post_id: int,
    vote_create: VoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vote on a post (upvote or downvote). One vote per user per post."""
    # Validate vote type
    if vote_create.vote_type not in ["up", "down"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vote type must be 'up' or 'down'"
        )

    # Verify post exists
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # Check for existing vote
    existing_vote = db.query(ForumVote).filter(
        ForumVote.post_id == post_id,
        ForumVote.user_id == current_user.id
    ).first()

    if existing_vote:
        if existing_vote.vote_type == vote_create.vote_type:
            # Remove vote if same type (toggle off)
            db.delete(existing_vote)
            db.commit()
        else:
            # Update vote type
            existing_vote.vote_type = vote_create.vote_type
            db.commit()
    else:
        # Create new vote
        new_vote = ForumVote(
            post_id=post_id,
            user_id=current_user.id,
            vote_type=vote_create.vote_type
        )
        db.add(new_vote)
        db.commit()

    # Get updated vote counts
    vote_counts = db.query(
        ForumVote.vote_type,
        func.count(ForumVote.id).label("count")
    ).filter(ForumVote.post_id == post_id).group_by(ForumVote.vote_type).all()

    upvotes = sum(vc.count for vc in vote_counts if vc.vote_type == "up")
    downvotes = sum(vc.count for vc in vote_counts if vc.vote_type == "down")

    # Get user's current vote
    user_vote = db.query(ForumVote).filter(
        ForumVote.post_id == post_id,
        ForumVote.user_id == current_user.id
    ).first()

    return VoteSummaryResponse(
        post_id=post_id,
        upvotes=upvotes,
        downvotes=downvotes,
        score=upvotes - downvotes,
        user_vote=user_vote.vote_type if user_vote else None
    )
