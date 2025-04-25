import { Button, Alert } from 'react-native';
import { useAuth } from '~/components/User/AuthContext';
import { useRouter } from 'expo-router';

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    Alert.alert('Logged out');
    router.replace('/LandingPage'); // Redirect to landing
  };

  return <Button title="Log Out" onPress={handleLogout} />;
}