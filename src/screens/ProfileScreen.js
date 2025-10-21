import * as ImagePicker from "expo-image-picker";
import { updateProfile } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import { auth } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import { colors, spacing, typography } from "../styles/tokens";
import { getAvatarColor, getInitials } from "../utils/helpers";
import { updateUserProfile, uploadProfileImage } from "../utils/profile";

export default function ProfileScreen({ navigation }) {
  // Get current user from Firebase store
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const setCurrentUser = useFirebaseStore((state) => state.setCurrentUser);
  const updateUser = useFirebaseStore((state) => state.updateUser);

  // Local state for editable fields
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ""
  );
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [status, setStatus] = useState(currentUser?.status || "Available");
  const [imageURL, setImageURL] = useState(currentUser?.imageURL || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const statusOptions = ["Available", "Busy", "Away"];

  const handleChangePhoto = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to upload a profile picture."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1], // Square crop
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsUploading(true);

        try {
          // Upload image to Firebase Storage
          const downloadURL = await uploadProfileImage(
            currentUser.uid,
            result.assets[0].uri
          );

          // Update local state
          setImageURL(downloadURL);

          // Update Firestore
          await updateUserProfile(currentUser.uid, {
            imageURL: downloadURL,
          });

          // Update Firebase store
          updateUser(currentUser.uid, { imageURL: downloadURL });

          // Also update currentUser in store
          setCurrentUser({
            ...currentUser,
            imageURL: downloadURL,
          });

          Alert.alert("Success", "Profile photo updated successfully!");
        } catch (error) {
          console.error("Error uploading photo:", error);
          Alert.alert("Error", "Failed to upload photo. Please try again.");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSaveChanges = async () => {
    // Validate display name
    if (!displayName.trim()) {
      Alert.alert("Validation Error", "Display name cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      // Update Firestore user document
      await updateUserProfile(currentUser.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        status: status,
      });

      // Update Firebase Auth displayName
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
        });
      }

      // Update Firebase store
      const updates = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        status: status,
      };

      updateUser(currentUser.uid, updates);

      // Also update currentUser in store
      setCurrentUser({
        ...currentUser,
        ...updates,
      });

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      Alert.alert("Error", "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    // TODO: Implement in next subtask
    console.log("Sign out tapped");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          {imageURL ? (
            <Image source={{ uri: imageURL }} style={styles.profilePhoto} />
          ) : (
            <View
              style={[
                styles.profilePhoto,
                styles.placeholderPhoto,
                { backgroundColor: getAvatarColor(currentUser?.userId) },
              ]}
            >
              <Text style={styles.placeholderText}>
                {getInitials(currentUser?.displayName || currentUser?.username)}
              </Text>
            </View>
          )}

          {/* Change Photo Button */}
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={handleChangePhoto}
            disabled={isUploading}
          >
            <Text style={styles.changePhotoText}>
              {isUploading ? "Uploading..." : "Change Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Display Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Display Name</Text>
          <Input
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your display name"
            autoCapitalize="words"
          />
        </View>

        {/* Username (non-editable) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.nonEditableField}>
            <Text style={styles.nonEditableText}>@{currentUser?.username}</Text>
          </View>
        </View>

        {/* Email (non-editable) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.nonEditableField}>
            <Text style={styles.nonEditableText}>{currentUser?.email}</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Bio</Text>
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>
        </View>

        {/* Status Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.statusOption,
                  status === option && styles.statusOptionActive,
                ]}
                onPress={() => setStatus(option)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    status === option && styles.statusOptionTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Changes Button */}
        <Button
          onPress={handleSaveChanges}
          disabled={isSaving || !displayName.trim()}
          style={styles.saveButton}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>

        {/* Sign Out Button */}
        <Button
          onPress={handleSignOut}
          variant="danger"
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    padding: spacing[6],
  },
  photoSection: {
    alignItems: "center",
    marginBottom: spacing[8],
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing[4],
  },
  placeholderPhoto: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  changePhotoButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  changePhotoText: {
    fontSize: typography.fontSize.base,
    color: colors.primary.base,
    fontWeight: typography.fontWeight.semibold,
  },
  fieldContainer: {
    marginBottom: spacing[6],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  nonEditableField: {
    backgroundColor: colors.background.subtle,
    borderRadius: 8,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  nonEditableText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: "right",
    marginTop: spacing[1],
  },
  statusContainer: {
    flexDirection: "row",
    gap: spacing[2],
  },
  statusOption: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.light,
    backgroundColor: colors.background.paper,
    alignItems: "center",
  },
  statusOptionActive: {
    borderColor: colors.primary.base,
    backgroundColor: colors.primary.lighter,
  },
  statusOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  statusOptionTextActive: {
    color: colors.primary.base,
    fontWeight: typography.fontWeight.semibold,
  },
  saveButton: {
    marginTop: spacing[4],
  },
  signOutButton: {
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
});
