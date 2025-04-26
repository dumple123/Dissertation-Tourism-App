import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export interface FloorSelectorProps {
  availableFloors: number[];
  selectedFloor: number;
  onSelect: (floor: number) => void;
}

const FloorSelector: React.FC<FloorSelectorProps> = ({
  availableFloors,
  selectedFloor,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {availableFloors
          .sort((a, b) => b - a)
          .map((floor) => (
            <TouchableOpacity
              key={floor}
              onPress={() => onSelect(floor)}
              style={[
                styles.floorButton,
                floor === selectedFloor && styles.selectedButton,
              ]}
            >
              <Text
                style={[
                  styles.floorText,
                  floor === selectedFloor && styles.selectedText,
                ]}
              >
                {floor}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 300,
  },
  scroll: {
    alignItems: 'center',
  },
  floorButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
    width: 50,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#2A9D8F',
    borderColor: '#2A9D8F',
  },
  floorText: {
    color: '#333',
    fontWeight: 'normal',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FloorSelector;
