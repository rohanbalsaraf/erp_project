import { Redirect } from 'expo-router';

// Root index simply forwards to the protected app cluster.
// If not authenticated, the Layout Guard inside (app)/_layout.tsx will redirect to /login.
export default function Index() {
  return <Redirect href="/(app)/(teacher)" />;
}
