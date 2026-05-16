import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { extractDecisions } from "../services/aiService";
import { colors as tokenColors, spacing, typography, borderRadius } from "../styles/tokens";

export default function DecisionsScreen({ route }) {
  const { colors } = useTheme();
  const { conversationId } = route.params;
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadDecisions = async () => {
      try {
        setLoading(true);
        const result = await extractDecisions(conversationId);
        if (!ignore) {
          setDecisions(result.decisions || []);
        }
      } catch (error) {
        if (!ignore) console.error("Failed to load decisions:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadDecisions();

    return () => {
      ignore = true;
    };
  }, [conversationId]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        listContent: { padding: spacing.md },
        item: {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginBottom: spacing.md,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        header: {
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: spacing.sm,
        },
        confidenceBadge: {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: borderRadius.full,
        },
        confidenceText: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          color: tokenColors.neutral.white,
          textTransform: "uppercase",
        },
        decision: {
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text,
          marginBottom: spacing.lg,
          lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
        },
        metaContainer: { marginBottom: spacing.md },
        label: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: spacing.xs / 2,
        },
        participants: {
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.normal * typography.fontSize.base,
        },
        timestamp: {
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
        },
        context: {
          fontSize: typography.fontSize.base,
          color: colors.text,
          lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
        },
        loading: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        },
        loadingText: {
          marginTop: spacing.md,
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
        },
        emptyContainer: {
          alignItems: "center",
          paddingVertical: spacing.xl * 2,
          paddingHorizontal: spacing.lg,
        },
        emptyText: {
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text,
          marginBottom: spacing.sm,
        },
        emptySubtext: {
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: typography.lineHeight.relaxed,
        },
      }),
    [colors]
  );

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case "high":
        return tokenColors.success.main;
      case "medium":
        return tokenColors.warning.main;
      default:
        return tokenColors.neutral.base;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.header}>
        <View
          style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(item.confidence) },
          ]}
        >
          <Text style={styles.confidenceText}>{item.confidence}</Text>
        </View>
      </View>

      <Text style={styles.decision}>{item.decision}</Text>

      <View style={styles.metaContainer}>
        <Text style={styles.label}>Participants:</Text>
        <Text style={styles.participants}>{item.participants.join(", ")}</Text>
      </View>

      {item.timestamp && (
        <View style={styles.metaContainer}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      )}

      <View style={styles.metaContainer}>
        <Text style={styles.label}>Context:</Text>
        <Text style={styles.context}>{item.context}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={tokenColors.primary.base} />
        <Text style={styles.loadingText}>Analyzing decisions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={decisions}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No decisions found</Text>
            <Text style={styles.emptySubtext}>
              Decisions will appear here when the team reaches conclusions in
              the conversation.
            </Text>
          </View>
        }
      />
    </View>
  );
}
