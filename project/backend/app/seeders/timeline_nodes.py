from app.config.database import SessionLocal
from app.models.timeline_node import TimelineNode


def seed_timeline_nodes():
    """Seed pre-defined timeline nodes for classics learning."""
    db = SessionLocal()

    nodes = [
        {
            "era": "先秦",
            "period": "西周—战国",
            "title": "诗歌源头",
            "content": "诗的源头是歌谣，《诗经》是最早的诗歌总集，《楚辞》开浪漫骚体之先河。《诗经》以四言为主，现实主义风格，分为风雅颂，运用赋比兴手法。《楚辞》采用骚体，浪漫主义风格，以屈原《离骚》为代表。",
            "key_points": [
                "《诗经》：四言为主，现实主义，风雅颂/赋比兴",
                "《楚辞》：骚体，浪漫主义，屈原《离骚》"
            ],
            "sort_order": 1
        },
        {
            "era": "汉代",
            "period": "西汉—东汉",
            "title": "乐府与五言兴起",
            "content": "乐府采诗，感于哀乐、缘事而发。五言诗起于民间，《古诗十九首》被誉为'五言冠冕'。汉乐府以叙事诗为主，《孔雀东南飞》为代表；古诗十九首则以抒情五言见长，标志文人诗的开端。",
            "key_points": [
                "汉乐府：叙事诗为主，《孔雀东南飞》",
                "古诗十九首：抒情五言，文人诗开端"
            ],
            "sort_order": 2
        },
        {
            "era": "魏晋南北朝",
            "period": "三国—南北朝",
            "title": "文人诗成熟",
            "content": "建安诗慷慨悲凉，陶渊明开田园诗先河，谢灵运开山水诗先河，永明体重声律。建安风骨刚健，曹操、曹植为代表；陶渊明田园诗平淡自然；永明体讲究平仄，为唐诗奠基。",
            "key_points": [
                "建安：曹操、曹植，风骨刚健",
                "陶渊明：田园诗鼻祖，平淡自然",
                "永明体：讲究平仄，为唐诗奠基"
            ],
            "sort_order": 3
        },
        {
            "era": "唐代",
            "period": "初唐—中晚唐",
            "title": "诗歌巅峰",
            "content": "唐诗集大成，近体诗格律完备，题材、风格极盛。近体诗包括律诗、绝句，格律严谨。李白代表浪漫主义，杜甫代表现实主义，白居易倡导新乐府运动。",
            "key_points": [
                "近体诗：律诗、绝句，格律严谨",
                "李白（浪漫）、杜甫（写实）、白居易（新乐府）"
            ],
            "sort_order": 4
        },
        {
            "era": "宋代",
            "period": "北宋—南宋",
            "title": "词代诗兴",
            "content": "诗至唐已极，宋人以词为正宗，词合乐可歌。词又称诗余，以长短句为特征。婉约派以柳永、李清照为代表，豪放派以苏轼、辛弃疾为代表。",
            "key_points": [
                "婉约：柳永、李清照",
                "豪放：苏轼、辛弃疾"
            ],
            "sort_order": 5
        },
        {
            "era": "元代",
            "period": "元代",
            "title": "曲起代诗",
            "content": "元曲更通俗、合乐，成为元代文学代表。散曲兴起，取代诗词主流地位。包括小令、套数等形式，通俗自然，贴近民间生活。",
            "key_points": [
                "小令、套数",
                "通俗自然，贴近民间"
            ],
            "sort_order": 6
        }
    ]

    try:
        # Clear existing nodes
        db.query(TimelineNode).delete()
        db.commit()

        for node_data in nodes:
            node = TimelineNode(**node_data)
            db.add(node)

        db.commit()
        print(f"Seeded {len(nodes)} timeline nodes successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding timeline nodes: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_timeline_nodes()
