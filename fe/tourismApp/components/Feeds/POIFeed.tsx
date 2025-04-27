import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getLatestPOIVisits, getLatestUserPOIVisits } from '~/api/poiProgress';

interface POIFeedProps {
  userId?: string;
  limit?: number;
}

interface POIVisit {
  id: string;
  visitedAt: string;
  poi: { name: string };
  user?: { username: string };
}

const POIFeed: React.FC<POIFeedProps> = ({ userId, limit = 10 }) => {
  const [visits, setVisits] = useState<POIVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const data = userId
          ? await getLatestUserPOIVisits(userId, limit)
          : await getLatestPOIVisits(limit);

        setVisits(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [userId, limit]);

  if (loading) return <ActivityIndicator size="large" className="mt-4" />;

  if (!loading && visits.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-500">
          {userId ? 'You have not visited any POIs yet!' : 'No recent POI visits to show.'}
        </Text>
      </View>
    );
  }

  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-4">
        {userId ? 'Your Recent Visits' : 'Latest POI Visits'}
      </Text>
      <FlatList
        data={visits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-2 p-3 bg-gray-100 rounded-lg">
            <Text className="font-semibold">{item?.poi?.name ?? 'Unknown POI'}</Text>
            {!userId && (
              <Text className="text-sm text-gray-700">
                Visited by: {item?.user?.username ?? 'Unknown User'}
              </Text>
            )}
            <Text className="text-xs text-gray-500">
              {item.visitedAt ? new Date(item.visitedAt).toLocaleString() : 'Unknown date'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default POIFeed;
