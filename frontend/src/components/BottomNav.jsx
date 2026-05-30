// components/BottomNav.jsx — 4-tab bottom nav matching Stitch design
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/",            icon: "home",            label: "Home"    },
  { path: "/input",       icon: "restaurant_menu", label: "Decide"  },
  { path: "/grocery",     icon: "shopping_basket", label: "Grocery" },
  { path: "/history",     icon: "history",         label: "History" },
  { path: "/preferences", icon: "group",           label: "Users"   },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ path, icon, label }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`nav-btn ${active ? "active" : ""}`}
            aria-label={label}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 24 }}>
              {icon}
            </span>
            <span className="text-[11px]">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
