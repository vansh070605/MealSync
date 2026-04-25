import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

const CATEGORIES = {
  "Grains & Staples": ["Rice", "Flour", "Maggi", "Bread", "Pav", "Noodles", "Puffed Rice", "Flattened Rice", "Semolina", "Macaroni"],
  "Vegetables": ["Potato", "Onion", "Tomato", "Peas", "Capsicum", "Carrot", "Cabbage", "Cauliflower", "Spinach", "Okra", "Eggplant", "Mushroom", "Bottle Gourd", "Bitter Gourd", "Ivy Gourd", "Taro Root", "Radish"],
  "Proteins": ["Paneer", "Chickpeas", "Yellow Lentils", "Kidney Beans", "Red Lentils", "Black Chickpeas", "Moong Dal", "Toor Dal", "Chana Dal", "Soya Chunks", "Eggs", "Chicken", "Mutton", "Lobster"],
  "Dairy & Pantry": ["Curd", "Butter", "Cream", "Cheese", "Cashew", "Coconut", "Peanuts", "Ghee", "Yogurt", "Jam", "Ketchup", "Soy Sauce"]
};

export default function InputScreen() {
  const navigate = useNavigate();
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [time, setTime] = useState(60);
  const [budget, setBudget] = useState(10);
  const [mood, setMood] = useState("normal");

  const toggleIngredient = (ing) => {
    setSelectedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const handleRecommend = () => {
    const params = new URLSearchParams({
      ingredients: selectedIngredients.join(","),
      time,
      budget,
      mood
    });
    navigate(`/recommend?${params.toString()}`);
  };

  return (
    <div className="pb-24 animate-fade-in">
      <TopBar title="Nourish & Gather" subtitle="What's in your kitchen?" />

      <div className="px-5 mt-6">
        {/* Ingredient Groups */}
        <div className="space-y-6">
          {Object.entries(CATEGORIES).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-slate-400">
                {cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map(ing => (
                  <button
                    key={ing}
                    onClick={() => toggleIngredient(ing)}
                    className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 border ${
                      selectedIngredients.includes(ing)
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-lg scale-105"
                        : "bg-white text-slate-700 border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {ing}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="mt-10 space-y-8 pt-8 border-t border-slate-100">
          {/* Time Slider */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-slate-800">Cooking Time</label>
              <span className="text-sm font-bold px-3 py-1 bg-emerald-50 rounded-full text-emerald-700">{time} mins</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={time}
              onChange={(e) => setTime(parseInt(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Mood Selector */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "quick", label: "Quick Bite", icon: "bolt" },
              { id: "normal", label: "Balanced", icon: "restaurant" },
              { id: "heavy", label: "Hearty", icon: "soup_kitchen" },
              { id: "surprise", label: "Surprise Me", icon: "auto_awesome" }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  mood === m.id 
                    ? "bg-emerald-50 border-emerald-500 shadow-sm" 
                    : "bg-white border-slate-100"
                }`}
              >
                <span className={`material-symbols-rounded ${mood === m.id ? "text-emerald-700" : "text-slate-400"}`}>
                  {m.icon}
                </span>
                <span className={`text-sm font-bold ${mood === m.id ? "text-emerald-900" : "text-slate-600"}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action */}
        <div className="mt-10">
          <button
            onClick={handleRecommend}
            className="w-full h-16 bg-emerald-800 text-white rounded-3xl text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 transition-transform"
          >
            <span className="material-symbols-rounded">auto_fix_high</span>
            <span>What should we eat?</span>
          </button>
          <p className="text-center text-[11px] mt-4 uppercase tracking-widest font-bold text-slate-400">
            ML Engine analyzes 110+ meals in real-time
          </p>
        </div>
      </div>
    </div>
  );
}
