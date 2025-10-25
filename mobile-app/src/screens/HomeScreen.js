import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import UserListItem from "../components/UserListItem";
import { db } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import usePresenceStore from "../stores/presenceStore";
import { colors, spacing, typography } from "../styles/tokens";
import { signOutUser } from "../utils/auth";
import { deleteConversation, getConversationId } from "../utils/conversation";
import { formatTimestamp, getAvatarColor, getInitials } from "../utils/helpers";

export default function HomeScreen({ navigation }) {
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const users = useFirebaseStore((state) => state.users);
  const setUsers = useFirebaseStore((state) => state.setUsers);
  const conversationsMap = useFirebaseStore((state) => state.conversationsMap);
  const conversations = useFirebaseStore((state) => state.conversations);
  const usersMap = useFirebaseStore((state) => state.usersMap);
  const isConnected = usePresenceStore((state) => state.isConnected);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState(null);
  const [wasOffline, setWasOffline] = useState(false);

  // Get group conversations
  const groupConversations = conversations.filter(
    (conv) => conv.isGroup === true
  );

  // Track connection status for "Connecting" state
  useEffect(() => {
    if (!isConnected) {
      setWasOffline(true);
    } else if (isConnected && wasOffline) {
      // Clear "Connecting" state after 2 seconds when reconnected
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, wasOffline]);

  // Configure header with profile icon
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerProfileButton}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          {currentUser?.imageURL ? (
            <Image
              source={{ uri: currentUser.imageURL }}
              style={styles.headerProfileImage}
              contentFit="cover"
              priority="high"
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              style={[
                styles.headerProfileImage,
                styles.headerProfilePlaceholder,
                { backgroundColor: getAvatarColor(currentUser?.uid) },
              ]}
            >
              <Text style={styles.headerProfileInitials}>
                {getInitials(currentUser?.displayName || currentUser?.username)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentUser]);

  // Fetch all users from Firestore
  useEffect(() => {
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          userId: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
        setIsLoading(false);
        setIsRefreshing(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setIsLoading(false);
        setIsRefreshing(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [setUsers]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // The onSnapshot listener will automatically refresh
  };

  const handleUserPress = (user) => {
    // Don't allow chatting with yourself
    if (user.userId === currentUser.uid) {
      return;
    }

    // Navigate to chat screen with this user
    navigation.navigate("Chat", { otherUser: user });
  };

  const handleGroupPress = (conversation) => {
    // Navigate to group chat screen
    navigation.navigate("Chat", {
      conversationId: conversation.conversationId,
      isGroup: true,
      groupName: conversation.groupName,
    });
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleUserLongPress = (user) => {
    // Don't allow deleting conversation with yourself
    if (user.userId === currentUser.uid) {
      return;
    }

    // Check if a conversation exists with this user
    const conversationId = getConversationId(currentUser.uid, user.userId);

    if (!conversationsMap[conversationId]) {
      // No conversation exists
      return;
    }

    // Show delete confirmation alert
    Alert.alert(
      `Delete conversation with ${user.displayName || user.username}?`,
      "This will delete all messages. You can message them again to start a new conversation.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteConversation(conversationId, user),
        },
      ]
    );
  };

  const handleGroupLongPress = (conversation) => {
    // Show delete confirmation alert for groups
    Alert.alert(
      `Delete "${conversation.groupName}"?`,
      "This will delete all messages from this group. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            handleDeleteConversation(
              conversation.conversationId,
              null,
              conversation.groupName
            ),
        },
      ]
    );
  };

  const handleDeleteConversation = async (conversationId, user, groupName) => {
    try {
      setDeletingConversationId(conversationId);
      await deleteConversation(conversationId);

      // Firestore listener will automatically update the global store

      // Show success feedback
      const message = groupName
        ? `Group "${groupName}" has been deleted.`
        : `Your conversation with ${
            user.displayName || user.username
          } has been deleted.`;

      Alert.alert("Conversation deleted", message, [{ text: "OK" }]);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      Alert.alert(
        "Delete failed",
        "Unable to delete conversation. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setDeletingConversationId(null);
    }
  };

  // Combine users and group conversations into a single list
  const combinedList = [
    // Add group conversations first with type marker
    ...groupConversations.map((conv) => ({ ...conv, type: "group" })),
    // Add users with type marker
    ...users.map((user) => ({ ...user, type: "user" })),
  ];

  const renderUser = ({ item }) => {
    const isCurrentUser = item.userId === currentUser.uid;
    const conversationId = getConversationId(currentUser.uid, item.userId);
    const isDeleting = deletingConversationId === conversationId;
    const conversation = conversationsMap[conversationId];

    return (
      <UserListItem
        user={item}
        onPress={() => handleUserPress(item)}
        onLongPress={() => handleUserLongPress(item)}
        isCurrentUser={isCurrentUser}
        isDeleting={isDeleting}
        lastMessage={conversation?.lastMessage}
        lastMessageTimestamp={conversation?.lastMessageTimestamp}
        lastMessageSenderId={conversation?.lastMessageSenderId}
        currentUserId={currentUser.uid}
      />
    );
  };

  const renderGroupConversation = ({ item }) => {
    const isDeleting = deletingConversationId === item.conversationId;
    const hasMessages = item.lastMessage && item.lastMessage.trim() !== "";

    // Get timestamp
    let timestampText = "";
    if (item.lastMessageTimestamp) {
      // Handle Firestore timestamp
      const timestamp = item.lastMessageTimestamp.seconds
        ? new Date(item.lastMessageTimestamp.seconds * 1000)
        : item.lastMessageTimestamp;
      timestampText = formatTimestamp(timestamp);
    }

    // Format last message preview
    let messagePreview = "";
    if (hasMessages) {
      const isSentByCurrentUser = item.lastMessageSenderId === currentUser.uid;
      let prefix = "";

      if (isSentByCurrentUser) {
        prefix = "You: ";
      } else if (item.lastMessageSenderId) {
        // Get sender info from usersMap
        const sender = usersMap[item.lastMessageSenderId];
        if (sender) {
          const senderName = sender.displayName || sender.username;
          prefix = `${senderName}: `;
        }
      }

      messagePreview = `${prefix}${item.lastMessage}`;
    } else {
      messagePreview = `${item.participants?.length || 0} members`;
    }

    return (
      <TouchableOpacity
        onPress={() => handleGroupPress(item)}
        onLongPress={() => handleGroupLongPress(item)}
        activeOpacity={0.7}
        style={styles.groupItem}
        disabled={isDeleting}
      >
        {/* Group Avatar */}
        <View style={styles.groupAvatarContainer}>
          {item.groupImageURL ? (
            <Image
              source={{ uri: item.groupImageURL }}
              style={styles.groupAvatar}
              contentFit="cover"
              priority="high"
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              style={[
                styles.groupAvatarPlaceholder,
                { backgroundColor: getAvatarColor(item.conversationId) },
              ]}
            >
              <Text style={styles.groupAvatarIcon}>👥</Text>
            </View>
          )}
        </View>

        {/* Group Info */}
        <View style={styles.groupInfo}>
          <View style={styles.groupHeaderRow}>
            <Text style={styles.groupName} numberOfLines={1}>
              {item.groupName || "Unnamed Group"}
            </Text>
            {timestampText !== "" && (
              <Text style={styles.timestamp}>{timestampText}</Text>
            )}
          </View>
          <Text style={styles.lastMessagePreview} numberOfLines={1}>
            {messagePreview}
          </Text>
        </View>

        {isDeleting && (
          <ActivityIndicator
            size="small"
            color={colors.primary.base}
            style={styles.deletingIndicator}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    if (item.type === "group") {
      return renderGroupConversation({ item });
    } else {
      return renderUser({ item });
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No conversations</Text>
      <Text style={styles.emptySubtext}>
        Start chatting or create a group to get started!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Messages</Text>
      <Text style={styles.headerSubtitle}>
        {groupConversations.length > 0 &&
          `${groupConversations.length} ${
            groupConversations.length === 1 ? "group" : "groups"
          } • `}
        {users.length} {users.length === 1 ? "user" : "users"}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.base} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  // Determine connection status message
  const connectionStatus = !isConnected
    ? "Offline"
    : wasOffline
    ? "Connecting"
    : null;

  return (
    <View style={styles.container}>
      {/* Connection Status Banner */}
      {connectionStatus && (
        <View
          style={[
            styles.connectionBanner,
            connectionStatus === "Connecting" &&
              styles.connectionBannerConnecting,
          ]}
        >
          <Text style={styles.connectionBannerText}>{connectionStatus}</Text>
        </View>
      )}

      <FlatList
        data={combinedList}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.type === "group" ? item.conversationId : item.userId
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.base]}
            tintColor={colors.primary.base}
          />
        }
        contentContainerStyle={
          combinedList.length === 0 ? styles.emptyList : null
        }
      />

      {/* Action Buttons - Bottom right */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={() => navigation.navigate("CreateGroup")}
          activeOpacity={0.8}
        >
          <Text style={styles.createGroupText}>Create Group</Text>
        </TouchableOpacity>

        {/* Temporary Sign Out Button - Will move to Profile screen later */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  headerContainer: {
    padding: spacing[4],
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  emptyList: {
    flexGrow: 1,
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
  actionButtons: {
    position: "absolute",
    bottom: spacing[6],
    right: spacing[6],
    flexDirection: "column",
  },
  createGroupButton: {
    backgroundColor: colors.primary.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 24,
    marginBottom: spacing[3],
    ...{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
  createGroupText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  signOutButton: {
    backgroundColor: colors.error.main,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 24,
    ...{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
  signOutText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  headerProfileButton: {
    marginRight: spacing[4],
  },
  headerProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerProfilePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerProfileInitials: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  groupAvatarContainer: {
    marginRight: spacing[3],
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutral.lighter,
  },
  groupAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  groupAvatarIcon: {
    fontSize: 28,
  },
  groupInfo: {
    flex: 1,
    justifyContent: "center",
  },
  groupHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[1],
  },
  groupName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing[2],
  },
  lastMessagePreview: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  deletingIndicator: {
    marginLeft: spacing[2],
  },
  connectionBanner: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.error.main,
    alignItems: "center",
    justifyContent: "center",
  },
  connectionBannerConnecting: {
    backgroundColor: colors.warning.main,
  },
  connectionBannerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
});
