import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { initDatabase } from "../database/db";

export default function RootLayout() {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    initDatabase()
      .then(() => {
        if (active) setDatabaseReady(true);
      })
      .catch((error: unknown) => {
        console.error("Failed to initialize database:", error);
        if (active) {
          setDatabaseError(
            error instanceof Error ? error.message : String(error),
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!databaseReady) {
    return (
      <View style={styles.startup}>
        <Text style={styles.startupText}>
          {databaseError
            ? `Could not initialize the database: ${databaseError}`
            : "Preparing the app…"}
        </Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  startup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  startupText: {
    color: "#1E293B",
    textAlign: "center",
  },
});
