import React, { createContext, useState, useContext } from 'react';

// Define the shape of our drawing context
type DrawingContextType = {
  rings: [number, number][][]; // Each ring is an array of coordinates
  isDrawing: boolean;
  buildingName: string | null;
  startDrawing: (name: string) => void;
  addPoint: (pt: [number, number]) => void;
  completeRing: () => void;
  completeShape: () => void;
  resetDrawing: () => void;
};

// Create the context object
const DrawingContext = createContext<DrawingContextType | null>(null);

// This provider wraps your app or map component and gives access to drawing logic
export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rings, setRings] = useState<[number, number][][]>([[]]); // [outer ring, inner ring1, inner ring2, ...]
  const [isDrawing, setIsDrawing] = useState(false);
  const [buildingName, setBuildingName] = useState<string | null>(null);

  const addPoint = (pt: [number, number]) =>
    setRings((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = [...updated[updated.length - 1], pt];
      return updated;
    });

  const completeRing = () => {
    setRings((prev) => [...prev, []]); // start new ring
  };

  const completeShape = () => setIsDrawing(false);

  const resetDrawing = () => {
    setRings([[]]);
    setIsDrawing(true);
    setBuildingName(null);
  };

  const startDrawing = (name: string) => {
    setRings([[]]);
    setBuildingName(name);
    setIsDrawing(true);
  };

  return (
    <DrawingContext.Provider
      value={{
        rings,
        isDrawing,
        buildingName,
        startDrawing,
        addPoint,
        completeRing,
        completeShape,
        resetDrawing,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
};

// Hook to use the drawing context
export const useDrawingContext = () => {
  const ctx = useContext(DrawingContext);
  if (!ctx) throw new Error('useDrawingContext must be used within DrawingProvider');
  return ctx;
};
