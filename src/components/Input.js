import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../styles/tokens";

/**
 * Input Component - React Native
 *
 * A fully-featured input component with label, error/success states,
 * helper text, and password visibility toggle.
 *
 * Note: This component is already optimized - all styles use StyleSheet.create()
 * which React Native caches. No style mappings are recreated on render.
 *
 * @example
 * <Input
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   keyboardType="email-address"
 * />
 *
 * @example
 * <Input
 *   label="Password"
 *   value={password}
 *   onChangeText={setPassword}
 *   secureTextEntry
 *   error="Password must be at least 8 characters"
 * />
 */
export default function Input({
  label,
  value,
  onChangeText,
  error = "",
  success = false,
  helperText = "",
  placeholder = "",
  disabled = false,
  required = false,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  style = {},
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine current state
  const hasError = Boolean(error);
  const hasSuccess = success && !hasError;

  // Determine input type (handle password toggle)
  const isSecure = secureTextEntry && !showPassword;

  const displayHelperText = error || helperText;

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, hasError && styles.labelError]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input wrapper */}
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.text.hint}
          editable={!disabled}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          style={[
            styles.input,
            hasError && styles.inputError,
            hasSuccess && styles.inputSuccess,
            isFocused && !hasError && !hasSuccess && styles.inputFocused,
            disabled && styles.inputDisabled,
            secureTextEntry && styles.inputWithToggle,
          ]}
          {...props}
        />

        {/* Password visibility toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggleButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.toggleIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Helper text or error message */}
      {displayHelperText && (
        <Text
          style={[
            styles.helperText,
            hasError && styles.helperTextError,
            hasSuccess && styles.helperTextSuccess,
          ]}
        >
          {displayHelperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
    width: "100%",
  },
  labelContainer: {
    marginBottom: spacing[1],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  labelError: {
    color: colors.error.main,
  },
  required: {
    color: colors.error.main,
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.neutral.lightBase,
    borderRadius: borderRadius.base,
  },
  inputWithToggle: {
    paddingRight: spacing[10],
  },
  inputFocused: {
    borderColor: colors.primary.base,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error.main,
    borderWidth: 2,
  },
  inputSuccess: {
    borderColor: colors.success.main,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: colors.action.disabledBackground,
    color: colors.text.disabled,
  },
  toggleButton: {
    position: "absolute",
    right: spacing[3],
    padding: spacing[1],
  },
  toggleIcon: {
    fontSize: 20,
  },
  helperText: {
    marginTop: spacing[1],
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  helperTextError: {
    color: colors.error.main,
  },
  helperTextSuccess: {
    color: colors.success.main,
  },
});
