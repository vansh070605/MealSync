// pages/InputScreen.jsx — Matches the Stitch "Decide - Input" screen exactly
// Layout: TopBar → Title → Ingredient chips → Cooking Time slider → Budget cards → Mood buttons → Hero CTA card → Bottom nav
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { useStore } from "../store";
import { recommend } from "../api";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";

const ALL_INGREDIENTS = [
  "Chicken", "Pasta", "Veggies", "Tofu", "Rice",
  "Salmon", "Eggs", "Paneer", "Noodles", "Bread",
  "Tomatoes", "Garlic", "Onion", "Cheese", "Mushrooms",
  "Bell Peppers", "Potatoes", "Lentils", "Shrimp", "Avocado",
];

const BUDGETS = [
  { value: 4,  label: "Low",    icon: "savings" },
  { value: 8,  label: "Medium", icon: "account_balance_wallet" },
  { value: 15, label: "High",   icon: "diamond" },
];

const MOODS = [
  { value: "light",    label: "Light",   icon: "spa" },
  { value: "heavy",    label: "Heavy",   icon: "restaurant" },
  { value: "quick",    label: "Quick",   icon: "bolt" },
  { value: "surprise", label: "Surprise",icon: "casino" },
];

export default function InputScreen() {
  const navigate = useNavigate();
  const {
    kitchenState, setKitchenState,
    setRecommendations, setFairnessWeights,
    setLoading, loading,
    setError, error, clearError,
  } = useStore();

  const [customIngredient, setCustomIngredient] = useState("");

  const toggleIngredient = (ing) => {
    const lower = ing.toLowerCase();
    const current = kitchenState.available_ingredients;
    if (current.includes(lower)) {
      setKitchenState((s) => ({
        ...s,
        available_ingredients: current.filter((x) => x !== lower),
      }));
    } else {
      setKitchenState((s) => ({
        ...s,
        available_ingredients: [...current, lower],
      }));
    }
  };

  const addCustom = () => {
    const clean = customIngredient.trim().toLowerCase();
    if (clean && !kitchenState.available_ingredients.includes(clean)) {
      setKitchenState((s) => ({
        ...s,
        available_ingredients: [...s.available_ingredients, clean],
      }));
    }
    setCustomIngredient("");
  };

  const handleRecommend = async () => {
    setLoading(true);
    clearError();
    try {
      const res = await recommend(kitchenState);
      setRecommendations(res.data.top_meals);
      setFairnessWeights(res.data.fairness_weights);
      navigate("/recommend");
    } catch (e) {
      setError(e.response?.data?.detail || "Could not get recommendations. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (ing) => kitchenState.available_ingredients.includes(ing.toLowerCase());
  const selectedBudget = BUDGETS.find((b) => b.value === kitchenState.budget_per_person) || BUDGETS[1];

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ backgroundColor: "#fbf9f2" }}>
      <TopBar />
      <ErrorBanner message={error} onDismiss={clearError} />

      <div className="px-5 mt-2">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#1b1c18" }}>
          What's on the menu?
        </h1>
        <p className="text-sm mb-6" style={{ color: "#46483c" }}>
          Tell us what you have, we'll do the rest.
        </p>

        {/* Ingredients — chip selectors */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#1b1c18" }}>Ingredients</p>
            <p className="text-xs" style={{ color: "#76786b" }}>Select multiple</p>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {ALL_INGREDIENTS.slice(0, 8).map((ing) => (
              <button
                key={ing}
                onClick={() => toggleIngredient(ing)}
                className={`chip ${isSelected(ing) ? "chip-selected" : "chip-unselected"}`}
              >
                {isSelected(ing) && (
                  <span className="mr-1">×</span>
                )}
                {ing}
              </button>
            ))}
          </div>
          {/* + Add other */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add other..."
              value={customIngredient}
              onChange={(e) => setCustomIngredient(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              className="input-field flex-1 text-sm"
            />
            <button onClick={addCustom} className="chip chip-unselected">
              + Add
            </button>
          </div>
        </div>

        {/* Cooking Time — slider matching Stitch */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#1b1c18" }}>Cooking Time</p>
            <div className="flex items-center gap-1" style={{ color: "#1b1c18" }}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>schedule</span>
              <span className="text-lg font-bold">{kitchenState.time_available}</span>
              <span className="text-sm" style={{ color: "#76786b" }}>min</span>
            </div>
          </div>
          <input
            type="range"
            min={10} max={60} step={5}
            value={kitchenState.time_available}
            onChange={(e) => setKitchenState((s) => ({ ...s, time_available: parseInt(e.target.value) }))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #56642b ${((kitchenState.time_available - 10) / 50) * 100}%, #e4e2dc ${((kitchenState.time_available - 10) / 50) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs" style={{ color: "#76786b" }}>10 min</span>
            <span className="text-xs" style={{ color: "#76786b" }}>60 min</span>
          </div>
        </div>

        {/* Budget — icon cards matching Stitch */}
        <div className="mb-6">
          <p className="text-sm font-semibold mb-3" style={{ color: "#1b1c18" }}>Budget</p>
          <div className="grid grid-cols-3 gap-3">
            {BUDGETS.map(({ value, label, icon }) => {
              const active = kitchenState.budget_per_person === value;
              return (
                <button
                  key={value}
                  onClick={() => setKitchenState((s) => ({ ...s, budget_per_person: value }))}
                  className="flex flex-col items-center gap-2 py-4 rounded-lg transition-all active:scale-[0.97]"
                  style={{
                    backgroundColor: active ? "#ff9e68" : "#f0eee7",
                    color: active ? "#ffffff" : "#46483c",
                    border: active ? "none" : "none",
                  }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 24 }}>{icon}</span>
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Mood — pill buttons matching Stitch */}
        <div className="mb-6">
          <p className="text-sm font-semibold mb-3" style={{ color: "#1b1c18" }}>Current Mood</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {MOODS.map(({ value, label, icon }) => {
              const active = kitchenState.mood === value;
              return (
                <button
                  key={value}
                  onClick={() => setKitchenState((s) => ({ ...s, mood: s.mood === value ? null : value }))}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all active:scale-[0.97]"
                  style={{
                    backgroundColor: active ? (value === "heavy" ? "#ff9e68" : "#56642b") : "#f0eee7",
                    color: active ? "#ffffff" : "#46483c",
                  }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{icon}</span>
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA card — food image + "Find Meals" */}
        <div className="rounded-xl overflow-hidden relative mb-4" style={{ backgroundColor: "#56642b" }}>
          <div className="flex">
            <div className="w-2/5 h-36 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop"
                alt="Fresh food"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center px-4 py-3">
              <span className="material-symbols-rounded text-white mb-1" style={{ fontSize: 20 }}>add</span>
              <p className="text-sm text-white font-medium leading-5">
                We'll suggest meals based on your leftovers.
              </p>
            </div>
          </div>
          <button
            onClick={handleRecommend}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all active:scale-[0.97]"
            style={{ backgroundColor: "#3e4c16", color: "#d9eaa3" }}>
            {loading ? "Finding meals…" : (
              <>Find Meals <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward</span></>
            )}
          </button>
        </div>
      </div>

      {loading && <Loader text="Finding the best meals for your group…" />}
    </div>
  );
}
