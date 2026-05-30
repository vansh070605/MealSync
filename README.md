# 🍽️ MealSync: Collaborative AI Meal Engine

MealSync is a high-fidelity, machine-learning-powered platform designed for households to make collaborative food decisions. Built for roommate groups or families, it solves the "What should we eat?" dilemma by balancing individual preferences, kitchen constraints, and group harmony.

---

## 🚀 Key Upgraded Features

### 1. Smart Shared Grocery List (Ration ki List)
* **Real-Time Sync**: Add, track, and check off items in a shared ration list powered by Firebase Realtime Database.
* **Aasan Entry (Quick Add)**: Instant add suggestions for common Indian ingredients (Aloo, Pyaz, Paneer, Doodh, etc.) to minimize typing.
* **Recommendation Integration**: Directly add missing ingredients to the grocery list with a single click from the unlockable recipes drawer.

### 2. User Authentication & Invites
* **Secure Auth**: Protect household profiles using email & password login/registration.
* **Gharwala Invites**: Generate dynamic invitation links (`http://localhost:5173/invite?flatId=XYZ`) that allow new roommates to log in and automatically join the shared household database.

### 3. Installable App (PWA)
* Fully installable on iOS and Android devices with high-fidelity, customized logos (`192x192` and `512x512` PWA icons).
* Offline caching and automatic service-worker updates.

### 4. ML Feedback Loop
* Recommendations analyze historical cooking satisfaction logs.
* **Harmony Penalty/Boost**: High rating histories (>= 75%) award a **+15% Harmony Boost** to a recipe, while low rating histories (< 50%) apply a **-35% Harmony Penalty** to rotate and refresh ideas automatically.
* Visual proof notes (e.g., `(Boosted based on past high rating of 85%)`) are displayed directly on recipe cards.

### 5. Appetizing Recipe Images
* Gorgeous Indian food headers render automatically for all 110+ dishes.
* Relies on persistent placeholder images locked to the `meal_id` so that recipe covers remain consistent.

---

## 🧠 Architecture
1. **Frontend (State & UI)**: React 18, Tailwind CSS, Framer Motion, and **Firebase Realtime Database + Auth**. The frontend handles all client-state management, making it fast and secure.
2. **Backend (FastAPI ML)**: A stateless inference service running uvicorn/Gunicorn. It takes available ingredients, time, budget, user preferences, and history logs, running them through the XGBoost preference engine to score meals and calculate harmony.

---

## 🛠️ Local Quick Start

### 1. Backend Server
```bash
cd backend
python -m venv .venv
# Activate virtual environment
# Windows: .venv\Scripts\activate | Unix: source .venv/bin/activate
pip install -r requirements.txt
python main.py
```
*Starts uvicorn on port `8000`.*

### 2. Frontend Server
```bash
cd frontend
npm install
npm run dev
```
*Starts Vite on port `5173`.*

> [!TIP]
> You can also start both servers automatically from the root folder by launching `.\start_backend.bat` and `.\start_frontend.bat` in separate terminals.

---

## 🌍 Production Deployment

### Backend (Render / Railway)
1. Set **Root Directory** to `backend`.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Set **Root Directory** to `frontend`.
2. Add Environment Variable: `VITE_API_URL` -> Deployed Backend URL (e.g. `https://mealsync-backend.onrender.com`).
3. Deploy!
