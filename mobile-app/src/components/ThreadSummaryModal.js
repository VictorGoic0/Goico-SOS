import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import {
  colors as tokenColors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../styles/tokens";
import MarkdownText from "./MarkdownText";

export default function ThreadSummaryModal({
  visible,
  onClose,
  summary,
  loading,
}) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        },
        modal: {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          padding: spacing[5],
          width: "90%",
          maxHeight: "70%",
          ...shadows.lg,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing[4],
        },
        title: {
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text,
        },
        closeButton: {
          fontSize: 24,
          color: colors.textSecondary,
        },
        content: { maxHeight: 400 },
        summaryText: {
          fontSize: typography.fontSize.base,
          lineHeight: 24,
          color: colors.text,
        },
        errorText: {
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          textAlign: "center",
        },
      }),
    [colors]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Thread Summary</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {loading ? (
              <ActivityIndicator size="large" color={tokenColors.primary.base} />
            ) : summary ? (
              <MarkdownText textStyle={styles.summaryText}>
                {summary}
              </MarkdownText>
            ) : (
              <Text style={styles.errorText}>No summary available</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
