import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { migrate, seedIfEmpty } from "../lib/db";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    (async () => {
      try {
        await migrate();
        await seedIfEmpty();
      } finally {
        setDbReady(true);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <QueryClientProvider client={queryClient}>
            {dbReady ? (
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="subscription"
                  options={{ presentation: "modal" }}
                />
              </Stack>
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </QueryClientProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
