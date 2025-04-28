import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { getLatestPOIVisits, getLatestUserPOIVisits } from '~/api/poiProgress';
import { SafeAreaView } from 'react-native-safe-area-context';

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

        console.log('Fetched visits:', data);
        setVisits(data);
        console.log('Visits fetched in POIFeed:', data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [userId, limit]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  if (!loading && visits.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          {userId ? 'You have not visited any POIs yet!' : 'No recent POI visits to show.'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {userId ? 'Your Recent Visits' : 'Latest POI Visits'}
        </Text>

        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          style={{ flexGrow: 1 }}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isNew = isToday(item.visitedAt);

            return (
              <View style={styles.card}>
                <View style={styles.headerRow}>
                  <Text style={styles.poiName}>{item?.poi?.name ?? 'Unknown POI'}</Text>
                  {isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>

                {!userId && (
                  <Text style={styles.visitor}>
                    {item?.user?.username ?? 'Unknown User'}
                  </Text>
                )}

                <Text style={styles.timestamp}>
                  {item.visitedAt ? new Date(item.visitedAt).toLocaleString() : 'Unknown date'}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  poiName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    flexShrink: 1,
  },
  newBadge: {
    backgroundColor: '#ff5252',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  visitor: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
  },
});

export default POIFeed;
