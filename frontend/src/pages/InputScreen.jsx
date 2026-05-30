import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

const CATEGORIES = {
  "Sabziyaan (Vegetables)": [
    "Potato", "Onion", "Tomato", "Peas", "Capsicum", "Carrot", "Cabbage", "Cauliflower", 
    "Spinach", "Okra", "Eggplant", "Mushroom", "Bottle Gourd", "Bitter Gourd", "Ivy Gourd", 
    "Taro Root", "Radish", "Green Beans", "Leftover Veggies"
  ],
  "Dal, Anda, Meat (Proteins)": [
    "Paneer", "Chickpeas", "Yellow Lentils", "Kidney Beans", "Red Lentils", "Black Chickpeas", 
    "Moong Dal", "Toor Dal", "Chana Dal", "Soya Chunks", "Eggs", "Chicken", "Mutton", 
    "Lobster", "Moth Beans", "Soya Chaap", "Black Lentils", "Besan"
  ],
  "Roti, Chawal & Staples": [
    "Rice", "Flour", "Maggi", "Bread", "Pav", "Noodles", "Puffed Rice", "Flattened Rice", 
    "Semolina", "Macaroni", "Dosa Batter", "Leftover Idli"
  ],
  "Dahi, Ghee & Masala (Dairy & Pantry)": [
    "Curd", "Butter", "Cream", "Cheese", "Cashew", "Coconut", "Peanuts", "Ghee", 
    "Yogurt", "Jam", "Ketchup", "Soy Sauce", "Fanta"
  ]
};

const INGREDIENT_LABELS = {
  "Rice": "Chawal (Rice)",
  "Flour": "Atta (Flour)",
  "Maggi": "Maggi",
  "Bread": "Double Roti (Bread)",
  "Pav": "Pav / Bun",
  "Noodles": "Noodles",
  "Puffed Rice": "Lai / Murmura (Puffed Rice)",
  "Flattened Rice": "Poha (Flattened Rice)",
  "Semolina": "Suji (Semolina)",
  "Macaroni": "Pasta / Macaroni",
  "Dosa Batter": "Dosa Batter",
  "Leftover Idli": "Bachi hui Idli",
  "Potato": "Aloo (Potato)",
  "Onion": "Pyaaz (Onion)",
  "Tomato": "Tamatar (Tomato)",
  "Peas": "Matar (Peas)",
  "Capsicum": "Shimla Mirch (Capsicum)",
  "Carrot": "Gajar (Carrot)",
  "Cabbage": "Patta Gobi (Cabbage)",
  "Cauliflower": "Phool Gobi (Cauliflower)",
  "Spinach": "Palak (Spinach)",
  "Okra": "Bhindi (Okra)",
  "Eggplant": "Baingan (Eggplant)",
  "Mushroom": "Mushroom",
  "Bottle Gourd": "Lauki (Bottle Gourd)",
  "Bitter Gourd": "Karela (Bitter Gourd)",
  "Ivy Gourd": "Kundru (Ivy Gourd)",
  "Taro Root": "Arbi (Taro Root)",
  "Radish": "Mooli (Radish)",
  "Green Beans": "Beans",
  "Leftover Veggies": "Bachi hui Sabzi",
  "Paneer": "Paneer",
  "Chickpeas": "Chole (Chickpeas)",
  "Yellow Lentils": "Arhar Dal (Yellow Lentils)",
  "Kidney Beans": "Rajma (Kidney Beans)",
  "Red Lentils": "Masoor Dal (Red Lentils)",
  "Black Chickpeas": "Kala Chana",
  "Moong Dal": "Moong Dal",
  "Toor Dal": "Toor Dal",
  "Chana Dal": "Chana Dal",
  "Soya Chunks": "Nutrela / Soya Chunks",
  "Eggs": "Ande (Eggs)",
  "Chicken": "Chicken",
  "Mutton": "Mutton",
  "Lobster": "Lobster",
  "Moth Beans": "Matki (Moth Beans)",
  "Soya Chaap": "Soya Chaap",
  "Black Lentils": "Urad/Kaali Dal",
  "Besan": "Besan (Gram Flour)",
  "Curd": "Dahi (Curd)",
  "Butter": "Makhan (Butter)",
  "Cream": "Malai (Cream)",
  "Cheese": "Cheese",
  "Cashew": "Kaju (Cashew)",
  "Coconut": "Nariyal (Coconut)",
  "Peanuts": "Mungfali (Peanuts)",
  "Ghee": "Ghee",
  "Yogurt": "Yogurt",
  "Jam": "Jam",
  "Ketchup": "Ketchup",
  "Soy Sauce": "Soy Sauce",
  "Fanta": "Cold Drink / Fanta"
};

