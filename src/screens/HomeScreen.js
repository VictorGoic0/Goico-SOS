import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import UserListItem from "../components/UserListItem";
import { db } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import { colors, spacing, typography } from "../styles/tokens";
import { signOutUser } from "../utils/auth";
import { deleteConversation, getConversationId } from "../utils/conversation";
import { getAvatarColor, getInitials } from "../utils/helpers";

export default function HomeScreen({ navigation }) {
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const users = useFirebaseStore((state) => state.users);
  const setUsers = useFirebaseStore((state) => state.setUsers);
  const conversationsMap = useFirebaseStore((state) => state.conversationsMap);
  const conversations = useFirebaseStore((state) => state.conversations);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState(null);

  // Get group conversations
  const groupConversations = conversations.filter(
    (conv) => conv.isGroup === true
  );

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

    return (
      <UserListItem
        user={item}
        onPress={() => handleUserPress(item)}
        onLongPress={() => handleUserLongPress(item)}
        isCurrentUser={isCurrentUser}
        isDeleting={isDeleting}
      />
    );
  };

  const renderGroupConversation = ({ item }) => {
    const isDeleting = deletingConversationId === item.conversationId;

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
          <Text style={styles.groupName} numberOfLines={1}>
            {item.groupName || "Unnamed Group"}
          </Text>
          <Text style={styles.groupMembers} numberOfLines={1}>
            {item.participants?.length || 0} members
          </Text>
        </View>

        {/* Group Badge */}
        <View style={styles.groupBadge}>
          <Text style={styles.groupBadgeText}>Group</Text>
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

  return (
    <View style={styles.container}>
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
  groupName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  groupMembers: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  groupBadge: {
    backgroundColor: colors.primary.lighter,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
    marginLeft: spacing[2],
  },
  groupBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.base,
  },
  deletingIndicator: {
    marginLeft: spacing[2],
  },
});
