import React, { useState, useEffect } from "react";
import { getHistory } from "../api";
import axios from "axios";
import API_BASE_URL from "../apiConfig";

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    getHistory()
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch history:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all meal history? This cannot be undone.")) {
      // We'll use the API config here or add clearHistory to api.js
      axios.delete(`${API_BASE_URL}/history`)
        .then(() => {
          setHistory([]);
        })
        .catch(err => {
          console.error("Failed to clear history:", err);
        });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-8">
      <div className="animate-pulse text-slate-400 font-bold">Loading your journey...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">Journal</span>
            <h1 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">Meal History</h1>
          </div>
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="mt-2 p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors flex items-center gap-2 text-xs font-bold"
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
            {history.map((entry, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] p-6 shadow-card border border-slate-50 animate-fade-in group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{entry.meal_name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'Today'}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                    Cooked
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex -space-x-2">
                    {(entry.satisfactions || []).slice(0, 3).map((s, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                        {s.user_name ? s.user_name[0] : '?'}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    Group Avg: {entry.satisfactions?.length ? Math.round((entry.satisfactions.reduce((acc, curr) => acc + curr.score, 0) / entry.satisfactions.length) * 100) : 0}%
                  </div>
                </div>

                <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  "{entry.notes || 'A delicious meal for the group.'}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
