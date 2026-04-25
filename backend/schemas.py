"""
schemas.py — Pydantic request/response schemas.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ── User ────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    name: str
    avatar: str = "🧑"
    likes: List[str] = []
    dislikes: List[str] = []
    spice_tolerance: int = Field(default=3, ge=1, le=5)
    effort_tolerance: str = "medium"   # low / medium / high


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    avatar: Optional[str] = None
    likes: Optional[List[str]] = None
    dislikes: Optional[List[str]] = None
    spice_tolerance: Optional[int] = Field(default=None, ge=1, le=5)
    effort_tolerance: Optional[str] = None


class UserOut(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Kitchen State ────────────────────────────────────────────────────────────

class KitchenState(BaseModel):
    available_ingredients: List[str] = []
    time_available: int = 60          # minutes
    budget_per_person: float = 10.0   # USD
    mood: Optional[str] = None        # light / heavy / quick / surprise


# ── Recommendation ───────────────────────────────────────────────────────────

class MealScore(BaseModel):
    meal_id: int
    meal_name: str
    description: str
    score: float
    prep_time: int
    cost_estimate: float
    difficulty: str
    tags: List[str]
    cuisine: str
    ingredients: List[str]
    explanation: str
    per_user_scores: dict


class RecommendationRequest(BaseModel):
    kitchen_state: KitchenState


class RecommendationResponse(BaseModel):
    top_meals: List[MealScore]
    fairness_weights: dict   # user_name -> weight used


# ── History ──────────────────────────────────────────────────────────────────

class SelectMealRequest(BaseModel):
    meal_id: int
    satisfaction_scores: dict  # user_name -> 0.0–1.0
    notes: Optional[str] = ""


class HistoryEntry(BaseModel):
    id: int
    meal_id: int
    meal_name: str
    selected_at: datetime
    satisfactions: dict   # user_name -> score

    model_config = {"from_attributes": True}


# ── Analytics ────────────────────────────────────────────────────────────────

class AnalyticsResponse(BaseModel):
    total_meals_cooked: int
    most_cooked_meal: Optional[str]
    average_satisfaction: dict   # user_name -> avg score
    fairness_index: float         # std dev of avg satisfactions (lower = fairer)
