import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import "./src/config/firebase"; // Initialize Firebase

export default function App() {
  return (
    <View style={styles.container}>
      <Text>🚀 Mobile Messaging App</Text>
      <Text style={styles.subtitle}>Firebase Connected!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    marginTop: 10,
    color: "#10b981",
    fontSize: 16,
  },
});
