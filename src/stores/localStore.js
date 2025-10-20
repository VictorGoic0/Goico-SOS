import { create } from "zustand";

/**
 * Local Store - Optimistic Updates
 *
 * Purpose: Handle temporary local state before Firebase confirms.
 * Used for instant UI feedback (messages show as "sending" immediately).
 */
const useLocalStore = create((set, get) => ({
  // State
  pendingMessages: {}, // { conversationId: [messages with status: "sending"] }
  drafts: {}, // { conversationId: "draft text..." }

  // UI State
  isSending: {}, // { conversationId: boolean }
  isLoadingConversation: {}, // { conversationId: boolean }

  // Actions
  addPendingMessage: (conversationId, message) =>
    set((state) => ({
      pendingMessages: {
        ...state.pendingMessages,
        [conversationId]: [
          ...(state.pendingMessages[conversationId] || []),
          message,
        ],
      },
    })),

  removePendingMessage: (conversationId, messageId) =>
    set((state) => ({
      pendingMessages: {
        ...state.pendingMessages,
        [conversationId]: (state.pendingMessages[conversationId] || []).filter(
          (msg) => msg.messageId !== messageId
        ),
      },
    })),

  setDraft: (conversationId, text) =>
    set((state) => ({
      drafts: {
        ...state.drafts,
        [conversationId]: text,
      },
    })),

  clearDraft: (conversationId) =>
    set((state) => {
      const newDrafts = { ...state.drafts };
      delete newDrafts[conversationId];
      return { drafts: newDrafts };
    }),

  // Helper to get pending messages for a conversation
  getPendingMessages: (conversationId) => {
    return get().pendingMessages[conversationId] || [];
  },

  // Helper to get draft for a conversation
  getDraft: (conversationId) => {
    return get().drafts[conversationId] || "";
  },

  // UI State Actions
  setIsSending: (conversationId, sending) =>
    set((state) => ({
      isSending: {
        ...state.isSending,
        [conversationId]: sending,
      },
    })),

  setIsLoadingConversation: (conversationId, loading) =>
    set((state) => ({
      isLoadingConversation: {
        ...state.isLoadingConversation,
        [conversationId]: loading,
      },
    })),
}));

export default useLocalStore;
