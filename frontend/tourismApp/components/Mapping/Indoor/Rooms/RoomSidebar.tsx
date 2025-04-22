import React from 'react';
import { deleteRoom } from '~/api/room';
import { useDrawingContext } from '../Drawing/useDrawing';

interface RoomSidebarProps {
  room: {
    id: string;
    name: string;
    floor: number;
    buildingId: string;
    geojson: {
      type: 'Feature';
      geometry: {
        type: 'Polygon';
        coordinates: [number, number][][];
      };
      properties: any;
    };
    [key: string]: any;
  };
  onDeleteSuccess: () => void;
  onStartEdit: () => void;
  topOffset?: number;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({
  room,
  onDeleteSuccess,
  onStartEdit,
  topOffset = 360,
}) => {
  const { setRings, setIsDrawing, setRoomInfo } = useDrawingContext();

  const handleDelete = async () => {
    const confirmDelete = confirm('Are you sure you want to delete this room?');
    if (!confirmDelete) return;

    try {
      await deleteRoom(room.id);
      alert('Room deleted');
      onDeleteSuccess();
    } catch (err) {
      console.error('Failed to delete room:', err);
      alert('Failed to delete room');
    }
  };

  const handleEdit = () => {
    const coordinates = room.geojson.geometry.coordinates;
    const transformed = coordinates.map((ring: [number, number][]) => ring.slice(0, -1));
    setRings(transformed);
    setRoomInfo({ name: room.name, floor: room.floor, buildingId: room.buildingId });
    setIsDrawing(true); 
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: topOffset,
        left: 0,
        zIndex: 10,
        width: 240,
        backgroundColor: '#f9f9f9',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        border: '1px solid #ccc',
        fontFamily: 'Open Sans, sans-serif',
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 18, marginBottom: 16 }}>Room Details</h3>

      <p><strong>Name:</strong> {room.name}</p>
      <p><strong>Floor:</strong> {room.floor}</p>

      <button
        onClick={handleEdit}
        style={{
          padding: '8px 12px',
          backgroundColor: '#E9C46A',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '8px',
        }}
      >
        Edit Room
      </button>

      <button
        onClick={handleDelete}
        style={{
          padding: '8px 12px',
          backgroundColor: '#e63946',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Delete Room
      </button>
    </div>
  );
};

export default RoomSidebar;
