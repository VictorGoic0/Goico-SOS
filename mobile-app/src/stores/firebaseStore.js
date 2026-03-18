import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../config/firebase";

/**
 * Firebase Store - Source of Truth
 *
 * Purpose: All data from Firestore (users, conversations, messages).
 * Updated by Firestore onSnapshot listeners.
 * This is the authoritative data store.
 */
const useFirebaseStore = create((set, get) => ({
  // State
  currentUser: null, // Currently logged-in user
  users: [], // All users from Firestore
  usersMap: {}, // Quick lookup: { userId: user }
  usersLoading: false,
  usersUnsubscribe: null, // Cleanup for users listener
  conversations: [], // All conversations for current user
  conversationsMap: {}, // Quick lookup: { conversationId: conversation }
  messages: {}, // { conversationId: [messages] }

  // Current User Actions
  setCurrentUser: (user) =>
    set({
      currentUser: user,
    }),

  // Users Actions
  setUsers: (users) =>
    set({
      users,
      usersLoading: false,
      usersMap: users.reduce((map, user) => {
        map[user.userId] = user;
        return map;
      }, {}),
    }),

  setUsersLoading: (loading) => set({ usersLoading: loading }),

  /** Start listening to users collection. No-op if already subscribed. Call unsubscribeUsers() on cleanup. */
  subscribeToUsers: () => {
    if (get().usersUnsubscribe) return;
    get().setUsersLoading(true);
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          userId: doc.id,
          ...doc.data(),
        }));
        get().setUsers(usersData);
      },
      (error) => {
        console.error("Error fetching users:", error);
        get().setUsersLoading(false);
      },
    );
    set({ usersUnsubscribe: unsubscribe });
  },

  unsubscribeUsers: () => {
    const unsub = get().usersUnsubscribe;
    if (unsub) unsub();
    set({ usersUnsubscribe: null });
  },

  /** One-off fetch for pull-to-refresh; listener remains active. */
  refreshUsers: async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }));
      get().setUsers(usersData);
    } catch (error) {
      console.error("Error refreshing users:", error);
      get().setUsersLoading(false);
    }
  },

  updateUser: (userId, updates) =>
    set((state) => {
      const updatedUsers = state.users.map((user) =>
        user.userId === userId ? { ...user, ...updates } : user
      );
      return {
        users: updatedUsers,
        usersMap: updatedUsers.reduce((map, user) => {
          map[user.userId] = user;
          return map;
        }, {}),
      };
    }),

  // Conversations Actions
  setConversations: (conversations) =>
    set({
      conversations,
      conversationsMap: conversations.reduce((map, conv) => {
        map[conv.conversationId] = conv;
        return map;
      }, {}),
    }),

  addConversation: (conversation) =>
    set((state) => {
      const newConversations = [...state.conversations, conversation];
      return {
        conversations: newConversations,
        conversationsMap: {
          ...state.conversationsMap,
          [conversation.conversationId]: conversation,
        },
      };
    }),

  updateConversation: (conversationId, updates) =>
    set((state) => {
      const updatedConversations = state.conversations.map((conv) =>
        conv.conversationId === conversationId ? { ...conv, ...updates } : conv
      );
      return {
        conversations: updatedConversations,
        conversationsMap: updatedConversations.reduce((map, conv) => {
          map[conv.conversationId] = conv;
          return map;
        }, {}),
      };
    }),

  // Messages Actions
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),

  updateMessageStatus: (conversationId, messageId, status) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) =>
          msg.messageId === messageId ? { ...msg, status } : msg
        ),
      },
    })),

  // Helper Functions
  getUserById: (userId) => {
    return get().usersMap[userId] || null;
  },

  getConversationById: (conversationId) => {
    return get().conversationsMap[conversationId] || null;
  },

  getMessages: (conversationId) => {
    return get().messages[conversationId] || [];
  },

  // Clear all data (for logout)
  clearStore: () => {
    get().unsubscribeUsers();
    set({
      currentUser: null,
      users: [],
      usersMap: {},
      usersLoading: false,
      usersUnsubscribe: null,
      conversations: [],
      conversationsMap: {},
      messages: {},
    });
  },
}));

export default useFirebaseStore;
