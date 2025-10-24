import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import useFirebaseStore from "../stores/firebaseStore";
import { colors, spacing, typography } from "../styles/tokens";
import {
  formatMessageTime,
  getAvatarColor,
  getInitials,
} from "../utils/helpers";

/**
 * MessageBubble - Display a message in a chat
 * @param {Object} message - Message object
 * @param {boolean} isSent - Whether message was sent by current user
 * @param {boolean} isGroup - Whether this is a group conversation
 * @param {boolean} showTimestamp - Whether to show timestamp
 */
export default function MessageBubble({
  message,
  isSent,
  isGroup = false,
  showTimestamp = true,
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
                <Text style={[styles.statusIcon, isRead && styles.readIcon]}>
                  {isSending ? "🕐" : isRead ? "✓✓" : "✓"}
                </Text>
              )}
            </View>
          )}
        </View>
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
  readIcon: {
    color: colors.primary.base, // Blue color for read receipts
  },
});
