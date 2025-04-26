import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Map {
  id: string;
  name: string;
}

interface SelectedMapContextType {
  selectedMap: Map | null;
  setSelectedMap: (map: Map | null) => void;
}

// Create the context
const SelectedMapContext = createContext<SelectedMapContextType | undefined>(undefined);

// Provider
export function SelectedMapProvider({ children }: { children: ReactNode }) {
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);

  return (
    <SelectedMapContext.Provider value={{ selectedMap, setSelectedMap }}>
      {children}
    </SelectedMapContext.Provider>
  );
}

// Hook
export function useSelectedMap() {
  const context = useContext(SelectedMapContext);
  if (!context) {
    throw new Error('useSelectedMap must be used inside SelectedMapProvider');
  }
  return context;
}
