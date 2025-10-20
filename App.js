import { StatusBar } from "expo-status-bar";
import "./src/config/firebase"; // Initialize Firebase
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
