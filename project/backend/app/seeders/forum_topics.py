from app.config.database import SessionLocal
from app.models.learning import ForumTopic, TopicStatus


def seed_forum_topics():
    """Seed pre-defined forum topics for classics discussion."""
    db = SessionLocal()

    topics = [
        {
            "title": "《史记》《汉书》第九：班马之争",
            "description": "在《史记》《汉书》第九中，作者朱自清将两部史学著作并列而谈，用'谈'的方式呈现史书的特点与魅力。那么，'班马'两位作者，究竟谁更胜一筹呢？请结合具体内容阐述你的观点。",
            "status": TopicStatus.active,
            "created_by": 2
        },
        {
            "title": "《诸子》第十：如何品味百家争鸣的智慧",
            "description": "朱自清介绍了百家争鸣中的各家风采，还写了诸子产生的社会背景、诸子兴起的过程、儒学独尊的形成。为了让青少年学生能将这一著作'当作一只船，航到经典的海里去'，朱自清挖空心思呈现千年前百家争鸣思想的智慧。我们该如何品味呢？",
            "status": TopicStatus.active,
            "created_by": 2
        },
        {
            "title": "《诗》第十二：古典诗歌演变史的学习方法",
            "description": "朱自清用短小的篇幅，绘制出一部清晰明了的古典诗歌演变史，从汉乐府诗到五言、七言的形成，从古体到近体，各家代表、各派诗风等无不备述。我们如何利用好这份宝贵的脉络研究，对古典诗歌进行一次系统学习呢？",
            "status": TopicStatus.active,
            "created_by": 2
        },
        {
            "title": "《诗经》的'兴观群怨'：现代人的理解",
            "description": "《论语》提到《诗》可以兴，可以观，可以群，可以怨。兴：激发人的情感；观：观察政治得失，风俗的盛衰；群：提高人际交往能力；怨：讽刺时政。从现代人的角度，我们该如何理解《诗经》这些功用？",
            "status": TopicStatus.active,
            "created_by": 2
        }
    ]

    try:
        # Clear existing topics
        db.query(ForumTopic).delete()
        db.commit()

        for topic_data in topics:
            topic = ForumTopic(**topic_data)
            db.add(topic)

        db.commit()
        print(f"Seeded {len(topics)} forum topics successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding forum topics: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_forum_topics()
