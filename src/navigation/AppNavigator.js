import { NavigationContainer } from "@react-navigation/native";
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
import ChatScreen from "../screens/ChatScreen";
import HomeScreen from "../screens/HomeScreen";

// Utils
import { colors, spacing, typography } from "../styles/tokens";
import {
  initializePresence,
  listenToPresence,
  updatePresence,
} from "../utils/presence";
import { getUserProfile } from "../utils/profile";

const Stack = createNativeStackNavigator();

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
        console.log("✅ User authenticated:", user.uid);

        try {
          // Fetch user profile from Firestore to check if username exists
          const userProfile = await getUserProfile(user.uid);

          if (userProfile && userProfile.username) {
            // User has completed profile setup
            console.log(
              "✅ User profile found with username:",
              userProfile.username
            );
            setCurrentUser({
              ...user,
              ...userProfile,
            });
            setHasUsername(true);

            // Initialize presence for this user
            await initializePresence(user.uid);
          } else {
            // User needs to complete profile setup
            console.log("⚠️ User profile not found or missing username");
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
        console.log("❌ User signed out");
        setCurrentUser(null);
        setHasUsername(false);
        setIsCheckingProfile(false);
      }
    });

    return unsubscribe;
  }, [setCurrentUser]);

  // Listen to presence changes in Realtime Database
  useEffect(() => {
    const unsubscribe = listenToPresence();
    return unsubscribe;
  }, []);

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

  // Show loading screen while checking profile
  if (currentUser && isCheckingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
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
                title: "Messaging App",
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
