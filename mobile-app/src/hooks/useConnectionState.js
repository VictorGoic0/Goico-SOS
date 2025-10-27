import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "../config/firebase";
import usePresenceStore from "../stores/presenceStore";

/**
 * Hook to monitor Firebase Realtime Database connection state.
 *
 * Firebase provides a special path `.info/connected` that tracks connection status.
 * This hook listens to that path and provides the connection state to other hooks.
 * Also updates presenceStore so components can access the connection status globally.
 *
 * @returns {boolean} isConnected - true when connected, false when disconnected
 */
export default function useConnectionState() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Special Firebase path that tracks connection state
    const connectedRef = ref(realtimeDb, ".info/connected");

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val() === true;
      setIsConnected(connected);

      // Update presence store so all components can access connection status
      usePresenceStore.getState().setConnectionStatus(connected);

      if (connected) {
        console.log("🟢 Connected to Realtime Database");
      } else {
        console.log("🔴 Disconnected from Realtime Database");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
}
