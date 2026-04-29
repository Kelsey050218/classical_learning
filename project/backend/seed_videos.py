"""Seed three exhibition videos into the works table."""
import sys
sys.path.insert(0, '/Users/macbookpro/经典常谈/project/backend')

from app.config.database import SessionLocal
from app.models.work import Work, WorkType, WorkStatus
from app.models.user import User
from app.models.chapter import Chapter  # noqa: F401 — registers chapters table in metadata


def seed_videos():
    db = SessionLocal()

    # Find or create an admin/system user
    user = db.query(User).filter(User.role == 'teacher').first()
    if not user:
        user = db.query(User).first()
    if not user:
        print("No user found. Creating a default user...")
        user = User(
            username="admin",
            name="系统管理员",
            role="teacher",
            password_hash="$2b$12$placeholder",  # Not for login
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    videos = [
        {
            "title": "汉字的演变——动画",
            "description": "以动画形式生动展现汉字从甲骨文到楷书的演变历程，让文字活起来。",
            "content": "本视频通过精美的动画，展现了汉字从甲骨文、金文、小篆、隶书到楷书的演变过程，让观众直观感受汉字之美。",
            "file_url": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E6%B1%89%E5%AD%97%E7%9A%84%E6%BC%94%E5%8F%98-%E5%8A%A8%E7%94%BB.mp4",
        },
        {
            "title": "汉字的演变——科普",
            "description": "科普讲解汉字的起源与演变，深入浅出地介绍汉字文化。",
            "content": "本视频以科普视角讲解汉字的起源，从仓颉造字的传说到甲骨文的发现，再到现代汉字的规范化，系统梳理汉字发展的历史脉络。",
            "file_url": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E6%B1%89%E5%AD%97%E7%9A%84%E6%BC%94%E5%8F%98-%E7%A7%91%E6%99%AE.mp4",
        },
        {
            "title": "《诗经》导读",
            "description": "走进中国第一部诗歌总集，感受三千年前的先民情怀。",
            "content": "本视频带领观众走进《诗经》的世界，从\"关关雎鸠\"到\"蒹葭苍苍\"，感受先秦时期的风雅颂，体会先民的情感与智慧。",
            "file_url": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E8%AF%97%E7%BB%8F.mp4",
        },
    ]

    for v in videos:
        existing = db.query(Work).filter(Work.title == v["title"]).first()
        if existing:
            print(f"Skipping existing: {v['title']}")
            continue

        work = Work(
            user_id=user.id,
            work_type=WorkType.video,
            title=v["title"],
            description=v["description"],
            content=v["content"],
            file_url=v["file_url"],
            status=WorkStatus.published,
        )
        db.add(work)
        print(f"Added: {v['title']}")

    db.commit()
    print("Done seeding videos.")
    db.close()


if __name__ == "__main__":
    seed_videos()
