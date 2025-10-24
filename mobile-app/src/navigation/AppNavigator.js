import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { auth } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";

// Auth Screens
import LoginScreen from "../screens/LoginScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import SignupScreen from "../screens/SignupScreen";

// Main Screens
import ActionItemsScreen from "../screens/ActionItemsScreen";
import ChatScreen from "../screens/ChatScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import GroupInfoScreen from "../screens/GroupInfoScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";

// Utils
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { colors, spacing, typography } from "../styles/tokens";
import { listenToConversations } from "../utils/conversation";
import { registerForPushNotifications } from "../utils/notifications";
import {
  initializePresence,
  listenToConnectionStatus,
  listenToPresence,
  updatePresence,
} from "../utils/presence";
import { getUserProfile } from "../utils/profile";

const Stack = createNativeStackNavigator();

// Create navigation reference for use outside of navigation context
export const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const setCurrentUser = useFirebaseStore((state) => state.setCurrentUser);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);

  // Update hasUsername when currentUser.username changes
  // Also initialize presence when username is first set (profile creation)
  useEffect(() => {
    if (currentUser?.username) {
      // Only initialize presence if we just got the username (profile was just created)
      if (!hasUsername) {
        initializePresence(currentUser.uid);
      }
      setHasUsername(true);
    } else if (currentUser && !currentUser.username) {
      setHasUsername(false);
    }
  }, [currentUser?.username, currentUser?.uid, hasUsername]);

  // Listen to auth state changes and check for username
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile from Firestore to check if username exists
          const userProfile = await getUserProfile(user.uid);

          if (userProfile && userProfile.username) {
            // User has completed profile setup
            setCurrentUser({
              ...user,
              ...userProfile,
            });
            setHasUsername(true);

            // Initialize presence for this user
            await initializePresence(user.uid);
          } else {
            // User needs to complete profile setup
            setCurrentUser(user);
            setHasUsername(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // If error, assume no profile and show setup screen
          setCurrentUser(user);
          setHasUsername(false);
        } finally {
          setIsCheckingProfile(false);
        }
      } else {
        setCurrentUser(null);
        setHasUsername(false);
        setIsCheckingProfile(false);
      }
    });

    return unsubscribe;
  }, [setCurrentUser]);

  // Listen to presence changes in Realtime Database
  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    const unsubscribe = listenToPresence();
    return unsubscribe;
  }, [currentUser?.uid]);

  // Listen to Firebase connection status
  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    const unsubscribe = listenToConnectionStatus();
    return unsubscribe;
  }, [currentUser?.uid]);

  // Listen to conversations for current user
  useEffect(() => {
    if (!currentUser?.uid || !hasUsername) {
      return;
    }

    const unsubscribe = listenToConversations(currentUser.uid);
    return unsubscribe;
  }, [currentUser?.uid, hasUsername]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    if (!currentUser?.uid || !hasUsername) {
      return;
    }

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // App came to foreground
        updatePresence(currentUser.uid, true);
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        // App went to background
        updatePresence(currentUser.uid, false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [currentUser, hasUsername]);

  // Register for push notifications and save token to Firestore
  useEffect(() => {
    if (!currentUser?.uid || !hasUsername) {
      return;
    }

    const registerNotifications = async () => {
      try {
        const token = await registerForPushNotifications();

        if (token) {
          // Save push token to user's Firestore document
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
            pushToken: token,
          });
          console.log("Push token saved to Firestore:", token);
        }
      } catch (error) {
        console.error("Error registering for push notifications:", error);
      }
    };

    registerNotifications();
  }, [currentUser?.uid, hasUsername]);

  // Show loading screen while checking profile
  if (currentUser && isCheckingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.base} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {currentUser ? (
        hasUsername ? (
          // Main Stack - User is authenticated and has completed profile
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.primary.mediumDark,
              },
              headerTintColor: colors.neutral.white,
              headerTitleStyle: {
                fontWeight: typography.fontWeight.semibold,
              },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "Goico SOS",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: true,
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: "Profile",
                headerShown: true,
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="CreateGroup"
              component={CreateGroupScreen}
              options={{
                title: "Create Group",
                headerShown: true,
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="GroupInfo"
              component={GroupInfoScreen}
              options={{
                title: "Group Info",
                headerShown: true,
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="ActionItems"
              component={ActionItemsScreen}
              options={{
                title: "Action Items",
                headerShown: true,
                headerBackTitle: "Back",
              }}
            />
          </Stack.Navigator>
        ) : (
          // Profile Setup Stack - User is authenticated but needs to complete profile
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </Stack.Navigator>
        )
      ) : (
        // Auth Stack - User is not authenticated
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
});
