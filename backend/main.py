"""
main.py — FastAPI application entry point.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import recommend
from database import engine, Base, SessionLocal
from seed_data import seed
import uvicorn

# Initialize Database
try:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
except Exception as e:
    import traceback
    print("Database initialization or seeding failed. Stack trace:")
    traceback.print_exc()
    print("Attempting to recreate database tables to resolve schema mismatch...")
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed(db)
        finally:
            db.close()
        print("Database tables recreated and seeded successfully!")
    except Exception as recreate_err:
        print(f"Failed to recreate database: {recreate_err}")
        raise recreate_err

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
