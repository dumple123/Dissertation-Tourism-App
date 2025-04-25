import { Slot } from 'expo-router';
import { AuthProvider } from '../components/User/AuthContext'; // adjust path if needed

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}