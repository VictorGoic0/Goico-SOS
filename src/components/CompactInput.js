import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, spacing, typography } from "../styles/tokens";

/**
 * CompactInput - Compact input for chat interfaces
 *
 * A streamlined input component designed for inline use in chat/messaging UIs.
 * No labels, minimal styling, tight integration with action buttons.
 *
 * @example
 * <CompactInput
 *   value={message}
 *   onChangeText={setMessage}
 *   placeholder="Type a message..."
 *   onSubmit={handleSend}
 *   submitLabel="Send"
 * />
 */
export default function CompactInput({
  value,
  onChangeText,
  placeholder = "Type a message...",
  onSubmit,
  submitLabel = "Send",
  disabled = false,
  maxLength = 1000,
  multiline = true,
  autoFocus = false,
  submitDisabled = false,
  isSubmitting = false,
  style = {},
  inputStyle = {},
  buttonStyle = {},
  ...props
}) {
  const canSubmit =
    !submitDisabled && !disabled && !isSubmitting && value.trim();

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        editable={!disabled && !isSubmitting}
        multiline={multiline}
        maxLength={maxLength}
        autoFocus={autoFocus}
        style={[styles.input, inputStyle]}
        {...props}
      />
      <TouchableOpacity
        style={[
          styles.submitButton,
          !canSubmit && styles.submitButtonDisabled,
          buttonStyle,
        ]}
        onPress={onSubmit}
        disabled={!canSubmit}
        activeOpacity={0.7}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? "..." : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing[3],
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background.default,
    borderRadius: 20,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  submitButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral.mediumLight,
  },
  submitButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
