import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getVenues } from "../database/db";
import type { Venue } from "../database/types";

export default function HomeScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }

    let active = true;

    async function loadCourts() {
      try {
        const data = await getVenues();
        if (active) setVenues(data);
      } catch (error) {
        console.error("Failed to load venues:", error);
        if (active) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadCourts();

    return () => {
      active = false;
    };
  }, [user]);

  if (!user || user.role !== "user") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.mutedText}>Opening your dashboard…</Text>
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
            <Text style={styles.greeting}>Hi, {user.name.split(" ")[0]}</Text>
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
            <Text style={styles.heroEyebrow}>READY WHEN YOU ARE</Text>
            <Text style={styles.heroTitle}>Find your{`\n`}next game.</Text>
            <Text style={styles.heroBody}>
              Explore local courts and find a place to play.
            </Text>
          </View>
          <View style={styles.heroAccent} />
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Courts near you</Text>
            <Text style={styles.sectionSubtitle}>
              Browse venues in Tagum City
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {isLoading ? "…" : venues.length}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Finding courts</Text>
            <Text style={styles.stateBody}>
              Loading venue information from this device.
            </Text>
          </View>
        ) : loadError ? (
          <View style={[styles.stateCard, styles.errorCard]}>
            <Text style={styles.errorTitle}>Couldn’t load courts</Text>
            <Text style={styles.stateBody}>{loadError}</Text>
          </View>
        ) : venues.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>No courts available yet</Text>
            <Text style={styles.stateBody}>
              Check back later for sports venues in your area.
            </Text>
          </View>
        ) : (
          venues.map((venue) => (
            <View key={venue.id} style={styles.venueCard}>
              <View style={styles.venueTopRow}>
                <View style={styles.venueIcon}>
                  <Text style={styles.venueIconText}>
                    {venue.sports[0]?.slice(0, 1).toUpperCase() ?? "C"}
                  </Text>
                </View>
                <View style={styles.pricePill}>
                  <Text style={styles.priceText}>
                    ₱{venue.pricePerHour}
                    <Text style={styles.priceUnit}> / hr</Text>
                  </Text>
                </View>
              </View>
              <Text style={styles.venueName}>{venue.name}</Text>
              <Text style={styles.venueLocation}>⌖ {venue.location}</Text>
              <View style={styles.divider} />
              <View style={styles.venueDetails}>
                <Text style={styles.detailText}>
                  {venue.courtCount}{" "}
                  {venue.courtCount === 1 ? "court" : "courts"}
                </Text>
                <Text style={styles.detailDot}>·</Text>
                <Text style={styles.detailText}>
                  {venue.openTime}–{venue.closeTime}
                </Text>
              </View>
              {venue.sports.length > 0 ? (
                <View style={styles.sportList}>
                  {venue.sports.map((sport) => (
                    <View key={sport} style={styles.sportTag}>
                      <Text style={styles.sportText}>{sport}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {venue.description ? (
                <Text style={styles.description}>{venue.description}</Text>
              ) : null}
            </View>
          ))
        )}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brand: {
    color: "#258052",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 5,
  },
  greeting: {
    color: "#182C20",
    fontSize: 22,
    fontWeight: "800",
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
    minHeight: 196,
    overflow: "hidden",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#174D35",
    borderRadius: 24,
    padding: 22,
    marginBottom: 27,
  },
  heroCopy: {
    flex: 1,
    zIndex: 1,
  },
  heroEyebrow: {
    color: "#B7E7C8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroBody: {
    maxWidth: 220,
    color: "#D1E6D8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },
  ballBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#D8F3DE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  ballText: {
    color: "#18764A",
    fontSize: 28,
    fontWeight: "800",
  },
  heroAccent: {
    position: "absolute",
    width: 155,
    height: 155,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(201, 239, 213, 0.15)",
    right: -54,
    bottom: -96,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#1B3023",
    fontSize: 20,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#829087",
    fontSize: 13,
    marginTop: 4,
  },
  countBadge: {
    minWidth: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#E3F2E6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
  },
  countText: {
    color: "#18764A",
    fontSize: 14,
    fontWeight: "800",
  },
  venueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E7ECE5",
  },
  venueTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  venueIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E5F4E9",
    alignItems: "center",
    justifyContent: "center",
  },
  venueIconText: {
    color: "#18764A",
    fontSize: 18,
    fontWeight: "800",
  },
  pricePill: {
    backgroundColor: "#F0F7F1",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  priceText: {
    color: "#18764A",
    fontSize: 14,
    fontWeight: "800",
  },
  priceUnit: {
    color: "#6A8874",
    fontSize: 11,
    fontWeight: "600",
  },
  venueName: {
    color: "#1B3023",
    fontSize: 17,
    fontWeight: "800",
  },
  venueLocation: {
    color: "#849087",
    fontSize: 13,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF1ED",
    marginVertical: 13,
  },
  venueDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    color: "#526258",
    fontSize: 12,
    fontWeight: "600",
  },
  detailDot: {
    color: "#A1AAA3",
    paddingHorizontal: 8,
    fontSize: 14,
  },
  sportList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 7,
  },
  sportTag: {
    backgroundColor: "#F2F6F1",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  sportText: {
    color: "#607267",
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    color: "#87928A",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 11,
  },
  stateCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECE5",
    borderRadius: 18,
    padding: 19,
  },
  errorCard: {
    backgroundColor: "#FFF8F7",
    borderColor: "#F3D9D5",
  },
  stateTitle: {
    color: "#263B2E",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  errorTitle: {
    color: "#A83228",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  stateBody: {
    color: "#7A887F",
    fontSize: 13,
    lineHeight: 20,
  },
  mutedText: {
    color: "#738278",
    fontSize: 14,
  },
  disclaimer: {
    color: "#96A098",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 9,
    paddingHorizontal: 12,
  },
});
