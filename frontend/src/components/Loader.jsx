// components/Loader.jsx — Loading state matching Stitch palette
export default function Loader({ text = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #e4e2dc" }} />
        <div className="absolute inset-0 rounded-full animate-spin"
             style={{ border: "2px solid transparent", borderTopColor: "#56642b" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "#76786b" }}>{text}</p>
    </div>
  );
}
