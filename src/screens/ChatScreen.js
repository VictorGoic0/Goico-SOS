import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CompactInput from "../components/CompactInput";
import MessageBubble from "../components/MessageBubble";
import { db } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import useLocalStore from "../stores/localStore";
import usePresenceStore from "../stores/presenceStore";
import { colors, spacing, typography } from "../styles/tokens";
import {
  deleteConversation,
  getOrCreateConversation,
  sendMessage,
} from "../utils/conversation";
import { getAvatarColor, getInitials } from "../utils/helpers";

export default function ChatScreen({ route, navigation }) {
  const { otherUser } = route.params;

  // Firebase Store
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const messages = useFirebaseStore((state) => state.messages);
  const setMessages = useFirebaseStore((state) => state.setMessages);

  // Local Store (drafts and UI state only)
  const drafts = useLocalStore((state) => state.drafts);
  const setDraft = useLocalStore((state) => state.setDraft);
  const clearDraft = useLocalStore((state) => state.clearDraft);
  const isLoadingConversation = useLocalStore(
    (state) => state.isLoadingConversation
  );
  const setIsLoadingConversation = useLocalStore(
    (state) => state.setIsLoadingConversation
  );

  // Local state
  const [conversationId, setConversationId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const flatListRef = useRef(null);

  // Get messages for this conversation
  const conversationMessages = messages[conversationId] || [];

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

  // Set up real-time message listener with metadata changes
  useEffect(() => {
    if (!conversationId) return;

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    // includeMetadataChanges: true enables tracking of local writes
    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            messageId: doc.id,
            ...data,
            // Use Firebase metadata to determine if message is pending
            // hasPendingWrites: true = local write (sending)
            // hasPendingWrites: false = server confirmed (sent)
            status: doc.metadata.hasPendingWrites
              ? "sending"
              : data.status || "sent",
          };
        });

        // Store messages in Firebase store
        setMessages(conversationId, messagesList);

        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.error("Error in message listener:", error);
      }
    );

    return unsubscribe;
  }, [conversationId, setMessages]);

  // Mark messages as delivered when user views them
  useEffect(() => {
    if (!conversationId || !messages[conversationId]) return;

    const markMessagesAsDelivered = async () => {
      const conversationMessages = messages[conversationId] || [];

      // Find messages from other user that are "sent" but not "delivered"
      const undeliveredMessages = conversationMessages.filter(
        (msg) =>
          msg.senderId !== currentUser.uid &&
          msg.status === "sent" &&
          !msg.metadata?.hasPendingWrites // Don't update pending writes
      );

      // Mark each as delivered
      for (const msg of undeliveredMessages) {
        try {
          const messageRef = doc(
            db,
            "conversations",
            conversationId,
            "messages",
            msg.messageId
          );
          await updateDoc(messageRef, { status: "delivered" });
        } catch (error) {
          console.error("Error marking message as delivered:", error);
        }
      }
    };

    markMessagesAsDelivered();
  }, [conversationId, messages, currentUser.uid]);

  // Get online status
  const isOnline = usePresenceStore((state) =>
    state.isUserOnline(otherUser.userId)
  );

  // Set navigation header with profile photo and online status
  useEffect(() => {
    const hasMessages = conversationMessages.length > 0;

    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerContent}
          activeOpacity={0.7}
          onPress={() => {
            // TODO: Navigate to user profile or conversation info
          }}
        >
          {/* Profile Photo */}
          <View style={styles.headerAvatarContainer}>
            {otherUser.imageURL ? (
              <Image
                source={{ uri: otherUser.imageURL }}
                style={styles.headerAvatar}
              />
            ) : (
              <View
                style={[
                  styles.headerAvatarPlaceholder,
                  { backgroundColor: getAvatarColor(otherUser.userId) },
                ]}
              >
                <Text style={styles.headerAvatarInitials}>
                  {getInitials(otherUser.displayName || otherUser.username)}
                </Text>
              </View>
            )}
            {/* Online/Offline Status Indicator */}
            <View
              style={[
                styles.headerOnlineIndicator,
                {
                  backgroundColor: isOnline
                    ? colors.success.main
                    : colors.neutral.mediumLight,
                },
              ]}
            />
          </View>

          {/* User Name */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {otherUser.displayName || otherUser.username}
            </Text>
            {isOnline && <Text style={styles.headerSubtitle}>Online</Text>}
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={[
            styles.deleteButton,
            (!hasMessages || isDeleting) && styles.deleteButtonDisabled,
          ]}
          onPress={handleDeleteConversation}
          disabled={!hasMessages || isDeleting}
          activeOpacity={0.7}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.neutral.white} />
          ) : (
            <Text style={styles.deleteButtonText}>🗑️</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [
    navigation,
    otherUser,
    isOnline,
    conversationMessages.length,
    isDeleting,
  ]);

  // Handle send message
  const handleSend = async () => {
    const inputText = drafts[conversationId] || "";
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();

    // Clear draft immediately for instant UI feedback
    clearDraft(conversationId);

    try {
      // Just write to Firestore - Firebase handles optimistic updates!
      // Message will appear instantly with hasPendingWrites: true ("sending")
      // Then update to hasPendingWrites: false ("sent") when server confirms
      await sendMessage(
        conversationId,
        currentUser.uid,
        currentUser.username,
        textToSend
      );

      // Auto-scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore draft on error so user doesn't lose their message
      setDraft(conversationId, textToSend);
    }
  };

  // Handle input text change
  const handleInputChange = (text) => {
    setDraft(conversationId, text);
  };

  // Handle delete conversation
  const handleDeleteConversation = () => {
    // Show confirmation alert
    Alert.alert(
      "Delete this entire conversation?",
      "This will permanently delete all messages. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!conversationId) return;

            try {
              setIsDeleting(true);
              await deleteConversation(conversationId);

              // Navigate back to HomeScreen
              navigation.goBack();

              // Show success feedback
              setTimeout(() => {
                Alert.alert(
                  "Conversation deleted",
                  `Your conversation with ${
                    otherUser.displayName || otherUser.username
                  } has been deleted.`,
                  [{ text: "OK" }]
                );
              }, 300);
            } catch (error) {
              console.error("Error deleting conversation:", error);
              setIsDeleting(false);
              Alert.alert(
                "Delete failed",
                "Unable to delete conversation. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  // Get loading state
  const isLoading = isLoadingConversation[conversationId] || false;

  // Get draft text
  const inputText = drafts[conversationId] || "";

  if (isLoading || !conversationId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.base} />
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
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={conversationMessages}
        keyExtractor={(item) => item.messageId}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isSent={item.senderId === currentUser.uid}
          />
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No messages yet. Say hi to{" "}
              {otherUser.displayName || otherUser.username}! 👋
            </Text>
          </View>
        }
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <CompactInput
          value={inputText}
          onChangeText={handleInputChange}
          onSubmit={handleSend}
          placeholder="Type a message..."
        />
      </View>
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
  messagesList: {
    paddingVertical: spacing[4],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[8],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.paper,
  },
  // Header styles
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarContainer: {
    position: "relative",
    marginRight: spacing[2],
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral.lighter,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarInitials: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  headerOnlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background.paper,
  },
  headerTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.success.main,
    marginTop: spacing[0],
  },
  deleteButton: {
    marginRight: spacing[4],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.error.main,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: colors.neutral.mediumLight,
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 20,
  },
});
