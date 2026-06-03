"""
main.py — FastAPI application entry point.
"""
import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import recommend
from database import engine, Base, SessionLocal
from seed_data import seed
import uvicorn
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError

# Initialize Database safely to prevent concurrent execution conflicts (e.g. pg_type unique violations)
def init_db_safely():
    url_str = str(engine.url)
    is_postgres = "postgresql" in url_str or "postgres" in url_str

    if is_postgres:
        print("[INFO] Production PostgreSQL detected. Attempting safe database initialization...")
        db = SessionLocal()
        try:
            # Session-level advisory lock (using lock ID 123456)
            lock_acquired = db.execute(text("SELECT pg_try_advisory_lock(123456)")).scalar()
            if lock_acquired:
                print("[INFO] Acquired database lock. Initializing tables & seeding...")
                Base.metadata.create_all(bind=engine)
                seed(db)
                db.execute(text("SELECT pg_advisory_unlock(123456)"))
                print("[SUCCESS] Database tables initialized and lock released.")
            else:
                print("[INFO] Another worker is currently initializing the database. Waiting...")
                # Wait up to 15 seconds for the other worker to finish
                for i in range(15):
                    time.sleep(1)
                    try:
                        db.execute(text("SELECT count(*) FROM flats"))
                        print("[SUCCESS] Database is ready (initialized by another worker).")
                        break
                    except Exception:
                        pass
        except Exception as err:
            print(f"[ERROR] Database lock/initialization failed: {err}")
            # Try normal creation as a fallback
            try:
                Base.metadata.create_all(bind=engine)
                seed(db)
            except Exception as fallback_err:
                print(f"[ERROR] Fallback database init failed: {fallback_err}")
        finally:
            db.close()
    else:
        # Local SQLite development environment
        print("[INFO] Local SQLite database detected. Initializing...")
        try:
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            try:
                seed(db)
            finally:
                db.close()
        except Exception as e:
            import traceback
            print("SQLite database initialization or seeding failed. Stack trace:")
            traceback.print_exc()
            print("Attempting to recreate SQLite database tables...")
            try:
                Base.metadata.drop_all(bind=engine)
                Base.metadata.create_all(bind=engine)
                db = SessionLocal()
                try:
                    seed(db)
                finally:
                    db.close()
                print("[SUCCESS] SQLite database recreated and seeded successfully!")
            except Exception as recreate_err:
                print(f"[ERROR] Failed to recreate SQLite database: {recreate_err}")
                raise recreate_err

init_db_safely()

app = FastAPI(
    title="MealSync API",
    description="Collaborative Meal Decision Engine for flats",
    version="1.0.0",
)

# Open CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend.router)

@app.get("/", tags=["Root"])
def root():
    return {"message": "MealSync API is running 🍽️", "docs": "/docs"}

if __name__ == "__main__":
    # Use environment variables for production ports
    port = int(os.getenv("PORT", 8000))
    # In production, we use 0.0.0.0 to be accessible externally
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
