#!/usr/bin/env python3
"""Parse 《经典常谈》通关打卡题库（终极版）.docx and import into database."""

import json
import re
from docx import Document
import pymysql

DOCX_PATH = "/Users/macbookpro/经典常谈/docs/data/《经典常谈》通关打卡题库（终极版）.docx"

DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "classics_user",
    "password": "YOUR_PASSWORD",
    "database": "classics_learning",
    "charset": "utf8mb4",
}

CHAPTER_MAP = {
    "《说文解字》第一": 1,
    "《周易》第二": 2,
    "《尚书》第三": 3,
    "《诗经》第四": 4,
    "三礼第五": 5,
    "\"三礼\"第五": 5,
    "《春秋》三传第六": 6,
    "四书第七": 7,
    "\"四书\"第七": 7,
    "《战国策》第八": 8,
    "《史记》《汉书》第九": 9,
    "诸子第十": 10,
    "辞赋第十一": 11,
    "诗第十二": 12,
    "文第十三": 13,
}


def normalize_chapter_title(text: str) -> str:
    text = text.strip()
    # Remove trailing （8题）
    text = re.sub(r"（\d+题）$", "", text)
    return text


def extract_question_type(text: str) -> tuple:
    """Extract question type from text like '1.【填空题】...' -> ('fill', rest)"""
    match = re.match(r"^(\d+)\.【(.+?)】(.+)$", text.strip(), re.DOTALL)
    if match:
        num = match.group(1)
        qtype = match.group(2).strip()
        rest = match.group(3).strip()
        return num, qtype, rest
    return None, None, text


def map_question_type(qtype: str) -> str:
    if qtype == "选择题":
        return "choice"
    if qtype == "填空题":
        return "fill"
    return "short"


def parse_docx():
    doc = Document(DOCX_PATH)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

    chapters = []
    current_chapter = None
    current_question = None
    buffer = []

    i = 0
    while i < len(paragraphs):
        text = paragraphs[i]

        # Detect chapter header
        if re.search(r"（\d+题）$", text) and any(
            keyword in text for keyword in ["《说文解字》", "《周易》", "《尚书》", "《诗经》", "三礼", "《春秋》", "四书", "《战国策》", "《史记》", "诸子", "辞赋", "诗第十二", "文第十三"]
        ):
            if current_chapter:
                if current_question:
                    current_chapter["questions"].append(current_question)
                    current_question = None
                chapters.append(current_chapter)
            title = normalize_chapter_title(text)
            current_chapter = {"title": title, "questions": []}
            i += 1
            continue

        # Detect tier labels like 【基础识记】一阶1梯
        if text.startswith("【") and "阶" in text and "梯" in text:
            i += 1
            continue

        # Detect question start
        num, qtype, rest = extract_question_type(text)
        if num:
            if current_question:
                current_chapter["questions"].append(current_question)
            current_question = {
                "num": int(num),
                "type": map_question_type(qtype),
                "raw_type": qtype,
                "content": rest,
                "options": [],
                "answer": None,
            }
            i += 1
            continue

        # Detect options A/B/C/D
        if current_question and re.match(r"^[A-D]\.\s*", text):
            current_question["options"].append(text)
            i += 1
            continue

        # Detect answer
        if text.startswith("【答案】"):
            if current_question:
                current_question["answer"] = text.replace("【答案】", "").strip()
            i += 1
            continue

        # If we are inside a question and it's not an option/answer, append to content or answer
        if current_question:
            # If answer was already set, append to answer (multi-line answer)
            if current_question["answer"] is not None:
                current_question["answer"] += "\n" + text
            else:
                current_question["content"] += "\n" + text

        i += 1

    if current_chapter:
        if current_question:
            current_chapter["questions"].append(current_question)
        chapters.append(current_chapter)

    return chapters


def insert_into_db(chapters):
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Clear existing data
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    cursor.execute("TRUNCATE TABLE quiz_attempts")
    cursor.execute("TRUNCATE TABLE questions")
    cursor.execute("TRUNCATE TABLE quizzes")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

    for ch in chapters:
        title = ch["title"]
        chapter_id = CHAPTER_MAP.get(title)
        if not chapter_id:
            print(f"Warning: unknown chapter title '{title}', skipping")
            continue

        # Get sort_order from chapters table
        cursor.execute("SELECT sort_order FROM chapters WHERE id = %s", (chapter_id,))
        row = cursor.fetchone()
        sort_order = row[0] if row else 0

        quiz_title = f"{title}闯关"
        cursor.execute(
            "INSERT INTO quizzes (title, chapter_id, level, sort_order, description, pass_score) VALUES (%s, %s, %s, %s, %s, %s)",
            (quiz_title, chapter_id, 1, sort_order, None, 0),
        )
        quiz_id = cursor.lastrowid

        for q in ch["questions"]:
            content = q["content"]
            options = json.dumps(q["options"], ensure_ascii=False) if q["options"] else None
            answer = q["answer"]
            qtype = q["type"]

            # Clean up options: remove trailing newlines in answer
            if answer:
                answer = answer.strip()

            cursor.execute(
                "INSERT INTO questions (quiz_id, question_type, content, options, answer, explanation, score, sort_order) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (quiz_id, qtype, content, options, answer, None, 10, q["num"]),
            )

        print(f"Inserted quiz for {title} with {len(ch['questions'])} questions")

    conn.commit()
    conn.close()


if __name__ == "__main__":
    chapters = parse_docx()
    print(f"Parsed {len(chapters)} chapters")
    for ch in chapters:
        print(f"  {ch['title']}: {len(ch['questions'])} questions")
    insert_into_db(chapters)
    print("Done!")
