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
          Sync your dinner in seconds
        </p>

        {/* Avatar stack row */}
        <div className="flex items-center gap-1.5 mt-4">
          <div className="flex -space-x-2">
            {users.slice(0, 4).map((u, i) => (
              <div key={u.id}
                   className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-white"
                   style={{
                     backgroundColor: ["#8a9a5b", "#ff9e68", "#d57881", "#bdce89"][i % 4],
                     color: "#ffffff",
                     zIndex: 4 - i,
                   }}>
                {u.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-xs font-medium ml-2" style={{ color: "#56642b" }}>
            Everyone's ready to decide
          </span>
        </div>
      </div>

      {/* Green CTA Card — "Feeling hungry?" */}
      <div className="mx-5 mb-5 rounded-xl overflow-hidden px-5 py-6"
           style={{ backgroundColor: "#56642b" }}>
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold mb-3"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#d9eaa3" }}>
          Dinner tonight
        </span>
        <h2 className="text-[22px] font-bold text-white leading-7 mb-1">
          Feeling hungry?
        </h2>
        <p className="text-sm mb-5" style={{ color: "#bdce89" }}>
          We've analyzed everyone's preferences for a perfect match.
        </p>
        <button
          onClick={() => navigate("/input")}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#ffffff", color: "#56642b" }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>restaurant_menu</span>
          Get Recommendation
        </button>
      </div>

      {/* LAST MEAL CHOSEN */}
      <div className="px-5 mb-4">
        <p className="section-label mb-3">LAST MEAL CHOSEN</p>
        <div className="card px-4 py-3.5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
               style={{ backgroundColor: "#f0eee7" }}>
            🥗
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: "#1b1c18" }}>
                {lastMeal ? lastMeal.meal_name : "Harvest Bowl"}
              </span>
              <span className="badge-good text-[11px]">
                {lastMeal ? `${Object.keys(lastMeal.satisfactions).length}` : "4.8"} ★
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#76786b" }}>
              {lastMeal
                ? `Agreed by ${Object.keys(lastMeal.satisfactions).slice(0, 3).join(", ")}`
                : "Agreed by Sarah, Ben & Leo"}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px]" style={{ color: "#76786b" }}>Healthy</span>
              <span className="text-[11px]" style={{ color: "#76786b" }}>15 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row — Streak + Group */}
      <div className="px-5 grid grid-cols-2 gap-3">
        <div className="card px-4 py-4 flex flex-col items-center">
          <span className="material-symbols-rounded mb-1" style={{ fontSize: 22, color: "#56642b" }}>
            local_fire_department
          </span>
          <p className="text-xs" style={{ color: "#76786b" }}>Streak</p>
          <p className="text-xl font-bold" style={{ color: "#1b1c18" }}>5 Days</p>
        </div>
        <div className="card px-4 py-4 flex flex-col items-center">
          <span className="material-symbols-rounded mb-1" style={{ fontSize: 22, color: "#56642b" }}>
            groups
          </span>
          <p className="text-xs" style={{ color: "#76786b" }}>Group</p>
          <p className="text-xl font-bold" style={{ color: "#1b1c18" }}>Family</p>
        </div>
      </div>
    </div>
  );
}
