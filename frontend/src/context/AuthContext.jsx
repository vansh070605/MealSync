import { createContext, useContext, useEffect, useState } from "react";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { app } from "../firebase";
import { getUserProfile, saveUserProfile } from "../api";

const auth = getAuth(app);
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const profileRes = await getUserProfile(u.uid);
          if (profileRes.data) {
            setUserProfile(profileRes.data);
          } else {
            // Create a default profile if none exists
            const defaultProfile = {
              uid: u.uid,
              email: u.email,
              name: u.email.split("@")[0],
              avatar: "🧑",
              likes: [],
              dislikes: [],
              spice_tolerance: 3,
              flatId: null
            };
            await saveUserProfile(u.uid, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const defaultProfile = {
      uid: cred.user.uid,
      email: email,
      name: name || email.split("@")[0],
      avatar: "🧑",
      likes: [],
      dislikes: [],
      spice_tolerance: 3,
      flatId: null
    };
    await saveUserProfile(cred.user.uid, defaultProfile);
    setUserProfile(defaultProfile);
    return cred;
  };

  const logout = () => {
    return signOut(auth);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#fbf9f2" }}>
        <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "#56642b", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, setUserProfile, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
