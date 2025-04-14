import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/User/AuthContext';
import AuthModal from '../components/User/AuthModal';
import SignUpModal from '../components/User/SignUpModal';

export default function LandingPage() {
  const [loginVisible, setLoginVisible] = useState(false);
  const [signUpVisible, setSignUpVisible] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Landing Page</Text>

      <TouchableOpacity style={styles.button} onPress={() => setLoginVisible(true)}>
        <Text style={styles.buttonText}>Login / Sign Up</Text>
      </TouchableOpacity>

      <AuthModal
        visible={loginVisible}
        onClose={() => setLoginVisible(false)}
        onSwitchToSignUp={() => {
          setLoginVisible(false);
          setSignUpVisible(true);
        }}
      />

      <SignUpModal
        visible={signUpVisible}
        onClose={() => setSignUpVisible(false)}
        onSwitchToLogin={() => {
          setSignUpVisible(false);
          setLoginVisible(true);
        }}
      />
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
  title: {
    fontSize: 28,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2A9D8F',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
