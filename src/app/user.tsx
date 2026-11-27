import { useEffect, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { getAllSports, getVenues } from "@/database/db";
import type { Venue } from "@/database/types";

export default function UserScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("");

  useEffect(() => {
    getAllSports().then(setSports).catch(console.error);
  }, []);

  useEffect(() => {
    getVenues(search, selectedSport).then(setVenues).catch(console.error);
  }, [search, selectedSport]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore Courts</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by venue or location..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {["", ...sports].map((sport) => {
          const isActive = selectedSport === sport;
          return (
            <Pressable
              key={sport || "all"}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setSelectedSport(sport)}
            >
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
              >
                {sport || "All"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={venues}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No matching venues found.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.venueName}>{item.name}</Text>
              <Text style={styles.price}>₱{item.pricePerHour}/hr</Text>
            </View>

            <Text style={styles.meta}>
              {item.location} • {item.openTime}–{item.closeTime} •{" "}
              {item.courtCount} {item.courtCount === 1 ? "court" : "courts"}
            </Text>

            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}

            <View style={styles.tagRow}>
              {item.sports.map((sport) => (
                <View key={sport} style={styles.tag}>
                  <Text style={styles.tagText}>{sport}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0F172A",
  },
  chipScroll: {
    flexGrow: 0,
    marginVertical: 12,
  },
  chipRow: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#059669",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  venueName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#059669",
  },
  meta: {
    fontSize: 13,
    color: "#64748B",
  },
  description: {
    fontSize: 14,
    color: "#475569",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
  },
});
