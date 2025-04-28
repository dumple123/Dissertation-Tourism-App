import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type LocateMeButtonProps = {
  isFollowingUser: boolean;
  onToggleFollow: () => void;
};

export default function LocateMeButton({ isFollowingUser, onToggleFollow }: LocateMeButtonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggleFollow} style={styles.button}>
        <Ionicons
          name={isFollowingUser ? "locate" : "locate-outline"}
          size={24}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 25,
    bottom: 15,
    zIndex: 9,
  },
  button: {
    backgroundColor: '#2A9D8F',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});