import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from models import Meal, User

SELECTABLE_INGREDIENTS = {
    "rice", "flour", "maggi", "bread", "pav", "noodles", "puffed rice", "flattened rice", "semolina", "macaroni", "dosa batter", "leftover idli",
    "potato", "onion", "tomato", "peas", "capsicum", "carrot", "cabbage", "cauliflower", "spinach", "okra", "eggplant", "mushroom", "bottle gourd", "bitter gourd", "ivy gourd", "taro root", "radish", "green beans", "leftover veggies",
    "paneer", "chickpeas", "yellow lentils", "kidney beans", "red lentils", "black chickpeas", "moong dal", "toor dal", "chana dal", "soya chunks", "eggs", "chicken", "mutton", "lobster", "moth beans", "soya chaap", "black lentils", "besan",
    "curd", "butter", "cream", "cheese", "cashew", "coconut", "peanuts", "ghee", "yogurt", "jam", "ketchup", "soy sauce", "fanta"
}

def normalize_ingredient(ing: str) -> str:
    ing = ing.lower().strip()
    if ing == "cashews":
        return "cashew"
    if ing == "peanut":
        return "peanuts"
    if ing in ("beans", "green beans"):
        return "green beans"
    if "potato" in ing:
        return "potato"
    if "eggplant" in ing:
        return "eggplant"
    if "onion" in ing:
        return "onion"
    if "tomato" in ing:
        return "tomato"
    if "basmati rice" in ing or "rice" in ing:
        return "rice"
    if "egg" in ing:
        return "eggs"
    if "chicken" in ing:
        return "chicken"
    if "mutton" in ing:
        return "mutton"
    if "lobster" in ing:
        return "lobster"
    if "paneer" in ing:
        return "paneer"
    if "chickpea" in ing:
        return "chickpeas"
    if "kidney bean" in ing:
        return "kidney beans"
    if "soya chunk" in ing:
        return "soya chunks"
    if "soya chaap" in ing:
        return "soya chaap"
    if ing in ("curd", "yogurt"):
        return "curd"
    if "cashew" in ing:
        return "cashew"
    if "coconut" in ing:
        return "coconut"
    if "peanuts" in ing:
        return "peanuts"
    if "leftover idli" in ing:
        return "leftover idli"
    if "dosa batter" in ing:
        return "dosa batter"
    if "leftover veggies" in ing or "leftover veg" in ing:
        return "leftover veggies"
    if "moth beans" in ing:
        return "moth beans"
    if "yellow lentils" in ing or "yellow lentil" in ing:
        return "yellow lentils"
    if "red lentils" in ing or "red lentil" in ing:
        return "red lentils"
    if "black chickpeas" in ing or "black chana" in ing:
        return "black chickpeas"
    if "moong dal" in ing:
        return "moong dal"
    if "toor dal" in ing:
        return "toor dal"
    if "chana dal" in ing:
        return "chana dal"
    if "black lentils" in ing:
        return "black lentils"
    if "mixed lentils" in ing or "mixed lentil" in ing:
        return "yellow lentils"
    if "besan" in ing or "roasted besan" in ing:
        return "besan"
    return ing

def get_recommendations(db: Session, available_ingredients: list, max_prep_time: int, budget_tier: int, mood: str, users: list = None, meal_history: list = None):
    meals = db.query(Meal).all()
    if users is None:
        users = []
    if meal_history is None:
        meal_history = []
    
    if not meals or not users:
        return {"top_meals": [], "suggestions": []}

    # Normalize user's available ingredients and map to the standard keys
    available_set = {normalize_ingredient(i) for i in available_ingredients if i}
    
    meal_scores = []
    suggestions = []
    
    for meal in meals:
        # 1. Base Score from Prep Time
        # We allow a 15 min buffer for flexibility
        if meal.prep_time > (max_prep_time + 15):
            continue
            
        # Get normalized ingredients for the meal
        meal_ingredients_normalized = [normalize_ingredient(i) for i in meal.ingredients]
        
        # Filter to get only the selectable ingredients required by the meal
        meal_selectable = {i for i in meal_ingredients_normalized if i in SELECTABLE_INGREDIENTS}
        
        # If no selectable ingredients exist (rare), consider it fully matched
        missing = meal_selectable - available_set
        
        # 2. Group Harmony Score calculation
        user_scores = []
        for user in users:
            score = 70 # Start with a neutral high base
            
            # Boost if they like ingredients
            user_likes = {l.lower() for l in user.get("likes", [])}
            if any(ing in user_likes for ing in meal_ingredients_normalized):
                score += 15
            
            # Penalize if they dislike ingredients
            user_dislikes = {d.lower() for d in user.get("dislikes", [])}
            if any(ing in user_dislikes for ing in meal_ingredients_normalized):
                score -= 40
            
            # Spice Preference
            spice_diff = abs(meal.prep_time % 5 - user.get("spice_tolerance", 3))
            score -= (spice_diff * 5)
            
            user_scores.append(max(0, min(100, score)))

        avg_score = sum(user_scores) / len(user_scores)
        min_score = min(user_scores)
        harmony_score = (avg_score * 0.6 + min_score * 0.4)

        # 3. Apply ML Feedback Loop (history penalty / boost)
        meal_ratings = []
        for entry in meal_history:
            if entry.get("meal_id") == meal.id:
                scores_dict = entry.get("satisfaction_scores") or entry.get("satisfactions")
                if scores_dict and isinstance(scores_dict, dict):
                    valid_scores = [float(val) for val in scores_dict.values() if val is not None]
                    if valid_scores:
                        meal_ratings.append(sum(valid_scores) / len(valid_scores))
        
        history_boost = 0
        history_explanation = ""
        if meal_ratings:
            avg_historical = sum(meal_ratings) / len(meal_ratings)
            if avg_historical >= 75.0:
                history_boost = 15
                history_explanation = f" (Boosted based on past high rating of {round(avg_historical)}%)"
            elif avg_historical < 50.0:
                history_boost = -35
                history_explanation = f" (Penalized due to low past satisfaction of {round(avg_historical)}%)"

        harmony_score = max(0, min(100, harmony_score + history_boost))

        # Enforce strict ingredient matching
        if len(missing) == 0:
          # If the user selected ingredients, make sure the meal actually uses at least one of them
          if available_set and not meal_selectable.intersection(available_set):
              continue
              
          # 100% Match: feasible to cook!
          meal_scores.append({
              "meal_id": meal.id,
              "name": meal.name,
              "score": round(harmony_score),
              "prep_time": meal.prep_time,
              "budget_tier": int(meal.cost_estimate / 5) or 1,
              "ingredients": meal.ingredients,
              "explanation": f"Matches all required ingredients! High group harmony at {round(harmony_score)}%{history_explanation}."
          })
        elif len(missing) <= 2 and meal_selectable.intersection(available_set):
          # Almost matchable: Suggest to the user
          # Format nicely for presentation
          display_missing = [m.title() for m in missing]
          suggestions.append({
              "meal_id": meal.id,
              "meal_name": meal.name,
              "score": round(harmony_score),
              "missing_ingredients": display_missing,
              "explanation": f"Missing only {', '.join(display_missing)}. Add these to unlock!{history_explanation}"
          })

    # Sort top meals by Harmony Score and take top 5
    meal_scores.sort(key=lambda x: x["score"], reverse=True)
    
    # Sort suggestions by number of missing ingredients (fewer missing first), then by harmony score
    suggestions.sort(key=lambda x: (len(x["missing_ingredients"]), -x["score"]))
    
    return {
        "top_meals": meal_scores[:5],
        "suggestions": suggestions[:5]
    }

