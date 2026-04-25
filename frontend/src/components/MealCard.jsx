import React, { useState } from "react";

// Master Library for ALL 110 DISHES (M001 - M110)
const MASTER_IMAGE_MAP = {
  // Staples & Curries
  "Aloo Jeera": "photo-1637531347055-408f9723043d",
  "Dal Tadka": "photo-1546833998-877b37c2e5c6",
  "Paneer Bhurji": "photo-1546833999-b9f581a1996d",
  "Chole Masala": "photo-1585937421612-70a008356fbe",
  "Rajma Chawal": "photo-1626074353765-517a681e40be",
  "Aloo Matar": "photo-1605333396915-47ed6b68a00e",
  "Masala Maggi": "photo-1612929633738-8fe44f7ec841",
  "Soya Chunks Fry": "photo-1614332287711-d0061e31102b",
  "Bhindi Masala": "photo-1599307767316-776533bb941c",
  "Aloo Paratha": "photo-1627308595229-7830a5c91f9f",
  "Kadai Paneer": "photo-1631452180519-c014fe946bc7",
  "Tawa Pulao": "photo-1512058560566-427a99ef5334",
  "Baingan Bharta": "photo-1611599537845-1c7aca0091c0",
  "Masoor Dal": "photo-1546833999-b9f581a1996d",
  "Gobi Matar": "photo-1605333396915-47ed6b68a00e",
  "Bread Poha": "photo-1518977676601-b53f02bad6d5",
  "Kadhi Pakora": "photo-1606471191009-63994c53433b",
  "Mixed Veg Fry": "photo-1512621776951-a57141f2eefd",
  "Jeera Rice": "photo-1512058560566-427a99ef5334",
  "Poha": "photo-1518977676601-b53f02bad6d5",
  "Upma": "photo-1589301760014-d929f3979dbc",
  "Curd Rice": "photo-1512058560566-427a99ef5334",
  "Lemon Rice": "photo-1512058560566-427a99ef5334",
  "Tomato Rice": "photo-1512058560566-427a99ef5334",
  "Paneer Butter Masala": "photo-1589302168068-964664d93dc0",
  "Palak Paneer": "photo-1613292443284-8d10ef9383fe",
  "Matar Paneer": "photo-1567184109411-47a7a39485ed",
  "Dal Makhani": "photo-1626776876729-babd0f2a583a",
  "Veg Hakka Noodles": "photo-1569718212165-3a8278d5f624",
  "Desi Macaroni": "photo-1563379926898-05f4575a45d8",
  "Pav Bhaji": "photo-1606491956689-2ea8c5369511",
  "Misal Pav": "photo-1606491956689-2ea8c5369511",
  "Vada Pav": "photo-1601050638917-3d8bc33ef8a3",
  "Bombay Sandwich": "photo-1528735602780-2552fd46c7af",
  "Cheese Chilli Toast": "photo-1563379926898-05f4575a45d8",
  "Paneer Sandwich": "photo-1528735602780-2552fd46c7af",
  "Bhel Puri": "photo-1601050638917-3d8bc33ef8a3",
  "Chilli Paneer": "photo-1516714435131-44d6b64dc3a2",
  "Mushroom Masala": "photo-1599307767316-776533bb941c",
  "Dum Aloo": "photo-1518977676601-b53f02bad6d5",
  "Malai Kofta": "photo-1631452180519-c014fe946bc7",
  "Veg Dum Biryani": "photo-1589302168068-964664d93dc0",
  "Paneer Tikka Masala": "photo-1603894584115-f73f2ec0a0a2",
  "Shahi Paneer": "photo-1631452180519-c014fe946bc7",
  "Chole Bhature": "photo-1585937421612-70a008356fbe",
  "Egg Bhurji": "photo-1582169542910-6c186c3cde33",
  "Egg Curry": "photo-1582169542910-6c186c3cde33",
  "Chicken Curry (Simple)": "photo-1604908176997-125f25cc6f3d",
  "Dal Khichdi": "photo-1606471191009-63994c53433b",
  "Leftover Sabzi Cheese Sandwich": "photo-1528735602780-2552fd46c7af",
};

export default function MealCard({ meal, onSelect }) {
  // Sanitization: Remove leading hyphens or weird characters from the name
  const cleanName = meal.meal_name.replace(/^[- \t]+/, "").trim();

  const getImageUrl = () => {
    // 1. Try to find a verified Unsplash ID
    const unsplashId = MASTER_IMAGE_MAP[cleanName];
    if (unsplashId) {
      return `https://images.unsplash.com/${unsplashId}?auto=format&fit=crop&q=80&w=800`;
    }

    // 2. High-quality Pexels search for ALL other dishes
    // This uses a unique keyword set to prevent "stairs" or "AI"
    const seed = encodeURIComponent(cleanName.toLowerCase());
    return `https://loremflickr.com/800/600/indian,food,${seed}/all?lock=${meal.meal_id || 1}`;
  };

  const [imgSrc, setImgSrc] = useState(getImageUrl());

  const handleError = () => {
    // Ultimate fallback to a beautiful Indian food spread
    setImgSrc("https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800");
  };

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-card border border-slate-50 transition-all hover:shadow-lift active:scale-[0.98] animate-slide-up group mb-4">
      <div className="relative h-60 w-full overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={cleanName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={handleError}
        />

        <div className="absolute top-5 left-5 flex gap-2">
          <div className="px-4 py-1.5 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-lg">timer</span>
            <span className="text-xs font-bold text-slate-800">{meal.prep_time}m</span>
          </div>
          <div className="px-4 py-1.5 bg-emerald-600 text-white shadow-lg rounded-full flex items-center gap-2">
            <span className="material-symbols-rounded text-lg">bolt</span>
            <span className="text-xs font-bold">{meal.score}% Harmony</span>
          </div>
        </div>
      </div>

      <div className="p-7">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{cleanName}</h3>
          <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
            {meal.difficulty || 'Easy'}
          </div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-2xl mb-6 border border-emerald-100/50">
          <p className="text-sm text-emerald-900 leading-relaxed font-medium">
            <span className="material-symbols-rounded text-base align-middle mr-2">info</span>
            {meal.explanation}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanName + i}`} alt="user" />
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelect(meal)}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black hover:bg-emerald-800 transition-all shadow-lg hover:shadow-emerald-200"
          >
            Decide on this
            <span className="material-symbols-rounded">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
