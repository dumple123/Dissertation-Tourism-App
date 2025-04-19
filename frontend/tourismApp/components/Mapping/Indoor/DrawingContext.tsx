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
  updatePoint: (index: number, newPoint: [number, number], ringIndex?: number) => void;
  insertPoint: (index: number, newPoint: [number, number], ringIndex?: number) => void;
  setRings: (newRings: [number, number][][]) => void;
};

// Create the context object
const DrawingContext = createContext<DrawingContextType | null>(null);

// This provider wraps your app or map component and gives access to drawing logic
export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ringsState, setRingsState] = useState<[number, number][][]>([[]]); // renamed to avoid shadowing
  const [isDrawing, setIsDrawing] = useState(false);
  const [buildingName, setBuildingName] = useState<string | null>(null);

  // Function to set rings directly (used when editing a building)
  const setRings = (newRings: [number, number][][]) => {
    setRingsState(newRings);
    setIsDrawing(true);
  };

  const addPoint = (pt: [number, number]) =>
    setRingsState((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = [...updated[updated.length - 1], pt];
      return updated;
    });

  const completeRing = () => {
    setRingsState((prev) => [...prev, []]);
  };

  const completeShape = () => setIsDrawing(false);

  const resetDrawing = () => {
    setRingsState([[]]);
    setIsDrawing(true);
    setBuildingName(null);
  };

  const startDrawing = (name: string) => {
    setRingsState([[]]);
    setBuildingName(name);
    setIsDrawing(true);
  };

  const updatePoint = (index: number, newPoint: [number, number], ringIndex: number = 0) =>
    setRingsState((prev) => {
      const updated = [...prev];
      const ring = [...updated[ringIndex]];
      ring[index] = newPoint;
      updated[ringIndex] = ring;
      return updated;
    });

  const insertPoint = (index: number, newPoint: [number, number], ringIndex: number = 0) =>
    setRingsState((prev) => {
      const updated = [...prev];
      const ring = [...updated[ringIndex]];
      ring.splice(index, 0, newPoint);
      updated[ringIndex] = ring;
      return updated;
    });

  return (
    <DrawingContext.Provider
      value={{
        rings: ringsState,
        isDrawing,
        buildingName,
        startDrawing,
        addPoint,
        completeRing,
        completeShape,
        resetDrawing,
        updatePoint,
        insertPoint,
        setRings, // now correctly included
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