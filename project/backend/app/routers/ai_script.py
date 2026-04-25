import os
import json
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.models.chapter import Chapter
from app.routers.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


class ScriptScene(BaseModel):
    shot_number: int
    scene: str
    shot_content: str
    camera_movement: str
    lighting_tone: str
    sound_design: str
    feeling: str


class ScriptGenerateRequest(BaseModel):
    chapter_id: int
    scene: Optional[str] = None
    style: Optional[str] = "classical"  # classical, modern, humorous


class ScriptGenerateResponse(BaseModel):
    title: str
    script_text: str
    scenes: List[ScriptScene]


# Mock script generation based on chapter content
CHAPTER_SCRIPT_TEMPLATES = {
    1: {  # 《说文解字》第一
        "title": "《说文解字》：汉字的奥秘",
        "scenes": [
            {
                "shot_number": 1,
                "scene": "书房内，古籍堆叠",
                "shot_content": "展示《说文解字》古籍封面，镜头缓缓推近书名",
                "camera_movement": "推镜头，从全景到特写",
                "lighting_tone": "温暖的烛光色调，昏黄柔和",
                "sound_design": "翻书声，古琴背景音乐",
                "feeling": "神秘而庄重的学术氛围"
            },
            {
                "shot_number": 2,
                "scene": "仓颉造字传说场景",
                "shot_content": "动画展示仓颉观察鸟兽足迹，创造文字的过程",
                "camera_movement": "跟拍镜头，跟随仓颉的视线移动",
                "lighting_tone": "神话般的金色光芒",
                "sound_design": "鸟鸣声，脚步声，创造文字时的神奇音效",
                "feeling": " awe-inspiring, 远古智慧的震撼"
            },
            {
                "shot_number": 3,
                "scene": "六书造字法演示",
                "shot_content": "分别展示象形、指事、会意、形声四种造字法的例子",
                "camera_movement": "分屏切换，每种造字法一个画面",
                "lighting_tone": "明亮的自然光，清晰明快",
                "sound_design": "笔墨书写声，讲解配音",
                "feeling": "清晰明了，易于理解的知识传递"
            }
        ]
    },
    2: {  # 《周易》第二
        "title": "《周易》：阴阳的智慧",
        "scenes": [
            {
                "shot_number": 1,
                "scene": "太极图旋转",
                "shot_content": "黑白太极图缓缓旋转，阴阳鱼相互追逐",
                "camera_movement": "俯拍旋转镜头",
                "lighting_tone": "黑白对比强烈，太极图边缘有微光",
                "sound_design": "深沉的鼓声，宇宙般的空灵音乐",
                "feeling": "宇宙洪荒，阴阳平衡的哲学之美"
            },
            {
                "shot_number": 2,
                "scene": "古代占卜场景",
                "shot_content": "展示蓍草占卜过程，手指灵活操作",
                "camera_movement": "特写镜头，聚焦手指动作",
                "lighting_tone": "神秘的暗色调，只有占卜区域有光",
                "sound_design": "蓍草摩擦声，神秘的吟唱",
                "feeling": "神秘莫测，古人对天命的敬畏"
            },
            {
                "shot_number": 3,
                "scene": "八卦图演化",
                "shot_content": "从太极生两仪，两仪生四象，四象生八卦的动画演示",
                "camera_movement": "逐步拉远，展示完整的八卦系统",
                "lighting_tone": "渐变光效，从暗到明",
                "sound_design": "清脆的卦象生成音效",
                "feeling": "秩序井然，万物生成的奇妙"
            }
        ]
    }
}


def generate_mock_script(chapter_id: int, scene_hint: Optional[str] = None, style: str = "classical") -> dict:
    """Generate a mock script based on chapter ID."""
    chapter = CHAPTER_SCRIPT_TEMPLATES.get(chapter_id)

    if not chapter:
        # Generate a generic script for chapters without templates
        chapter = {
            "title": f"《经典常谈》第{chapter_id}章",
            "scenes": [
                {
                    "shot_number": 1,
                    "scene": scene_hint or "经典典籍书房",
                    "shot_content": "展示经典古籍，缓缓翻开书页",
                    "camera_movement": "推镜头，从全景到特写",
                    "lighting_tone": "温暖的书房灯光",
                    "sound_design": "翻书声，古琴音乐",
                    "feeling": "古典雅致的学术氛围"
                },
                {
                    "shot_number": 2,
                    "scene": "内容讲解场景",
                    "shot_content": "用画面展示本章核心内容",
                    "camera_movement": "平移镜头",
                    "lighting_tone": "明亮的自然光",
                    "sound_design": "讲解配音，适当的背景音乐",
                    "feeling": "清晰明了的知识传递"
                },
                {
                    "shot_number": 3,
                    "scene": "总结与感悟",
                    "shot_content": "回到书房，合上书卷",
                    "camera_movement": "拉镜头，从特写到全景",
                    "lighting_tone": "夕阳余晖，温暖而略带感伤",
                    "sound_design": "古琴收尾，余音袅袅",
                    "feeling": "回味无穷，经典的永恒魅力"
                }
            ]
        }

    # Build script text from scenes
    script_lines = [f"标题：{chapter['title']}\n"]
    script_lines.append("=" * 50 + "\n")

    for scene in chapter["scenes"]:
        script_lines.append(f"\n【镜头 {scene['shot_number']}】\n")
        script_lines.append(f"场景：{scene['scene']}\n")
        script_lines.append(f"画面内容：{scene['shot_content']}\n")
        script_lines.append(f"景别与运动：{scene['camera_movement']}\n")
        script_lines.append(f"色调与光影：{scene['lighting_tone']}\n")
        script_lines.append(f"声音设计：{scene['sound_design']}\n")
        script_lines.append(f"传达感觉：{scene['feeling']}\n")

    script_text = "".join(script_lines)

    return {
        "title": chapter["title"],
        "script_text": script_text,
        "scenes": chapter["scenes"]
    }


@router.post("/generate-script", response_model=ScriptGenerateResponse)
def generate_script(
    request: ScriptGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a short video script for a chapter using AI."""
    # Verify chapter exists
    chapter = db.query(Chapter).filter(Chapter.id == request.chapter_id).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    # TODO: Integrate with Doubao/ByteDance API for real AI generation
    # For now, use mock generation
    result = generate_mock_script(
        chapter_id=request.chapter_id,
        scene_hint=request.scene,
        style=request.style or "classical"
    )

    # Build response scenes
    scenes = []
    for scene_data in result["scenes"]:
        scenes.append(ScriptScene(**scene_data))

    return ScriptGenerateResponse(
        title=result["title"],
        script_text=result["script_text"],
        scenes=scenes
    )
