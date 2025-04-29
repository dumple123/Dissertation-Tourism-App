import React, { useState } from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import POIFeed from '~/components/Feed/POIFeed';
import CompletedMapsProfile from '~/components/User/MobileCompletedMaps';
import { useAuth } from '~/components/User/AuthContext'; 

const ProfilePage: React.FC = () => {
  const { user } = useAuth(); 
  const [scrollEnabled, setScrollEnabled] = useState(true); 

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const { username, id: userId } = user;

  return (
    <FlatList
      scrollEnabled={scrollEnabled} // Control scroll
      ListHeaderComponent={
        <>
          <Text style={styles.title}>{username}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Maps</Text>
            {/* Pass handlers to the CompletedMapsProfile */}
            <CompletedMapsProfile
              userId={userId}
              onTouchStart={() => setScrollEnabled(false)}
              onTouchEnd={() => setScrollEnabled(true)}
            />
          </View>
        </>
      }
      data={[{}]} // Dummy item
      keyExtractor={(_, index) => index.toString()}
      renderItem={() => (
        <POIFeed
          userId={userId}
          limit={10}
        />
      )}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
    textAlign: 'center',
  },
});

export default ProfilePage;
