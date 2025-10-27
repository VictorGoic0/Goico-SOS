import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import usePresenceStore from "../stores/presenceStore";
import { colors, spacing, typography } from "../styles/tokens";
import {
  formatLastSeen,
  formatTimestamp,
  getAvatarColor,
  getInitials,
} from "../utils/helpers";

/**
 * UserListItem - Display a user in a list with presence indicator
 * @param {Object} user - User object
 * @param {Function} onPress - Callback when user is pressed
 * @param {Function} onLongPress - Callback when user is long-pressed
 * @param {boolean} isCurrentUser - Whether this is the current logged-in user
 * @param {boolean} isDeleting - Whether the conversation is being deleted
 * @param {string} lastMessage - Last message text in conversation
 * @param {Object} lastMessageTimestamp - Timestamp of last message
 * @param {string} lastMessageSenderId - User ID who sent last message
 * @param {string} currentUserId - Current user ID
 */
export default function UserListItem({
  user,
  onPress,
  onLongPress,
  isCurrentUser = false,
  isDeleting = false,
  lastMessage = null,
  lastMessageTimestamp = null,
  lastMessageSenderId = null,
  currentUserId = null,
}) {
  const isOnline = usePresenceStore((state) => state.isUserOnline(user.userId));
  const presenceData = usePresenceStore(
    (state) => state.presenceData[user.userId]
  );

  const initials = getInitials(user.displayName || user.username);
  const avatarColor = getAvatarColor(user.userId);

  // Check if there's a conversation with messages
  const hasConversation = lastMessage && lastMessage.trim() !== "";

  // Format timestamp
  let timestampText = "";
  if (lastMessageTimestamp) {
    const timestamp = lastMessageTimestamp.seconds
      ? new Date(lastMessageTimestamp.seconds * 1000)
      : lastMessageTimestamp;
    timestampText = formatTimestamp(timestamp);
  }

  // Format last message preview
  let messagePreview = "";
  if (hasConversation) {
    const isSentByCurrentUser = lastMessageSenderId === currentUserId;
    const prefix = isSentByCurrentUser ? "You: " : "";
    messagePreview = `${prefix}${lastMessage}`;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrentUser && styles.currentUserContainer,
        isDeleting && styles.deletingContainer,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={isCurrentUser ? 1 : 0.7}
      disabled={isCurrentUser || isDeleting}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {user.imageURL ? (
          <Image
            source={{ uri: user.imageURL }}
            style={styles.avatar}
            contentFit="cover"
            priority="high"
            cachePolicy="memory-disk"
          />
        ) : (
          <View
            style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        {/* Online indicator */}
        <View
          style={[
            styles.onlineIndicator,
            {
              backgroundColor: isOnline
                ? colors.success.main
                : colors.neutral.mediumLight,
            },
          ]}
        />
      </View>

      {/* User info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName} numberOfLines={1}>
            {user.displayName || user.username}
          </Text>
          {isCurrentUser && <Text style={styles.youBadge}>You</Text>}
          {!isCurrentUser && hasConversation && timestampText !== "" && (
            <Text style={styles.timestamp}>{timestampText}</Text>
          )}
        </View>

        {/* Show last message if conversation exists, otherwise show username */}
        {hasConversation ? (
          <>
            <Text style={styles.lastMessageText} numberOfLines={1}>
              {messagePreview}
            </Text>
            {/* Show online status even when there's a conversation */}
            {!isCurrentUser && isOnline && (
              <Text style={styles.status} numberOfLines={1}>
                {user.status || "Available"}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.username} numberOfLines={1}>
              @{user.username}
            </Text>
            {!isOnline && presenceData?.lastSeen && (
              <Text style={styles.lastSeen} numberOfLines={1}>
                {formatLastSeen(presenceData.lastSeen)}
              </Text>
            )}
            {isOnline && !isCurrentUser && (
              <Text style={styles.status} numberOfLines={1}>
                {user.status || "Available"}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Loading indicator when deleting */}
      {isDeleting && (
        <ActivityIndicator size="small" color={colors.primary.base} />
      )}

      {/* Chevron - hidden for current user and when deleting */}
      {!isCurrentUser && !isDeleting && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  currentUserContainer: {
    opacity: 0.6,
  },
  deletingContainer: {
    opacity: 0.5,
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing[3],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutral.lighter,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.background.paper,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[1],
  },
  displayName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  youBadge: {
    marginLeft: spacing[2],
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.base,
    backgroundColor: colors.primary.lighter,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing[2],
  },
  username: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[0],
  },
  lastMessageText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  lastSeen: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  status: {
    fontSize: typography.fontSize.xs,
    color: colors.success.main,
    marginTop: spacing[1],
  },
  chevron: {
    fontSize: 28,
    color: colors.neutral.mediumLight,
    marginLeft: spacing[2],
  },
});
