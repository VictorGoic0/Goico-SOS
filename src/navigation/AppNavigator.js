import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from "react";
import { auth } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";

// Auth Screens
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

// Main Screens (placeholder for now)
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing, typography } from "../styles/tokens";
import { signOutUser } from "../utils/auth";

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

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ User authenticated:", user.uid);
        setCurrentUser(user);
      } else {
        console.log("❌ User signed out");
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, [setCurrentUser]);

  return (
    <NavigationContainer>
      {currentUser ? (
        // Main Stack - User is authenticated
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
