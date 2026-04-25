"""
routers/recommend.py — Recommendation and kitchen-state endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Meal, User, MealHistory, Satisfaction
from schemas import KitchenState, RecommendationResponse, MealScore, SelectMealRequest
from scoring import filter_feasible_meals, compute_fairness_weights, score_meal

router = APIRouter(tags=["Recommend"])


@router.post("/recommend", response_model=RecommendationResponse)
def recommend(kitchen_state: KitchenState, db: Session = Depends(get_db)):
    users = db.query(User).all()
    if not users:
        raise HTTPException(status_code=400, detail="No users in database. Run seed first.")

    meals = db.query(Meal).all()

    # 1. Constraint filter
    feasible = filter_feasible_meals(
        meals,
        kitchen_state.available_ingredients,
        kitchen_state.time_available,
        kitchen_state.budget_per_person,
        kitchen_state.mood,
    )

    if not feasible:
        # Relax ingredient constraint and retry
        feasible = filter_feasible_meals(
            meals,
            [],
            kitchen_state.time_available,
            kitchen_state.budget_per_person,
            kitchen_state.mood,
        )

    if not feasible:
        raise HTTPException(status_code=404, detail="No feasible meals found for given constraints.")

    # 2. Fairness weights
    fairness_weights = compute_fairness_weights(users, db)

    # 3. Recent history (last 7 entries for repetition penalty)
    recent_history = (
        db.query(MealHistory)
        .order_by(MealHistory.selected_at.desc())
        .limit(7)
        .all()
    )

    # 4. Score all feasible meals
    scored = []
    for meal in feasible:
        total, per_user, explanation = score_meal(
            meal, users, fairness_weights, recent_history, kitchen_state.mood
        )
        scored.append((total, meal, per_user, explanation))

    scored.sort(key=lambda x: x[0], reverse=True)
    top3 = scored[:3]

    result = []
    for total, meal, per_user, explanation in top3:
        result.append(
            MealScore(
                meal_id=meal.id,
                meal_name=meal.name,
                description=meal.description,
                score=round(total, 2),
                prep_time=meal.prep_time,
                cost_estimate=meal.cost_estimate,
                difficulty=meal.difficulty,
                tags=meal.tags,
                cuisine=meal.cuisine,
                ingredients=meal.ingredients,
                explanation=explanation,
                per_user_scores=per_user,
            )
        )

    fairness_named = {
        next(u.name for u in users if u.id == uid): round(w, 3)
        for uid, w in fairness_weights.items()
    }

    return RecommendationResponse(top_meals=result, fairness_weights=fairness_named)


@router.post("/history", status_code=201)
def select_meal(body: SelectMealRequest, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == body.meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    history_entry = MealHistory(meal_id=body.meal_id, notes=body.notes or "")
    db.add(history_entry)
    db.flush()

    for user_name, score in body.satisfaction_scores.items():
        user = db.query(User).filter(User.name == user_name).first()
        if user:
            sat = Satisfaction(
                user_id=user.id,
                history_id=history_entry.id,
                score=float(score),
            )
            db.add(sat)

    db.commit()
    return {"status": "ok", "history_id": history_entry.id}
