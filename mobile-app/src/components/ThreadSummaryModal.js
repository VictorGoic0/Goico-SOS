import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { tokens } from "../styles/tokens";

export default function ThreadSummaryModal({
  visible,
  onClose,
  summary,
  loading,
}) {
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
              <ActivityIndicator
                size="large"
                color={tokens.colors.primary.base}
              />
            ) : summary ? (
              <Text style={styles.summaryText}>{summary}</Text>
            ) : (
              <Text style={styles.errorText}>No summary available</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: tokens.colors.background.paper,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing[5],
    width: "90%",
    maxHeight: "70%",
    ...tokens.shadows.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.spacing[4],
  },
  title: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: tokens.colors.neutral.mediumDark,
  },
  content: {
    maxHeight: 400,
  },
  summaryText: {
    fontSize: tokens.typography.fontSize.base,
    lineHeight: 24,
    color: tokens.colors.text.primary,
  },
  errorText: {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.neutral.base,
    textAlign: "center",
  },
});
