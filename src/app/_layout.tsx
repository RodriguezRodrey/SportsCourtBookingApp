import { AuthProvider, useAuth } from "@/context/auth";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { initDatabase } from "@/database/db";

function AppNavigator() {
  const { user } = useAuth();

  const homeRoute = user?.role === "admin" ? "/admin" : "/user";
  const userDeniedRoute = user ? "/admin" : "/login";
  const adminDeniedrRoute = user ? "/user" : "/login";

  return (
    <Stack>
      {/* Landing Screen */}
      <Stack.Screen name="index" />

      <Stack.Protected guard={!user} redirectTo={homeRoute}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>

      <Stack.Protected
        guard={user?.role === "user"}
        redirectTo={userDeniedRoute}
      >
        <Stack.Screen name="user" />
      </Stack.Protected>

      <Stack.Protected
        guard={user?.role === "admin"}
        redirectTo={adminDeniedrRoute}
      >
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeDatabase() {
      try {
        await initDatabase();
        if (isMounted) {
          setIsDatabaseReady(true);
        }
      } catch (error) {
        if (isMounted) {
          setDatabaseError(
            error instanceof Error
              ? error.message
              : "An unknown database error occurred.",
          );
        }
      }
    }

    initializeDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  if (databaseError) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.errorTitle}>Database unavailable</Text>
        <Text style={styles.errorMessage}>{databaseError}</Text>
      </View>
    );
  }

  if (!isDatabaseReady) {
    return (
      <View style={styles.statusContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Preparing the app...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },
  errorTitle: {
    color: "#B91C1C",
    fontSize: 18,
    fontWeight: "700",
  },
  errorMessage: {
    marginTop: 8,
    color: "#64748B",
    textAlign: "center",
  },
});
