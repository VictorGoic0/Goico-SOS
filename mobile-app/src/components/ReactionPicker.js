import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { spacing } from "../styles/tokens";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "😮", "😢"];

/**
 * ReactionPicker - Modal with emoji grid; tap emoji to select, tap outside to close.
 * @param {boolean} visible
 * @param {(emoji: string) => void} onSelect - Called when user taps an emoji
 * @param {() => void} onClose - Called when user taps outside or we should close
 */
export default function ReactionPicker({ visible, onSelect, onClose }) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.4)",
        },
        panel: {
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: spacing[3],
          paddingHorizontal: spacing[4],
          minWidth: 220,
        },
        grid: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: spacing[3],
        },
        emojiButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.inputBackground,
        },
        emojiText: {
          fontSize: 24,
        },
      }),
    [colors]
  );

  const handleSelect = (emoji) => {
    onSelect(emoji);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grid}>
            {REACTION_EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.emojiButton}
                onPress={() => handleSelect(emoji)}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
