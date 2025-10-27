import { useEffect, useRef } from "react";
import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { realtimeDb } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import useConnectionState from "./useConnectionState";

/**
 * Hook to manage user presence in Realtime Database.
 * - Writes presence data on mount
 * - Uses onDisconnect() to automatically set offline when connection is lost
 * - Updates lastSeen timestamp periodically for activity tracking
 * - Reacts to connection state changes for instant reconnection updates
 *
 * @param {boolean} enabled - Whether presence tracking is enabled
 */
export function usePresence(enabled = true) {
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const isConnected = useConnectionState();
  const intervalRef = useRef(null);
  const UPDATE_INTERVAL_MS = 30000; // 30 seconds

  useEffect(() => {
    if (!enabled || !currentUser?.uid) return;

    const presenceRef = ref(realtimeDb, `presence/${currentUser.uid}`);

    // Initialize presence data on mount
    const initializePresence = async () => {
      try {
        // Set up onDisconnect to set offline when user disconnects
        await onDisconnect(presenceRef).set({
          isOnline: false,
          lastSeen: serverTimestamp(),
        });

        // Write presence data
        await set(presenceRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error initializing presence:", error);
      }
    };

    // Update lastSeen timestamp periodically
    const updatePresence = async () => {
      try {
        await set(presenceRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating presence:", error);
      }
    };

    // Initialize presence
    initializePresence();

    // Set up periodic updates
    intervalRef.current = setInterval(updatePresence, UPDATE_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set presence offline (onDisconnect will also handle this automatically)
      set(presenceRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      }).catch((error) => {
        console.error("Error removing presence:", error);
      });
    };
  }, [enabled, currentUser?.uid]);

  // React to connection state changes - update presence immediately on reconnect
  useEffect(() => {
    if (!enabled || !currentUser?.uid || !isConnected) return;

    const presenceRef = ref(realtimeDb, `presence/${currentUser.uid}`);

    // On reconnect, immediately update presence
    const updatePresenceOnReconnect = async () => {
      try {
        await onDisconnect(presenceRef).set({
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
        await set(presenceRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating presence on reconnect:", error);
      }
    };

    updatePresenceOnReconnect();
  }, [isConnected, enabled, currentUser?.uid]);
}

export default usePresence;
