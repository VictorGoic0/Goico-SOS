import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import useFirebaseStore from "../stores/firebaseStore";
import { colors, spacing, typography } from "../styles/tokens";
import {
  formatMessageTime,
  formatTimestamp,
  getAvatarColor,
  getInitials,
} from "../utils/helpers";

/**
 * MessageBubble - Display a message in a chat
 * @param {Object} message - Message object
 * @param {boolean} isSent - Whether message was sent by current user
 * @param {boolean} isGroup - Whether this is a group conversation
 * @param {boolean} showTimestamp - Whether to show timestamp
 * @param {boolean} isLastMessage - Whether this is the last message (for read indicator)
 * @param {Array} readBy - Array of user IDs who have read the message (for group chats, excluding sender)
 */
export default function MessageBubble({
  message,
  isSent,
  isGroup = false,
  showTimestamp = true,
  isLastMessage = false,
  readBy = [],
}) {
  // Get sender info from usersMap (for group chats)
  const usersMap = useFirebaseStore((state) => state.usersMap);
  const sender = usersMap[message.senderId];

  // Show sender info only for group chats AND received messages (not sent by current user)
  const showSenderInfo = isGroup && !isSent;
  const isRead = message.status === "read";
  const isSending = message.status === "sending";

  return (
    <View
      style={[
        styles.container,
        isSent ? styles.sentContainer : styles.receivedContainer,
      ]}
    >
      {/* Show sender profile photo for group messages from others */}
      {showSenderInfo && (
        <View style={styles.senderAvatarContainer}>
          {sender?.imageURL ? (
            <Image
              source={{ uri: sender.imageURL }}
              style={styles.senderAvatar}
              contentFit="cover"
              priority="normal"
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              style={[
                styles.senderAvatarPlaceholder,
                { backgroundColor: getAvatarColor(message.senderId) },
              ]}
            >
              <Text style={styles.senderAvatarText}>
                {getInitials(sender?.displayName || sender?.username || "?")}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Message bubble and content */}
      <View style={styles.bubbleWrapper}>
        {/* Show sender name for group messages from others */}
        {showSenderInfo && (
          <Text style={styles.senderName}>
            {sender?.displayName || sender?.username || "Unknown"}
          </Text>
        )}

        <View
          style={[
            styles.bubble,
            isSent ? styles.sentBubble : styles.receivedBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isSent ? styles.sentText : styles.receivedText,
            ]}
          >
            {message.text}
          </Text>

          {showTimestamp && (
            <View style={styles.metaContainer}>
              <Text
                style={[
                  styles.timestamp,
                  isSent ? styles.sentTimestamp : styles.receivedTimestamp,
                ]}
              >
                {message.timestamp
                  ? formatMessageTime(message.timestamp)
                  : "Sending..."}
              </Text>

              {isSent && (
                <Text style={styles.statusIcon}>{isSending ? "🕐" : "✓"}</Text>
              )}
            </View>
          )}
        </View>

        {/* Show "Read X ago" indicator outside bubble for last sent message that has been read */}
        {isSent && isRead && message.readAt && isLastMessage && !isGroup && (
          <Text style={styles.readIndicator}>
            Read {formatTimestamp(message.readAt)}
          </Text>
        )}

        {/* Show group chat read receipts with mini avatars */}
        {isSent && isGroup && readBy.length > 0 && isLastMessage && (
          <TouchableOpacity
            style={styles.groupReadIndicator}
            onLongPress={() => {
              // Show full names on long press (filter out any users no longer in system)
              const readerNames = readBy
                .map((userId) => {
                  const user = usersMap[userId];
                  return user?.displayName || user?.username;
                })
                .filter(Boolean) // Remove undefined users
                .join(", ");

              if (readerNames) {
                Alert.alert("Read by", readerNames);
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.groupReadText}>
              Read {message.readAt && formatTimestamp(message.readAt)}
            </Text>
            <View style={styles.miniAvatarsContainer}>
              {readBy.slice(0, 3).map((userId, index) => {
                const user = usersMap[userId];
                return user?.imageURL ? (
                  <Image
                    key={userId}
                    source={{ uri: user.imageURL }}
                    style={[
                      styles.miniAvatar,
                      index > 0 && styles.miniAvatarOverlap,
                    ]}
                    contentFit="cover"
                    priority="normal"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View
                    key={userId}
                    style={[
                      styles.miniAvatarPlaceholder,
                      { backgroundColor: getAvatarColor(userId) },
                      index > 0 && styles.miniAvatarOverlap,
                    ]}
                  >
                    <Text style={styles.miniAvatarText}>
                      {getInitials(user?.displayName || user?.username || "?")}
                    </Text>
                  </View>
                );
              })}
              {readBy.length > 3 && (
                <View
                  style={[
                    styles.miniAvatarPlaceholder,
                    styles.miniAvatarOverlap,
                    { backgroundColor: colors.neutral.dark },
                  ]}
                >
                  <Text style={styles.miniAvatarText}>
                    +{readBy.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: spacing[1],
    marginHorizontal: spacing[4],
  },
  sentContainer: {
    justifyContent: "flex-end",
  },
  receivedContainer: {
    justifyContent: "flex-start",
  },
  // Sender avatar (for group messages)
  senderAvatarContainer: {
    marginRight: spacing[2],
    marginTop: spacing[4], // Align with sender name
  },
  senderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral.lighter,
  },
  senderAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  senderAvatarText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  // Bubble wrapper (includes sender name and bubble)
  bubbleWrapper: {
    maxWidth: "75%",
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    marginLeft: spacing[1],
  },
  bubble: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 16,
  },
  sentBubble: {
    backgroundColor: colors.primary.base,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: colors.neutral.lighter,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  sentText: {
    color: colors.neutral.white,
  },
  receivedText: {
    color: colors.text.primary,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[1],
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
  },
  sentTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  receivedTimestamp: {
    color: colors.text.tertiary,
  },
  statusIcon: {
    fontSize: typography.fontSize.xs,
    marginLeft: spacing[1],
    color: "rgba(255, 255, 255, 0.8)",
  },
  readIndicator: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing[1],
    marginRight: 0,
    alignSelf: "flex-end",
  },
  groupReadIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[1],
    alignSelf: "flex-end",
  },
  groupReadText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginRight: spacing[2],
  },
  miniAvatarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.background.default,
  },
  miniAvatarPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.background.default,
  },
  miniAvatarText: {
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  miniAvatarOverlap: {
    marginLeft: -6, // Overlap avatars slightly
  },
});
