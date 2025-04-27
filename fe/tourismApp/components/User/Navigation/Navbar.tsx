import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Link } from 'expo-router';
import {
  FontAwesome,
  MaterialCommunityIcons,
  Entypo,
} from '@expo/vector-icons';
import { useTheme } from '~/components/Styles/themeContext';

const navItems = [
  {
    label: 'Home',
    path: '/(auth)/',
    icon: (color: string) => <FontAwesome name="home" size={24} color={color} />,
  },
  // Itinerary tab only shown on mobile
  ...(Platform.OS !== 'web'
    ? [{
        label: 'Itinerary',
        path: '/(auth)/Itinerary',
        icon: (color: string) => <MaterialCommunityIcons name="clipboard-text" size={24} color={color} />,
      }]
    : []),
  {
    label: 'Map',
    path: '/(auth)/Map',
    icon: (color: string) => <Entypo name="map" size={24} color={color} />,
  },
  {
    label: 'Feed',
    path: '/(auth)/feed',
    icon: (color: string) => <MaterialCommunityIcons name="view-list" size={24} color={color} />,
  },
  {
    label: 'Profile',
    path: '/(auth)/Profile',
    icon: (color: string) => <FontAwesome name="user" size={24} color={color} />,
  },
] as const;

export default function Navbar() {
  const theme = useTheme();

  return (
    <View style={[styles.navbar, { backgroundColor: theme.navBackground }]}>
      {navItems.map((item) => (
        <Link key={item.path} href={item.path as any} asChild>
          <Pressable style={styles.navItem}>
            {item.icon(theme.navText)}
            <Text style={[styles.navText, { color: theme.navText }]}>{item.label}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
