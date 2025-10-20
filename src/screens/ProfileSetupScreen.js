import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import { colors, spacing, typography } from "../styles/tokens";
import { createUserProfile } from "../utils/profile";

export default function ProfileSetupScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null); // URI from image picker
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Username validation (REQUIRED)
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (username.length > 20) {
      newErrors.username = "Username must be less than 20 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Display name is optional, but if provided, validate length
    if (displayName.trim() && displayName.length > 50) {
      newErrors.displayName = "Display name must be less than 50 characters";
    }

    // Bio is optional, but if provided, validate length
    if (bio.trim() && bio.length > 200) {
      newErrors.bio = "Bio must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
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
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create user profile in Firestore
      await createUserProfile({
        username: username.trim().toLowerCase(), // Store lowercase for consistency
        displayName: displayName.trim() || username.trim(), // Use username if no display name
        bio: bio.trim() || null,
        imageUri: profileImage,
      });

      // Navigation will automatically update once currentUser has username
      console.log("✅ Profile created successfully");
    } catch (error) {
      console.error("Profile creation error:", error);

      // Handle specific errors
      if (error.code === "username-taken") {
        setErrors({ username: "This username is already taken" });
      } else if (error.code === "network-error") {
        Alert.alert(
          "Network Error",
          "Please check your connection and try again."
        );
      } else {
        Alert.alert("Error", "Failed to create profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Set up your username to get started
          </Text>
        </View>

        {/* Profile Picture */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handlePickImage}
            disabled={isLoading}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>📷</Text>
                <Text style={styles.placeholderLabel}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.imageHint}>
            Tap to upload profile picture (optional)
          </Text>
        </View>

        {/* Username Input (REQUIRED) */}
        <Input
          label="Username"
          placeholder="johndoe"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            if (errors.username) {
              setErrors({ ...errors, username: null });
            }
          }}
          error={errors.username}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          editable={!isLoading}
          helperText="Required • Unique identifier for your account"
        />

        {/* Display Name Input (OPTIONAL) */}
        <Input
          label="Display Name"
          placeholder="John Doe"
          value={displayName}
          onChangeText={(text) => {
            setDisplayName(text);
            if (errors.displayName) {
              setErrors({ ...errors, displayName: null });
            }
          }}
          error={errors.displayName}
          autoCapitalize="words"
          maxLength={50}
          editable={!isLoading}
          helperText="Optional • How others will see your name"
        />

        {/* Bio Input (OPTIONAL) */}
        <Input
          label="Bio"
          placeholder="Tell us about yourself..."
          value={bio}
          onChangeText={(text) => {
            setBio(text);
            if (errors.bio) {
              setErrors({ ...errors, bio: null });
            }
          }}
          error={errors.bio}
          multiline
          numberOfLines={3}
          maxLength={200}
          editable={!isLoading}
          helperText="Optional • A short description about you"
        />

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        >
          Complete Setup
        </Button>

        {/* Info Note */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            📝 Your username is permanent and cannot be changed later. Choose
            wisely!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    padding: spacing[6],
  },
  header: {
    marginBottom: spacing[8],
    alignItems: "center",
  },
  title: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: spacing[6],
  },
  imageContainer: {
    marginBottom: spacing[2],
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.paper,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.paper,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border.main,
    borderStyle: "dashed",
  },
  placeholderText: {
    fontSize: 40,
    marginBottom: spacing[1],
  },
  placeholderLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  imageHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  submitButton: {
    marginTop: spacing[4],
  },
  infoContainer: {
    marginTop: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.info.light,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.info.main,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.info.dark,
    lineHeight: typography.lineHeight.relaxed,
  },
});
