import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import { db } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import { colors, spacing, typography } from "../styles/tokens";
import { getAvatarColor, getInitials } from "../utils/helpers";

export default function CreateGroupScreen({ navigation }) {
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const users = useFirebaseStore((state) => state.users);
  const setUsers = useFirebaseStore((state) => state.setUsers);

  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      },
      (error) => {
        console.error("Error fetching users:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setUsers]);

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Filter out current user from the list
  const availableUsers = users.filter(
    (user) => user.userId !== currentUser.uid
  );

  // Check if user is selected
  const isUserSelected = (userId) => selectedUsers.includes(userId);

  const renderUserItem = ({ item }) => {
    const isSelected = isUserSelected(item.userId);

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleUserSelection(item.userId)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.imageURL ? (
            <Image source={{ uri: item.imageURL }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: getAvatarColor(item.userId) },
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitials(item.displayName || item.username)}
              </Text>
            </View>
          )}
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <Text style={styles.displayName} numberOfLines={1}>
            {item.displayName || item.username}
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            @{item.username}
          </Text>
        </View>

        {/* Checkbox */}
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.base} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Group Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter group name..."
            value={groupName}
            onChangeText={setGroupName}
            maxLength={50}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        {/* Add Group Photo Button (Optional) */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => {
              // TODO: Implement image picker for group photo
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.photoButtonText}>📷 Add Group Photo</Text>
            <Text style={styles.photoButtonSubtext}>(Optional)</Text>
          </TouchableOpacity>
        </View>

        {/* Select Participants Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Participants</Text>
            <Text style={styles.selectedCount}>
              {selectedUsers.length} selected
            </Text>
          </View>

          {/* User List */}
          {availableUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No other users found</Text>
            </View>
          ) : (
            <FlatList
              data={availableUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.userId}
              scrollEnabled={false}
              style={styles.userList}
            />
          )}
        </View>
      </ScrollView>

      {/* Create Group Button (Fixed at bottom) */}
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => {
            // TODO: Implement create group functionality
            console.log("Create group:", { groupName, selectedUsers });
          }}
          disabled={!groupName.trim() || selectedUsers.length < 2}
          fullWidth
        >
          Create Group Chat
        </Button>
      </View>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing[6],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  selectedCount: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.base,
    fontWeight: typography.fontWeight.semibold,
  },
  input: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginTop: spacing[2],
  },
  photoButton: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: spacing[4],
    alignItems: "center",
    justifyContent: "center",
  },
  photoButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  photoButtonSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  userList: {
    marginTop: spacing[2],
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[3],
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  avatarContainer: {
    marginRight: spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.lighter,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  displayName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  username: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.neutral.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary.base,
    borderColor: colors.primary.base,
  },
  checkmark: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  emptyContainer: {
    padding: spacing[8],
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
  },
  buttonContainer: {
    padding: spacing[4],
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
