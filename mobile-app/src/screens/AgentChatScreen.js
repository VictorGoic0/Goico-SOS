import React, { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from "react-native";
import { executeAgent } from "../services/aiService";
import { colors, spacing, typography } from "../styles/tokens";
import MessageBubble from "../components/MessageBubble";
import CompactInput from "../components/CompactInput";
import useFirebaseStore from "../stores/firebaseStore";

export default function AgentChatScreen({ route }) {
  const { conversationId } = route.params;
  const currentUser = useFirebaseStore((state) => state.currentUser);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages appear
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSubmit = async () => {
    console.log(
      "handleSubmit called, query:",
      query,
      "processing:",
      processing
    );

    if (!query.trim() || processing) {
      console.log("Bailing early - query empty or already processing");
      return;
    }

    const userQuery = query.trim();
    console.log("Processing query:", userQuery);
    setQuery("");

    // Add user message
    const userMessage = {
      messageId: `user-${Date.now()}`,
      senderId: currentUser.uid,
      senderUsername: currentUser.username,
      text: userQuery,
      timestamp: new Date(),
      status: "delivered",
    };

    console.log("Adding user message:", userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setProcessing(true);

    try {
      console.log("About to call executeAgent...");
      // Add initial agent message that will be updated with streaming
      const agentMessageId = `agent-${Date.now()}`;
      const agentMessage = {
        messageId: agentMessageId,
        senderId: "ai-agent",
        senderUsername: "AI Agent",
        text: "",
        timestamp: new Date(),
        status: "delivered",
      };

      setMessages((prev) => [...prev, agentMessage]);

      await executeAgent(userQuery, conversationId, (chunk, fullText) => {
        // Update agent message with streaming text
        console.log("AgentChatScreen received chunk:", chunk);
        console.log("AgentChatScreen fullText:", fullText);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex]?.senderId === "ai-agent") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              text: fullText,
            };
          }
          return updated;
        });
      });
    } catch (error) {
      console.error("Agent failed:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          messageId: `error-${Date.now()}`,
          senderId: "ai-agent",
          senderUsername: "AI Agent",
          text: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          status: "delivered",
        },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isSent = item.senderId === currentUser.uid;
    const isAI = item.senderId === "ai-agent";
    const showTimestamp =
      index === 0 ||
      (messages[index - 1]?.timestamp &&
        new Date(item.timestamp).getTime() -
          new Date(messages[index - 1].timestamp).getTime() >
          300000);

    return (
      <MessageBubble
        message={item}
        isSent={isSent}
        isAI={isAI}
        isGroup={false}
        showTimestamp={showTimestamp}
        isLastMessage={index === messages.length - 1}
        readBy={[]}
        priority="normal"
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>👋 Welcome to AI Agent</Text>
            <Text style={styles.emptyText}>
              I can help you analyze this conversation. Try asking:
            </Text>
            <View style={styles.examplesContainer}>
              <Text style={styles.examplePrompt}>
                "Show me all action items from last week"
              </Text>
              <Text style={styles.examplePrompt}>
                "What decisions were made?"
              </Text>
              <Text style={styles.examplePrompt}>
                "Summarize this conversation"
              </Text>
            </View>
          </View>
        }
      />

      {/* Typing Indicator */}
      {processing && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={colors.primary.base} />
          <Text style={styles.typingText}>AI Agent is thinking...</Text>
        </View>
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <CompactInput
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSubmit}
          placeholder="Ask the agent anything..."
          disabled={processing}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  messagesContent: {
    padding: spacing[4],
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[6],
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing[4],
  },
  examplesContainer: {
    alignSelf: "stretch",
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing[4],
    marginTop: spacing[2],
  },
  examplePrompt: {
    fontSize: 14,
    color: colors.primary.base,
    fontStyle: "italic",
    marginBottom: spacing[2],
    textAlign: "center",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.default,
  },
  typingText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: "italic",
    marginLeft: spacing[2],
  },
  inputContainer: {
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
