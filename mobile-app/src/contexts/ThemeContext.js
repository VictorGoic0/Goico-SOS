import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { themeColors } from "../styles/tokens";

const THEME_STORAGE_KEY = "@app_theme_mode";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!cancelled && saved !== null) {
          setThemeModeState(saved);
        }
      } catch  {
        // ignore
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    })();
    return () => (cancelled = true);
  }, []);

  const setTheme = useCallback(async (mode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch  {
      // ignore
    }
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === "system") return systemColorScheme === "dark";
    return themeMode === "dark";
  }, [themeMode, systemColorScheme]);

  const colors = useMemo(
    () => (isDark ? themeColors.dark : themeColors.light),
    [isDark],
  );

  const value = useMemo(
    () => ({
      themeMode,
      setTheme,
      isDark,
      colors,
      isThemeLoaded: isLoaded,
    }),
    [themeMode, setTheme, isDark, colors, isLoaded],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
