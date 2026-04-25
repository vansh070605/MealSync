import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from models import Meal, User

def get_recommendations(db: Session, available_ingredients: list, max_prep_time: int, budget_tier: int, mood: str):
    meals = db.query(Meal).all()
    users = db.query(User).all()
    
    if not meals or not users:
        return []

    available_set = {i.lower().strip() for i in available_ingredients}
    
    meal_scores = []
    for meal in meals:
        # 1. Base Score from Prep Time & Budget
        # We allow a 15 min buffer for flexibility
        if meal.prep_time > (max_prep_time + 15):
            continue
            
        # 2. Feasibility Score (Ingredient Match)
        meal_ingredients = {i.lower().strip() for i in meal.ingredients}
        matches = meal_ingredients.intersection(available_set)
        
        # Soft-matching: Even if 0 matches, we allow it but with a penalty
        feasibility = (len(matches) / len(meal_ingredients)) if meal_ingredients else 0
        feasibility_multiplier = 0.3 + (feasibility * 0.7) # Min 0.3 multiplier even with 0 ingredients

        # 3. Group Harmony Score
        # We calculate how much the 6 flatmates will like this
        user_scores = []
        for user in users:
            score = 70 # Start with a neutral high base
            
            # Boost if they like ingredients or tags
            user_likes = {l.lower() for l in user.likes}
            if any(ing in user_likes for ing in meal_ingredients):
                score += 15
            
            # Penalize if they dislike ingredients
            user_dislikes = {d.lower() for d in user.dislikes}
            if any(ing in user_dislikes for ing in meal_ingredients):
                score -= 40
            
            # Spice Preference (Tolerance vs Dish Level)
            # meal.spice_level is assumed to be 1-5
            # user.spice_tolerance is 1-5
            spice_diff = abs(meal.prep_time % 5 - user.spice_tolerance) # Using prep_time as proxy for spice if missing
            score -= (spice_diff * 5)
            
            user_scores.append(max(0, min(100, score)))

        # Fairness Logic: Weighted Average + Respecting the "Veto" (minimum score)
        avg_score = sum(user_scores) / len(user_scores)
        min_score = min(user_scores)
        
        # A meal is only "Harmonious" if even the person who likes it least still finds it 'Okay'
        harmony_score = (avg_score * 0.6 + min_score * 0.4) * feasibility_multiplier

        meal_scores.append({
            "meal_id": meal.id,
            "name": meal.name,
            "score": round(harmony_score),
            "prep_time": meal.prep_time,
            "budget_tier": int(meal.cost_estimate / 5) or 1,
            "ingredients": meal.ingredients,
            "explanation": f"Matches {len(matches)} of your ingredients. High group harmony at {round(harmony_score)}%."
        })

    # Sort by Harmony Score and take Top 5
    meal_scores.sort(key=lambda x: x["score"], reverse=True)
    return meal_scores[:5]
