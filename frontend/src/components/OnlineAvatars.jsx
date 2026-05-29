import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { motion } from "framer-motion";

const OnlineAvatars = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const presenceRef = ref(db, "presence");
    const unsub = onValue(presenceRef, (snap) => {
      const data = snap.val() || {};
      const users = Object.entries(data)
        .filter(([, v]) => v.online)
        .map(([uid]) => uid);
      setOnlineUsers(users);
    });
    return () => unsub();
  }, []);

  const colors = ["#8a9a5b","#ff9e68","#d57881","#bdce89","#56642b","#76786b"];
  
  return (
    <div className="flex items-center gap-1.5 mt-4">
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 6).map((uid, i) => (
          <motion.div
            key={uid}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white"
            style={{
              backgroundColor: colors[i % colors.length],
              color: "#ffffff",
              zIndex: 10 - i,
              borderColor: "#4caf50",
              boxShadow: "0 0 4px #4caf50"
            }}
            whileHover={{ scale: 1.08 }}
          >
            {uid.slice(-2).toUpperCase()}
          </motion.div>
        ))}
      </div>
      <span className="text-xs font-medium ml-2" style={{ color: "#56642b" }}>
        {onlineUsers.length} member{onlineUsers.length !== 1 ? 's' : ''} online
      </span>
    </div>
  );
};

export default OnlineAvatars;
