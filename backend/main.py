"""
main.py — FastAPI application entry point.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, recommend, history
from database import engine, Base, SessionLocal
from seed_data import seed
import uvicorn

# Initialize Database
Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    seed(db)
finally:
    db.close()

app = FastAPI(
    title="MealSync API",
    description="Collaborative Meal Decision Engine for 6 flatmates",
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

app.include_router(users.router)
app.include_router(recommend.router)
app.include_router(history.router)

@app.get("/", tags=["Root"])
def root():
    return {"message": "MealSync API is running 🍽️", "docs": "/docs"}

if __name__ == "__main__":
    # Use environment variables for production ports
    port = int(os.getenv("PORT", 8000))
    # In production, we use 0.0.0.0 to be accessible externally
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
