import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import CompactInput from "../components/CompactInput";
import MessageBubble from "../components/MessageBubble";
import ThreadSummaryModal from "../components/ThreadSummaryModal";
import { db } from "../config/firebase";
import {
  detectPriority,
  semanticSearch,
  summarizeThread,
} from "../services/aiService";
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
import {
  listenToTypingIndicator,
  removeTypingIndicator,
  setTypingIndicator,
} from "../utils/typingIndicator";

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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Typing indicators state
  const [typingUserIds, setTypingUserIds] = useState([]);
  const typingTimeoutRef = useRef(null);

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
      },
      (error) => {
        console.error("Error in message listener:", error);
      }
    );

    return unsubscribe;
  }, [conversationId, setMessages]);

  // Auto-priority detection for new messages from others
  useEffect(() => {
    if (!conversationId || !messages[conversationId]) return;

    const conversationMessages = messages[conversationId] || [];

    // Find new messages from others that haven't been analyzed yet
    const newMessagesFromOthers = conversationMessages.filter(
      (msg) =>
        msg.senderId !== currentUser.uid && // Not sent by current user
        !msg.metadata?.hasPendingWrites && // Server confirmed (not still sending)
        !msg.priority && // Not already analyzed
        msg.text // Has text to analyze
    );

    // Detect priority for each new message
    newMessagesFromOthers.forEach(async (msg) => {
      try {
        const priorityData = await detectPriority(msg.text);

        // Write priority for ALL messages (high, normal, low)
        // This ensures each message is only analyzed once
        const messageRef = doc(
          db,
          "conversations",
          conversationId,
          "messages",
          msg.messageId
        );

        await updateDoc(messageRef, {
          priority: priorityData.priority,
          priorityReason: priorityData.reason,
          urgencyScore: priorityData.urgencyScore,
        });
      } catch (error) {
        console.error("Priority detection failed for message:", error);
        // Silently fail - priority detection is not critical
      }
    });
  }, [conversationId, messages, currentUser.uid]);

  // Mark messages as read when user views them
  useEffect(() => {
    if (!conversationId || !messages[conversationId]) return;

    const markMessagesAsRead = async () => {
      const conversationMessages = messages[conversationId] || [];

      // Get conversation to check if it's a group
      const conversation = conversationsMap[conversationId];
      const isGroup = conversation?.isGroup || false;

      if (isGroup) {
        // GROUP CHAT FLOW: Message is unread if current user is NOT in readBy array
        const unreadMessages = conversationMessages.filter(
          (msg) =>
            msg.senderId !== currentUser.uid &&
            !msg.metadata?.hasPendingWrites &&
            (!msg.readBy || !msg.readBy.includes(currentUser.uid)) // Not in readBy array
        );

        // Mark each as read by adding current user to readBy array
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
              readBy: arrayUnion(currentUser.uid),
              readAt: serverTimestamp(),
            });
          } catch (error) {
            console.error("Error marking group message as read:", error);
          }
        }
      } else {
        // 1-ON-1 CHAT FLOW: Message is unread if status is "sent"
        const unreadMessages = conversationMessages.filter(
          (msg) =>
            msg.senderId !== currentUser.uid &&
            msg.status === "sent" &&
            !msg.metadata?.hasPendingWrites
        );

        // Mark each as read with simple status update
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
            console.error("Error marking 1-on-1 message as read:", error);
          }
        }
      }
    };

    markMessagesAsRead();
  }, [conversationId, messages, currentUser.uid, conversationsMap]);

  // Typing indicator: Listen to typing users
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = listenToTypingIndicator(
      conversationId,
      currentUser.uid,
      (userIds) => {
        setTypingUserIds(userIds);
      }
    );

    return () => {
      unsubscribe();
      // Clean up our own typing status
      removeTypingIndicator(conversationId, currentUser.uid);
      isTypingRef.current = false;
    };
  }, [conversationId, currentUser.uid]);

  // Track if user is currently marked as typing
  const isTypingRef = useRef(false);

  // Typing indicator: Handle typing (instant, no debounce)
  const handleTypingIndicator = useCallback(() => {
    if (!conversationId) return;

    // Only set typing on first keystroke (prevents excessive writes)
    if (!isTypingRef.current) {
      setTypingIndicator(conversationId, currentUser.uid);
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-clear after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      removeTypingIndicator(conversationId, currentUser.uid);
      isTypingRef.current = false;
    }, 1000);
  }, [conversationId, currentUser.uid]);

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
                  contentFit="cover"
                  priority="high"
                  cachePolicy="memory-disk"
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
                    contentFit="cover"
                    priority="high"
                    cachePolicy="memory-disk"
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
          {/* Search Button */}
          <TouchableOpacity
            style={[styles.aiButton, !hasMessages && styles.aiButtonDisabled]}
            onPress={() => setShowSearchBar(!showSearchBar)}
            disabled={!hasMessages}
            activeOpacity={0.7}
          >
            <Text style={styles.aiButtonText}>🔍</Text>
          </TouchableOpacity>

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

          {/* Decisions Button */}
          <TouchableOpacity
            style={[styles.aiButton, !hasMessages && styles.aiButtonDisabled]}
            onPress={() => navigation.navigate("Decisions", { conversationId })}
            disabled={!hasMessages}
            activeOpacity={0.7}
          >
            <Text style={styles.aiButtonText}>✓</Text>
          </TouchableOpacity>

          {/* Agent Chat Button */}
          <TouchableOpacity
            style={[styles.aiButton, !hasMessages && styles.aiButtonDisabled]}
            onPress={() => navigation.navigate("AgentChat", { conversationId })}
            disabled={!hasMessages}
            activeOpacity={0.7}
          >
            <Text style={styles.aiButtonText}>🤖</Text>
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
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore draft on error so user doesn't lose their message
      setDraft(conversationId, textToSend);
    }
  };

  // Handle input text change
  const handleInputChange = (text) => {
    setDraft(conversationId, text);
    // Trigger typing indicator (instant)
    handleTypingIndicator();
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

  // Handle semantic search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !conversationId) return;

    setSearching(true);
    try {
      const result = await semanticSearch(conversationId, searchQuery);
      setSearchResults(result.results || []);

      // Show alert if no results found
      if (!result.results || result.results.length === 0) {
        Alert.alert(
          "No Results",
          `No messages found matching "${searchQuery}". Try different keywords.`
        );
      }
    } catch (error) {
      console.error("Search failed:", error);
      Alert.alert(
        "Search failed",
        "Unable to search messages. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSearching(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchBar(false);
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
      {/* Search Bar */}
      {showSearchBar && (
        <View style={styles.searchContainer}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search messages..."
            style={[
              styles.searchInput,
              searching && styles.searchInputDisabled,
            ]}
            placeholderTextColor={colors.text.tertiary}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            editable={!searching}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={searching || !searchQuery.trim()}
          >
            {searching ? (
              <ActivityIndicator size="small" color={colors.neutral.white} />
            ) : (
              <Text style={styles.searchButtonText}>🔍</Text>
            )}
          </TouchableOpacity>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={clearSearch}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <ScrollView style={styles.searchResults} nestedScrollEnabled={true}>
            {searchResults.map((msg, i) => (
              <TouchableOpacity
                key={i}
                style={styles.searchResult}
                onPress={() => {
                  // Clear search and scroll to message would go here
                  clearSearch();
                }}
              >
                <Text style={styles.searchResultSender} numberOfLines={1}>
                  {msg.senderUsername}
                </Text>
                <Text style={styles.searchResultText} numberOfLines={2}>
                  {msg.text}
                </Text>
                <View style={styles.searchResultMeta}>
                  <Text style={styles.searchResultSimilarity}>
                    {(msg.similarity * 100).toFixed(0)}% match
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={[...conversationMessages].reverse()}
        keyExtractor={(item) => item.messageId}
        inverted={true}
        renderItem={({ item, index }) => {
          // Check if this is the last message sent by current user
          const isSent = item.senderId === currentUser.uid;

          // Since array is reversed, index 0 = most recent message
          // Find the FIRST occurrence in reversed array = most recent message
          const reversedMessages = [...conversationMessages].reverse();
          let lastSentMessageIndex = -1;
          for (let i = 0; i < reversedMessages.length; i++) {
            if (reversedMessages[i].senderId === currentUser.uid) {
              lastSentMessageIndex = i;
              break;
            }
          }
          const isLastMessage = isSent && index === lastSentMessageIndex;

          // For group chats, filter readBy array to exclude sender and only include current participants
          const readBy =
            isGroup && item.readBy
              ? item.readBy.filter(
                  (userId) =>
                    userId !== item.senderId &&
                    conversation?.participants?.includes(userId) // Only current participants
                )
              : [];

          return (
            <MessageBubble
              message={item}
              isSent={isSent}
              isGroup={isGroup}
              isLastMessage={isLastMessage}
              readBy={readBy}
              priority={item.priority || "normal"}
            />
          );
        }}
        contentContainerStyle={styles.messagesList}
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

      {/* Typing Indicator */}
      {typingUserIds.length > 0 && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>
            {(() => {
              const typingNames = typingUserIds
                .map(
                  (userId) =>
                    usersMap[userId]?.displayName || usersMap[userId]?.username
                )
                .filter(Boolean);

              if (typingNames.length === 0) return "";

              if (typingNames.length === 1) {
                return `${typingNames[0]} is typing...`;
              }

              if (typingNames.length === 2) {
                return `${typingNames[0]} and ${typingNames[1]} are typing...`;
              }

              return `${typingNames.slice(0, 2).join(", ")} and ${
                typingNames.length - 2
              } ${
                typingNames.length - 2 === 1 ? "other is" : "others are"
              } typing...`;
            })()}
          </Text>
        </View>
      )}

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
    flexGrow: 1,
    justifyContent: "flex-end",
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
  typingIndicator: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.default,
  },
  typingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  // Search styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.neutral.lighter,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchInputDisabled: {
    backgroundColor: colors.neutral.light,
    opacity: 0.6,
    color: colors.text.secondary,
  },
  searchButton: {
    marginLeft: spacing[2],
    backgroundColor: colors.primary.base,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 18,
  },
  clearSearchButton: {
    marginLeft: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
  },
  clearSearchText: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  searchResultsContainer: {
    maxHeight: "60%", // Limit to 60% of screen height
    backgroundColor: colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchResults: {
    flexGrow: 0, // Don't grow beyond content
    flexShrink: 1, // Allow shrinking if needed
  },
  searchResult: {
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.neutral.white,
  },
  searchResultSender: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.base,
    marginBottom: spacing[1],
  },
  searchResultText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  searchResultMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchResultSimilarity: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
});
