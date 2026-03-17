import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../contexts/ThemeContext";
import useFirebaseStore from "../stores/firebaseStore";
import { colors as tokenColors, spacing, typography } from "../styles/tokens";
import {
  formatMessageTime,
  formatTimestamp,
  getAvatarColor,
  getInitials,
} from "../utils/helpers";
import { addReaction } from "../utils/reactions";
import MarkdownText from "./MarkdownText";
import MessageReactions from "./MessageReactions";
import ReactionPicker from "./ReactionPicker";

/**
 * MessageBubble - Display a message in a chat
 * @param {Object} message - Message object
 * @param {boolean} isSent - Whether message was sent by current user
 * @param {boolean} isGroup - Whether this is a group conversation
 * @param {boolean} showTimestamp - Whether to show timestamp
 * @param {boolean} isLastMessage - Whether this is the last message (for read indicator)
 * @param {Array} readBy - Array of user IDs who have read the message (for group chats, excluding sender)
 * @param {string} priority - Priority level: "high", "normal", or "low"
 * @param {boolean} isAI - Whether this message is from the AI agent
 * @param {string} [conversationId] - Conversation ID (required for reactions)
 */
export default function MessageBubble({
  message,
  isSent,
  isGroup = false,
  showTimestamp = true,
  isLastMessage = false,
  readBy = [],
  priority = "normal",
  isAI = false,
  conversationId,
}) {
  const { colors } = useTheme();
  const usersMap = useFirebaseStore((state) => state.usersMap);
  const currentUserId = useFirebaseStore((state) => state.currentUser?.uid);
  const sender = usersMap[message.senderId];

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const messageId = message.messageId;
  const canReact =
    !!conversationId && !!messageId && !!currentUserId && !isAI;

  // Show sender info only for group chats AND received messages (not sent by current user)
  const showSenderInfo = isGroup && !isSent;
  const isRead = message.status === "read";
  const isSending = message.status === "sending";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          marginVertical: spacing[1],
          marginHorizontal: spacing[4],
        },
        sentContainer: { justifyContent: "flex-end" },
        receivedContainer: { justifyContent: "flex-start" },
        senderAvatarContainer: {
          marginRight: spacing[2],
          marginTop: spacing[4],
        },
        senderAvatar: {
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: colors.skeleton,
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
          color: tokenColors.neutral.white,
        },
        bubbleWrapper: { maxWidth: "75%" },
        senderName: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          color: colors.textSecondary,
          marginBottom: spacing[1],
          marginLeft: spacing[1],
        },
        bubble: {
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[2],
          borderRadius: 16,
        },
        sentBubble: {
          backgroundColor: colors.userBubble,
          borderBottomRightRadius: 4,
        },
        receivedBubble: {
          backgroundColor: colors.messageBubble,
          borderBottomLeftRadius: 4,
        },
        aiBubble: {
          backgroundColor: tokenColors.ai.main,
          borderBottomLeftRadius: 4,
        },
        highPriorityBubble: {
          borderWidth: 2,
          borderColor: colors.statusBusy,
        },
        priorityBadge: {
          backgroundColor: colors.statusBusy,
          paddingHorizontal: spacing[2],
          paddingVertical: spacing[1],
          borderRadius: 4,
          marginBottom: spacing[2],
          alignSelf: "flex-start",
        },
        priorityText: {
          color: tokenColors.neutral.white,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.bold,
        },
        messageText: {
          fontSize: typography.fontSize.base,
          lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
        },
        sentText: { color: colors.userBubbleText },
        receivedText: { color: colors.text },
        aiText: { color: tokenColors.neutral.white },
        metaContainer: {
          flexDirection: "row",
          alignItems: "center",
          marginTop: spacing[1],
        },
        timestamp: { fontSize: typography.fontSize.xs },
        sentTimestamp: { color: "rgba(255, 255, 255, 0.8)" },
        receivedTimestamp: { color: colors.textSecondary },
        aiTimestamp: { color: "rgba(255, 255, 255, 0.8)" },
        statusIcon: {
          fontSize: typography.fontSize.xs,
          marginLeft: spacing[1],
          color: "rgba(255, 255, 255, 0.8)",
        },
        readIndicator: {
          fontSize: typography.fontSize.xs,
          color: colors.textSecondary,
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
          color: colors.textSecondary,
          marginRight: spacing[2],
        },
        miniAvatarsContainer: { flexDirection: "row", alignItems: "center" },
        miniAvatar: {
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.background,
        },
        miniAvatarPlaceholder: {
          width: 16,
          height: 16,
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.background,
        },
        miniAvatarText: {
          fontSize: 8,
          fontWeight: typography.fontWeight.bold,
          color: tokenColors.neutral.white,
        },
        miniAvatarOverlap: { marginLeft: -6 },
      }),
    [colors]
  );

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

        <TouchableOpacity
          style={[
            styles.bubble,
            isSent
              ? styles.sentBubble
              : isAI
              ? styles.aiBubble
              : styles.receivedBubble,
            priority === "high" && styles.highPriorityBubble,
          ]}
          onLongPress={canReact ? () => setShowReactionPicker(true) : undefined}
          activeOpacity={1}
          delayLongPress={400}
        >
          {/* High priority badge */}
          {priority === "high" && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>🔴 High Priority</Text>
            </View>
          )}

          {isAI ? (
            <MarkdownText textStyle={styles.aiText}>
              {message.text}
            </MarkdownText>
          ) : (
            <Text
              style={[
                styles.messageText,
                isSent ? styles.sentText : styles.receivedText,
              ]}
            >
              {message.text}
            </Text>
          )}

          {showTimestamp && (
            <View style={styles.metaContainer}>
              <Text
                style={[
                  styles.timestamp,
                  isSent
                    ? styles.sentTimestamp
                    : isAI
                    ? styles.aiTimestamp
                    : styles.receivedTimestamp,
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
        </TouchableOpacity>

        {/* Message reactions (tap to add/remove, long-press to see who reacted) */}
        {canReact && (
          <MessageReactions
            conversationId={conversationId}
            messageId={messageId}
            currentUserId={currentUserId}
            reactions={message.reactions}
            usersMap={usersMap}
          />
        )}

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
                    { backgroundColor: colors.skeleton },
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

      <ReactionPicker
        visible={showReactionPicker}
        onSelect={(emoji) => {
          addReaction(conversationId, messageId, currentUserId, emoji).catch(
            (err) => console.error("Add reaction failed:", err)
          );
          setShowReactionPicker(false);
        }}
        onClose={() => setShowReactionPicker(false)}
      />
    </View>
  );
}