export default function InputScreen() {
  const navigate = useNavigate();
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [time, setTime] = useState(60);
  const [budget, setBudget] = useState(10);
  const [mood, setMood] = useState("normal");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [expandedCategories, setExpandedCategories] = useState({
    "Sabziyaan (Vegetables)": true
  });

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const toggleIngredient = (ing) => {
    // Save frequency for smart sorting
    const freqs = JSON.parse(localStorage.getItem("ingredient_frequencies") || "{}");
    if (!selectedIngredients.includes(ing)) {
      freqs[ing] = (freqs[ing] || 0) + 1;
      localStorage.setItem("ingredient_frequencies", JSON.stringify(freqs));
    }
    
    setSelectedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const handleClearAll = () => {
    setSelectedIngredients([]);
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

  // Sort ingredients inside category using frequency
  const freqs = JSON.parse(localStorage.getItem("ingredient_frequencies") || "{}");
  const getSortedItems = (items) => {
    return [...items].sort((a, b) => (freqs[b] || 0) - (freqs[a] || 0));
  };

  return (
    <div className="pb-24 animate-fade-in">
      <TopBar title="Nourish & Gather" subtitle="Aapki Rasoi Mein Kya Hai?" />

      <div className="px-5 mt-6">
        
        {/* Search bar */}
        <div className="mb-6 relative">
          <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input 
            type="text" 
            placeholder="Ingredient search karein (e.g. Aloo, Paneer, Pyaz)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-300 focus:bg-white transition-all shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          )}
        </div>

        {/* Selected Ingredients Dashboard (Manageable & Viewable) */}
        {selectedIngredients.length > 0 && (
          <div className="card p-5 mb-6 bg-slate-50/70 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">SELECTED INGREDIENTS ({selectedIngredients.length})</span>
              <button 
                onClick={handleClearAll}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-rounded text-sm">delete_sweep</span>
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {selectedIngredients.map(ing => (
                <span 
                  key={ing} 
                  onClick={() => toggleIngredient(ing)}
                  className="px-3.5 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-transform"
                >
                  {INGREDIENT_LABELS[ing] || ing}
                  <span className="material-symbols-rounded text-xs bg-white/20 rounded-full p-0.5">close</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {Object.entries(CATEGORIES).map(([cat, items]) => {
            const filteredItems = items.filter(ing => {
              const label = INGREDIENT_LABELS[ing] || ing;
              return label.toLowerCase().includes(searchQuery.toLowerCase()) || ing.toLowerCase().includes(searchQuery.toLowerCase());
            });

            if (searchQuery.trim() && filteredItems.length === 0) {
              return null;
            }

            const isExpanded = expandedCategories[cat] || (searchQuery.trim().length > 0);
            const selectedCount = items.filter(ing => selectedIngredients.includes(ing)).length;
            
            return (
              <div key={cat} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
                      {cat}
                    </h3>
                    {selectedCount > 0 && (
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  <span className="material-symbols-rounded text-slate-400">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="p-5 flex flex-wrap gap-2 animate-fade-in border-t border-slate-100">
                    {getSortedItems(filteredItems).map(ing => {
                      const isSelected = selectedIngredients.includes(ing);
                      return (
                        <button
                          key={ing}
                          onClick={() => toggleIngredient(ing)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 border ${
                            isSelected
                              ? "bg-emerald-700 text-white border-emerald-700 shadow-md scale-105"
                              : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 active:scale-95"
                          }`}
                        >
                          {INGREDIENT_LABELS[ing] || ing}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Filters Section */}
        <div className="mt-10 space-y-8 pt-8 border-t border-slate-100">
          {/* Time Slider */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-slate-800">Banane Ka Time (Max Cooking Time)</label>
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
          <div>
            <label className="text-sm font-bold text-slate-800 mb-4 block">Kaisa khana khana hai? (Mood Select)</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "quick", label: "Fatafat (Quick)", icon: "bolt" },
                { id: "normal", label: "Sahi Diet (Balanced)", icon: "restaurant" },
                { id: "heavy", label: "Pait Bhar (Hearty)", icon: "soup_kitchen" },
                { id: "surprise", label: "Kuch Bhi (Surprise)", icon: "auto_awesome" }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-[0.98] ${
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
        </div>

        {/* Primary Action */}
        <div className="mt-10">
          <button
            onClick={handleRecommend}
            className="w-full h-16 bg-emerald-800 text-white rounded-3xl text-lg font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-900 active:scale-95 transition-all"
            style={{ backgroundColor: "#56642b" }}
          >
            <span className="material-symbols-rounded">auto_fix_high</span>
            <span>Batao Kya Khayein? 🍲</span>
          </button>
          <p className="text-center text-[11px] mt-4 uppercase tracking-widest font-bold text-slate-400">
            ML Engine analyzes 110+ meals in real-time
          </p>
        </div>
      </div>
    </div>
  );
}
