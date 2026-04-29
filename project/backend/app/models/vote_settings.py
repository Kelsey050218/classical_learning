from sqlalchemy import Column, Boolean
from app.models.base import BaseModel


class VoteSettings(BaseModel):
    __tablename__ = "vote_settings"

    is_voting_open = Column(Boolean, default=False)
