import React from 'react';
import { deleteRoom } from '~/api/room';

interface RoomSidebarProps {
  id: string;
  name: string;
  floor: number;
  onDeleteSuccess: () => void;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({ id, name, floor, onDeleteSuccess }) => {
  const handleDelete = async () => {
    const confirmDelete = confirm('Are you sure you want to delete this room?');
    if (!confirmDelete) return;

    try {
      await deleteRoom(id);
      alert('Room deleted');
      onDeleteSuccess();
    } catch (err) {
      console.error('Failed to delete room:', err);
      alert('Failed to delete room');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        left: 300,
        backgroundColor: '#ffffff',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 11,
        width: 240,
        boxSizing: 'border-box',
        fontFamily: 'Open Sans, sans-serif',
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 18, marginBottom: 16 }}>Room Details</h3>

      <p><strong>Name:</strong> {name}</p>
      <p><strong>Floor:</strong> {floor}</p>

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
