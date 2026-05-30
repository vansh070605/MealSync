// components/TopBar.jsx — App header bar matching Stitch design
export default function TopBar({ title, subtitle }) {
  return (
    <header className="flex flex-col items-center justify-center px-5 py-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
             style={{ backgroundColor: "#56642b" }}>
          <span className="material-symbols-rounded text-white" style={{ fontSize: 18 }}>
            restaurant
          </span>
        </div>
        <span className="text-lg font-black tracking-tight" style={{ color: "#1b1c18" }}>
          MealSync
        </span>
      </div>
      {subtitle && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{subtitle}</p>}
    </header>
  );
}
