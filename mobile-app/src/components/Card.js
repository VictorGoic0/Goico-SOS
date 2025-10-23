import React from "react";
import { StyleSheet, View } from "react-native";
import { borderRadius, colors, shadows, spacing } from "../styles/tokens";

// ============================================================================
// STATIC STYLES - Created once, reused on every render
// ============================================================================

const VARIANT_STYLES = {
  elevated: {
    ...shadows.base,
    backgroundColor: colors.background.paper,
    borderWidth: 0,
  },
  outlined: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  flat: {
    backgroundColor: colors.background.default,
    borderWidth: 0,
  },
};

const PADDING_STYLES = {
  none: {
    padding: 0,
  },
  sm: {
    padding: spacing[4],
  },
  md: {
    padding: spacing[6],
  },
  lg: {
    padding: spacing[8],
  },
};

/**
 * Card Component - React Native
 *
 * A versatile container component for grouping related content.
 *
 * @example
 * <Card>Content here</Card>
 *
 * @example
 * <Card variant="outlined">Content here</Card>
 *
 * @example
 * <Card variant="flat" padding="lg">Content here</Card>
 */
export default function Card({
  children,
  variant = "elevated",
  padding = "md",
  style = {},
  ...props
}) {
  return (
    <View
      style={[
        styles.card,
        VARIANT_STYLES[variant],
        PADDING_STYLES[padding],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
  },
});
