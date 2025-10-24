import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Configure how notifications are handled when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get Expo push token
 * @returns {Promise<string|null>} Expo push token or null if failed
 */
export async function registerForPushNotifications() {
  let token = null;

  try {
    // Push notifications are only supported on iOS and Android
    // Web push requires VAPID keys and different setup
    if (Platform.OS === "web") {
      console.log(
        "Push notifications are not supported on web. Real-time updates still work via Firebase listeners."
      );
      return null;
    }

    // iOS simulators cannot receive push notifications (no APNs support)
    // Android emulators CAN receive push notifications (with custom dev build)
    if (!Device.isDevice && Platform.OS === "ios") {
      console.log(
        "Push notifications require a physical iOS device (simulators don't support APNs)"
      );
      return null;
    }

    // Android emulator with custom dev build will work
    if (!Device.isDevice && Platform.OS === "android") {
      console.log(
        "Running on Android emulator - push notifications will work with custom dev build"
      );
      // Continue with registration
    }

    // Request notification permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permission not granted, request it
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permission denied, return null
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "8165c80c-91be-4335-8cea-17a35b612fee",
    });
    token = tokenData.data;

    console.log("Push notification token:", token);

    // Android-specific: Set notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

/**
 * Add notification received listener (when app is in foreground)
 * @param {Function} callback - Function to call when notification is received
 * @returns {Object} Subscription object with remove() method
 */
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps on notification)
 * @param {Function} callback - Function to call when notification is tapped
 * @returns {Object} Subscription object with remove() method
 */
export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Send push notification via backend Vercel endpoint
 * @param {string} conversationId - The conversation ID
 * @param {string} messageId - The message ID
 * @param {string} senderId - The sender's user ID
 * @param {string} senderUsername - The sender's username
 * @param {string} messageText - The message text
 */
export async function sendPushNotification(
  conversationId,
  messageId,
  senderId,
  senderUsername,
  messageText
) {
  const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  try {
    const response = await fetch(`${API_URL}/api/send-notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        messageId,
        senderId,
        senderUsername,
        messageText,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send notification:", response.status);
    }
  } catch (error) {
    console.error("Notification request failed:", error);
    // Don't throw - notifications are non-critical
  }
}
