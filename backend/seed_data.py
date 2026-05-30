"""
seed_data.py — Populate the database from food_data.csv and default users.
"""
import pandas as pd
from sqlalchemy.orm import Session
from models import User, Meal

USERS = [
    {"name": "Vansh", "avatar": "🧑", "likes": ["chicken", "pasta", "bread"], "dislikes": ["tofu"], "spice_tolerance": 2},
    {"name": "Shashwat", "avatar": "👩", "likes": ["spicy", "paneer", "curry"], "dislikes": ["beef"], "spice_tolerance": 5},
    {"name": "Rajasthani", "avatar": "🧔", "likes": ["potato", "paneer", "rice"], "dislikes": ["mushrooms"], "spice_tolerance": 2},
    {"name": "Atharva", "avatar": "👨", "likes": ["veg", "healthy", "lentils"], "dislikes": ["fried"], "spice_tolerance": 3},
    {"name": "Anni", "avatar": "🧒", "likes": ["noodles", "asian", "cheese"], "dislikes": ["lamb"], "spice_tolerance": 3},
    {"name": "Prajjwal", "avatar": "👴", "likes": ["soup", "comfort", "rice"], "dislikes": ["raw"], "spice_tolerance": 1}
]

def seed(db: Session) -> None:
    from models import Flat
    
    # 1. Ensure Flat exists
    if db.query(Flat).count() == 0:
        demo_flat = Flat(name="Demo Flat")
        db.add(demo_flat)
        db.commit()
        db.refresh(demo_flat)
        print("✅ Seeded Demo Flat.")
    else:
        demo_flat = db.query(Flat).first()

    if db.query(User).count() == 0:
        for u in USERS:
            user = User(name=u["name"], avatar=u["avatar"], spice_tolerance=u["spice_tolerance"], flat_id=demo_flat.id)
            user.likes = u["likes"]
            user.dislikes = u["dislikes"]
            db.add(user)
        db.commit()
        print("✅ Seeded 6 users.")

    if db.query(Meal).count() == 0:
        df = pd.read_csv('food_data.csv')
        for _, row in df.iterrows():
            tags = ["spicy"] if row['spice_level'] >= 3 else []
            if row['is_veg'] == 1: tags.append("veg")
            
            meal = Meal(
                name=row['name'],
                description=f"A delicious {row['name']} prepared with {row['main_ingredients']}.",
                prep_time=int(row['prep_time_mins']),
                cost_estimate=float(row['budget_tier']) * 3.5,
                cuisine="Indian" if "Outlier" not in str(row['name']) else "Special"
            )
            meal.ingredients = [i.strip() for i in str(row['main_ingredients']).split(',')]
            meal.tags = tags
            db.add(meal)
        db.commit()
        print(f"✅ Seeded {len(df)} meals from CSV.")
