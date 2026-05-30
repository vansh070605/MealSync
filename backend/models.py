"""
models.py — SQLAlchemy ORM models for MealSync.
"""
import json
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class Flat(Base):
    __tablename__ = "flats"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="flat")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    avatar = Column(String(10), default="🧑")
    likes_json = Column(Text, default="[]")          # JSON list of ingredient/tag strings
    dislikes_json = Column(Text, default="[]")
    spice_tolerance = Column(Integer, default=3)      # 1–5
    effort_tolerance = Column(String(10), default="medium")  # low/medium/high
    flat_id = Column(Integer, ForeignKey("flats.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    flat = relationship("Flat", back_populates="users")
    satisfactions = relationship("Satisfaction", back_populates="user")

    @property
    def likes(self):
        return json.loads(self.likes_json or "[]")

    @likes.setter
    def likes(self, value):
        self.likes_json = json.dumps(value)

    @property
    def dislikes(self):
        return json.loads(self.dislikes_json or "[]")

    @dislikes.setter
    def dislikes(self, value):
        self.dislikes_json = json.dumps(value)


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(Text, default="")
    ingredients_json = Column(Text, default="[]")  # JSON list of strings
    prep_time = Column(Integer, default=30)         # minutes
    difficulty = Column(String(10), default="medium")  # easy/medium/hard
    tags_json = Column(Text, default="[]")          # JSON list: spicy, veg, quick, ...
    cost_estimate = Column(Float, default=5.0)       # USD per person
    cuisine = Column(String(100), default="")

    history = relationship("MealHistory", back_populates="meal")

    @property
    def ingredients(self):
        return json.loads(self.ingredients_json or "[]")

    @ingredients.setter
    def ingredients(self, value):
        self.ingredients_json = json.dumps(value)

    @property
    def tags(self):
        return json.loads(self.tags_json or "[]")

    @tags.setter
    def tags(self, value):
        self.tags_json = json.dumps(value)


class MealHistory(Base):
    __tablename__ = "meal_history"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False)
    selected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    selected_by = Column(String(100), default="group")
    notes = Column(Text, default="")

    meal = relationship("Meal", back_populates="history")
    satisfactions = relationship("Satisfaction", back_populates="history_entry")


class Satisfaction(Base):
    __tablename__ = "satisfactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    history_id = Column(Integer, ForeignKey("meal_history.id"), nullable=False)
    score = Column(Float, nullable=False)   # 0.0 – 1.0

    user = relationship("User", back_populates="satisfactions")
    history_entry = relationship("MealHistory", back_populates="satisfactions")
