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
};

// Create the context object
const DrawingContext = createContext<DrawingContextType | null>(null);

// This provider wraps your app or map component and gives access to drawing logic
export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rings, setRings] = useState<[number, number][][]>([[]]); // [outer ring, inner ring1, inner ring2, ...]
  const [isDrawing, setIsDrawing] = useState(false);
  const [buildingName, setBuildingName] = useState<string | null>(null);

  // Add a new point to the current ring
  const addPoint = (pt: [number, number]) =>
    setRings((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = [...updated[updated.length - 1], pt];
      return updated;
    });

  // Complete the current ring and start a new one
  const completeRing = () => {
    setRings((prev) => [...prev, []]);
  };

  // Finish the drawing (stops interaction)
  const completeShape = () => setIsDrawing(false);

  // Clear all drawing data
  const resetDrawing = () => {
    setRings([[]]);
    setIsDrawing(true);
    setBuildingName(null);
  };

  // Begin a new shape with a given name
  const startDrawing = (name: string) => {
    setRings([[]]);
    setBuildingName(name);
    setIsDrawing(true);
  };

  // Move an existing vertex (default is outer ring)
  const updatePoint = (index: number, newPoint: [number, number], ringIndex: number = 0) =>
    setRings((prev) => {
      const updated = [...prev];
      const ring = [...updated[ringIndex]];
      ring[index] = newPoint;
      updated[ringIndex] = ring;
      return updated;
    });

  // Insert a new vertex between points (default is outer ring)
  const insertPoint = (index: number, newPoint: [number, number], ringIndex: number = 0) =>
    setRings((prev) => {
      const updated = [...prev];
      const ring = [...updated[ringIndex]];
      ring.splice(index, 0, newPoint);
      updated[ringIndex] = ring;
      return updated;
    });

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
        updatePoint,
        insertPoint,
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