import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate("/");
    } catch (err) {
      const msgs = {
        "auth/user-not-found": "Koi account nahi mila. Pehle sign up karo.",
        "auth/wrong-password": "Password galat hai. Dobara try karo.",
        "auth/email-already-in-use": "Yeh email pehle se registered hai.",
        "auth/weak-password": "Password kam se kam 6 characters ka hona chahiye.",
        "auth/invalid-email": "Valid email daalo.",
        "auth/invalid-credential": "Email ya password galat hai.",
        "auth/invalid-login-credentials": "Email ya password galat hai, ya account nahi bana. Pehle Sign Up tab select karke new account banayein."
      };
      setError(msgs[err.code] || `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#fbf9f2" }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ backgroundColor: "#56642b" }}
        >
          <span className="material-symbols-rounded text-white" style={{ fontSize: 32 }}>
            restaurant
          </span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "#1b1c18" }}>
          MealSync
        </h1>
        <p className="text-sm mt-1" style={{ color: "#76786b" }}>
          Apne ghar ke liye best meal choose karo
        </p>
      </div>

      {/* Card */}
      <div className="card w-full max-w-sm p-6">
        {/* Tab Toggle */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ backgroundColor: "#f0eee7" }}
        >
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={
                mode === m
                  ? { backgroundColor: "#56642b", color: "#fff" }
                  : { color: "#76786b" }
              }
            >
              {m === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="section-label mb-1.5 block">Tumhara naam</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Vansh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="section-label mb-1.5 block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="tumhara@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="section-label mb-1.5 block">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-2xl font-medium"
              style={{ backgroundColor: "#ffdbca", color: "#773304" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? (
              <div
                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#fff", borderTopColor: "transparent" }}
              />
            ) : mode === "login" ? (
              "Login karo 🚀"
            ) : (
              "Account banao ✨"
            )}
          </button>
        </form>
      </div>

      <p className="text-xs mt-6 text-center" style={{ color: "#76786b" }}>
        Apna data sirf tumhare ghar ke saath share hoga.
      </p>
    </div>
  );
}
