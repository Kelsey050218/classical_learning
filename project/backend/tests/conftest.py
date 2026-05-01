import os
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config.database import Base
from app.models.user import User
from app.models.chapter import Chapter
from app.models.reading import ReadingProgress, Annotation
from app.models.learning import LearningProgress, ForumTopic, ForumPost, ForumVote, Timeline, UserBadge
from app.models.work import Work, WorkType, WorkStatus
from app.models.timeline_node import TimelineNode
from app.models.annotation_demo import AnnotationDemo
from app.models.reading_card import ReadingCard
from app.models.evaluation import Evaluation
from app.models.quiz import Quiz, Question, QuizAttempt
from app.models.checkin import CheckIn
from app.models.study_time import StudyTimeLog
from app.models.bookmark import Bookmark
from app.models.highlight import Highlight
from app.models.note import Note
from app.models.work_like import WorkLike
from app.models.work_vote import WorkVote
from app.models.work_comment import WorkComment
from app.models.vote_settings import VoteSettings
from app.models.notification import Notification
from app.models.restoration import (
    RestorationChapter, RestorationFragment, RestorationDiagnostic,
    RestorationNode, RestorationProgress, RestorationNote,
)


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db_session):
    user = User(
        username="test_student",
        password_hash="$2b$12$dummy",
        real_name="测试学生",
        student_id="TEST001",
        role="student",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
