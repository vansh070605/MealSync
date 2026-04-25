// pages/HistoryScreen.jsx — Matches the Stitch "Meal History" screen exactly
// Layout: TopBar → Title + subtitle → "THIS WEEK" section → rows → "LAST WEEK" section → rows → Bottom nav
import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { getHistory } from "../api";
import Loader from "../components/Loader";

const MEAL_ICONS = ["🥗", "🍝", "🫐", "🌮", "🍅", "🥘", "🍲", "🍛"];

function SatBadge({ score }) {
  if (score >= 0.8) return <span className="badge-loved">Loved</span>;
  if (score >= 0.6) return <span className="badge-good">Good</span>;
  return <span className="badge-okay">Okay</span>;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory(10)
      .then((r) => setHistory(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading history…" />;

  // Partition into this week / last week (simple: first 2 = this week, rest = last week)
  const thisWeek = history.slice(0, 2);
  const lastWeek = history.slice(2);

  const avgSatisfaction = (sats) => {
    const vals = Object.values(sats);
    if (vals.length === 0) return 0.5;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: "#fbf9f2" }}>
      <TopBar />

      <div className="px-5 mt-2">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#1b1c18" }}>
          Meal History
        </h1>
        <p className="text-sm mb-6" style={{ color: "#46483c" }}>
          Revisit your past culinary adventures
        </p>

        {history.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: "#f0eee7" }}>
              <span className="material-symbols-rounded" style={{ fontSize: 28, color: "#76786b" }}>
                history
              </span>
            </div>
            <p className="text-sm text-center" style={{ color: "#76786b" }}>
              No meals recorded yet.<br />Select your first meal!
            </p>
          </div>
        ) : (
          <>
            {/* THIS WEEK */}
            {thisWeek.length > 0 && (
              <div className="mb-6">
                <p className="section-label mb-3">THIS WEEK</p>
                <div className="flex flex-col gap-2">
                  {thisWeek.map((entry, i) => (
                    <div key={entry.id} className="card px-4 py-3 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                           style={{ backgroundColor: "#f0eee7" }}>
                        {MEAL_ICONS[i % MEAL_ICONS.length]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "#1b1c18" }}>
                          {entry.meal_name}
                        </p>
                        <p className="text-xs" style={{ color: "#76786b" }}>
                          {new Date(entry.selected_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <SatBadge score={avgSatisfaction(entry.satisfactions)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LAST WEEK */}
            {lastWeek.length > 0 && (
              <div className="mb-6">
                <p className="section-label mb-3">LAST WEEK</p>
                <div className="flex flex-col gap-2">
                  {lastWeek.map((entry, i) => (
                    <div key={entry.id} className="card px-4 py-3 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                           style={{ backgroundColor: "#f0eee7" }}>
                        {MEAL_ICONS[(i + 2) % MEAL_ICONS.length]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "#1b1c18" }}>
                          {entry.meal_name}
                        </p>
                        <p className="text-xs" style={{ color: "#76786b" }}>
                          {new Date(entry.selected_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <SatBadge score={avgSatisfaction(entry.satisfactions)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
