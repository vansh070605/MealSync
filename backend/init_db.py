"""
init_db.py — One-time database initialization script.
"""
from database import engine, Base, SessionLocal
from models import User, Meal, MealHistory, Satisfaction # noqa
from seed_data import seed
import time
import sqlalchemy

def init():
    print("⏳ Initializing database...")
    
    # Retry logic in case the DB is still waking up
    for i in range(5):
        try:
            # Create tables
            Base.metadata.create_all(bind=engine)
            
            # Seed data
            with SessionLocal() as db:
                seed(db)
            print("✅ Database initialized successfully!")
            return
        except Exception as e:
            print(f"⚠️ Attempt {i+1} failed: {e}")
            time.sleep(2)
            
    print("❌ Could not initialize database.")

if __name__ == "__main__":
    init()
