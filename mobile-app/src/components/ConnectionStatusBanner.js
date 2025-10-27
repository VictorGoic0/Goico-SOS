import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import usePresenceStore from "../stores/presenceStore";
import { colors, spacing, typography } from "../styles/tokens";

/**
 * ConnectionStatusBanner - Shows offline/connecting status globally
 * Displays at the top of the screen on all pages
 */
export default function ConnectionStatusBanner() {
  const isConnected = usePresenceStore((state) => state.isConnected);
  const [wasOffline, setWasOffline] = useState(false);

  // Track connection status for "Connecting" state
  useEffect(() => {
    if (!isConnected) {
      setWasOffline(true);
    } else if (isConnected && wasOffline) {
      // Clear "Connecting" state after 2 seconds when reconnected
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, wasOffline]);

  // Determine connection status message
  const connectionStatus = !isConnected
    ? "Offline"
    : wasOffline
    ? "Connecting"
    : null;

  if (!connectionStatus) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        connectionStatus === "Connecting" && styles.bannerConnecting,
      ]}
    >
      <Text style={styles.text}>{connectionStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.error.main,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerConnecting: {
    backgroundColor: colors.warning.main,
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
});
