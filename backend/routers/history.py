"""
routers/history.py — Meal history and analytics endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import MealHistory, Satisfaction, User, Meal
from schemas import HistoryEntry, AnalyticsResponse
import statistics

router = APIRouter(tags=["History"])


@router.get("/history", response_model=list[HistoryEntry])
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    entries = (
        db.query(MealHistory)
        .order_by(MealHistory.selected_at.desc())
        .limit(limit)
        .all()
    )
    result = []
    for entry in entries:
        sats = db.query(Satisfaction).filter(Satisfaction.history_id == entry.id).all()
        sat_map = {}
        for s in sats:
            user = db.query(User).filter(User.id == s.user_id).first()
            if user:
                sat_map[user.name] = round(s.score, 2)
        meal = db.query(Meal).filter(Meal.id == entry.meal_id).first()
        result.append(
            HistoryEntry(
                id=entry.id,
                meal_id=entry.meal_id,
                meal_name=meal.name if meal else "Unknown",
                selected_at=entry.selected_at,
                satisfactions=sat_map,
            )
        )
    return result


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(MealHistory).count()

    # Most cooked meal
    history_list = db.query(MealHistory).all()
    from collections import Counter
    meal_counts = Counter(h.meal_id for h in history_list)
    most_cooked = None
    if meal_counts:
        most_id = meal_counts.most_common(1)[0][0]
        meal = db.query(Meal).filter(Meal.id == most_id).first()
        most_cooked = meal.name if meal else None

    # Average satisfaction per user
    users = db.query(User).all()
    avg_sat = {}
    for user in users:
        scores = [s.score for s in db.query(Satisfaction).filter(Satisfaction.user_id == user.id).all()]
        avg_sat[user.name] = round(sum(scores) / len(scores), 3) if scores else None

    # Fairness index (lower std dev = fairer)
    valid_scores = [v for v in avg_sat.values() if v is not None]
    fairness_index = round(statistics.stdev(valid_scores), 4) if len(valid_scores) > 1 else 0.0

    return AnalyticsResponse(
        total_meals_cooked=total,
        most_cooked_meal=most_cooked,
        average_satisfaction=avg_sat,
        fairness_index=fairness_index,
    )
