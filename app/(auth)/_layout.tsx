import { Stack } from 'expo-router';

// ==============================================
// LAYOUT : Routes Auth (non authentifiées)
// ==============================================

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}