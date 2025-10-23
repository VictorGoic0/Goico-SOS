import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { extractActionItems } from "../services/aiService";
import { colors } from "../styles/tokens";

export default function ActionItemsScreen({ route, navigation }) {
  const { conversationId } = route.params;
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActionItems();
  }, []);

  const loadActionItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await extractActionItems(conversationId);
      setActionItems(result.actionItems || []);
    } catch (error) {
      console.error("Failed to load action items:", error);
      setError(error.message || "Failed to load action items");
    } finally {
      setLoading(false);
    }
  };

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
        <ActivityIndicator size="large" color={colors.primary.base} />
        <Text style={styles.loadingText}>Extracting action items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadActionItems}>
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
      <TouchableOpacity style={styles.refreshButton} onPress={loadActionItems}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.default,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error.main,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary.base,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  item: {
    backgroundColor: "white",
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
    color: colors.text.primary,
    marginBottom: 8,
  },
  assigned: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  deadline: {
    fontSize: 14,
    color: colors.error.main,
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
  statusPending: {
    backgroundColor: "#FFF3CD",
  },
  statusCompleted: {
    backgroundColor: "#D1E7DD",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  context: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
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
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: colors.primary.base,
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
});
