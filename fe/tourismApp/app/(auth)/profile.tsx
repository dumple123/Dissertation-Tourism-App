import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import POIFeed from '~/components/Feed/POIFeed'; 

interface ProfilePageProps {
  username: string;
  userId: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ username, userId }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{username}</Text>

      {/* Show the user's last 10 visits */}
      <POIFeed userId={userId} limit={10} />
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
    marginBottom: 20,
    color: '#333',
  },
});

export default ProfilePage;
