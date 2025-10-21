import { create } from "zustand";

/**
 * Local Store - UI State & Drafts
 *
 * Purpose: Handle local UI state and draft messages.
 * NOTE: We don't track pending messages here anymore!
 * Firebase Firestore handles optimistic updates automatically via hasPendingWrites metadata.
 */
const useLocalStore = create((set, get) => ({
  // State
  drafts: {}, // { conversationId: "draft text..." }

  // UI State
  isSending: {}, // { conversationId: boolean }
  isLoadingConversation: {}, // { conversationId: boolean }

  // Draft Actions
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
