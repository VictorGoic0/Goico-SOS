import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { extractActionItems } from "../services/aiService";
import { colors as tokenColors } from "../styles/tokens";

export default function ActionItemsScreen({ route, navigation: _navigation }) {
  const { colors } = useTheme();
  const { conversationId } = route.params;
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        loading: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        },
        loadingText: {
          marginTop: 16,
          fontSize: 16,
          color: colors.textSecondary,
        },
        errorContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          padding: 20,
        },
        errorText: {
          fontSize: 16,
          color: colors.statusBusy,
          textAlign: "center",
          marginBottom: 16,
        },
        retryButton: {
          backgroundColor: tokenColors.primary.base,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        },
        retryButtonText: {
          color: "white",
          fontSize: 16,
          fontWeight: "600",
        },
        listContent: { padding: 16 },
        item: {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
        task: {
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 8,
        },
        assigned: {
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 4,
        },
        deadline: {
          fontSize: 14,
          color: colors.statusBusy,
          marginBottom: 8,
        },
        footer: {
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        },
        statusBadge: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
        },
        statusPending: { backgroundColor: "#FFF3CD" },
        statusCompleted: { backgroundColor: "#D1E7DD" },
        statusText: {
          fontSize: 12,
          fontWeight: "600",
          textTransform: "capitalize",
        },
        context: {
          flex: 1,
          fontSize: 13,
          color: colors.textSecondary,
          fontStyle: "italic",
        },
        emptyContainer: {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 60,
          paddingHorizontal: 40,
        },
        empty: {
          fontSize: 18,
          color: colors.textSecondary,
          textAlign: "center",
          marginBottom: 8,
        },
        emptySubtext: {
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
        },
        refreshButton: {
          backgroundColor: tokenColors.primary.base,
          padding: 16,
          alignItems: "center",
          margin: 16,
          borderRadius: 8,
        },
        refreshText: {
          color: "white",
          fontSize: 16,
          fontWeight: "600",
        },
      }),
    [colors],
  );

  const loadActionItems = useCallback(async (getIgnore = () => false) => {
    try {
      setLoading(true);
      setError(null);
      const result = await extractActionItems(conversationId);
      if (!getIgnore()) {
        setActionItems(result.actionItems || []);
      }
    } catch (error) {
      if (!getIgnore()) {
        console.error("Failed to load action items:", error);
        setError(error.message || "Failed to load action items");
      }
    } finally {
      if (!getIgnore()) setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    let ignore = false;
    loadActionItems(() => ignore);
    return () => {
      ignore = true;
    };
  }, [loadActionItems]);

  const handleRefresh = () => loadActionItems();

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.task}>{item.task}</Text>
      {item.assignedTo && (
        <Text style={styles.assigned}>Assigned to: {item.assignedTo}</Text>
      )}
      {item.deadline && (
        <Text style={styles.deadline}>Deadline: {item.deadline}</Text>
      )}
      <View style={styles.footer}>
        <View
          style={[
            styles.statusBadge,
            item.status === "completed"
              ? styles.statusCompleted
              : styles.statusPending,
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        {item.context && <Text style={styles.context}>{item.context}</Text>}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={tokenColors.primary.base} />
        <Text style={styles.loadingText}>Extracting action items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={actionItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No action items found</Text>
            <Text style={styles.emptySubtext}>
              Action items will appear here when team members commit to tasks
            </Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}
