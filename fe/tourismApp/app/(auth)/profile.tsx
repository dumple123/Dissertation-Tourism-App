import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import POIFeed from '~/components/Feed/POIFeed';
import CompletedMapsProfile from '~/components/User/MobileCompletedMaps';
import { useAuth } from '~/components/User/AuthContext'; 

const ProfilePage: React.FC = () => {
  const { user } = useAuth(); 

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const { username, id: userId } = user;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{username}</Text>

      {/* Completed Maps section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed Maps</Text>
        <CompletedMapsProfile userId={userId} />
      </View>

      {/* Recent POI Visits section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent POI Visits</Text>
        <POIFeed userId={userId} limit={10} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
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
