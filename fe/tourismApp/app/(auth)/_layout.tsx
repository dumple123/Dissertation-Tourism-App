import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '~/components/User/AuthContext';
import Navbar from '~/components/User/Navigation/Navbar';
import { ThemeProvider, useTheme } from '~/components/Styles/themeContext';
import { LocationProvider } from '~/components/Mapping/utils/useLocation';
import { POIProgressProvider } from '~/components/Mapping/Mobile/POI/POIProgressProvider';
import { usePOIProgress } from '~/components/Mapping/Mobile/POI/POIProgressProvider';
import { SelectedMapProvider } from '~/components/Mapping/Mobile/SelectedMapContext';

function InnerLayout() {
  const { isAuthenticated } = useAuth();
  const { refreshProgress } = usePOIProgress(); 
  const router = useRouter();
  const navReady = useRootNavigationState();
  const theme = useTheme();

  useEffect(() => {
    if (!navReady?.key) return;

    if (!isAuthenticated) {
      router.replace('/LandingPage');
    } else {
      refreshProgress(); 
    }
  }, [navReady?.key, isAuthenticated]); 

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack />
      {isAuthenticated && <Navbar />}
    </View>
  );
}

export default function AuthenticatedLayoutWrapper() {
  return (
    <ThemeProvider>
      <LocationProvider>
        <SelectedMapProvider>
          <POIProgressProvider> 
            <InnerLayout />
          </POIProgressProvider>
        </SelectedMapProvider> 
      </LocationProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
