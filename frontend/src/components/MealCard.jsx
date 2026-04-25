// components/MealCard.jsx — Recommendation card matching Stitch design exactly
// Structure: Image with score badge → title + time → quote explanation → Pick This Meal button

export default function MealCard({ meal, onSelect }) {
  const scorePercent = Math.round(meal.score * 10); // rough scale
  const displayScore = Math.min(99, Math.max(60, 70 + Math.round(meal.score * 3)));

  return (
    <div className="card overflow-hidden">
      {/* Food image placeholder with score badge */}
      <div className="relative h-48 overflow-hidden" style={{ backgroundColor: "#e4e2dc" }}>
        <img
          src={`https://source.unsplash.com/400x300/?${encodeURIComponent(meal.meal_name + " food")}`}
          alt={meal.meal_name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {/* Score badge — top-left green pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
             style={{ backgroundColor: "#56642b" }}>
          <span className="material-symbols-rounded text-white" style={{ fontSize: 14 }}>star</span>
          <span className="text-white text-sm font-bold">{displayScore}%</span>
        </div>
      </div>

      {/* Content area */}
      <div className="px-4 pt-3 pb-4">
        {/* Title row: name + prep time */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold" style={{ color: "#1b1c18" }}>
            {meal.meal_name}
          </h3>
          <div className="flex items-center gap-1" style={{ color: "#76786b" }}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>schedule</span>
            <span className="text-sm font-medium">{meal.prep_time}m</span>
          </div>
        </div>

        {/* Explanation quote */}
        <div className="quote-box mb-4">
          "{meal.explanation}"
        </div>

        {/* Pick This Meal button */}
        <button
          onClick={() => onSelect(meal)}
          className="btn-primary w-full text-sm"
        >
          Pick This Meal
        </button>
      </div>
    </div>
  );
}
