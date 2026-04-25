# MealSync — Collaborative Meal Decision Engine

A **production-quality** full-stack app for 6 flatmates to collaboratively decide what to cook for dinner, with fairness-aware scoring, constraint filtering, and a beautiful mobile-first UI.

---

## Project Structure

```
MealSync/
├── backend/
│   ├── main.py          # FastAPI entry point
│   ├── database.py      # SQLite + SQLAlchemy setup
│   ├── models.py        # ORM models (User, Meal, MealHistory, Satisfaction)
│   ├── schemas.py       # Pydantic schemas
│   ├── scoring.py       # 🧠 Core scoring engine
│   ├── seed_data.py     # 6 users + 30 meals seed
│   ├── requirements.txt
│   └── routers/
│       ├── users.py     # /users CRUD
│       ├── recommend.py # /recommend + /history POST
│       └── history.py   # /history GET + /analytics
│
└── frontend/
    ├── src/
    │   ├── api.js           # Axios API client
    │   ├── store.js         # React Context global state
    │   ├── App.jsx          # Router + layout
    │   ├── index.css        # Tailwind + design tokens
    │   ├── components/
    │   │   ├── BottomNav.jsx
    │   │   ├── Loader.jsx
    │   │   ├── ErrorBanner.jsx
    │   │   ├── MealCard.jsx
    │   │   └── SatisfactionModal.jsx
    │   └── pages/
    │       ├── Home.jsx
    │       ├── InputScreen.jsx
    │       ├── RecommendScreen.jsx
    │       ├── HistoryScreen.jsx
    │       └── PreferencesScreen.jsx
    ├── tailwind.config.js
    └── .env
```

---

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

---

## API Reference

| Method | Endpoint       | Description                          |
|--------|---------------|--------------------------------------|
| GET    | /users/        | List all 6 flatmates                 |
| GET    | /users/{id}    | Get single user                      |
| PATCH  | /users/{id}    | Update preferences                   |
| POST   | /recommend     | Get top-3 meal recommendations       |
| POST   | /history       | Record selected meal + satisfaction  |
| GET    | /history       | Get meal history                     |
| GET    | /analytics     | Satisfaction analytics + fairness    |

### POST /recommend — Request Body

```json
{
  "available_ingredients": ["chicken", "garlic", "tomatoes"],
  "time_available": 45,
  "budget_per_person": 8.0,
  "mood": "quick"
}
```

### POST /history — Record Selection

```json
{
  "meal_id": 7,
  "satisfaction_scores": {
    "Alex": 0.9,
    "Priya": 0.75,
    "Jordan": 0.5,
    "Sam": 0.85,
    "Riley": 0.7,
    "Morgan": 0.6
  }
}
```

---

## Scoring Engine

```
Score = Σ (user_preference(meal, user) × fairness_weight(user))
        - repetition_penalty
```

**Per-user preference score** includes:
- `+2.0` per matched like (ingredient/tag/cuisine)
- `-3.0` per matched dislike
- Spice penalty if meal spice > user tolerance
- Effort penalty if meal difficulty > user effort tolerance

**Fairness weights** — users with lower cumulative satisfaction get higher weights, preventing chronic under-satisfaction.

**Repetition penalty** — exponential decay (0.8^i × 3) for each occurrence in recent history.

---

## Default Users

| Name   | Emoji | Spice | Effort  | Likes              |
|--------|-------|-------|---------|--------------------|
| Alex   | 🧑    | 2/5   | medium  | chicken, grilled   |
| Priya  | 👩    | 5/5   | high    | spicy, paneer      |
| Jordan | 🧔    | 2/5   | low     | pizza, cheese      |
| Sam    | 👨    | 3/5   | low     | veg, salad, healthy|
| Riley  | 🧒    | 3/5   | medium  | noodles, asian     |
| Morgan | 👴    | 1/5   | medium  | soup, comfort, rice|

---

## Mobile-First Design

- Optimized for 320px–480px viewports
- Touch-friendly chips and large tap targets
- Sticky bottom navigation bar
- Ingredient multi-select with search
- Sliders for time and budget
- Bottom-sheet satisfaction modal
- No horizontal scrolling
