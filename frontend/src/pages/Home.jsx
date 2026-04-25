// pages/Home.jsx — Matches the Stitch "MealSync - Home" screen exactly
// Layout: TopBar → Hero title → Avatars row → Green CTA card → Last Meal card → Stats row → Bottom nav
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { useStore } from "../store";
import { getUsers, getHistory } from "../api";

export default function Home() {
  const navigate = useNavigate();
  const { users, setUsers } = useStore();
  const [lastMeal, setLastMeal] = useState(null);

  useEffect(() => {
    getUsers().then((r) => setUsers(r.data)).catch(() => {});
    getHistory(1).then((r) => {
      if (r.data.length > 0) setLastMeal(r.data[0]);
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: "#fbf9f2" }}>
      <TopBar />

      {/* Hero section */}
      <div className="px-5 mt-2 mb-4">
        <h1 className="text-[32px] font-bold leading-[40px] tracking-[-0.02em]"
            style={{ color: "#1b1c18" }}>
          MealSync
        </h1>
        <p className="text-base mt-1" style={{ color: "#46483c" }}>
          ML-Optimized for your household
        </p>

        {/* Avatar stack row */}
        <div className="flex items-center gap-1.5 mt-4">
          <div className="flex -space-x-2">
            {users.slice(0, 6).map((u, i) => (
              <div key={u.id}
                   className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white"
                   style={{
                     backgroundColor: ["#8a9a5b", "#ff9e68", "#d57881", "#bdce89", "#56642b", "#76786b"][i % 6],
                     color: "#ffffff",
                     zIndex: 10 - i,
                   }}>
                {u.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-xs font-medium ml-2" style={{ color: "#56642b" }}>
            {users.length} members ready
          </span>
        </div>
      </div>

      {/* Green CTA Card — "Feeling hungry?" */}
      <div className="mx-5 mb-5 rounded-3xl overflow-hidden px-6 py-7 shadow-xl shadow-sage-200/50"
           style={{ backgroundColor: "#56642b" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-rounded text-[#d9eaa3]" style={{ fontSize: 18 }}>smart_toy</span>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#d9eaa3" }}>
            XGBoost Engine Live
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white leading-tight mb-2">
          Ready to decide?
        </h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "#bdce89" }}>
          Our AI has analyzed 110+ meals against everyone's preferences for the perfect match.
        </p>
        <button
          onClick={() => navigate("/input")}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.97] shadow-lg shadow-black/10"
          style={{ backgroundColor: "#ffffff", color: "#56642b" }}>
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>auto_fix_high</span>
          Generate Best Match
        </button>
      </div>

      {/* LAST MEAL CHOSEN */}
      <div className="px-5 mb-5">
        <p className="section-label mb-3">LAST MEAL CHOSEN</p>
        <div className="card px-4 py-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-gradient-to-br from-sage-50 to-sage-100">
            {lastMeal ? "🍲" : "🥘"}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold" style={{ color: "#1b1c18" }}>
                {lastMeal ? lastMeal.meal_name : "Quick Dal Tadka"}
              </span>
              <span className="badge-good text-[11px] flex items-center gap-0.5">
                <span className="material-symbols-rounded text-[12px]">star</span>
                {lastMeal ? "4.9" : "4.8"}
              </span>
            </div>
            <p className="text-xs mt-0.5 font-medium" style={{ color: "#76786b" }}>
              {lastMeal
                ? `Harmony achieved with ${Object.keys(lastMeal.satisfactions).length} members`
                : "A top pick for Vansh & Priya"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row — Library + Group */}
      <div className="px-5 grid grid-cols-2 gap-4">
        <div className="card px-4 py-5 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center mb-2">
             <span className="material-symbols-rounded" style={{ fontSize: 24, color: "#56642b" }}>menu_book</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#76786b" }}>Library</p>
          <p className="text-lg font-bold" style={{ color: "#1b1c18" }}>110 Meals</p>
        </div>
        <div className="card px-4 py-5 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center mb-2">
             <span className="material-symbols-rounded" style={{ fontSize: 24, color: "#56642b" }}>verified</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#76786b" }}>Status</p>
          <p className="text-lg font-bold" style={{ color: "#1b1c18" }}>Optimized</p>
        </div>
      </div>
    </div>
  );
}
