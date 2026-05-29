import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, set, onValue, onDisconnect, serverTimestamp, update } from "firebase/database";
import { useAuth } from "../context/AuthContext";

export function usePresence() {
  const [onlineCount, setOnlineCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const uid = user.uid;
    const userRef = ref(db, `presence/${uid}`);
    
    // Mark as online initially
    set(userRef, { online: true, lastSeen: serverTimestamp() }).catch(console.error);
    
    // Update lastSeen every 15 seconds (heartbeat)
    const heartbeat = setInterval(() => {
      update(userRef, { lastSeen: serverTimestamp() }).catch(console.error);
    }, 15000);
    
    // Ensure we are marked offline when the tab/window closes
    onDisconnect(userRef).set({ online: false, lastSeen: serverTimestamp() }).catch(console.error);

    // Listen for any changes under /presence to compute online count
    const presenceRef = ref(db, "presence");
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val() || {};
      const count = Object.values(data).filter((u: any) => u.online).length;
      setOnlineCount(count);
    });

    return () => {
      clearInterval(heartbeat);
      set(userRef, { online: false, lastSeen: serverTimestamp() }).catch(console.error);
      unsubscribe();
    };
  }, [user]);

  return { onlineCount };
}
