import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import useFirebaseStore from "../stores/firebaseStore";
import useLocalStore from "../stores/localStore";
import { colors, spacing, typography } from "../styles/tokens";
import { getOrCreateConversation } from "../utils/conversation";

export default function ChatScreen({ route, navigation }) {
  const { otherUser } = route.params;

  // Firebase Store
  const currentUser = useFirebaseStore((state) => state.currentUser);

  // Local Store
  const isLoadingConversation = useLocalStore(
    (state) => state.isLoadingConversation
  );
  const setIsLoadingConversation = useLocalStore(
    (state) => state.setIsLoadingConversation
  );

  // Only conversationId needs local state since it's not shared across components
  const [conversationId, setConversationId] = useState(null);

  // Get or create conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      const tempConvId = `${currentUser.uid}_${otherUser.userId}`; // Temp ID for loading state
      setIsLoadingConversation(tempConvId, true);

      try {
        const conversation = await getOrCreateConversation(
          currentUser.uid,
          otherUser.userId,
          currentUser.username,
          otherUser.username
        );

        setConversationId(conversation.conversationId);
        setIsLoadingConversation(conversation.conversationId, false);
      } catch (error) {
        console.error("Error initializing conversation:", error);
        setIsLoadingConversation(tempConvId, false);
      }
    };

    initConversation();
  }, [currentUser, otherUser, setIsLoadingConversation]);

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({
      title: otherUser.displayName || otherUser.username,
    });
  }, [navigation, otherUser]);

  // Get loading state
  const isLoading = isLoadingConversation[conversationId] || false;

  if (isLoading || !conversationId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.base} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>Chat Screen</Text>
        <Text style={styles.placeholderSubtext}>
          Conversation with {otherUser.displayName || otherUser.username}
        </Text>
        <Text style={styles.placeholderSubtext}>
          Conversation ID: {conversationId}
        </Text>
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
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[8],
  },
  placeholderText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  placeholderSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing[2],
  },
});
