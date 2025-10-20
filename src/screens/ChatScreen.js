import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CompactInput from "../components/CompactInput";
import MessageBubble from "../components/MessageBubble";
import { db } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import useLocalStore from "../stores/localStore";
import { colors, spacing, typography } from "../styles/tokens";
import { getOrCreateConversation, sendMessage } from "../utils/conversation";
import { generateId } from "../utils/helpers";

export default function ChatScreen({ route, navigation }) {
  const { otherUser } = route.params;

  // Firebase Store
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const messages = useFirebaseStore((state) => state.messages);
  const setMessages = useFirebaseStore((state) => state.setMessages);

  // Local Store (now using Zustand for ALL state)
  const pendingMessages = useLocalStore((state) => state.pendingMessages);
  const addPendingMessage = useLocalStore((state) => state.addPendingMessage);
  const removePendingMessage = useLocalStore(
    (state) => state.removePendingMessage
  );
  const drafts = useLocalStore((state) => state.drafts);
  const setDraft = useLocalStore((state) => state.setDraft);
  const clearDraft = useLocalStore((state) => state.clearDraft);
  const isSending = useLocalStore((state) => state.isSending);
  const setIsSending = useLocalStore((state) => state.setIsSending);
  const isLoadingConversation = useLocalStore(
    (state) => state.isLoadingConversation
  );
  const setIsLoadingConversation = useLocalStore(
    (state) => state.setIsLoadingConversation
  );

  // Only conversationId needs local state since it's not shared across components
  const [conversationId, setConversationId] = useState(null);

  const flatListRef = useRef(null);

  // Get or create conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      const tempConvId = `${currentUser.uid}_${otherUser.userId}`; // Temp ID for loading state
      setIsLoadingConversation(tempConvId, true);

      try {
        const conversation = await getOrCreateConversation(
          currentUser.uid,
          otherUser.userId,
          currentUser.username,
          otherUser.username
        );

        setConversationId(conversation.conversationId);
        setIsLoadingConversation(conversation.conversationId, false);
      } catch (error) {
        console.error("Error initializing conversation:", error);
        setIsLoadingConversation(tempConvId, false);
      }
    };

    initConversation();
  }, [currentUser, otherUser, setIsLoadingConversation]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!conversationId) return;

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          messageId: doc.id,
          ...doc.data(),
        }));

        setMessages(conversationId, messagesData);
        console.log("✅ Messages loaded:", messagesData.length);
      },
      (error) => {
        console.error("Error listening to messages:", error);
      }
    );

    return () => unsubscribe();
  }, [conversationId, setMessages]);

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({
      title: otherUser.displayName || otherUser.username,
    });
  }, [navigation, otherUser]);

  const handleSend = async () => {
    const inputText = drafts[conversationId] || "";

    if (!inputText.trim() || !conversationId || isSending[conversationId]) {
      return;
    }

    const messageText = inputText.trim();
    const tempMessageId = generateId();

    // Clear input immediately (using Zustand)
    clearDraft(conversationId);
    setIsSending(conversationId, true);

    // Optimistic update - add to local store
    addPendingMessage(conversationId, {
      messageId: tempMessageId,
      senderId: currentUser.uid,
      senderUsername: currentUser.username,
      text: messageText,
      timestamp: Date.now(),
      status: "sending",
    });

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Send to Firestore
      await sendMessage(
        conversationId,
        currentUser.uid,
        currentUser.username,
        messageText
      );

      // Remove from pending messages
      removePendingMessage(conversationId, tempMessageId);
    } catch (error) {
      console.error("Error sending message:", error);
      // Keep in pending with "sending" status so user can retry
    } finally {
      setIsSending(conversationId, false);
    }
  };

  // Merge pending and confirmed messages
  const allMessages = [
    ...(messages[conversationId] || []),
    ...(pendingMessages[conversationId] || []),
  ].sort((a, b) => {
    const aTime = a.timestamp?.seconds
      ? a.timestamp.seconds * 1000
      : a.timestamp;
    const bTime = b.timestamp?.seconds
      ? b.timestamp.seconds * 1000
      : b.timestamp;
    return aTime - bTime;
  });

  const renderMessage = ({ item }) => (
    <MessageBubble
      message={item}
      isSent={item.senderId === currentUser.uid}
      showTimestamp={true}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>
        Start the conversation with{" "}
        {otherUser.displayName || otherUser.username}
      </Text>
    </View>
  );

  // Get current input text and UI state from Zustand
  const inputText = drafts[conversationId] || "";
  const isLoading = isLoadingConversation[conversationId] || false;
  const sending = isSending[conversationId] || false;

  if (isLoading || !conversationId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={allMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          allMessages.length === 0 ? styles.emptyList : styles.messageList
        }
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Message Input - Using CompactInput from design system */}
      <CompactInput
        value={inputText}
        onChangeText={(text) => setDraft(conversationId, text)}
        placeholder="Type a message..."
        onSubmit={handleSend}
        submitLabel="Send"
        isSubmitting={sending}
        submitDisabled={!inputText.trim()}
        maxLength={1000}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  messageList: {
    paddingVertical: spacing[2],
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[8],
  },
  emptyText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
