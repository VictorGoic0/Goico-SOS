/**
 * Design Tokens - React Native
 *
 * Foundational design values for the SOS design system.
 * Adapted from web design system for React Native.
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Primary - Blue palette (main brand color)
  primary: {
    lightest: "#e3f2fd",
    lighter: "#bbdefb",
    light: "#90caf9",
    lightBase: "#64b5f6",
    mediumLight: "#42a5f5",
    base: "#2196f3", // Main brand color
    mediumDark: "#1e88e5",
    dark: "#1976d2",
    darker: "#1565c0",
    darkest: "#0d47a1",
  },

  // Secondary - Purple/Indigo palette (accent color)
  secondary: {
    lightest: "#f3e5f5",
    lighter: "#e1bee7",
    light: "#ce93d8",
    lightBase: "#ba68c8",
    mediumLight: "#ab47bc",
    base: "#9c27b0", // Main accent color
    mediumDark: "#8e24aa",
    dark: "#7b1fa2",
    darker: "#6a1b9a",
    darkest: "#4a148c",
  },

  // Neutral - Gray palette (text, backgrounds, borders)
  neutral: {
    white: "#ffffff",
    lightest: "#fafafa",
    lighter: "#f5f5f5",
    light: "#eeeeee",
    lightBase: "#e0e0e0",
    mediumLight: "#bdbdbd",
    base: "#9e9e9e",
    mediumDark: "#757575",
    dark: "#616161",
    darker: "#424242",
    darkest: "#212121",
    black: "#000000",
  },

  // Semantic colors
  success: {
    light: "#81c784",
    main: "#4caf50",
    dark: "#388e3c",
    contrastText: "#ffffff",
  },

  error: {
    light: "#e57373",
    main: "#f44336",
    dark: "#d32f2f",
    contrastText: "#ffffff",
  },

  warning: {
    light: "#ffb74d",
    main: "#ff9800",
    dark: "#f57c00",
    contrastText: "#000000",
  },

  info: {
    light: "#64b5f6",
    main: "#2196f3",
    dark: "#1976d2",
    contrastText: "#ffffff",
  },

  // Background colors
  background: {
    default: "#fafafa",
    paper: "#ffffff",
    elevated: "#ffffff",
  },

  // Text colors (React Native uses direct color values)
  text: {
    primary: "rgba(0, 0, 0, 0.87)",
    secondary: "rgba(0, 0, 0, 0.6)",
    tertiary: "rgba(0, 0, 0, 0.5)",
    disabled: "rgba(0, 0, 0, 0.38)",
    hint: "rgba(0, 0, 0, 0.38)",
  },

  // Border colors
  border: {
    main: "rgba(0, 0, 0, 0.12)",
    light: "rgba(0, 0, 0, 0.08)",
    dark: "rgba(0, 0, 0, 0.24)",
  },

  // Divider
  divider: "rgba(0, 0, 0, 0.12)",

  // Action colors (for interactive elements)
  action: {
    active: "rgba(0, 0, 0, 0.54)",
    hover: "rgba(0, 0, 0, 0.04)",
    selected: "rgba(0, 0, 0, 0.08)",
    disabled: "rgba(0, 0, 0, 0.26)",
    disabledBackground: "rgba(0, 0, 0, 0.12)",
    focus: "rgba(0, 0, 0, 0.12)",
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font family (React Native defaults to system fonts)
  fontFamily: {
    base: "System", // Uses system default
    ios: "SF Pro Text",
    android: "Roboto",
    mono: "Courier",
  },

  // Font sizes (React Native uses numbers, not rem)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },

  // Font weights (React Native uses strings)
  fontWeight: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // Line heights (React Native uses numbers)
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999, // Fully rounded
};

// ============================================================================
// SHADOWS (React Native uses elevation on Android and shadow props on iOS)
// ============================================================================

export const shadows = {
  none: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
};

// ============================================================================
// Z-INDEX (React Native uses zIndex directly)
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
};

// Default export for convenience
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
};
