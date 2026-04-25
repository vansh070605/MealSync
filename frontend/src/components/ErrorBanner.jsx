// components/ErrorBanner.jsx
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="mx-5 mt-3 flex items-start gap-3 rounded-lg px-4 py-3"
         style={{ backgroundColor: "#ffdad6", color: "#93000a" }}>
      <span className="material-symbols-rounded shrink-0 mt-0.5" style={{ fontSize: 18 }}>error</span>
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100">
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
        </button>
      )}
    </div>
  );
}
