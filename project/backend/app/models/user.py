from sqlalchemy import Column, String, Enum
from app.models.base import BaseModel
import enum


class UserRole(enum.Enum):
    student = "student"
    admin = "admin"


class User(BaseModel):
    __tablename__ = "users"

    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    real_name = Column(String(50), nullable=True)
    class_name = Column(String(50), nullable=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)
