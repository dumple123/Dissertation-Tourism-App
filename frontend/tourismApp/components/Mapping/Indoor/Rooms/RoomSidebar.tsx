import React, { useState } from 'react';
import { deleteRoom, updateRoom } from '~/api/room';
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
    accessible: boolean;
    isArea: boolean;
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
  const { setRings, setIsDrawing, setRoomInfo, setEditingRoomId, resetDrawing } = useDrawingContext();
  const [accessible, setAccessible] = useState(room.accessible);
  const [isArea, setIsArea] = useState(room.isArea);
  const [name, setName] = useState(room.name);
  const [isSavingName, setIsSavingName] = useState(false);

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

    resetDrawing();
    setRings(transformed);
    setRoomInfo({ name: room.name, floor: room.floor, buildingId: room.buildingId });
    setEditingRoomId(room.id);
  };

  const handleToggle = async (field: 'accessible' | 'isArea', value: boolean) => {
    try {
      await updateRoom(room.id, { [field]: value });
      if (field === 'accessible') setAccessible(value);
      if (field === 'isArea') setIsArea(value);
      onDeleteSuccess();
    } catch (err) {
      console.error(`Failed to update room ${field}:`, err);
      alert(`Failed to update room ${field}`);
    }
  };

  const handleNameSave = async () => {
    try {
      setIsSavingName(true);
      await updateRoom(room.id, { name });
      onDeleteSuccess();
    } catch (err) {
      console.error('Failed to update room name:', err);
      alert('Failed to update room name');
    } finally {
      setIsSavingName(false);
    }
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

      <label style={{ display: 'block', marginBottom: 8 }}>
        <strong>Name:</strong>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            marginTop: '4px',
            boxSizing: 'border-box',
          }}
        />
      </label>
      <button
        onClick={handleNameSave}
        disabled={isSavingName}
        style={{
          padding: '6px 10px',
          backgroundColor: '#2a9d8f',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '12px',
        }}
      >
        Save Name
      </button>

      <label style={{ display: 'block', marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={accessible}
          onChange={(e) => handleToggle('accessible', e.target.checked)}
          style={{ marginRight: 8 }}
        />
        Accessible
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={isArea}
          onChange={(e) => handleToggle('isArea', e.target.checked)}
          style={{ marginRight: 8 }}
        />
        Is Area
      </label>

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
