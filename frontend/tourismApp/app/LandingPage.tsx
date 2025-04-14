import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Delay navigation by 500ms to ensure smooth transition after component mounts
    const timeout = setTimeout(() => {
      router.replace('/'); // Redirect to the main index screen
    }, 500);
    return () => clearTimeout(timeout);  // Cleanup the timeout on unmount
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Loading indicator (spinner and text) shown during the short delay */}
      <ActivityIndicator size="large" color="#999" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'  // or your app's background color
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#555'
  }
});