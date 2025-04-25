import React, { createContext, useState, useContext } from 'react';

// Define the shape of our drawing context
type DrawingContextType = {
  rings: [number, number][][];
  isDrawing: boolean;
  buildingName: string | null;
  roomInfo: { name: string; floor: number; buildingId: string } | null;
  editingRoomId: string | null;
  snapTargets: [number, number][][];
  setSnapTargets: (targets: [number, number][][]) => void;
  startDrawing: (name: string) => void;
  addPoint: (pt: [number, number]) => void;
  completeRing: () => void;
  completeShape: () => void;
  resetDrawing: () => void;
  updatePoint: (index: number, newPoint: [number, number], ringIndex?: number) => void;
  insertPoint: (index: number, newPoint: [number, number], ringIndex?: number) => void;
  setRings: (newRings: [number, number][][]) => void;
  setRoomInfo: (info: { name: string; floor: number; buildingId: string } | null) => void;
  setIsDrawing: (value: boolean) => void;
  setEditingRoomId: (id: string | null) => void;
  exitDrawing: () => void;
};

// Create the context object
const DrawingContext = createContext<DrawingContextType | null>(null);

// This provider wraps your app or map component and gives access to drawing logic
export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ringsState, setRingsState] = useState<[number, number][][]>([[]]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [buildingName, setBuildingName] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<{ name: string; floor: number; buildingId: string } | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [snapTargets, setSnapTargets] = useState<[number, number][][]>([]);

  // Set rings directly (used when editing)
  const setRings = (newRings: [number, number][][]) => {
    setRingsState(newRings);
    setIsDrawing(true);
  };

  // Add a point to the current ring
  const addPoint = (pt: [number, number]) =>
    setRingsState((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = [...updated[updated.length - 1], pt];
      return updated;
    });

  // Complete the current ring and start a new one
  const completeRing = () => {
    setRingsState((prev) => [...prev, []]);
  };

  // Cancel drawing and clear all state
  const exitDrawing = () => {
    setRingsState([[]]);
    setIsDrawing(false);
    setBuildingName(null);
    setRoomInfo(null);
    setEditingRoomId(null);
    setSnapTargets([]);
  };

  // Mark drawing as complete
  const completeShape = () => setIsDrawing(false);

  // Reset drawing with current building or room name cleared
  const resetDrawing = () => {
    setRingsState([[]]);
    setIsDrawing(true);
    setBuildingName(null);
    setRoomInfo(null);
    setEditingRoomId(null);
    setSnapTargets([]);
  };

  // Start drawing a building or room based on input name
  const startDrawing = (name: string) => {
    setRingsState([[]]);

    // If name includes pipe-delimited metadata, treat it as a room
    if (name.includes('|')) {
      const [roomName, floorStr, buildingId] = name.split('|');
      setRoomInfo({ name: roomName, floor: parseInt(floorStr), buildingId });
      setBuildingName(null);
    } else {
      setBuildingName(name);
      setRoomInfo(null);
    }

    setIsDrawing(true);
  };

  // Update a point in the polygon ring
  const updatePoint = (index: number, newPoint: [number, number], ringIndex: number = 0) =>
    setRingsState((prev) => {
      const updated = [...prev];
      const ring = [...updated[ringIndex]];
      ring[index] = newPoint;
      updated[ringIndex] = ring;
      return updated;
    });

  // Insert a point into the polygon ring
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
        roomInfo,
        editingRoomId,
        snapTargets,
        setSnapTargets,
        startDrawing,
        addPoint,
        completeRing,
        completeShape,
        resetDrawing,
        updatePoint,
        insertPoint,
        setRings,
        setRoomInfo,
        setIsDrawing,
        setEditingRoomId,
        exitDrawing,
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
