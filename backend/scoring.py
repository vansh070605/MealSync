"""
scoring.py — Core scoring and constraint-filtering engine.

Score = Σ user_preference_score(meal, user) × fairness_weight(user)
        - effort_penalty
        - repetition_penalty
"""
from __future__ import annotations
import math
from typing import List, Dict, Optional
from models import Meal, User, MealHistory, Satisfaction
from sqlalchemy.orm import Session


# ── Constants ────────────────────────────────────────────────────────────────

EFFORT_MAP = {"low": 1, "medium": 2, "high": 3}
DIFF_MAP   = {"easy": 1, "medium": 2, "hard": 3}

LIKE_BONUS    = 2.0
DISLIKE_PENALTY = 3.0
SPICE_PENALTY   = 1.5   # per point over tolerance
EFFORT_PENALTY  = 1.0   # per level over tolerance
REPETITION_DECAY = 0.8  # multiplier per recent occurrence (last 7 history entries)


# ── Constraint Filtering ─────────────────────────────────────────────────────

def filter_feasible_meals(
    meals: List[Meal],
    available_ingredients: List[str],
    time_available: int,
    budget_per_person: float,
    mood: Optional[str],
) -> List[Meal]:
    """Return only meals that satisfy hard constraints."""
    available_set = {i.lower().strip() for i in available_ingredients}
    feasible = []

    for meal in meals:
        # Time constraint
        if meal.prep_time > time_available:
            continue

        # Budget constraint
        if meal.cost_estimate > budget_per_person:
            continue

        # Ingredient coverage — at least 60% of required ingredients available
        if available_ingredients:
            req = {i.lower().strip() for i in meal.ingredients}
            if req:
                coverage = len(req & available_set) / len(req)
                if coverage < 0.6:
                    continue

        # Mood filter
        if mood == "quick" and meal.prep_time > 25:
            continue
        if mood == "light" and "heavy" in meal.tags:
            continue
        if mood == "heavy" and "light" in meal.tags:
            continue

        feasible.append(meal)

    return feasible


# ── Per-user preference score ────────────────────────────────────────────────

def user_preference_score(meal: Meal, user: User) -> float:
    """
    Score how well a meal fits a single user.
    Range is roughly -10 to +10 before clamping.
    """
    score = 5.0  # neutral baseline

    meal_ingredients = {i.lower() for i in meal.ingredients}
    meal_tags        = {t.lower() for t in meal.tags}

    # Likes bonus
    for like in user.likes:
        kw = like.lower()
        if kw in meal_ingredients or kw in meal_tags or kw in meal.name.lower():
            score += LIKE_BONUS

    # Dislikes penalty
    for dislike in user.dislikes:
        kw = dislike.lower()
        if kw in meal_ingredients or kw in meal_tags or kw in meal.name.lower():
            score -= DISLIKE_PENALTY

    # Spice tolerance
    if "spicy" in meal_tags:
        # estimate meal spice level from tags
        meal_spice = 4 if "very_spicy" in meal_tags else (3 if "spicy" in meal_tags else 1)
        spice_excess = max(0, meal_spice - user.spice_tolerance)
        score -= spice_excess * SPICE_PENALTY

    # Effort tolerance
    meal_effort = DIFF_MAP.get(meal.difficulty, 2)
    user_effort = EFFORT_MAP.get(user.effort_tolerance, 2)
    effort_excess = max(0, meal_effort - user_effort)
    score -= effort_excess * EFFORT_PENALTY

    return score


# ── Fairness weights ─────────────────────────────────────────────────────────

def compute_fairness_weights(
    users: List[User], db: Session
) -> Dict[int, float]:
    """
    Users with lower cumulative satisfaction get a higher weight.
    Weight = softmax over (max_avg - user_avg).
    """
    avgs: Dict[int, float] = {}
    for user in users:
        scores = [s.score for s in db.query(Satisfaction).filter(
            Satisfaction.user_id == user.id).all()]
        avgs[user.id] = sum(scores) / len(scores) if scores else 0.5

    # invert so low satisfaction → high weight
    max_avg = max(avgs.values(), default=0.5)
    raw = {uid: max_avg - avg + 0.1 for uid, avg in avgs.items()}

    total = sum(math.exp(v) for v in raw.values())
    return {uid: math.exp(v) / total for uid, v in raw.items()}


# ── Repetition penalty ───────────────────────────────────────────────────────

def repetition_penalty(meal: Meal, recent_history: List[MealHistory]) -> float:
    """Exponential decay penalty for recently cooked meals."""
    penalty = 0.0
    for i, entry in enumerate(recent_history):
        if entry.meal_id == meal.id:
            # More recent = heavier penalty
            penalty += REPETITION_DECAY ** i * 3.0
    return penalty


# ── Main scoring function ────────────────────────────────────────────────────

def score_meal(
    meal: Meal,
    users: List[User],
    fairness_weights: Dict[int, float],
    recent_history: List[MealHistory],
    mood: Optional[str] = None,
) -> tuple[float, dict, str]:
    """
    Returns (total_score, per_user_scores, explanation_text).
    """
    per_user: Dict[str, float] = {}
    weighted_sum = 0.0

    for user in users:
        pref = user_preference_score(meal, user)
        weight = fairness_weights.get(user.id, 1 / len(users))
        weighted_sum += pref * weight
        per_user[user.name] = round(pref, 2)

    rep_pen = repetition_penalty(meal, recent_history)
    total = weighted_sum - rep_pen

    # Surprise mode: add a small random nudge to break ties
    if mood == "surprise":
        import random
        total += random.uniform(-0.5, 1.5)

    # Build human-readable explanation
    reasons = []
    if any(v >= 6.5 for v in per_user.values()):
        top_user = max(per_user, key=per_user.get)
        reasons.append(f"{top_user} will love it")
    if meal.prep_time <= 20:
        reasons.append("very quick to prepare")
    if meal.cost_estimate <= 4:
        reasons.append("budget-friendly")
    if "veg" in [t.lower() for t in meal.tags]:
        reasons.append("vegetarian-friendly")
    if rep_pen == 0:
        reasons.append("fresh — not cooked recently")
    if not reasons:
        reasons.append("balanced choice for everyone")

    explanation = "Great pick: " + ", ".join(reasons) + "."

    return round(total, 3), per_user, explanation
