import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllBookings, getVenues } from "../../database/db";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [venueCount, setVenueCount] = useState<number | null>(null);
  const [bookingCount, setBookingCount] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "admin") {
      router.replace("/home");
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== "admin") return;

    let active = true;

    async function loadSummary() {
      try {
        const [venues, bookings] = await Promise.all([
          getVenues(),
          getAllBookings(),
        ]);
        if (active) {
          setVenueCount(venues.length);
          setBookingCount(bookings.length);
        }
      } catch (error) {
        console.error("Failed to load the admin dashboard:", error);
        if (active) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.mutedText}>Opening the admin dashboard…</Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleLogout() {
    signOut();
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>
              Good day, {user.name.split(" ")[0]}
            </Text>
            <Text style={styles.subtitle}>Here’s your venue overview.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>MANAGEMENT</Text>
            <Text style={styles.heroTitle}>Your courts,{`\n`}at a glance.</Text>
            <Text style={styles.heroBody}>
              Keep venues and bookings running smoothly.
            </Text>
          </View>
          <View style={styles.heroAccent} />
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.sectionSubtitle}>Current local records</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>On device</Text>
          </View>
        </View>

        {loadError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Couldn’t load dashboard data</Text>
            <Text style={styles.errorBody}>{loadError}</Text>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.venueIcon]}>
                <Text style={styles.statIconText}>V</Text>
              </View>
              <Text style={styles.statLabel}>VENUES</Text>
              <Text style={styles.statValue}>
                {venueCount === null ? "—" : venueCount}
              </Text>
              <Text style={styles.statHint}>in the directory</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.bookingIcon]}>
                <Text style={[styles.statIconText, styles.bookingIconText]}>
                  B
                </Text>
              </View>
              <Text style={styles.statLabel}>BOOKINGS</Text>
              <Text style={styles.statValue}>
                {bookingCount === null ? "—" : bookingCount}
              </Text>
              <Text style={styles.statHint}>saved on this device</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Management tools</Text>
            <Text style={styles.sectionSubtitle}>
              Admin features for the next build
            </Text>
          </View>
        </View>

        <View style={styles.toolCard}>
          <View style={styles.toolIcon}>
            <Text style={styles.toolIconText}>V</Text>
          </View>
          <View style={styles.toolCopy}>
            <Text style={styles.toolTitle}>Venues and schedules</Text>
            <Text style={styles.toolDescription}>
              Update court details, hours, and prices.
            </Text>
          </View>
        </View>
        <View style={styles.toolCard}>
          <View style={[styles.toolIcon, styles.maintenanceIcon]}>
            <Text style={[styles.toolIconText, styles.maintenanceIconText]}>
              M
            </Text>
          </View>
          <View style={styles.toolCopy}>
            <Text style={styles.toolTitle}>Maintenance closures</Text>
            <Text style={styles.toolDescription}>
              Mark courts unavailable during repairs.
            </Text>
          </View>
        </View>
        <View style={styles.toolCard}>
          <View style={[styles.toolIcon, styles.bookingsIcon]}>
            <Text style={[styles.toolIconText, styles.bookingsIconText]}>
              B
            </Text>
          </View>
          <View style={styles.toolCopy}>
            <Text style={styles.toolTitle}>Booking review</Text>
            <Text style={styles.toolDescription}>
              Review reservations and booking issues.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7F2",
  },
  scrollContent: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  brand: {
    color: "#258052",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 7,
  },
  greeting: {
    color: "#182C20",
    fontSize: 21,
    fontWeight: "800",
  },
  subtitle: {
    color: "#829087",
    fontSize: 12,
    marginTop: 4,
  },
  logoutButton: {
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5EAE2",
  },
  logoutText: {
    color: "#53665A",
    fontSize: 13,
    fontWeight: "700",
  },
  heroCard: {
    minHeight: 170,
    position: "relative",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#174D35",
    borderRadius: 23,
    padding: 20,
    marginBottom: 26,
  },
  heroCopy: {
    flex: 1,
    zIndex: 1,
  },
  heroBadge: {
    width: 52,
    height: 52,
    position: "absolute",
    top: 20,
    right: 20,
    borderRadius: 17,
    backgroundColor: "#D8F3DE",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  heroBadgeText: {
    color: "#18764A",
    fontSize: 23,
    fontWeight: "900",
  },
  heroEyebrow: {
    color: "#B7E7C8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 31,
    fontWeight: "800",
  },
  heroBody: {
    color: "#D1E6D8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  heroAccent: {
    width: 140,
    height: 140,
    position: "absolute",
    right: -68,
    bottom: -92,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "rgba(201, 239, 213, 0.2)",
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  sectionTitle: {
    color: "#1B3023",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#829087",
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E6F3E8",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#29945A",
  },
  statusText: {
    color: "#4D765B",
    fontSize: 10,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 27,
  },
  statCard: {
    flex: 1,
    minHeight: 150,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECE5",
    borderRadius: 18,
    padding: 15,
  },
  statIcon: {
    width: 33,
    height: 33,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    marginBottom: 13,
  },
  venueIcon: {
    backgroundColor: "#E4F3E7",
  },
  bookingIcon: {
    backgroundColor: "#EAF0FF",
  },
  statIconText: {
    color: "#21804D",
    fontSize: 14,
    fontWeight: "800",
  },
  bookingIconText: {
    color: "#5473C6",
  },
  statLabel: {
    color: "#8A958D",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  statValue: {
    color: "#1B3023",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 3,
  },
  statHint: {
    color: "#88948C",
    fontSize: 10,
    marginTop: 2,
  },
  errorCard: {
    backgroundColor: "#FFF8F7",
    borderWidth: 1,
    borderColor: "#F3D9D5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
  },
  errorTitle: {
    color: "#A83228",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
  },
  errorBody: {
    color: "#8A625E",
    fontSize: 12,
    lineHeight: 18,
  },
  toolCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7ECE5",
    padding: 13,
    marginBottom: 10,
  },
  toolIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E4F3E7",
  },
  maintenanceIcon: {
    backgroundColor: "#FFF0DE",
  },
  bookingsIcon: {
    backgroundColor: "#EAF0FF",
  },
  toolIconText: {
    color: "#21804D",
    fontSize: 17,
    fontWeight: "800",
  },
  maintenanceIconText: {
    color: "#C17B2F",
  },
  bookingsIconText: {
    color: "#5473C6",
  },
  toolCopy: {
    flex: 1,
    paddingHorizontal: 11,
  },
  toolTitle: {
    color: "#263B2E",
    fontSize: 13,
    fontWeight: "700",
  },
  toolDescription: {
    color: "#87928A",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  mutedText: {
    color: "#738278",
    fontSize: 14,
  },
});
