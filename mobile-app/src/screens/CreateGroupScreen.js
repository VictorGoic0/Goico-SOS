import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import Button from "../components/Button";
import { useTheme } from "../contexts/ThemeContext";
import useFirebaseStore from "../stores/firebaseStore";
import { colors as tokenColors, spacing, typography } from "../styles/tokens";
import {
  createGroupConversation,
  updateGroupConversation,
} from "../utils/conversation";
import { getAvatarColor, getInitials } from "../utils/helpers";

export default function CreateGroupScreen({ navigation }) {
  const { colors } = useTheme();
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const users = useFirebaseStore((state) => state.users);
  const usersLoading = useFirebaseStore((state) => state.usersLoading);
  // Filter out current user from the list
  const visibleUsers = users.filter((user) => user.userId !== currentUser.uid);

  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Pick group photo (Task 27)
  const pickGroupPhoto = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to select a group photo.",
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setGroupPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking group photo:", error);
      Alert.alert("Error", "Failed to select photo. Please try again.");
    }
  };

  // Handle create group button press (Tasks 26-29)
  const handleCreateGroup = async () => {
    // Task 26: Validate group name and selected users
    if (!groupName.trim()) {
      Alert.alert("Invalid Group Name", "Please enter a group name.");
      return;
    }

    if (selectedUsers.length < 2) {
      Alert.alert(
        "Not Enough Participants",
        "Please select at least 2 users to create a group.",
      );
      return;
    }

    setIsCreating(true);

    try {
      // Task 28: Create group conversation first (without photo)
      const conversationId = await createGroupConversation(
        groupName.trim(),
        selectedUsers,
        null, // No photo URL yet
      );

      // Task 27: If group photo selected, update conversation with photo
      if (groupPhoto) {
        try {
          // Use updateGroupConversation to upload and update in one call
          await updateGroupConversation(conversationId, {
            imageUri: groupPhoto, // Will be uploaded to conversation-files/{conversationId}/group-photo.jpg
          });
        } catch (uploadError) {
          console.error("Error uploading group photo:", uploadError);
          // Continue without photo if upload fails
          Alert.alert(
            "Photo Upload Failed",
            "Group was created but photo upload failed.",
          );
        }
      }

      // Task 29: Navigate to ChatScreen with new conversationId
      navigation.replace("Chat", {
        conversationId,
        isGroup: true,
        groupName: groupName.trim(),
      });
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please try again.");
      setIsCreating(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        },
        loadingText: {
          marginTop: spacing[4],
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
        },
        scrollView: { flex: 1 },
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
          color: colors.text,
        },
        selectedCount: {
          fontSize: typography.fontSize.sm,
          color: tokenColors.primary.base,
          fontWeight: typography.fontWeight.semibold,
        },
        input: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: spacing[3],
          fontSize: typography.fontSize.base,
          color: colors.text,
          marginTop: spacing[2],
        },
        photoButton: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: spacing[4],
          alignItems: "center",
          justifyContent: "center",
        },
        photoButtonText: {
          fontSize: typography.fontSize.base,
          color: colors.text,
          marginBottom: spacing[1],
        },
        photoButtonSubtext: {
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        },
        groupPhotoPreview: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.skeleton,
        },
        userList: { marginTop: spacing[2] },
        userItem: {
          flexDirection: "row",
          alignItems: "center",
          padding: spacing[3],
          backgroundColor: colors.surface,
          borderRadius: 8,
          marginBottom: spacing[2],
          borderWidth: 1,
          borderColor: colors.border,
        },
        avatarContainer: { marginRight: spacing[3] },
        avatar: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.skeleton,
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
          color: tokenColors.neutral.white,
        },
        userInfo: { flex: 1, justifyContent: "center" },
        displayName: {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text,
          marginBottom: spacing[1],
        },
        username: {
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        },
        checkbox: {
          width: 24,
          height: 24,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
        checkboxSelected: {
          backgroundColor: tokenColors.primary.base,
          borderColor: tokenColors.primary.base,
        },
        checkmark: {
          color: tokenColors.neutral.white,
          fontSize: 16,
          fontWeight: typography.fontWeight.bold,
        },
        emptyContainer: { padding: spacing[8], alignItems: "center" },
        emptyText: {
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          textAlign: "center",
        },
        buttonContainer: {
          padding: spacing[4],
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
      }),
    [colors],
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
            <Image
              source={{ uri: item.imageURL }}
              style={styles.avatar}
              contentFit="cover"
              priority="normal"
              cachePolicy="memory-disk"
            />
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

  if (usersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tokenColors.primary.base} />
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
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Add Group Photo Button (Optional) */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickGroupPhoto}
            activeOpacity={0.7}
          >
            {groupPhoto ? (
              <Image
                source={{ uri: groupPhoto }}
                style={styles.groupPhotoPreview}
                contentFit="cover"
                priority="high"
                cachePolicy="memory-disk"
              />
            ) : (
              <>
                <Text style={styles.photoButtonText}>📷 Add Group Photo</Text>
                <Text style={styles.photoButtonSubtext}>(Optional)</Text>
              </>
            )}
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
          {visibleUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No other users found</Text>
            </View>
          ) : (
            <FlatList
              data={visibleUsers}
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
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || selectedUsers.length < 2 || isCreating}
          loading={isCreating}
          fullWidth
        >
          {isCreating ? "Creating Group..." : "Create Group Chat"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
