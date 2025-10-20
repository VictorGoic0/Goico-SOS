import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";

// Auth Screens
import LoginScreen from "../screens/LoginScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import SignupScreen from "../screens/SignupScreen";

// Utils
import { colors, spacing, typography } from "../styles/tokens";
import { signOutUser } from "../utils/auth";
import { getUserProfile } from "../utils/profile";

// Temporary Home Screen placeholder
function HomeScreen() {
  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>🎉 You're logged in!</Text>
      <Text style={styles.placeholderText}>
        Home screen will be built in PR #5
      </Text>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const setCurrentUser = useFirebaseStore((state) => state.setCurrentUser);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);

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
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[6],
    backgroundColor: colors.background.default,
  },
  placeholderTitle: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: "center",
  },
  placeholderText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing[8],
  },
  signOutButton: {
    backgroundColor: colors.error.main,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
    borderRadius: 8,
  },
  signOutText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
