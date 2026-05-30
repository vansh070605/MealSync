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
        mood=kitchen_state.mood,
        users=kitchen_state.users,
        meal_history=kitchen_state.meal_history
    )
    
    top_meals = []
    for r in results.get("top_meals", []):
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
    
    suggestions = results.get("suggestions", [])
    return RecommendationResponse(
        top_meals=top_meals,
        fairness_weights={},
        suggestions=suggestions
    )
