# 🍽️ MealSync: Collaborative AI Meal Engine

MealSync is a high-fidelity, machine-learning-powered platform designed for households to make collaborative food decisions. Built for a group of 6 flatmates, it solves the "What should we eat?" dilemma by balancing individual preferences, kitchen constraints, and group harmony.

![MealSync Demo](https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=1200)

## 🧠 The Intelligence Layer
MealSync uses an **XGBoost Regression Model** to predict group satisfaction. 
- **Fairness Engine**: It doesn't just pick the average; it uses a custom scoring algorithm that respects individual "vetos" (low scores) to ensure no one is left unhappy.
- **Dynamic Learning**: Every time a meal is logged in the history, the model retrains its weights to better understand your group's evolving palate.
- **Soft Matching**: Our recommendation engine uses fuzzy logic to suggest meals even if you're missing a minor ingredient, prioritizing feasibility over strict rules.

## ✨ Core Features
- **Smart Recommendations**: Get a Top-5 list of meals based on your current kitchen stock and mood.
- **Household Profiles**: Manage preferences for Vansh, Shashwat, Rajasthani, Atharva, Anni, and Prajjwal.
- **Live Kitchen Sync**: Real-time tracking of ingredients and time availability.
- **Meal Journal**: Track what you've cooked, how much everyone liked it, and clear history with one click.
- **Premium UI**: A glassmorphic, mobile-first design with professional food photography for all 110+ dishes.

## 🛠️ Tech Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion (for smooth micro-animations).
- **Backend**: FastAPI (Python 3.12), SQLAlchemy.
- **ML Engine**: Scikit-Learn, XGBoost, Pandas.
- **Database**: SQLite (Production-ready for small groups).

## 🚀 Quick Start

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `python main.py`
*The server will initialize the database with 110 Indian dishes and 6 default users automatically.*

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 🌍 Deployment
The project is configured for easy deployment on **Render**, **Vercel**, or **Heroku**.
- **Backend**: Update `PORT` environment variable.
- **Frontend**: Set `VITE_API_URL` to your backend domain.

---
*Created with ❤️ for better group living.*
