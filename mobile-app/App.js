import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import "./src/config/firebase"; // Initialize Firebase
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import AppNavigator, { navigationRef } from "./src/navigation/AppNavigator";

function AppContent() {
  const { isDark } = useTheme();
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { conversationId } = response.notification.request.content.data;
        if (conversationId && navigationRef.isReady()) {
          navigationRef.navigate("Chat", { conversationId });
        }
      }
    );
    return () => subscription.remove();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
