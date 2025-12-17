import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="user-signup" />
        <Stack.Screen name="(owner)" />
        <Stack.Screen name="(user)" />
      </Stack>
    </AuthProvider>
  );
}