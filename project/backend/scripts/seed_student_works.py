import sys
import os

# 将backend目录加入路径，以便导入app模块
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from datetime import datetime
import random
import string

from app.config.database import SessionLocal
from app.models.user import User, UserRole
from app.models.work import Work, WorkType, WorkStatus
from app.models.chapter import Chapter  # noqa: F401 - register in metadata for FK resolution
from app.utils.security import get_password_hash


def generate_student_id() -> str:
    """Generate a unique student ID in format STU + 8 digits."""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = ''.join(random.choices(string.digits, k=4))
    return f"STU{timestamp}{random_suffix}"


STUDENTS = [
    {"real_name": "李明轩", "username": "limingxuan"},
    {"real_name": "王雨桐", "username": "wangyutong"},
    {"real_name": "张子涵", "username": "zhangzihan"},
    {"real_name": "刘思远", "username": "liusiyuan"},
    {"real_name": "陈嘉怡", "username": "chenjiayi"},
]

PASSWORD = "123456"

WORKS = [
    {
        "title": "汉字之美：从甲骨文到楷书",
        "description": "探索汉字演变历程，感受中华文字的文化魅力",
        "file_url": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E6%B1%89%E5%AD%97%E8%A7%86%E9%A2%91.mp4",
    },
    {
        "title": "诵读经典：《诗经》选读",
        "description": "配乐朗诵《诗经》名篇，体会千年前的诗韵之美",
        "file_url": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/A%E5%90%8C%E5%AD%A6.mp4",
    },
    {
        "title": "经典解读：《论语》中的修身智慧",
        "description": "结合生活解读《论语》，分享儒家思想的当代价值",
        "file_url": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/B%E5%90%8C%E5%AD%A6%E4%BD%9C%E5%93%81.mp4",
    },
    {
        "title": "声演经典：《楚辞》吟诵",
        "description": "以声传情演绎《楚辞》篇章，展现浪漫主义诗歌风采",
        "file_url": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/C%E5%90%8C%E5%AD%A6.mp4",
    },
    {
        "title": "典籍新说：《史记》人物故事",
        "description": "生动讲述《史记》中的历史人物，让典籍走进现代课堂",
        "file_url": "https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/D%E5%90%8C%E5%AD%A6%E4%BD%9C%E5%93%81.mp4",
    },
]


def seed():
    db = SessionLocal()
    try:
        created_users = []
        for student in STUDENTS:
            # 检查是否已存在
            existing = db.query(User).filter(User.username == student["username"]).first()
            if existing:
                print(f"用户 {student['username']} 已存在，跳过")
                created_users.append(existing)
                continue

            # Generate unique student_id
            student_id = generate_student_id()
            while db.query(User).filter(User.student_id == student_id).first():
                student_id = generate_student_id()

            user = User(
                username=student["username"],
                password_hash=get_password_hash(PASSWORD),
                real_name=student["real_name"],
                student_id=student_id,
                role=UserRole.student,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            created_users.append(user)
            print(f"创建用户: {student['real_name']} ({student['username']})")

        for idx, work_data in enumerate(WORKS):
            user = created_users[idx]

            # 检查该用户是否已有同名作品
            existing_work = db.query(Work).filter(
                Work.user_id == user.id,
                Work.title == work_data["title"]
            ).first()
            if existing_work:
                print(f"作品《{work_data['title']}》已存在，跳过")
                continue

            work = Work(
                user_id=user.id,
                work_type=WorkType.video,
                title=work_data["title"],
                description=work_data["description"],
                file_url=work_data["file_url"],
                status=WorkStatus.published,
            )
            db.add(work)
            print(f"创建作品: {work_data['title']} -> {user.real_name}")

        db.commit()
        print("\n全部插入完成！")
    except Exception as e:
        db.rollback()
        print(f"插入失败: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
