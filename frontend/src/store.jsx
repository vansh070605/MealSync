// store.jsx — Simple React Context global state
import { createContext, useContext, useState, useCallback } from "react";

const Store = createContext(null);

export function StoreProvider({ children }) {
  const [kitchenState, setKitchenState] = useState({
    available_ingredients: [],
    time_available: 45,
    budget_per_person: 8,
    mood: null,
  });

  const [recommendations, setRecommendations] = useState(null);
  const [fairnessWeights, setFairnessWeights]   = useState({});
  const [users, setUsers]                        = useState([]);
  const [loading, setLoading]                    = useState(false);
  const [error, setError]                        = useState(null);

  const clearError = useCallback(() => setError(null), []);

  return (
    <Store.Provider value={{
      kitchenState, setKitchenState,
      recommendations, setRecommendations,
      fairnessWeights, setFairnessWeights,
      users, setUsers,
      loading, setLoading,
      error, setError, clearError,
    }}>
      {children}
    </Store.Provider>
  );
}

export const useStore = () => useContext(Store);
