import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import "./src/config/firebase"; // Initialize Firebase
import useFirebaseStore from "./src/stores/firebaseStore";
import useLocalStore from "./src/stores/localStore";
import usePresenceStore from "./src/stores/presenceStore";

export default function App() {
  // Test store access
  const localStore = useLocalStore();
  const presenceStore = usePresenceStore();
  const firebaseStore = useFirebaseStore();

  console.log("✅ All stores initialized:", {
    local: !!localStore,
    presence: !!presenceStore,
    firebase: !!firebaseStore,
  });

  return (
    <View style={styles.container}>
      <Text>🚀 Mobile Messaging App</Text>
      <Text style={styles.subtitle}>Firebase Connected!</Text>
      <Text style={styles.subtitle}>3-Store Architecture Ready!</Text>
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
