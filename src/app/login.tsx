import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signIn, isSigningIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage("Enter your email and password to continue.");
      return;
    }

    setErrorMessage(null);

    let authenticatedUser;
    try {
      authenticatedUser = await signIn(email, password);
    } catch (error) {
      console.error("Failed to sign in:", error);
      setErrorMessage("We couldn't sign you in. Please try again.");
      return;
    }

    if (!authenticatedUser) {
      setErrorMessage("That email and password don't match.");
      return;
    }

    router.replace(authenticatedUser.role === "admin" ? "/admin" : "/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Sign in to find a court and get back in the game.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign in to your account</Text>

            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setErrorMessage(null);
              }}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="next"
              editable={!isSigningIn}
              accessibilityLabel="Email address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrorMessage(null);
              }}
              secureTextEntry
              autoComplete="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              editable={!isSigningIn}
              accessibilityLabel="Password"
            />

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} accessibilityRole="alert">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              style={[styles.submitButton, isSigningIn && styles.disabled]}
              onPress={handleLogin}
              disabled={isSigningIn}
            >
              <Text style={styles.submitButtonText}>
                {isSigningIn ? "Signing you in…" : "Sign in"}
              </Text>
              {!isSigningIn ? <Text style={styles.submitArrow}>→</Text> : null}
            </Pressable>
          </View>

          <Text style={styles.footer}>SPORTS COURT BOOKING</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7F2",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  topBar: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAE2",
  },
  backArrow: {
    color: "#173B2B",
    fontSize: 32,
    lineHeight: 34,
    marginTop: -4,
  },
  brand: {
    color: "#53705F",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  topBarSpacer: {
    width: 42,
  },
  hero: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 26,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#DDF1E3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroIcon: {
    color: "#18764A",
    fontSize: 32,
    fontWeight: "900",
  },
  eyebrow: {
    color: "#18804E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  title: {
    color: "#14291E",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
    textAlign: "center",
  },
  subtitle: {
    maxWidth: 290,
    color: "#68796E",
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 9,
  },
  formCard: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E7ECE5",
    shadowColor: "#173B2B",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  formTitle: {
    color: "#1A3023",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 22,
  },
  label: {
    color: "#43564A",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    minHeight: 54,
    backgroundColor: "#F8FAF7",
    borderWidth: 1,
    borderColor: "#E4EAE2",
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 17,
    fontSize: 15,
    color: "#172A1E",
  },
  errorBox: {
    backgroundColor: "#FFF1F0",
    borderColor: "#F7D2CE",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: "#A83228",
    fontSize: 13,
    lineHeight: 19,
  },
  submitButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18764A",
    borderRadius: 15,
    marginTop: 2,
  },
  disabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  submitArrow: {
    position: "absolute",
    right: 18,
    color: "#FFFFFF",
    fontSize: 22,
  },
  footer: {
    color: "#91A095",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 27,
  },
});
