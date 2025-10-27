import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { executeAgent } from "../services/aiService";
import { colors, spacing, typography, borderRadius } from "../styles/tokens";

export default function AgentChatScreen({ route }) {
  const { conversationId } = route.params;
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages appear
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSubmit = async () => {
    if (!query.trim() || processing) return;

    const userQuery = query.trim();
    setQuery("");
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuery,
      },
    ]);

    setProcessing(true);
    let agentResponse = "";

    try {
      await executeAgent(userQuery, conversationId, (chunk, fullText) => {
        agentResponse = fullText;
        // Update UI with streaming chunks
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];

          if (lastMessage?.role === "agent") {
            lastMessage.content = fullText;
          } else {
            updated.push({ role: "agent", content: fullText });
          }

          return updated;
        });
      });
    } catch (error) {
      console.error("Agent failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === "user";
    return (
      <View
        key={index}
        style={[
          styles.message,
          isUser ? styles.userMessage : styles.agentMessage,
        ]}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.roleLabel}>{isUser ? "You" : "🤖 AI Agent"}</Text>
        </View>
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.agentMessageText,
          ]}
        >
          {message.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>👋 Welcome to AI Agent</Text>
            <Text style={styles.emptyText}>
              Ask me anything about this conversation! I can:
            </Text>
            <View style={styles.capabilitiesList}>
              <Text style={styles.capability}>
                • Search and analyze messages
              </Text>
              <Text style={styles.capability}>• Extract action items</Text>
              <Text style={styles.capability}>
                • Categorize information by person
              </Text>
              <Text style={styles.capability}>• Generate summary reports</Text>
            </View>
            <Text style={styles.examplePrompt}>
              Try: "Show me all action items from last week grouped by person"
            </Text>
          </View>
        ) : (
          messages.map(renderMessage)
        )}
        {processing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={colors.primary.base} />
            <Text style={styles.processingText}>Agent is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ask the agent anything..."
          placeholderTextColor={colors.neutral.mediumLight}
          style={styles.input}
          multiline
          maxLength={500}
          editable={!processing}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={processing || !query.trim()}
          style={[
            styles.sendButton,
            (processing || !query.trim()) && styles.sendButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.sendButtonText,
              (processing || !query.trim()) && styles.sendButtonTextDisabled,
            ]}
          >
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.lightest,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.darkest,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.dark,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.relaxed,
  },
  capabilitiesList: {
    alignSelf: "stretch",
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  capability: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.darker,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.relaxed,
  },
  examplePrompt: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.base,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: typography.lineHeight.relaxed,
  },
  message: {
    marginBottom: spacing.md,
    maxWidth: "85%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary.base,
    borderRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.xs,
    padding: spacing.md,
  },
  agentMessage: {
    alignSelf: "flex-start",
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.xs,
    padding: spacing.md,
    shadowColor: colors.neutral.darkest,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    marginBottom: spacing.xs,
  },
  roleLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.mediumDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed,
  },
  userMessageText: {
    color: colors.neutral.white,
  },
  agentMessageText: {
    color: colors.neutral.darkest,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  processingText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.mediumDark,
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light,
  },
  input: {
    flex: 1,
    backgroundColor: colors.neutral.lightest,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.neutral.darkest,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary.base,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral.mediumLight,
  },
  sendButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  sendButtonTextDisabled: {
    color: colors.neutral.lighter,
  },
});
