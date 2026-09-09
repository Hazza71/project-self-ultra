import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PsxProvider } from "../src/lib/PsxContext";
import { colors } from "../src/theme/tokens";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PsxProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.gold,
            headerTitleStyle: { color: colors.offWhite, fontWeight: "600", letterSpacing: 1.4 },
            contentStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="atlas/index" options={{ title: "Atlas" }} />
          <Stack.Screen name="atlas/search" options={{ title: "Search" }} />
          <Stack.Screen name="atlas/tree/[treeId]" options={{ title: "Tree" }} />
          <Stack.Screen name="atlas/category/[categoryId]" options={{ title: "Category" }} />
          <Stack.Screen name="atlas/branch/[branchId]" options={{ title: "Branch" }} />
          <Stack.Screen name="atlas/achievement/[achievementId]" options={{ title: "Achievement" }} />
          <Stack.Screen name="ledger" options={{ title: "Ledger" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
        </Stack>
      </PsxProvider>
    </SafeAreaProvider>
  );
}
