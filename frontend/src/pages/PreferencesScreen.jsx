import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { getUsers, updateUser } from "../api";
import Loader from "../components/Loader";

const AVATAR_COLORS = ["#8a9a5b", "#ff9e68", "#d57881", "#bdce89", "#56642b", "#76786b"];

const TAG_SUGGESTIONS = [
  "Chicken", "Paneer", "Pasta", "Spicy", "Healthy", "Rice", 
  "Indian", "Asian", "Noodles", "Soup", "Potato", "Cheese"
];

function UserCard({ user, index, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    spice_tolerance: user.spice_tolerance,
    effort_tolerance: user.effort_tolerance,
    likes: [...user.likes],
    dislikes: [...user.dislikes],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const removeTag = (field, tag) =>
    setForm((f) => ({ ...f, [field]: f[field].filter((t) => t !== tag) }));

  const addTag = (field, tag) => {
    const clean = tag.trim().toLowerCase();
    if (clean && !form[field].includes(clean)) {
      setForm((f) => ({ ...f, [field]: [...f[field], clean] }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(user.id, form);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setExpanded(false);
      }, 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`card transition-all duration-300 ${expanded ? "ring-2 ring-emerald-500" : ""}`}>
      <div className="p-4 flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner text-white font-bold"
          style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
        >
          {user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-800">{user.name}</h3>
          <p className="text-xs text-slate-500 font-medium capitalize">
            {user.effort_tolerance} Effort • Spice: {user.spice_tolerance}/5
          </p>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors"
        >
          <span className="material-symbols-rounded">
            {expanded ? "expand_less" : "edit"}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-5 pt-2 border-t border-slate-50 animate-fade-in">
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Member Name</label>
              <input 
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Loves these</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.likes.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag("likes", tag)} className="material-symbols-rounded text-[14px]">close</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                {TAG_SUGGESTIONS.filter(t => !form.likes.includes(t.toLowerCase())).map(t => (
                  <button 
                    key={t}
                    onClick={() => addTag("likes", t)}
                    className="whitespace-nowrap px-3 py-1 bg-white border border-slate-100 rounded-full text-[11px] font-bold text-slate-500 hover:border-emerald-300"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Spice Level</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    onClick={() => setForm({...form, spice_tolerance: v})}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      form.spice_tolerance === v ? "bg-emerald-700 text-white shadow-md" : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-emerald-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
               saved ? <span className="material-symbols-rounded">done</span> : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PreferencesScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateUser = async (id, payload) => {
    await updateUser(id, payload);
    loadData();
  };

  if (loading) return <Loader />;

  return (
    <div className="pb-24 animate-fade-in">
      <TopBar title="The Household" subtitle="Tailor the ML recommendations" />
      <div className="px-5 mt-6 space-y-4">
        {users.map((user, idx) => (
          <UserCard key={user.id} user={user} index={idx} onSave={handleUpdateUser} />
        ))}
      </div>
    </div>
  );
}
