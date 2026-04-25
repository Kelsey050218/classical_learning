import os
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import create_engine, text
from app.config.database import DATABASE_URL

# Fallback if DATABASE_URL is not imported correctly
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    if "mysql" in DATABASE_URL:
        conn.execute(text("ALTER TABLE reading_progress ADD COLUMN is_unlocked BOOLEAN DEFAULT FALSE"))
    else:
        # SQLite
        conn.execute(text("ALTER TABLE reading_progress ADD COLUMN is_unlocked BOOLEAN DEFAULT 0"))
    conn.commit()
    print("Column is_unlocked added to reading_progress")
