import os
from dotenv import load_dotenv

# Load environment variables before any other imports
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import Base, engine
from app.routers import (
    auth, chapters, reading, forum, learning, timeline, works,
    timeline_nodes, ai_script, admin, annotation_demos, reading_cards,
    evaluations, quizzes, checkin, badges, materials, study_time, ai_chat,
    bookmarks, highlights, oss, notes, notifications,
    restoration, profile,
)
from app.models.user import User  # Import to ensure table is created
from app.models.chapter import Chapter  # Import to ensure table is created
from app.models.reading import ReadingProgress, Annotation  # Import to ensure table is created
from app.models.learning import LearningProgress, ForumTopic, ForumPost, ForumVote, Timeline, UserBadge  # Import to ensure table is created
from app.models.work import Work  # Import to ensure table is created
from app.models.timeline_node import TimelineNode  # Import to ensure table is created
from app.models.annotation_demo import AnnotationDemo  # Import to ensure table is created
from app.models.reading_card import ReadingCard  # Import to ensure table is created
from app.models.evaluation import Evaluation  # Import to ensure table is created
from app.models.quiz import Quiz, Question, QuizAttempt  # Import to ensure table is created
from app.models.checkin import CheckIn  # Import to ensure table is created
from app.models.study_time import StudyTimeLog  # Import to ensure table is created
from app.models.bookmark import Bookmark  # Import to ensure table is created
from app.models.highlight import Highlight  # Import to ensure table is created
from app.models.note import Note  # Import to ensure table is created
from app.models.work_like import WorkLike  # Import to ensure table is created
from app.models.work_vote import WorkVote  # Import to ensure table is created
from app.models.work_comment import WorkComment  # Import to ensure table is created
from app.models.vote_settings import VoteSettings  # Import to ensure table is created
from app.models.notification import Notification  # Import to ensure table is created
from app.models.restoration import (
    RestorationChapter, RestorationFragment, RestorationDiagnostic,
    RestorationNode, RestorationProgress, RestorationNote,
)  # Import to ensure table is created

# Create database tables (disabled to avoid DDL conflicts)
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="经典常谈伴学平台", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "http://jingdianread.nat100.top",
        "https://jingdianread.nat100.top",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(chapters.router, prefix="/api")
app.include_router(reading.router, prefix="/api")
app.include_router(forum.router, prefix="/api")
app.include_router(learning.router, prefix="/api")
app.include_router(timeline.router, prefix="/api")
app.include_router(works.router, prefix="/api")
app.include_router(timeline_nodes.router, prefix="/api")
app.include_router(ai_script.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(annotation_demos.router, prefix="/api")
app.include_router(reading_cards.router, prefix="/api")
app.include_router(evaluations.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
app.include_router(checkin.router, prefix="/api")
app.include_router(badges.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(study_time.router, prefix="/api")
app.include_router(ai_chat.router, prefix="/api")
app.include_router(bookmarks.router, prefix="/api")
app.include_router(highlights.router, prefix="/api")
app.include_router(oss.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(restoration.router, prefix="/api")
app.include_router(profile.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "经典常谈伴学平台运行正常"}
