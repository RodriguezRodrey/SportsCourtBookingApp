// Welcome screen for the Sports Court Booking app
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function Index() {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(400)}>
        <Image
          source={require("../../assets/images/sportsball.jpg")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)}>
        <Text style={styles.title}>Sports Court Booking</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)}>
        <Text style={styles.subtitle}>
          Book your favorite sports court today!
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(600)}>
        <Pressable style={styles.button} onPress={() => router.push("./login")}>
          <Text style={styles.buttonText}>Explore Courts</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F8FAFC",
  },
  logo: {
    width: 240,
    height: 240,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    cursor: "pointer",
    userSelect: "none",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
