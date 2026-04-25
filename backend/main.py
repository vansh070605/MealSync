"""
main.py — FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import User, Meal, MealHistory, Satisfaction  # noqa — register with metadata
from routers import users, recommend, history
from seed_data import seed

# Create tables
Base.metadata.create_all(bind=engine)

# Seed on startup
with SessionLocal() as db:
    seed(db)

app = FastAPI(
    title="MealSync API",
    description="Collaborative Meal Decision Engine for 6 flatmates",
    version="1.0.0",
)

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
