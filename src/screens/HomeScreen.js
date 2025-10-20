import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import UserListItem from "../components/UserListItem";
import { db } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import { colors, spacing, typography } from "../styles/tokens";
import { signOutUser } from "../utils/auth";

export default function HomeScreen({ navigation }) {
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const users = useFirebaseStore((state) => state.users);
  const setUsers = useFirebaseStore((state) => state.setUsers);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all users from Firestore
  useEffect(() => {
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          userId: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
        setIsLoading(false);
        setIsRefreshing(false);

        console.log("✅ Users loaded:", usersData.length);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setIsLoading(false);
        setIsRefreshing(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [setUsers]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // The onSnapshot listener will automatically refresh
  };

  const handleUserPress = (user) => {
    // Don't allow chatting with yourself
    if (user.userId === currentUser.uid) {
      return;
    }

    // Navigate to chat screen with this user
    navigation.navigate("Chat", { otherUser: user });
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const renderUser = ({ item }) => {
    const isCurrentUser = item.userId === currentUser.uid;
    return (
      <UserListItem
        user={item}
        onPress={() => handleUserPress(item)}
        isCurrentUser={isCurrentUser}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No users found</Text>
      <Text style={styles.emptySubtext}>
        Be the first to create an account!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Messages</Text>
      <Text style={styles.headerSubtitle}>
        {users.length} {users.length === 1 ? "user" : "users"}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.base} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.userId}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.base]}
            tintColor={colors.primary.base}
          />
        }
        contentContainerStyle={users.length === 0 ? styles.emptyList : null}
      />

      {/* Temporary Sign Out Button - Will move to Profile screen later */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
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
  headerContainer: {
    padding: spacing[4],
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[8],
  },
  emptyText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
  },
  signOutButton: {
    position: "absolute",
    bottom: spacing[6],
    right: spacing[6],
    backgroundColor: colors.error.main,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 24,
    ...{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
  signOutText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
