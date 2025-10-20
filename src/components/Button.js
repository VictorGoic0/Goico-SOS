import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from "../styles/tokens";

// ============================================================================
// STATIC STYLES - Created once, reused on every render
// ============================================================================

const SIZE_STYLES = {
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.base,
    minHeight: 32,
  },
  md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.base,
    minHeight: 40,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
};

const TEXT_SIZE_STYLES = {
  sm: {
    fontSize: typography.fontSize.sm,
  },
  md: {
    fontSize: typography.fontSize.base,
  },
  lg: {
    fontSize: typography.fontSize.lg,
  },
};

const VARIANT_STYLES = {
  primary: {
    backgroundColor: colors.primary.mediumDark,
    borderWidth: 1,
    borderColor: colors.primary.mediumDark,
  },
  secondary: {
    backgroundColor: colors.secondary.mediumDark,
    borderWidth: 1,
    borderColor: colors.secondary.mediumDark,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary.mediumDark,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },
};

const TEXT_VARIANT_STYLES = {
  primary: {
    color: colors.neutral.white,
  },
  secondary: {
    color: colors.neutral.white,
  },
  outline: {
    color: colors.primary.mediumDark,
  },
  ghost: {
    color: colors.text.primary,
  },
};

/**
 * Button Component - React Native
 *
 * A versatile button component with multiple variants, sizes, and states.
 *
 * @example
 * <Button variant="primary" onPress={handlePress}>
 *   Sign In
 * </Button>
 *
 * @example
 * <Button variant="primary" loading disabled>
 *   Loading...
 * </Button>
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  style = {},
  textStyle = {},
  ...props
}) {
  // Determine if button is disabled
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        SIZE_STYLES[size],
        VARIANT_STYLES[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant !== "ghost" && shadows.sm,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost"
              ? colors.primary.mediumDark
              : colors.neutral.white
          }
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            TEXT_SIZE_STYLES[size],
            TEXT_VARIANT_STYLES[variant],
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});
