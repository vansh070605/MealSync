import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { recommend, selectMeal, getUsers, getHistory, addGroceryItem } from "../api";
import { useStore } from "../store";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";

export default function RecommendScreen() {
  const { flatId, users, setUsers } = useStore();
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recommendations, setRecommendations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [ratings, setRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const ingredients = searchParams.get("ingredients")?.split(",").filter(Boolean) || [];
    const time = parseInt(searchParams.get("time")) || 60;
    const budget = parseInt(searchParams.get("budget")) || 50;
    const mood = searchParams.get("mood") || "Normal";

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch household's cooking history
        let historyData = [];
        if (flatId) {
          const histRes = await getHistory(flatId);
          historyData = histRes.data || [];
        }

        // Fetch users if not loaded
        let currentUsers = users;
        if (flatId && users.length === 0) {
          const usersRes = await getUsers(flatId);
          setUsers(usersRes.data);
          currentUsers = usersRes.data;
        }

        const kitchenState = {
          available_ingredients: ingredients,
          time_available: time,
          budget_per_person: budget,
          mood: mood,
          flat_id: flatId,
          users: currentUsers,
          meal_history: historyData
        };

        const res = await recommend(kitchenState);
        setRecommendations(res.data.top_meals || []);
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Could not connect to the backend. Please ensure VITE_API_URL is set in Vercel.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [searchParams, flatId]);

  const handleAddIngredient = (ing) => {
    const currentIngredients = searchParams.get("ingredients")?.split(",").filter(Boolean) || [];
    if (!currentIngredients.includes(ing)) {
      const newIngredients = [...currentIngredients, ing];
      const newParams = new URLSearchParams(searchParams);
      newParams.set("ingredients", newIngredients.join(","));
      setSearchParams(newParams);
    }
  };

  const handleAddToGroceryList = (ing) => {
    if (!flatId) return;
    addGroceryItem(flatId, { name: ing, added_by: userProfile?.name || "Decide Screen" })
      .then(() => alert(`${ing} ration ki list mein add ho gaya! 🛒`))
      .catch(err => {
        console.error("Failed to add to grocery list:", err);
        alert("Ration list mein add karne mein dikkat aayi.");
      });
  };

  const handleLogMeal = () => {
    if (!selectedMeal) return;
    setIsSubmitting(true);
    
    const payload = {
      meal_id: selectedMeal.meal_id,
      meal_name: selectedMeal.meal_name,
      notes: "Cooked with group! " + (selectedMeal.explanation || ""),
      satisfaction_scores: ratings
    };

    selectMeal(flatId, payload)
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
      <TopBar subtitle="Our Best Matches" />
      <div className="max-w-md mx-auto px-6 pt-6">
        <p className="text-slate-400 font-bold text-sm text-center mb-8">Top recommendations tailored for your group.</p>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem] text-center mb-8">
            <span className="material-symbols-rounded text-rose-400 text-4xl mb-2">cloud_off</span>
            <h3 className="text-rose-900 font-black">Connection Error</h3>
            <p className="text-rose-600 text-xs mt-1">{error}</p>
          </div>
        )}

        {!error && recommendations.length === 0 && (
          <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[3rem] text-center">
            <span className="material-symbols-rounded text-amber-400 text-5xl mb-4">search</span>
            <h3 className="text-amber-900 font-black text-xl">No exact matches found</h3>
            <p className="text-amber-700 text-sm mt-2">Try adding more ingredients or select from the unlockable suggestions below!</p>
          </div>
        )}

        <div className="space-y-6">
          {recommendations.map((meal) => (
            <div key={meal.meal_id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <img 
                src={`https://loremflickr.com/800/400/food,indian?lock=${meal.meal_id}`} 
                alt={meal.meal_name} 
                className="w-full h-44 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">{meal.meal_name}</h3>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-bold uppercase">
                    {meal.score}% Harmony
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-medium mb-4">{meal.explanation}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedMeal(meal);
                      const init = {};
                      const members = users.length > 0 ? users.map(u => u.name) : ["Vansh", "Priya"];
                      members.forEach(u => init[u] = 80);
                      setRatings(init);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-md"
                  >
                    Decide on this
                    <span className="material-symbols-rounded text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions / Unlockable meals */}
        {!error && suggestions.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="border-t border-slate-100 pt-8">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">Smart Assistant</span>
              <h2 className="text-2xl font-black text-slate-800 mt-2 tracking-tight">Unlockable Recipes</h2>
              <p className="text-slate-400 font-bold text-xs mt-1">Add just a few missing ingredients to unlock these dishes:</p>
            </div>

            <div className="space-y-6">
              {suggestions.map((sug) => (
                <div key={sug.meal_id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <img 
                    src={`https://loremflickr.com/800/400/food,indian?lock=${sug.meal_id}`} 
                    alt={sug.meal_name} 
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">{sug.meal_name}</h3>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-bold uppercase">
                        {sug.score}% Harmony
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium mb-4">{sug.explanation}</p>
                    <div className="flex flex-wrap gap-2">
                      {sug.missing_ingredients.map((ing) => (
                        <div key={ing} className="flex items-center gap-1">
                          <button
                            onClick={() => handleAddIngredient(ing)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95 border border-emerald-100"
                          >
                            <span className="material-symbols-rounded text-sm">add</span>
                            Add {ing}
                          </button>
                          <button
                            onClick={() => handleAddToGroceryList(ing)}
                            className="flex items-center justify-center p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-all border border-amber-100 active:scale-95"
                            title="Add to Grocery List"
                          >
                            <span className="material-symbols-rounded text-sm" style={{ fontSize: 16 }}>shopping_cart</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
