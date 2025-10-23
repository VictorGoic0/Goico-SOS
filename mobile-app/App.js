import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import "./src/config/firebase"; // Initialize Firebase
import AppNavigator, { navigationRef } from "./src/navigation/AppNavigator";

export default function App() {
  // Set up notification response listener (when user taps notification)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { conversationId } = response.notification.request.content.data;

        // Navigate to ChatScreen with conversationId when notification is tapped
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
      <StatusBar style="auto" />
    </>
  );
}
