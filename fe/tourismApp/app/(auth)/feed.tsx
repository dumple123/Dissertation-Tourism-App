import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import POIFeed from '~/components/Feeds/POIFeed';

export default function FeedPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <POIFeed />
    </SafeAreaView>
  );
}