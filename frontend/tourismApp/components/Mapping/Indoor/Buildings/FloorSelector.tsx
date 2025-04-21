import React from 'react';

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
    <div
        style={{
        position: 'absolute',
        top: 140, // moved down to sit under Add POI / Add Room
        right: 20,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        padding: 8,
        zIndex: 11,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        }}
    >
      {availableFloors
        .sort((a, b) => b - a)
        .map((floor) => (
          <button
            key={floor}
            onClick={() => onSelect(floor)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #ccc',
              backgroundColor: floor === selectedFloor ? '#2A9D8F' : '#f0f0f0',
              color: floor === selectedFloor ? '#fff' : '#333',
              fontWeight: floor === selectedFloor ? 'bold' : 'normal',
              cursor: 'pointer',
              width: 50,
              textAlign: 'center',
            }}
          >
            {floor}
          </button>
        ))}
    </div>
  );
};

export default FloorSelector;