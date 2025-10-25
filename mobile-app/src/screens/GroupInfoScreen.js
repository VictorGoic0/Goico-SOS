import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
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
import useFirebaseStore from "../stores/firebaseStore";
import { colors, spacing, typography } from "../styles/tokens";
import { updateGroupConversation } from "../utils/conversation";
import { getAvatarColor, getInitials } from "../utils/helpers";

export default function GroupInfoScreen({ route, navigation }) {
  const { conversationId } = route.params;

  const currentUser = useFirebaseStore((state) => state.currentUser);
  const users = useFirebaseStore((state) => state.users);
  const conversationsMap = useFirebaseStore((state) => state.conversationsMap);

  const conversation = conversationsMap[conversationId];

  const [groupName, setGroupName] = useState(conversation?.groupName || "");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set group name when conversation loads
  useEffect(() => {
    if (conversation?.groupName) {
      setGroupName(conversation.groupName);
    }
    setIsLoading(false);
  }, [conversation]);

  // Pick group photo
  const pickGroupPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to select a group photo."
        );
        return;
      }

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

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!groupName.trim()) {
      Alert.alert("Invalid Group Name", "Please enter a group name.");
      return;
    }

    setIsUpdating(true);

    try {
      const updates = {
        groupName: groupName.trim(),
      };

      // If photo was changed, include it
      if (groupPhoto) {
        updates.imageUri = groupPhoto;
      }

      await updateGroupConversation(conversationId, updates);

      Alert.alert("Success", "Group information updated successfully.");
      setGroupPhoto(null); // Clear the local photo after upload
    } catch (error) {
      console.error("Error updating group:", error);
      Alert.alert("Error", "Failed to update group. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle leave group
  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave "${
        conversation?.groupName || "this group"
      }"? You won't be able to see any messages from this group.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setIsLeaving(true);
            try {
              await leaveGroupConversation(conversationId, currentUser.uid);

              // Navigate back to Home screen
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            } catch (error) {
              console.error("Error leaving group:", error);
              Alert.alert("Error", "Failed to leave group. Please try again.");
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  // Get participants info
  const participants = (conversation?.participants || [])
    .map((userId) => users.find((u) => u.userId === userId))
    .filter(Boolean);

  // Render participant item
  const renderParticipantItem = ({ item }) => (
    <View style={styles.participantItem}>
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

      {/* "You" badge for current user */}
      {item.userId === currentUser.uid && (
        <View style={styles.youBadge}>
          <Text style={styles.youBadgeText}>You</Text>
        </View>
      )}
    </View>
  );

  if (isLoading || !conversation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.base} />
        <Text style={styles.loadingText}>Loading group info...</Text>
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
        {/* Group Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickGroupPhoto}
            activeOpacity={0.7}
          >
            {groupPhoto ? (
              <Image
                source={{ uri: groupPhoto }}
                style={styles.groupPhotoLarge}
                contentFit="cover"
                priority="high"
                cachePolicy="memory-disk"
              />
            ) : conversation.groupImageURL ? (
              <Image
                source={{ uri: conversation.groupImageURL }}
                style={styles.groupPhotoLarge}
                contentFit="cover"
                priority="high"
                cachePolicy="memory-disk"
              />
            ) : (
              <View
                style={[
                  styles.groupPhotoPlaceholder,
                  { backgroundColor: getAvatarColor(conversationId) },
                ]}
              >
                <Text style={styles.groupPhotoPlaceholderText}>👥</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to change photo</Text>
        </View>

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

        {/* Participants Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <Text style={styles.participantCount}>
              {participants.length} members
            </Text>
          </View>

          {/* Participants List */}
          {participants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No participants found</Text>
            </View>
          ) : (
            <FlatList
              data={participants}
              renderItem={renderParticipantItem}
              keyExtractor={(item) => item.userId}
              scrollEnabled={false}
              style={styles.participantList}
            />
          )}
        </View>

        {/* Save Changes Button */}
        <View style={styles.buttonSection}>
          <Button
            onPress={handleSaveChanges}
            disabled={!groupName.trim() || isUpdating}
            loading={isUpdating}
            fullWidth
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </View>
      </ScrollView>

      {/* Leave Group Button (Fixed at bottom) */}
      <View style={styles.dangerButtonContainer}>
        <Button
          onPress={handleLeaveGroup}
          variant="danger"
          fullWidth
          disabled={isLeaving}
          loading={isLeaving}
        >
          {isLeaving ? "Leaving..." : "Leave Group"}
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
  photoSection: {
    alignItems: "center",
    paddingVertical: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  photoButton: {
    marginBottom: spacing[2],
  },
  groupPhotoLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral.lighter,
  },
  groupPhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  groupPhotoPlaceholderText: {
    fontSize: 48,
  },
  photoHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  section: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
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
  participantCount: {
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
  participantList: {
    marginTop: spacing[2],
  },
  participantItem: {
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
  youBadge: {
    backgroundColor: colors.primary.lighter,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.base,
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
  buttonSection: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },
  dangerButtonContainer: {
    padding: spacing[4],
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
