import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

// -- Type for a saved location
export interface ItineraryPOI {
  id: string;
  name: string;
  coords: [number, number]; // [longitude, latitude]
}

// -- Context type
interface ItineraryPOIContextType {
  itinerary: ItineraryPOI[];
  addPOI: (poi: Omit<ItineraryPOI, 'id'>) => Promise<void>;
  removePOI: (id: string) => Promise<void>;
  clearItinerary: () => Promise<void>;
}

// -- Default context values
const ItineraryPOIContext = createContext<ItineraryPOIContextType>({
  itinerary: [],
  addPOI: async () => {},
  removePOI: async () => {},
  clearItinerary: async () => {},
});

// -- Itinerary Provider
export const ItineraryPOIProvider = ({ children }: { children: ReactNode }) => {
  const [itinerary, setItinerary] = useState<ItineraryPOI[]>([]);

  // -- Load itinerary from local storage on mount
  useEffect(() => {
    const loadItinerary = async () => {
      try {
        const stored = await AsyncStorage.getItem('itinerary');
        if (stored) {
          setItinerary(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load itinerary:', error);
      }
    };
    loadItinerary();
  }, []);

  // -- Save itinerary to local storage
  const saveItinerary = async (updated: ItineraryPOI[]) => {
    try {
      await AsyncStorage.setItem('itinerary', JSON.stringify(updated));
      setItinerary(updated); // update after saving to storage
    } catch (error) {
      console.error('Failed to save itinerary:', error);
    }
  };

  // -- Add a new POI (generate ID internally)
  const addPOI = async (poi: Omit<ItineraryPOI, 'id'>) => {
    const newPOI: ItineraryPOI = {
      id: uuid.v4().toString(),
      ...poi,
    };
    const updated = [...itinerary, newPOI];
    await saveItinerary(updated);
  };

  // -- Remove a POI by id
  const removePOI = async (id: string) => {
    setItinerary((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      AsyncStorage.setItem('itinerary', JSON.stringify(updated)).catch((err) =>
        console.error('Failed to save after deletion:', err)
      );
      return updated;
    });
  };

  // -- Clear the entire itinerary
  const clearItinerary = async () => {
    try {
      await AsyncStorage.removeItem('itinerary');
      setItinerary([]);
    } catch (error) {
      console.error('Failed to clear itinerary:', error);
    }
  };

  return (
    <ItineraryPOIContext.Provider value={{ itinerary, addPOI, removePOI, clearItinerary }}>
      {children}
    </ItineraryPOIContext.Provider>
  );
};

// -- Hook to use the context
export const useItineraryPOIs = () => useContext(ItineraryPOIContext);
