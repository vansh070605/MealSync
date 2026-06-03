"""
init_db.py — One-time database initialization script.
"""
from database import engine, Base, SessionLocal
from models import User, Meal, MealHistory, Satisfaction # noqa
from seed_data import seed
import time
import sqlalchemy

def init():
    print("[INFO] Initializing database...")
    
    # Retry logic in case the DB is still waking up
    for i in range(5):
        try:
            # Create tables
            Base.metadata.create_all(bind=engine)
            
            # Seed data
            with SessionLocal() as db:
                seed(db)
            print("[SUCCESS] Database initialized successfully!")
            return
        except Exception as e:
            print(f"[WARNING] Attempt {i+1} failed: {e}")
            # If it's a database schema/column mismatch error, attempt to recreate tables
            if "UndefinedColumn" in str(e) or "column" in str(e) or "ProgrammingError" in str(type(e)):
                print("Detected schema mismatch. Attempting to recreate database tables...")
                try:
                    Base.metadata.drop_all(bind=engine)
                    Base.metadata.create_all(bind=engine)
                    with SessionLocal() as db:
                        seed(db)
                    print("[SUCCESS] Database recreated and initialized successfully!")
                    return
                except Exception as recreate_err:
                    print(f"[WARNING] Failed to recreate database on attempt {i+1}: {recreate_err}")
            time.sleep(2)
            
    print("[ERROR] Could not initialize database.")

if __name__ == "__main__":
    init()
