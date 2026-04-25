import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import MealCard from "../components/MealCard";

export default function RecommendScreen() {
  const [searchParams] = useSearchParams();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [ratings, setRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const ingredients = searchParams.get("ingredients")?.split(",") || [];
    const time = parseInt(searchParams.get("time")) || 60;
    const budget = parseInt(searchParams.get("budget")) || 50;
    const mood = searchParams.get("mood") || "Normal";

    const kitchenState = {
      available_ingredients: ingredients,
      time_available: time,
      budget_per_person: budget,
      mood: mood
    };

    setLoading(true);
    setError(null);
    
    axios.post(`${API_BASE_URL}/recommend`, kitchenState)
      .then(res => {
        setRecommendations(res.data.top_meals || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch recommendations:", err);
        setError("Could not connect to the backend. Please ensure VITE_API_URL is set in Vercel.");
        setLoading(false);
      });
  }, [searchParams]);

  const handleLogMeal = () => {
    if (!selectedMeal) return;
    setIsSubmitting(true);
    
    const payload = {
      meal_id: selectedMeal.meal_id,
      notes: "Cooked with group! " + (selectedMeal.explanation || ""),
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
        alert("Failed to save to history. Check backend connection.");
      });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 font-bold animate-pulse">Consulting the ML Model...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Today's ML Pick</span>
        <h1 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">Our Best Matches</h1>
        <p className="text-slate-400 font-bold text-sm mt-2 mb-8">Top recommendations tailored for your group.</p>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem] text-center mb-8">
            <span className="material-symbols-rounded text-rose-400 text-4xl mb-2">cloud_off</span>
            <h3 className="text-rose-900 font-black">Connection Error</h3>
            <p className="text-rose-600 text-xs mt-1">{error}</p>
          </div>
        )}

        {!error && recommendations.length === 0 && (
          <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[3rem] text-center">
            <span className="material-symbols-rounded text-amber-400 text-5xl mb-4">Search</span>
            <h3 className="text-amber-900 font-black text-xl">No exact matches found</h3>
            <p className="text-amber-700 text-sm mt-2">Try adding more ingredients or increasing your time limit!</p>
          </div>
        )}

        <div className="space-y-4">
          {recommendations.map((meal) => (
            <MealCard 
              key={meal.meal_id} 
              meal={meal} 
              onSelect={(m) => {
                setSelectedMeal(m);
                const init = {};
                ["Vansh", "Shashwat", "Rajasthani", "Atharva", "Anni", "Prajjwal"].forEach(u => init[u] = 80);
                setRatings(init);
              }} 
            />
          ))}
        </div>
      </div>

      {/* Rating Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Rate this Meal</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{selectedMeal.meal_name}</p>
              </div>
              <button onClick={() => setSelectedMeal(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="space-y-6 mb-8">
              {Object.keys(ratings).map(user => (
                <div key={user}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-black text-slate-700">{user}</span>
                    <span className="text-sm font-bold text-emerald-600">{ratings[user]}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={ratings[user]}
                    onChange={(e) => setRatings({...ratings, [user]: parseInt(e.target.value)})}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handleLogMeal}
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : "Save to History"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
