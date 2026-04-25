from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.learning import LearningProgress, ProjectStatus
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.learning import (
    LearningProgressResponse,
    ProjectProgress,
    SubProjectProgress,
)

router = APIRouter(prefix="/learning", tags=["learning"])

# Project structure definition
PROJECTS = [
    {
        "id": 1,
        "slug": "reading",
        "name": "回到历史现场-经典溯源档案馆",
        "description": "穿越时光隧道，探寻典籍起源，建立经典文化的时间坐标系",
        "icon": "book",
        "sub_projects": [
            {"id": 1, "slug": "timeline", "name": "典籍时间轴", "path": "/timeline"},
        ],
        "unlock_condition": None,
    },
    {
        "id": 2,
        "slug": "dialogue",
        "name": "现实问题驱动-经典当代对话站",
        "description": "以现实问题为驱动，与经典展开跨时空对话，创作当代解读",
        "icon": "message",
        "sub_projects": [
            {"id": 4, "slug": "forum", "name": "经典思想论坛", "path": "/forum"},
            {"id": 5, "slug": "ai_script", "name": "AI 短视频脚本", "path": "/ai-script"},
        ],
        "unlock_condition": {"project_id": 1, "status": "completed"},
    },
    {
        "id": 3,
        "slug": "creation",
        "name": "沉浸式体验-经典角色穿越馆",
        "description": "化身经典角色，用声演和视频创作沉浸式体验传统文化",
        "icon": "video",
        "sub_projects": [
            {"id": 8, "slug": "audio", "name": "经典声演", "path": "/audio-perf"},
            {"id": 9, "slug": "video", "name": "典籍长视频剪辑", "path": "/video-edit"},
            {"id": 10, "slug": "capcut", "name": "剪映创作", "path": "https://www.capcut.cn", "is_external": True},
        ],
        "unlock_condition": {"project_id": 2, "status": "completed"},
    },
]

SUB_PROJECT_MAP = {}
for p in PROJECTS:
    for sp in p["sub_projects"]:
        SUB_PROJECT_MAP[sp["id"]] = {**sp, "project_id": p["id"]}


