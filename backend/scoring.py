import joblib
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from models import Meal, Satisfaction, User

MODEL_PATH = "meal_scoring_pipeline.joblib"
try:
    model = joblib.load(MODEL_PATH)
except:
    model = None

def get_recommendations(db: Session, available_ingredients=None, max_prep_time=60, budget_tier=2, mood="normal"):
    meals = db.query(Meal).all()
    users = db.query(User).all()
    
    if not meals or not users:
        return []

    meal_scores = []
    
    # Calculate fairness weights
    fairness_weights = {u.id: 1.0 for u in users}
    for user in users:
        recent_sats = db.query(Satisfaction).filter(Satisfaction.user_id == user.id).order_by(Satisfaction.id.desc()).limit(5).all()
        if recent_sats:
            avg_sat = sum(s.score for s in recent_sats) / len(recent_sats)
            fairness_weights[user.id] = 1.0 + (1.0 - avg_sat)

    available_set = {i.lower().strip() for i in (available_ingredients or [])}

    for meal in meals:
        # 1. Soft Constraints (Time - relaxed)
        if meal.prep_time > max_prep_time + 30:
            continue
            
        # 2. Ingredient Logic (Soft matching for multiple results)
        matched_items = []
        feasibility_multiplier = 1.0
        
        if available_set:
            meal_ingredients_raw = meal.ingredients
            meal_text = " ".join(meal_ingredients_raw).lower()
            matched_items = [i for i in available_set if i in meal_text]
            
            if matched_items:
                # Give a big boost for matches to rank them at the top
                coverage = len(matched_items) / len(available_set)
                feasibility_multiplier = 1.5 + (coverage * 3.0)
            else:
                # No match? Keep it in the list but with a penalty (0.5x)
                feasibility_multiplier = 0.5
        
        # 3. ML Inference
        user_satisfactions = []
        for user in users:
            if model:
                u_id_str = f"U{user.id:03d}"
                m_id_str = f"M{meal.id:03d}"
                
                features = pd.DataFrame([{
                    "user_id": u_id_str,
                    "meal_id": m_id_str,
                    "prep_time_mins": meal.prep_time,
                    "ingredient_count": len(meal.ingredients),
                    "spice_level": 3,
                    "is_veg": 1,
                    "budget_tier": int(meal.cost_estimate / 5) or 1
                }])
                pred_score = model.predict(features)[0]
            else:
                pred_score = 5.0
            
            weighted_score = pred_score * fairness_weights.get(user.id, 1.0)
            user_satisfactions.append(weighted_score)

        avg_score = sum(user_satisfactions) / len(user_satisfactions)
        min_score = min(user_satisfactions)
        
        harmony_score = (avg_score * 0.6 + min_score * 0.4) * feasibility_multiplier
        
        # Explanation
        if matched_items:
            ing_text = ", ".join([i.capitalize() for i in matched_items])
            explanation = f"Matches your {ing_text}. High group harmony!"
        else:
            explanation = "A balanced household favorite based on group tastes."

        meal_scores.append({
            "meal_id": meal.id,
            "name": meal.name,
            "score": round(min(harmony_score * 10, 99), 1),
            "prep_time": meal.prep_time,
            "ingredients": meal.ingredients,
            "explanation": explanation,
            "budget_tier": int(meal.cost_estimate / 5) or 1
        })

    # Return top 5 matches (Ensures multiple results)
    return sorted(meal_scores, key=lambda x: x["score"], reverse=True)[:5]
