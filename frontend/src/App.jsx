// App.jsx — Root component with routing matching Stitch screen flow
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./store";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import InputScreen from "./pages/InputScreen";
import RecommendScreen from "./pages/RecommendScreen";
import HistoryScreen from "./pages/HistoryScreen";
import PreferencesScreen from "./pages/PreferencesScreen";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="relative max-w-[480px] mx-auto min-h-screen overflow-x-hidden"
             style={{ backgroundColor: "#fbf9f2" }}>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/input"       element={<InputScreen />} />
            <Route path="/recommend"   element={<RecommendScreen />} />
            <Route path="/history"     element={<HistoryScreen />} />
            <Route path="/preferences" element={<PreferencesScreen />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
