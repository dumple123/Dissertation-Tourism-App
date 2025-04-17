import React, { createContext, useState, useContext } from 'react';

// Define the shape of our drawing context
type DrawingContextType = {
  points: [number, number][];
  isDrawing: boolean;
  addPoint: (pt: [number, number]) => void;
  completeShape: () => void;
  resetDrawing: () => void;
};

// Create the context object
const DrawingContext = createContext<DrawingContextType | null>(null);

// This provider wraps your app or map component and gives access to drawing logic
export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(true);

  const addPoint = (pt: [number, number]) => setPoints((prev) => [...prev, pt]);
  const completeShape = () => setIsDrawing(false);
  const resetDrawing = () => {
    setPoints([]);
    setIsDrawing(true);
  };

  return (
    <DrawingContext.Provider value={{ points, isDrawing, addPoint, completeShape, resetDrawing }}>
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
