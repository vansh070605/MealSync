// pages/RecommendScreen.jsx — Matches the Stitch "Recommendations" screen exactly
// Layout: TopBar → "Today's Pick" badge → Title + subtitle → 3 MealCards stacked → Bottom nav
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import MealCard from "../components/MealCard";
import SatisfactionModal from "../components/SatisfactionModal";
import { useStore } from "../store";
import { getUsers, selectMeal } from "../api";

export default function RecommendScreen() {
  const navigate = useNavigate();
  const { recommendations, users, setUsers } = useStore();
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [submitted, setSubmitted]       = useState(false);

  useEffect(() => {
    if (users.length === 0) {
      getUsers().then((r) => setUsers(r.data)).catch(() => {});
    }
  }, []);

  if (!recommendations) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-5"
           style={{ backgroundColor: "#fbf9f2" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
             style={{ backgroundColor: "#f0eee7" }}>
          <span className="material-symbols-rounded" style={{ fontSize: 36, color: "#76786b" }}>
            restaurant_menu
          </span>
        </div>
        <p className="text-center text-sm" style={{ color: "#46483c" }}>
          No recommendations yet.<br />Go to Decide first!
        </p>
        <button onClick={() => navigate("/input")} className="btn-primary px-8">
          Go to Decide →
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5"
           style={{ backgroundColor: "#fbf9f2" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
             style={{ backgroundColor: "#d9eaa3" }}>
          <span className="material-symbols-rounded" style={{ fontSize: 36, color: "#253000" }}>
            check_circle
          </span>
        </div>
        <h2 className="text-xl font-bold" style={{ color: "#1b1c18" }}>Meal Selected!</h2>
        <p className="text-sm text-center" style={{ color: "#46483c" }}>
          Satisfaction scores saved. Fairness weights updated for next time.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary px-8">Back to Home</button>
        <button onClick={() => navigate("/history")} className="btn-outline px-8">View History</button>
      </div>
    );
  }

  const handleSelect = async (scores) => {
    await selectMeal({
      meal_id: selectedMeal.meal_id,
      satisfaction_scores: scores,
    });
    setSelectedMeal(null);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: "#fbf9f2" }}>
      <TopBar />

      <div className="px-5 mt-2">
        {/* "Today's Pick" badge */}
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ backgroundColor: "#d9eaa3", color: "#253000" }}>
          Today's Pick
        </span>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#1b1c18" }}>
          Our Best Matches
        </h1>
        <p className="text-sm mb-6" style={{ color: "#46483c" }}>
          We've found three dishes that perfectly align with your group's dietary preferences and current mood.
        </p>

        {/* Meal cards */}
        <div className="flex flex-col gap-5">
          {recommendations.map((meal) => (
            <MealCard
              key={meal.meal_id}
              meal={meal}
              onSelect={setSelectedMeal}
            />
          ))}
        </div>
      </div>

      {/* Satisfaction modal */}
      {selectedMeal && (
        <SatisfactionModal
          meal={selectedMeal}
          users={users}
          onSubmit={handleSelect}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </div>
  );
}
