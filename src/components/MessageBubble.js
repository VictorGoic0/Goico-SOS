import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../styles/tokens";
import { formatMessageTime } from "../utils/helpers";

/**
 * MessageBubble - Display a message in a chat
 * @param {Object} message - Message object
 * @param {boolean} isSent - Whether message was sent by current user
 * @param {boolean} showTimestamp - Whether to show timestamp
 */
export default function MessageBubble({
  message,
  isSent,
  showTimestamp = true,
}) {
  const isDelivered =
    message.status === "delivered" || message.status === "read";
  const isSending = message.status === "sending";

  return (
    <View
      style={[
        styles.container,
        isSent ? styles.sentContainer : styles.receivedContainer,
      ]}
    >
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
              <Text style={styles.statusIcon}>
                {isSending ? "🕐" : isDelivered ? "✓✓" : "✓"}
              </Text>
            )}
          </View>
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
  bubble: {
    maxWidth: "75%",
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
});
