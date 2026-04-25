// components/TopBar.jsx — App header bar matching Stitch design
export default function TopBar() {
  return (
    <header className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
             style={{ backgroundColor: "#56642b" }}>
          <span className="material-symbols-rounded text-white" style={{ fontSize: 18 }}>
            restaurant
          </span>
        </div>
        <span className="text-base font-bold" style={{ color: "#1b1c18" }}>
          MealSync
        </span>
      </div>
      <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#f0eee7" }}>
        <span className="material-symbols-rounded" style={{ fontSize: 20, color: "#46483c" }}>
          notifications
        </span>
      </button>
    </header>
  );
}
