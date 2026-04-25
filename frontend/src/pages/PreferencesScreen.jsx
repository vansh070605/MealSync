// pages/PreferencesScreen.jsx — Matches the Stitch "User Preferences" screen exactly
// Layout: TopBar → "Household Members" title + subtitle → User cards (avatar, name, role, likes chips, dislikes chips, spice slider, edit icon) → Bottom nav
import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { getUsers, updateUser } from "../api";
import Loader from "../components/Loader";

const AVATAR_COLORS = ["#8a9a5b", "#ff9e68", "#d57881", "#bdce89", "#56642b", "#76786b"];
const ROLES = ["Primary User", "Member", "Vegetarian", "Member", "Member", "Guest"];

const SPICE_LABELS = ["Low", "Medium", "High"];
const TAG_SUGGESTIONS = [
  "Italian", "Seafood", "Leafy Greens", "BBQ", "Spicy Thai",
  "Tofu", "Pasta", "Indian", "Mexican", "Asian",
  "Healthy", "Comfort", "Soup", "Grilled", "Rice",
];

function UserCard({ user, index, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    spice_tolerance: user.spice_tolerance,
    effort_tolerance: user.effort_tolerance,
    likes: [...user.likes],
    dislikes: [...user.dislikes],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const spiceLabel = user.spice_tolerance <= 2 ? "Low" : user.spice_tolerance <= 3 ? "Medium" : "High";

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
    await updateUser(user.id, form);
    setSaving(false);
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card overflow-hidden">
      {/* Collapsed header */}
      <div className="flex items-center gap-3 px-4 py-4">
        {/* Avatar circle */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
          style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
          {user.name.charAt(0)}
        </div>

        {/* Name + role */}
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: "#1b1c18" }}>{user.name}</p>
          <p className="text-xs" style={{ color: "#76786b" }}>{ROLES[index] || "Member"}</p>
        </div>

        {/* Edit button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: expanded ? "#d9eaa3" : "#f0eee7" }}>
          <span className="material-symbols-rounded"
                style={{ fontSize: 18, color: expanded ? "#253000" : "#46483c" }}>
            {expanded ? "close" : "edit"}
          </span>
        </button>
      </div>

      {/* Collapsed preview: likes + dislikes chips, spice */}
      {!expanded && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {/* Likes */}
          {user.likes.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="material-symbols-rounded shrink-0 mt-0.5"
                    style={{ fontSize: 16, color: "#56642b" }}>favorite</span>
              <span className="text-xs font-semibold shrink-0" style={{ color: "#56642b" }}>Likes</span>
              <div className="flex flex-wrap gap-1.5">
                {user.likes.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: "#d9eaa3", color: "#253000" }}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Dislikes */}
          {user.dislikes.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="material-symbols-rounded shrink-0 mt-0.5"
                    style={{ fontSize: 16, color: "#95454e" }}>block</span>
              <span className="text-xs font-semibold shrink-0" style={{ color: "#95454e" }}>Dislikes</span>
              <div className="flex flex-wrap gap-1.5">
                {user.dislikes.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: "#ffdadb", color: "#55141f" }}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Spice tolerance */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded shrink-0"
                  style={{ fontSize: 16, color: "#944a1b" }}>local_fire_department</span>
            <span className="text-xs font-semibold" style={{ color: "#944a1b" }}>Spice Tolerance</span>
            <span className="text-xs font-semibold ml-auto" style={{ color: "#1b1c18" }}>{spiceLabel}</span>
          </div>
        </div>
      )}

      {/* Expanded edit form */}
      {expanded && (
        <div className="px-4 pb-5 flex flex-col gap-5 border-t"
             style={{ borderColor: "#e4e2dc" }}>
          {/* Likes editing */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-rounded" style={{ fontSize: 16, color: "#56642b" }}>favorite</span>
              <span className="text-xs font-semibold" style={{ color: "#56642b" }}>Likes</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.likes.map((tag) => (
                <button key={tag} onClick={() => removeTag("likes", tag)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1"
                  style={{ backgroundColor: "#d9eaa3", color: "#253000" }}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)} ×
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TAG_SUGGESTIONS
                .filter((t) => !form.likes.includes(t.toLowerCase()))
                .slice(0, 4)
                .map((t) => (
                  <button key={t} onClick={() => addTag("likes", t)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: "#f0eee7", color: "#46483c" }}>
                    + {t}
                  </button>
                ))}
            </div>
          </div>

          {/* Dislikes editing */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-rounded" style={{ fontSize: 16, color: "#95454e" }}>block</span>
              <span className="text-xs font-semibold" style={{ color: "#95454e" }}>Dislikes</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.dislikes.map((tag) => (
                <button key={tag} onClick={() => removeTag("dislikes", tag)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1"
                  style={{ backgroundColor: "#ffdadb", color: "#55141f" }}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)} ×
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Mushrooms", "Olives", "Cilantro", "Lamb", "Tofu"]
                .filter((t) => !form.dislikes.includes(t.toLowerCase()))
                .slice(0, 3)
                .map((t) => (
                  <button key={t} onClick={() => addTag("dislikes", t)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: "#f0eee7", color: "#46483c" }}>
                    + {t}
                  </button>
                ))}
            </div>
          </div>

          {/* Spice tolerance slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: "#944a1b" }}>
                  local_fire_department
                </span>
                <span className="text-xs font-semibold" style={{ color: "#944a1b" }}>Spice Tolerance</span>
              </div>
              <span className="text-xs font-bold" style={{ color: "#1b1c18" }}>
                {form.spice_tolerance <= 2 ? "Low" : form.spice_tolerance <= 3 ? "Medium" : "High"}
              </span>
            </div>
            <input
              type="range" min={1} max={5} step={1}
              value={form.spice_tolerance}
              onChange={(e) => setForm((f) => ({ ...f, spice_tolerance: parseInt(e.target.value) }))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #56642b ${((form.spice_tolerance - 1) / 4) * 100}%, #e4e2dc ${((form.spice_tolerance - 1) / 4) * 100}%)`,
              }}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={saved ? "btn-tonal w-full" : "btn-primary w-full"}
            style={saved ? {} : {}}>
            {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PreferencesScreen() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    getUsers().then((r) => setUsers(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  if (loading) return <Loader text="Loading preferences…" />;

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: "#fbf9f2" }}>
      <TopBar />

      <div className="px-5 mt-2">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#1b1c18" }}>
          Household Members
        </h1>
        <p className="text-sm mb-5" style={{ color: "#46483c" }}>
          Manage taste preferences and dietary needs for everyone in your group.
        </p>

        <div className="flex flex-col gap-3">
          {users.map((user, i) => (
            <UserCard key={user.id} user={user} index={i} onSave={load} />
          ))}
        </div>
      </div>
    </div>
  );
}
