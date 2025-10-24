import { create } from "zustand";

/**
 * Presence Store - Real-time User Status
 *
 * Purpose: Track online/offline status from Realtime Database.
 * Updates from Firebase Realtime Database onValue() listener.
 */
const usePresenceStore = create((set, get) => ({
  // State
  presenceData: {}, // { userId: { isOnline: boolean, lastSeen: timestamp } }
  isConnected: true, // Firebase connection status (assume connected initially)
  wasDisconnected: false, // Track if we were previously disconnected (for "Connecting" state)

  // Actions
  updatePresence: (userId, presenceObj) =>
    set((state) => ({
      presenceData: {
        ...state.presenceData,
        [userId]: presenceObj,
      },
    })),

  setAllPresence: (presenceMap) =>
    set({
      presenceData: presenceMap || {},
    }),

  setConnectionStatus: (connected) =>
    set((state) => {
      // If we're reconnecting (was disconnected, now connected)
      const wasDisconnected = !state.isConnected && connected;

      return {
        isConnected: connected,
        wasDisconnected: state.wasDisconnected || !connected, // Set to true if we disconnect
      };
    }),

  // Helper to get connection status display
  getConnectionStatus: () => {
    const state = get();
    if (!state.isConnected && state.wasDisconnected) {
      return "connecting"; // Was offline, now trying to reconnect
    }
    if (!state.isConnected) {
      return "offline"; // Currently offline
    }
    return "online"; // Connected
  },

  // Helper to check if user is online
  isUserOnline: (userId) => {
    const presence = get().presenceData[userId];
    return presence?.isOnline || false;
  },

  // Helper to get user's last seen timestamp
  getLastSeen: (userId) => {
    const presence = get().presenceData[userId];
    return presence?.lastSeen || null;
  },

  // Helper to get full presence object for a user
  getUserPresence: (userId) => {
    return get().presenceData[userId] || { isOnline: false, lastSeen: null };
  },
}));

export default usePresenceStore;
