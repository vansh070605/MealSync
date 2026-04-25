from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Meal, User, MealHistory, Satisfaction
from schemas import KitchenState, RecommendationResponse, MealScore, SelectMealRequest
from scoring import get_recommendations

router = APIRouter(tags=["Recommend"])

@router.post("/recommend", response_model=RecommendationResponse)
def recommend(kitchen_state: KitchenState, db: Session = Depends(get_db)):
    results = get_recommendations(
        db,
        available_ingredients=kitchen_state.available_ingredients,
        max_prep_time=kitchen_state.time_available,
        budget_tier=int(kitchen_state.budget_per_person / 5) or 1,
        mood=kitchen_state.mood
    )
    if not results:
        raise HTTPException(status_code=404, detail="No matches found.")
    
    top_meals = []
    for r in results:
        top_meals.append(
            MealScore(
                meal_id=r["meal_id"],
                meal_name=r["name"],
                description=f"Predicted by ML to be a favorite for your group.",
                score=r["score"],
                prep_time=r["prep_time"],
                cost_estimate=r["budget_tier"] * 5.0,
                difficulty="Medium",
                tags=["AI Best Pick"],
                cuisine="Indian",
                ingredients=r["ingredients"],
                explanation=r["explanation"],
                per_user_scores={}
            )
        )
    return RecommendationResponse(top_meals=top_meals, fairness_weights={})

@router.get("/history")
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    # Corrected attribute: selected_at
    history = db.query(MealHistory).order_by(MealHistory.selected_at.desc()).limit(limit).all()
    results = []
    for h in history:
        meal = db.query(Meal).filter(Meal.id == h.meal_id).first()
        sats = db.query(Satisfaction).filter(Satisfaction.history_id == h.id).all()
        
        sat_list = []
        for s in sats:
            u = db.query(User).filter(User.id == s.user_id).first()
            if u:
                sat_list.append({"user_name": u.name, "score": s.score})

        results.append({
            "meal_name": meal.name if meal else "Special Group Meal",
            "timestamp": h.selected_at,
            "notes": h.notes,
            "satisfactions": sat_list
        })
    return results

@router.post("/history", status_code=201)
def select_meal(body: SelectMealRequest, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == body.meal_id).first()
    
    # MealHistory uses 'selected_at' automatically
    history_entry = MealHistory(meal_id=body.meal_id, notes=body.notes or "")
    db.add(history_entry)
    db.flush()

    if body.satisfaction_scores:
        for user_name, score in body.satisfaction_scores.items():
            user = db.query(User).filter(User.name.ilike(user_name)).first()
            if user:
                db.add(Satisfaction(
                    user_id=user.id, 
                    history_id=history_entry.id, 
                    score=float(score)/100.0
                ))
    
    db.commit()
    return {"status": "ok", "history_id": history_entry.id}

@router.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    db.query(Satisfaction).delete()
    db.query(MealHistory).delete()
    db.commit()
    return {"status": "history cleared"}
