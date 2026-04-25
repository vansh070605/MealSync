// components/SatisfactionModal.jsx — Bottom sheet for rating after meal selection
import { useState } from "react";

export default function SatisfactionModal({ meal, users, onSubmit, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(users.map((u) => [u.name, 0.7]))
  );
  const [submitting, setSubmitting] = useState(false);

  const label = (v) => {
    if (v >= 0.8) return "Loved";
    if (v >= 0.6) return "Good";
    if (v >= 0.4) return "Okay";
    return "Meh";
  };

  const badgeClass = (v) => {
    if (v >= 0.8) return "badge-loved";
    if (v >= 0.6) return "badge-good";
    return "badge-okay";
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(scores);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
         style={{ backgroundColor: "rgba(45, 45, 42, 0.4)" }}
         onClick={onClose}>
      <div className="w-full max-w-[480px] rounded-t-xl px-5 pt-5 pb-8 safe-bottom"
           style={{ backgroundColor: "#fbf9f2" }}
           onClick={(e) => e.stopPropagation()}>
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: "#c6c8b8" }} />

        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold" style={{ color: "#1b1c18" }}>Rate tonight's meal</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#f0eee7" }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18, color: "#46483c" }}>close</span>
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: "#76786b" }}>{meal.meal_name}</p>

        <div className="flex flex-col gap-5 mb-6">
          {users.map((user) => (
            <div key={user.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: "#1b1c18" }}>
                  {user.avatar} {user.name}
                </span>
                <span className={badgeClass(scores[user.name])}>
                  {label(scores[user.name])}
                </span>
              </div>
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={scores[user.name]}
                onChange={(e) =>
                  setScores((s) => ({ ...s, [user.name]: parseFloat(e.target.value) }))
                }
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #56642b ${scores[user.name] * 100}%, #e4e2dc ${scores[user.name] * 100}%)`,
                }}
              />
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
          {submitting ? "Saving…" : "Confirm Selection"}
        </button>
      </div>
    </div>
  );
}
