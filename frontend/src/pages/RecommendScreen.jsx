import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import MealCard from "../components/MealCard";

export default function RecommendScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [ratings, setRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const ingredients = searchParams.get("ingredients") || "";
    const time = searchParams.get("time") || 60;
    const mood = searchParams.get("mood") || "normal";
    const budget = searchParams.get("budget") || 10;

    const kitchenState = {
      available_ingredients: ingredients.split(",").filter(i => i),
      time_available: parseInt(time),
      budget_per_person: parseFloat(budget),
      mood: mood
    };

    axios.post(`${API_BASE_URL}/recommend`, kitchenState)
      .then(res => {
        setRecommendations(res.data.top_meals);
        setLoading(false);
      })
      .catch(err => {
        console.error("ML Inference Failed:", err);
        setLoading(false);
      });
  }, [searchParams]);

  const handleLogMeal = () => {
    if (!selectedMeal) return;
    setIsSubmitting(true);

    const payload = {
      meal_id: selectedMeal.meal_id,
      notes: "Cooked with group! " + selectedMeal.explanation,
      satisfaction_scores: ratings
    };

    axios.post(`${API_BASE_URL}/history`, payload)
      .then(() => {
        setIsSubmitting(false);
        setSelectedMeal(null);
        navigate("/history");
      })
      .catch(err => {
        console.error("Failed to log meal:", err);
        setIsSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse">Consulting the ML Chef...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        <div className="mb-8 animate-fade-in">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Today's ML Pick</span>
          <h1 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">Our Best Matches</h1>
          <p className="text-slate-500 mt-2 font-medium">Top recommendations tailored for your group.</p>
        </div>

        <div className="space-y-6">
          {recommendations?.map((meal, idx) => (
            <MealCard 
              key={meal.meal_id} 
              meal={meal} 
              onSelect={(m) => {
                setSelectedMeal(m);
                // Pre-populate ratings for all users
                const initialRatings = {};
                ["Vansh", "Shashwat", "Rajasthani", "Atharva", "Anni", "Prajjwal"].forEach(u => initialRatings[u] = 80);
                setRatings(initialRatings);
              }}
            />
          ))}
        </div>

        {/* Satisfaction Rating Modal */}
        {selectedMeal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-slide-up relative overflow-hidden">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
              
              <button 
                onClick={() => setSelectedMeal(null)}
                className="absolute top-8 right-8 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200"
              >
                <span className="material-symbols-rounded">close</span>
              </button>

              <h2 className="text-2xl font-black text-slate-900 mb-1">Rate tonight's meal</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">{selectedMeal.meal_name}</p>

              <div className="space-y-8 mb-10 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(ratings).map((user) => (
                  <div key={user} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                          {user[0]}
                        </div>
                        <span className="font-black text-slate-700">{user}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        ratings[user] > 80 ? 'bg-emerald-100 text-emerald-700' : 
                        ratings[user] > 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {ratings[user] > 80 ? 'Loved' : ratings[user] > 50 ? 'Okay' : 'Meh'}
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={ratings[user]}
                      onChange={(e) => setRatings({...ratings, [user]: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-emerald-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={handleLogMeal}
                disabled={isSubmitting}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-800 transition-all shadow-xl hover:shadow-emerald-200 flex items-center justify-center gap-3 active:scale-95"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-rounded">history_edu</span>
                    Save to History
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
