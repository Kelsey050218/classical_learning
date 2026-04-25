import json
import os
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.models.chapter import Chapter  # Ensure chapters table exists in metadata
from app.models.quiz import Quiz, Question


def seed_quizzes():
    db = SessionLocal()
    try:
        # Load quiz data
        data_path = os.path.join(os.path.dirname(__file__), "data", "quizzes.json")
        with open(data_path, "r", encoding="utf-8") as f:
            quizzes_data = json.load(f)

        # Clear existing data
        db.query(Question).delete()
        db.query(Quiz).delete()
        db.commit()

        for quiz_data in quizzes_data:
            quiz = Quiz(
                title=quiz_data["title"],
                level=quiz_data["level"],
                sort_order=quiz_data["sort_order"],
                description=quiz_data.get("description"),
                pass_score=quiz_data.get("pass_score", 60),
            )
            db.add(quiz)
            db.commit()
            db.refresh(quiz)

            for idx, q_data in enumerate(quiz_data["questions"]):
                question = Question(
                    quiz_id=quiz.id,
                    question_type=q_data["question_type"],
                    content=q_data["content"],
                    options=q_data.get("options"),
                    answer=q_data.get("answer"),
                    explanation=q_data.get("explanation"),
                    score=q_data.get("score", 10),
                    sort_order=idx,
                )
                db.add(question)

            db.commit()
            print(f"Seeded quiz: {quiz.title} with {len(quiz_data['questions'])} questions")

        print("Quiz seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding quizzes: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_quizzes()
