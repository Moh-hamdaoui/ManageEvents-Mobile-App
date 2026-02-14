import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { AuthProvider } from "@/src/domain/state/AuthContext";
import { EventsProvider } from "@/src/domain/state/EventsContext";
import { EventParticipationProvider } from "@/src/domain/state/EventParticipationContext";
import { useAuth } from "@/src/hook/useAuth";

// ==============================================
// AUTH GATE
// ==============================================

function AuthGate({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (state.status === "loading") return;

    const isAuthenticated = state.status === "authenticated";
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [state.status, segments]);

  if (state.status === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <>{children}</>;
}

// ==============================================
// ROOT LAYOUT
// ==============================================

export default function RootLayout() {
  return (
    <AuthProvider>
      <EventsProvider>
        <EventParticipationProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </AuthGate>
        </EventParticipationProvider>
      </EventsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
});
