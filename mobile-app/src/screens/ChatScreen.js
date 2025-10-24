import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
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
import ThreadSummaryModal from "../components/ThreadSummaryModal";
import { db } from "../config/firebase";
import { summarizeThread } from "../services/aiService";
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
  const { otherUser: routeOtherUser, conversationId: routeConversationId } =
    route.params;

  // Firebase Store
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const messages = useFirebaseStore((state) => state.messages);
  const setMessages = useFirebaseStore((state) => state.setMessages);
  const conversationsMap = useFirebaseStore((state) => state.conversationsMap);
  const usersMap = useFirebaseStore((state) => state.usersMap);

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

  // AI Features state
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Get messages for this conversation
  const conversationMessages = messages[conversationId] || [];

  // Get or create conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      // If conversationId is passed (for groups), use it directly
      if (routeConversationId) {
        setConversationId(routeConversationId);
        return;
      }

      // Otherwise, get or create 1-on-1 conversation
      if (!routeOtherUser) {
        console.error("No otherUser or conversationId provided");
        return;
      }

      const tempConvId = `${currentUser.uid}_${routeOtherUser.userId}`; // Temp ID for loading state
      setIsLoadingConversation(tempConvId, true);

      try {
        const conversation = await getOrCreateConversation(
          currentUser.uid,
          routeOtherUser.userId,
          currentUser.username,
          routeOtherUser.username
        );

        setConversationId(conversation.conversationId);
        setIsLoadingConversation(conversation.conversationId, false);
      } catch (error) {
        console.error("Error initializing conversation:", error);
        setIsLoadingConversation(tempConvId, false);
      }
    };

    initConversation();
  }, [
    currentUser,
    routeOtherUser,
    routeConversationId,
    setIsLoadingConversation,
  ]);

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

  // Mark messages as read when user views them
  useEffect(() => {
    if (!conversationId || !messages[conversationId]) return;

    const markMessagesAsRead = async () => {
      const conversationMessages = messages[conversationId] || [];

      // Find messages from other user that are "sent" but not "read"
      const unreadMessages = conversationMessages.filter(
        (msg) =>
          msg.senderId !== currentUser.uid &&
          msg.status === "sent" &&
          !msg.metadata?.hasPendingWrites // Don't update pending writes
      );

      // Mark each as read
      for (const msg of unreadMessages) {
        try {
          const messageRef = doc(
            db,
            "conversations",
            conversationId,
            "messages",
            msg.messageId
          );
          await updateDoc(messageRef, {
            status: "read",
            readAt: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      }
    };

    markMessagesAsRead();
  }, [conversationId, messages, currentUser.uid]);

  // Task 30: Detect if conversation is a group
  const conversation = conversationsMap[conversationId];
  const isGroup = conversation?.isGroup || false;

  // Derive otherUser from conversation participants if not provided
  // (e.g., when navigating from notification)
  let otherUser = routeOtherUser;
  if (!otherUser && conversation && !isGroup) {
    // Get the other participant's user ID (filter out current user)
    const otherUserId = conversation.participants?.find(
      (id) => id !== currentUser.uid
    );

    // Look up user data from usersMap
    if (otherUserId && usersMap[otherUserId]) {
      otherUser = usersMap[otherUserId];
    }
  }

  // Get online status (only for 1-on-1 chats)
  const isOnline = usePresenceStore((state) =>
    otherUser ? state.isUserOnline(otherUser.userId) : false
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
            // Task 31: Tap header to navigate to GroupInfoScreen (for groups)
            if (isGroup) {
              navigation.navigate("GroupInfo", { conversationId });
            }
          }}
        >
          {/* Task 31: Show group icon or profile photo */}
          <View style={styles.headerAvatarContainer}>
            {isGroup ? (
              // Group icon/photo
              conversation?.groupImageURL ? (
                <Image
                  source={{ uri: conversation.groupImageURL }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View
                  style={[
                    styles.headerAvatarPlaceholder,
                    { backgroundColor: getAvatarColor(conversationId) },
                  ]}
                >
                  <Text style={styles.headerAvatarInitials}>👥</Text>
                </View>
              )
            ) : (
              // 1-on-1 profile photo
              <>
                {otherUser?.imageURL ? (
                  <Image
                    source={{ uri: otherUser.imageURL }}
                    style={styles.headerAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.headerAvatarPlaceholder,
                      {
                        backgroundColor: getAvatarColor(
                          otherUser?.userId || conversationId
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.headerAvatarInitials}>
                      {getInitials(
                        otherUser?.displayName || otherUser?.username || "?"
                      )}
                    </Text>
                  </View>
                )}
                {/* Online/Offline Status Indicator (only for 1-on-1) */}
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
              </>
            )}
          </View>

          {/* Task 31: User Name or Group Name */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {isGroup
                ? conversation?.groupName || "Group Chat"
                : otherUser?.displayName || otherUser?.username || "Chat"}
            </Text>
            {/* Task 31: Show participant count for groups, online status for 1-on-1 */}
            {isGroup ? (
              <Text style={styles.headerSubtitle}>
                {conversation?.participants?.length || 0} members
              </Text>
            ) : (
              isOnline && <Text style={styles.headerSubtitle}>Online</Text>
            )}
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          {/* AI Buttons */}
          <TouchableOpacity
            style={[styles.aiButton, !hasMessages && styles.aiButtonDisabled]}
            onPress={handleSummarize}
            disabled={!hasMessages}
            activeOpacity={0.7}
          >
            <Text style={styles.aiButtonText}>📝</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aiButton, !hasMessages && styles.aiButtonDisabled]}
            onPress={handleActionItems}
            disabled={!hasMessages}
            activeOpacity={0.7}
          >
            <Text style={styles.aiButtonText}>📋</Text>
          </TouchableOpacity>

          {/* Delete Button */}
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
        </View>
      ),
    });
  }, [
    navigation,
    otherUser,
    isOnline,
    conversationMessages.length,
    isDeleting,
    isGroup,
    conversation,
    conversationId,
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

  // Handle summarize thread
  const handleSummarize = async () => {
    setShowSummary(true);
    setLoadingSummary(true);
    setSummary("");

    try {
      const result = await summarizeThread(conversationId);
      setSummary(result.summary);
    } catch (error) {
      console.error("Summarization failed:", error);
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // Handle action items navigation
  const handleActionItems = () => {
    navigation.navigate("ActionItems", { conversationId });
  };

  // Handle delete conversation
  const handleDeleteConversation = () => {
    const conversationName = isGroup
      ? conversation?.groupName || "group"
      : otherUser?.displayName || otherUser?.username || "conversation";

    // Show confirmation alert
    Alert.alert(
      `Delete this ${isGroup ? "group" : "conversation"}?`,
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
                  `${isGroup ? "Group" : "Conversation"} deleted`,
                  `${conversationName} has been deleted.`,
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
        renderItem={({ item, index }) => {
          // Check if this is the last message sent by current user
          const isSent = item.senderId === currentUser.uid;
          const isLastMessage =
            isSent && index === conversationMessages.length - 1;

          return (
            <MessageBubble
              message={item}
              isSent={isSent}
              isGroup={isGroup}
              isLastMessage={isLastMessage}
            />
          );
        }}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isGroup
                ? `No messages yet. Start the conversation! 👋`
                : `No messages yet. Say hi to ${
                    otherUser?.displayName || otherUser?.username || "them"
                  }! 👋`}
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

      {/* Thread Summary Modal */}
      <ThreadSummaryModal
        visible={showSummary}
        onClose={() => setShowSummary(false)}
        summary={summary}
        loading={loadingSummary}
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
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing[2],
  },
  aiButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    marginRight: spacing[1],
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  aiButtonDisabled: {
    opacity: 0.3,
  },
  aiButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    opacity: 0.3,
  },
  deleteButtonText: {
    fontSize: 22,
  },
});
