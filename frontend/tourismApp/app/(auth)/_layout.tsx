import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '~/components/User/AuthContext';
import Navbar from '~/components/User/Navigation/Navbar';
import { ThemeProvider, useTheme } from '~/components/Styles/themeContext'; 

function InnerLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const navReady = useRootNavigationState();
  const theme = useTheme();

  useEffect(() => {
    if (!navReady?.key) return;

    if (!isAuthenticated) {
      router.replace('/LandingPage');
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
      <InnerLayout />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});