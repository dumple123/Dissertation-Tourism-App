import React from 'react';
import { View, Text } from 'react-native';
import POIFeed from '~/components/Feeds/POIFeed';

export default function FeedPage() {
  return (
    <View className="flex-1 bg-white px-4 py-6">
      <Text className="text-2xl font-bold mb-4">Recent POI Visits</Text>
      <POIFeed />
    </View>
  );
}
