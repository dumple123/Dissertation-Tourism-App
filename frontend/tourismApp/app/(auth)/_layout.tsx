import { Stack, useRouter, useNavigationContainerRef, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '~/components/User/AuthContext';

export default function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const navReady = useRootNavigationState();

  useEffect(() => {
    if (!navReady?.key) return; // Wait until navigation is ready

    if (!isAuthenticated) {
      router.replace('/LandingPage');
    }
  }, [navReady?.key, isAuthenticated]);

  return <Stack />;
}