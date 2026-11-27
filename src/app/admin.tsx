import { useAuth } from "@/context/auth";
import { getAllBookings, getVenues } from "@/database/db";
import type { Booking } from "@/database/types";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

async function fetchDashboardData() {
  const [venues, bookings] = await Promise.all([getVenues(), getAllBookings()]);
  return { venueCount: venues.length, bookings };
}

export default function AdminScreen() {
  const { user, logout } = useAuth();
  const [venueCount, setVenueCount] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDashboardData();
      setVenueCount(data.venueCount);
      setBookings(data.bookings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load dashboard data.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    fetchDashboardData()
      .then((data) => {
        if (isActive) {
          setVenueCount(data.venueCount);
          setBookings(data.bookings);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load dashboard data.",
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed",
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SPORTS COURT BOOKING</Text>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.greeting}>
            Welcome, {user?.name ?? "Administrator"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Pressable
          accessibilityRole="button"
          disabled={isLoading}
          onPress={() => {
            void loadDashboard();
          }}
          style={({ pressed }) => [
            styles.refreshButton,
            (pressed || isLoading) && styles.buttonPressed,
          ]}
        >
          <Text style={styles.refreshText}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Venues</Text>
          <Text style={styles.statValue}>
            {isLoading ? "—" : venueCount}
          </Text>
          <Text style={styles.statHint}>Available in the app</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Confirmed bookings</Text>
          <Text style={styles.statValue}>
            {isLoading ? "—" : confirmedCount}
          </Text>
          <Text style={styles.statHint}>Currently active</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Couldn’t load dashboard</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent bookings</Text>
        {!isLoading ? (
          <Text style={styles.sectionMeta}>{bookings.length} total</Text>
        ) : null}
      </View>

      {isLoading && bookings.length === 0 ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#059669" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyMessage}>
            New bookings will appear here.
          </Text>
        </View>
      ) : (
        bookings.slice(0, 5).map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingDetails}>
              <Text style={styles.bookingVenue}>
                {booking.venueName ?? "Venue"}
              </Text>
              <Text style={styles.bookingMeta}>
                {booking.activity} · {booking.date}
              </Text>
              <Text style={styles.bookingMeta}>
                {booking.startTime}–{booking.endTime} · Court{" "}
                {booking.courtNumber}
              </Text>
            </View>
            <Text
              style={[
                styles.status,
                booking.status === "confirmed"
                  ? styles.confirmedStatus
                  : styles.cancelledStatus,
              ]}
            >
              {booking.status}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 36,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#059669",
  },
  title: {
    marginTop: 4,
    fontSize: 25,
    fontWeight: "700",
    color: "#1E293B",
  },
  greeting: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },
  logoutButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  logoutText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  sectionMeta: {
    color: "#64748B",
    fontSize: 13,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#ECFDF5",
  },
  refreshText: {
    color: "#047857",
    fontSize: 13,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 116,
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  statValue: {
    marginTop: 7,
    color: "#1E293B",
    fontSize: 30,
    fontWeight: "700",
  },
  statHint: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 12,
  },
  errorCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    gap: 4,
  },
  errorTitle: {
    color: "#991B1B",
    fontWeight: "700",
  },
  errorMessage: {
    color: "#B91C1C",
    fontSize: 13,
  },
  loadingCard: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    color: "#64748B",
    fontSize: 13,
  },
  emptyCard: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyMessage: {
    marginTop: 5,
    color: "#64748B",
    fontSize: 13,
  },
  bookingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bookingDetails: {
    flex: 1,
    gap: 4,
  },
  bookingVenue: {
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "700",
  },
  bookingMeta: {
    color: "#64748B",
    fontSize: 12,
  },
  status: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  confirmedStatus: {
    color: "#047857",
    backgroundColor: "#ECFDF5",
  },
  cancelledStatus: {
    color: "#B91C1C",
    backgroundColor: "#FEF2F2",
  },
});
