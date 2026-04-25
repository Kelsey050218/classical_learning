from app.config.database import SessionLocal
from app.models.annotation_demo import AnnotationDemo
from app.models.chapter import Chapter  # Import to ensure FK target is in metadata


DEMOS_DATA = [
    # Chapter 1: 说文解字
    {
        "chapter_id": 1,
        "demo_type": "knowledge",
        "selected_text": "六书",
        "content": "六书是古人分析汉字造字和用字方法而归纳出的六种条例：象形、指事、会意、形声、转注、假借。",
        "explanation": "知识批注：补充背景知识，帮助理解专业术语。"
    },
    {
        "chapter_id": 1,
        "demo_type": "connection",
        "selected_text": "仓颉造字",
        "content": "仓颉造字的传说与西方普罗米修斯盗火的传说有异曲同工之妙，都体现了人类对文明起源的敬畏。",
        "explanation": "关联批注：将文本内容与其他知识或生活经验联系起来。"
    },
    {
        "chapter_id": 1,
        "demo_type": "question",
        "selected_text": "天雨粟，鬼夜哭",
        "content": "为什么仓颉造字时'天雨粟，鬼夜哭'？这是否说明文字的发明具有某种神秘的力量？",
        "explanation": "质疑批注：对文本内容提出疑问，激发深入思考。"
    },
    {
        "chapter_id": 1,
        "demo_type": "evaluation",
        "selected_text": "文字可以增进人的能力，也可以增进人的巧诈",
        "content": "朱自清这句话深刻揭示了文字的双重性：它既是文明的载体，也可能被用来欺骗。这种辩证思维值得我们学习。",
        "explanation": "评价批注：对作者观点进行评价，表达自己的见解。"
    },
    # Chapter 2: 周易
    {
        "chapter_id": 2,
        "demo_type": "knowledge",
        "selected_text": "八卦",
        "content": "八卦由阴阳两爻组合而成：乾（天）、坤（地）、震（雷）、巽（风）、坎（水）、离（火）、艮（山）、兑（泽）。",
        "explanation": "知识批注：补充八卦的基本构成和象征意义。"
    },
    {
        "chapter_id": 2,
        "demo_type": "connection",
        "selected_text": "阴阳",
        "content": "阴阳思想不仅见于《周易》，中医理论也以阴阳平衡为基础，如'阴平阳秘，精神乃治'。",
        "explanation": "关联批注：将《周易》阴阳思想与中医知识联系。"
    },
    # Chapter 4: 诗经
    {
        "chapter_id": 4,
        "demo_type": "knowledge",
        "selected_text": "赋比兴",
        "content": "赋：直陈其事；比：以彼物比此物；兴：先言他物以引起所咏之词。这三者是《诗经》最基本的艺术手法。",
        "explanation": "知识批注：解释《诗经》核心艺术手法的含义。"
    },
    {
        "chapter_id": 4,
        "demo_type": "evaluation",
        "selected_text": "诗言志",
        "content": "孔子将'诗言志'发展为教化工具，强调诗的社会功能；而现代人读诗，更多关注其审美价值。两种取向各有侧重。",
        "explanation": "评价批注：对比古今对诗歌功能的不同理解。"
    },
]


def seed_annotation_demos():
    """Seed annotation demo examples."""
    db = SessionLocal()

    try:
        db.query(AnnotationDemo).delete()
        db.commit()

        for demo_data in DEMOS_DATA:
            demo = AnnotationDemo(**demo_data)
            db.add(demo)

        db.commit()
        print(f"Seeded {len(DEMOS_DATA)} annotation demos successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding annotation demos: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_annotation_demos()
