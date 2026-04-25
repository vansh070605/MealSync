@echo off
echo ==========================================
echo  MealSync - Starting Backend Server
echo ==========================================
cd /d "%~dp0backend"
python -m uvicorn main:app --reload --port 8000
