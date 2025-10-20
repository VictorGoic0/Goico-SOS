import { create } from 'zustand';

/**
 * Presence Store - Real-time User Status
 * 
 * Purpose: Track online/offline status from Realtime Database.
 * Updates from Firebase Realtime Database onValue() listener.
 */
const usePresenceStore = create((set, get) => ({
  // State
  presenceData: {}, // { userId: { isOnline: boolean, lastSeen: timestamp } }

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

