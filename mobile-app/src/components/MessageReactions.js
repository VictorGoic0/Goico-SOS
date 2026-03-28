import React, { useMemo } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { addReaction, removeReaction } from "../utils/reactions";
import { spacing, typography } from "../styles/tokens";

/**
 * Aggregate reactions by emoji: [{ emoji, count, userIds }]
 */
function aggregateReactions(reactions) {
  const byEmoji = new Map();
  for (const reaction of reactions || []) {
    const key = reaction.emoji;
    if (!byEmoji.has(key)) {
      byEmoji.set(key, { emoji: key, count: 0, userIds: [] });
    }
    const entry = byEmoji.get(key);
    entry.count += 1;
    entry.userIds.push(reaction.userId);
  }
  return Array.from(byEmoji.values());
}

/**
 * MessageReactions - Display reaction pills below message; tap to add/remove, long-press to see who reacted.
 * @param {string} conversationId
 * @param {string} messageId
 * @param {string} currentUserId
 * @param {Array<{ userId: string, emoji: string, timestamp?: object }>} reactions
 * @param {Object} usersMap - Map of userId -> { displayName?, username }
 */
export default function MessageReactions({
  conversationId,
  messageId,
  currentUserId,
  reactions = [],
  usersMap = {},
}) {
  const { colors } = useTheme();

  const aggregated = useMemo(() => aggregateReactions(reactions), [reactions]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: spacing[1],
          gap: spacing[2],
        },
        pill: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing[1],
          paddingHorizontal: spacing[2],
          borderRadius: 12,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        pillText: {
          fontSize: typography.fontSize.sm,
          color: colors.text,
        },
        count: {
          marginLeft: spacing[1],
          fontSize: typography.fontSize.xs,
          color: colors.textSecondary,
        },
      }),
    [colors]
  );

  const handlePress = async (emoji) => {
    const hasReacted = reactions.some(
      (reaction) =>
        reaction.userId === currentUserId && reaction.emoji === emoji
    );
    try {
      await (hasReacted
        ? removeReaction(conversationId, messageId, currentUserId, emoji)
        : addReaction(conversationId, messageId, currentUserId, emoji));
    } catch (err) {
      console.error("Reaction update failed:", err);
    }
  };

  const showWhoReacted = (emoji, userIds) => {
    const names = userIds
      .map((uid) => usersMap[uid]?.displayName || usersMap[uid]?.username || uid)
      .filter(Boolean);
    Alert.alert(emoji, names.length ? names.join(", ") : "No names");
  };

  if (aggregated.length === 0) return null;

  return (
    <View style={styles.container}>
      {aggregated.map(({ emoji, count, userIds }) => (
        <TouchableOpacity
          key={emoji}
          style={styles.pill}
          onPress={() => handlePress(emoji)}
          onLongPress={() => showWhoReacted(emoji, userIds)}
          activeOpacity={0.7}
        >
          <Text style={styles.pillText}>{emoji}</Text>
          {count > 1 && <Text style={styles.count}>{count}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}
