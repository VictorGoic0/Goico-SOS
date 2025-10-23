import { create } from "zustand";

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
      usersMap: users.reduce((map, user) => {
        map[user.userId] = user;
        return map;
      }, {}),
    }),

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
  clearStore: () =>
    set({
      currentUser: null,
      users: [],
      usersMap: {},
      conversations: [],
      conversationsMap: {},
      messages: {},
    }),
}));

export default useFirebaseStore;
