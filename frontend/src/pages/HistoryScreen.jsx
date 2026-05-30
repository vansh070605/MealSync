import React, { useState, useEffect } from "react";
import { getHistory, clearHistory } from "../api";
import { useStore } from "../store";
import TopBar from "../components/TopBar";

export default function HistoryScreen() {
  const { flatId } = useStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    if (!flatId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getHistory(flatId)
      .then(res => {
        setHistory(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch history:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, [flatId]);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all meal history? This cannot be undone.")) {
      clearHistory(flatId)
        .then(() => {
          setHistory([]);
        })
        .catch(err => {
          console.error("Failed to clear history:", err);
        });
    }
  };

  const getSatisfactionList = (entry) => {
    // If it's a list (old format)
    if (Array.isArray(entry.satisfactions)) {
      return entry.satisfactions.map(s => ({ name: s.user_name || "Gharwala", score: s.score || 0 }));
    }
    // If it's a dictionary (new format)
    const scores = entry.satisfaction_scores || entry.satisfactions;
    if (scores && typeof scores === "object") {
      return Object.keys(scores).map(key => ({ name: key, score: scores[key] || 0 }));
    }
    return [];
  };

  const AVATAR_COLORS = ["#8a9a5b", "#ff9e68", "#d57881", "#bdce89", "#56642b", "#76786b"];

  if (loading) return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-8">
      <div className="animate-pulse text-slate-400 font-bold">Loading your journey...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-24">
      <TopBar subtitle="Meal History" />
      <div className="max-w-md mx-auto px-6 pt-6">
        <div className="flex justify-end mb-6">
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <span className="material-symbols-rounded text-lg">delete_sweep</span>
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-rounded text-4xl text-slate-200">history</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No meals logged yet</h3>
            <p className="text-slate-400 text-sm px-10">Start cooking to build your household's flavor profile!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry, idx) => {
              const satisfactionList = getSatisfactionList(entry);
              const avgScore = satisfactionList.length 
                ? Math.round(satisfactionList.reduce((acc, curr) => acc + curr.score, 0) / satisfactionList.length) 
                : 0;

              return (
                <div key={entry.id || idx} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm animate-fade-in group">
                  <img 
                    src={`https://loremflickr.com/800/400/food,indian?lock=${entry.meal_id || 1}`} 
                    alt={entry.meal_name} 
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">{entry.meal_name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                        Cooked
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex -space-x-2">
                        {satisfactionList.slice(0, 4).map((s, i) => (
                          <div 
                            key={i} 
                            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                            title={`${s.name}: ${s.score}%`}
                          >
                            {s.name ? s.name[0].toUpperCase() : '?'}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        Group Avg: <span className="text-emerald-700 font-extrabold">{avgScore}%</span>
                      </div>
                    </div>

                    {entry.notes && (
                      <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
