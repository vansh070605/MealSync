import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { StoreProvider, useStore } from "./store";
import { AuthProvider, useAuth } from "./context/AuthContext";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import InputScreen from "./pages/InputScreen";
import RecommendScreen from "./pages/RecommendScreen";
import GroceryScreen from "./pages/GroceryScreen";
import HistoryScreen from "./pages/HistoryScreen";
import PreferencesScreen from "./pages/PreferencesScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import AuthScreen from "./pages/AuthScreen";
import { saveUser, saveUserProfile } from "./api";

function AppContent() {
  const { user, userProfile, setUserProfile } = useAuth();
  const { flatId, setFlatId } = useStore();
  const [searchParams] = useSearchParams();

  // 1. Capture invite flatId from URL query param
  useEffect(() => {
    const inviteFlatId = searchParams.get("flatId");
    if (inviteFlatId) {
      localStorage.setItem("inviteFlatId", inviteFlatId);
    }
  }, [searchParams]);

  // 2. Perform join household logic when user is logged in
  useEffect(() => {
    const inviteFlatId = localStorage.getItem("inviteFlatId");
    if (user && userProfile && inviteFlatId && userProfile.flatId !== inviteFlatId) {
      const updatedProfile = {
        ...userProfile,
        flatId: inviteFlatId
      };

      saveUserProfile(user.uid, updatedProfile)
        .then(() => {
          return saveUser(inviteFlatId, user.uid, {
            name: userProfile.name || user.email.split("@")[0],
            avatar: userProfile.avatar || "🧑",
            spice_tolerance: userProfile.spice_tolerance || 3,
            likes: userProfile.likes || [],
            dislikes: userProfile.dislikes || [],
            effort_tolerance: userProfile.effort_tolerance || "Medium"
          });
        })
        .then(() => {
          setUserProfile(updatedProfile);
          setFlatId(inviteFlatId);
          localStorage.removeItem("inviteFlatId");
          alert("Household join kar liya hai successfully! 🎉");
          window.location.href = "/";
        })
        .catch(console.error);
    } else if (userProfile?.flatId && flatId !== userProfile.flatId) {
      // Sync store flatId with profile flatId if they mismatch
      setFlatId(userProfile.flatId);
    }
  }, [user, userProfile, flatId, setFlatId]);

  if (!user) {
    return <AuthScreen />;
  }

  // Force onboarding if they don't have a household
  const hasNoFlat = !userProfile?.flatId;

  return (
    <div className="relative max-w-[480px] mx-auto min-h-screen overflow-x-hidden"
         style={{ backgroundColor: "#fbf9f2" }}>
      <Routes>
        {hasNoFlat ? (
          <>
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
          </>
        ) : (
          <>
            <Route path="/"            element={<Home />} />
            <Route path="/input"       element={<InputScreen />} />
            <Route path="/recommend"   element={<RecommendScreen />} />
            <Route path="/grocery"     element={<GroceryScreen />} />
            <Route path="/history"     element={<HistoryScreen />} />
            <Route path="/preferences" element={<PreferencesScreen />} />
            <Route path="/onboarding"  element={<OnboardingScreen />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
      {!hasNoFlat && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}
