import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import usePresenceStore from "../stores/presenceStore";
import { colors, spacing, typography } from "../styles/tokens";
import { formatLastSeen, getAvatarColor, getInitials } from "../utils/helpers";

/**
 * UserListItem - Display a user in a list with presence indicator
 * @param {Object} user - User object
 * @param {Function} onPress - Callback when user is pressed
 * @param {boolean} isCurrentUser - Whether this is the current logged-in user
 */
export default function UserListItem({ user, onPress, isCurrentUser = false }) {
  const isOnline = usePresenceStore((state) => state.isUserOnline(user.userId));
  const presenceData = usePresenceStore(
    (state) => state.presenceData[user.userId]
  );

  const initials = getInitials(user.displayName || user.username);
  const avatarColor = getAvatarColor(user.userId);

  return (
    <TouchableOpacity
      style={[styles.container, isCurrentUser && styles.currentUserContainer]}
      onPress={onPress}
      activeOpacity={isCurrentUser ? 1 : 0.7}
      disabled={isCurrentUser}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {user.imageURL ? (
          <Image source={{ uri: user.imageURL }} style={styles.avatar} />
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
        </View>
        <Text style={styles.username} numberOfLines={1}>
          @{user.username}
        </Text>
        {!isOnline && presenceData?.lastSeen && (
          <Text style={styles.lastSeen} numberOfLines={1}>
            {formatLastSeen(presenceData.lastSeen)}
          </Text>
        )}
        {isOnline && (
          <Text style={styles.status} numberOfLines={1}>
            {user.status || "Available"}
          </Text>
        )}
      </View>

      {/* Chevron - hidden for current user */}
      {!isCurrentUser && <Text style={styles.chevron}>›</Text>}
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
  },
  youBadge: {
    marginLeft: spacing[2],
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
    backgroundColor: colors.primary.lighter,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
  },
  username: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[0],
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
