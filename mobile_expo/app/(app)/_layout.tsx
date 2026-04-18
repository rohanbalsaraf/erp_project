import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout() {
  const { token, isLoading } = useAuth();

  // Wait for the AuthContext to hydrate
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Guard Clause: Only logged in users can reach this segment
  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* We allow routing to either segment, but login logic explicitly decides which one they enter upon Auth */}
      <Stack.Screen name="(teacher)" />
      <Stack.Screen name="(student)" />
    </Stack>
  );
}