@router.get("/projects")
def get_learning_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full learning project tree with user progress and unlock status."""
    # Get all progress records for user
    progress_records = db.query(LearningProgress).filter(
        LearningProgress.user_id == current_user.id
    ).all()

    # Build lookup maps
    progress_map = {}
    project_status = {}
    for r in progress_records:
        progress_map[r.sub_project_id] = r
        # Aggregate project status
        if r.project_id not in project_status:
            project_status[r.project_id] = []
        project_status[r.project_id].append(r.status)

    # Determine project completion
    project_completion = {}
    for pid, statuses in project_status.items():
        if all(s == ProjectStatus.completed for s in statuses):
            project_completion[pid] = "completed"
        elif any(s in (ProjectStatus.in_progress, ProjectStatus.completed) for s in statuses):
            project_completion[pid] = "in_progress"
        else:
            project_completion[pid] = "locked"

    # Build response
    result = []
    for project in PROJECTS:
        pid = project["id"]

        # Determine project status
        if project["unlock_condition"] is None:
            # First project always available
            proj_status = project_completion.get(pid, "locked")
            if proj_status == "locked":
                proj_status = "in_progress"  # Auto unlock first project
        else:
            cond = project["unlock_condition"]
            req_project_id = cond["project_id"]
            req_status = cond["status"]

            req_proj_status = project_completion.get(req_project_id, "locked")
            if req_proj_status == req_status or (req_status == "completed" and req_proj_status in ("completed", "in_progress")):
                proj_status = project_completion.get(pid, "locked")
                if proj_status == "locked":
                    proj_status = "in_progress"  # Auto unlock if condition met
            else:
                proj_status = "locked"

        # Build sub-projects with status
        sub_projects = []
        completed_count = 0
        for sp in project["sub_projects"]:
            sp_id = sp["id"]
            record = progress_map.get(sp_id)
            if record:
                sp_status = record.status.value
                if record.status == ProjectStatus.completed:
                    completed_count += 1
            else:
                # Auto-create progress for unlocked projects
                if proj_status != "locked":
                    sp_status = "in_progress"
                    # Optionally create record in DB
                else:
                    sp_status = "locked"

            sub_projects.append({
                **sp,
                "status": sp_status,
            })

        total_count = len(project["sub_projects"])
        progress_pct = int((completed_count / total_count) * 100) if total_count > 0 else 0

        result.append({
            "id": pid,
            "slug": project["slug"],
            "name": project["name"],
            "description": project["description"],
            "icon": project["icon"],
            "status": proj_status,
            "progress": progress_pct,
            "completed_count": completed_count,
            "total_count": total_count,
            "sub_projects": sub_projects,
            "unlock_condition": project["unlock_condition"],
        })

    return result


@router.post("/projects/{project_id}/complete")
def complete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all sub-projects in a project as completed."""
    project = next((p for p in PROJECTS if p["id"] == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for sp in project["sub_projects"]:
        progress = db.query(LearningProgress).filter(
            LearningProgress.user_id == current_user.id,
            LearningProgress.sub_project_id == sp["id"]
        ).first()

        if progress:
            progress.status = ProjectStatus.completed
            progress.completed_at = datetime.utcnow()
        else:
            progress = LearningProgress(
                user_id=current_user.id,
                project_id=project_id,
                sub_project_id=sp["id"],
                status=ProjectStatus.completed,
                unlocked_at=datetime.utcnow(),
                completed_at=datetime.utcnow()
            )
            db.add(progress)

    db.commit()
    return {"message": f"Project {project_id} marked as completed"}


@router.get("/progress", response_model=List[ProjectProgress])
def get_learning_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's learning progress grouped by project."""
    # Get all progress records for user
    progress_records = db.query(LearningProgress).filter(
        LearningProgress.user_id == current_user.id
    ).all()

    # Group by project
    project_map = {}
    for record in progress_records:
        if record.project_id not in project_map:
            project_map[record.project_id] = []
        project_map[record.project_id].append(record)

    # Build response
    result = []
    for project_id, sub_projects in project_map.items():
        sub_project_list = []
        completed_count = 0

        for sp in sub_projects:
            sub_project_list.append(SubProjectProgress(
                sub_project_id=sp.sub_project_id,
                status=sp.status,
                unlocked_at=sp.unlocked_at,
                completed_at=sp.completed_at
            ))
            if sp.status == ProjectStatus.completed:
                completed_count += 1

        result.append(ProjectProgress(
            project_id=project_id,
            sub_projects=sub_project_list,
            completed_count=completed_count,
            total_count=len(sub_project_list)
        ))

    return result


@router.post("/progress/{sub_project_id}/unlock", response_model=LearningProgressResponse)
def unlock_sub_project(
    sub_project_id: int,
    project_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlock a sub-project for the user."""
    # Check if progress record exists
    progress = db.query(LearningProgress).filter(
        LearningProgress.user_id == current_user.id,
        LearningProgress.sub_project_id == sub_project_id
    ).first()

    if progress:
        if progress.status != ProjectStatus.locked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sub-project is already unlocked or completed"
            )
        progress.status = ProjectStatus.in_progress
        progress.unlocked_at = datetime.utcnow()
    else:
        if project_id is None:
            # Infer project_id from SUB_PROJECT_MAP
            sp_info = SUB_PROJECT_MAP.get(sub_project_id)
            if sp_info:
                project_id = sp_info["project_id"]
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="project_id is required for new progress records"
                )

        # Create new progress record
        progress = LearningProgress(
            user_id=current_user.id,
            project_id=project_id,
            sub_project_id=sub_project_id,
            status=ProjectStatus.in_progress,
            unlocked_at=datetime.utcnow()
        )
        db.add(progress)

    db.commit()
    db.refresh(progress)

    return progress


@router.post("/progress/{sub_project_id}/complete", response_model=LearningProgressResponse)
def complete_sub_project(
    sub_project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a sub-project as completed for the user."""
    # Get progress record
    progress = db.query(LearningProgress).filter(
        LearningProgress.user_id == current_user.id,
        LearningProgress.sub_project_id == sub_project_id
    ).first()

    if not progress:
        # Auto-create and complete
        sp_info = SUB_PROJECT_MAP.get(sub_project_id)
        if not sp_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sub-project not found"
            )

        progress = LearningProgress(
            user_id=current_user.id,
            project_id=sp_info["project_id"],
            sub_project_id=sub_project_id,
            status=ProjectStatus.completed,
            unlocked_at=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
        return progress

    if progress.status == ProjectStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sub-project is already completed"
        )

    if progress.status == ProjectStatus.locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sub-project is locked. Unlock it first."
        )

    progress.status = ProjectStatus.completed
    progress.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(progress)

    return progress
