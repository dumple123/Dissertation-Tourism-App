import { View, Text, StyleSheet } from 'react-native';
import LogoutButton from '~/components/User/LogoutButton';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>You are signed in</Text>
      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A9D8F',
  },
});
