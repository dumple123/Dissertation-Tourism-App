import React from 'react';
import { deleteRoom } from '~/api/room';

interface RoomSidebarProps {
  room: {
    id: string;
    name: string;
    floor: number;
    [key: string]: any;
  };
  onDeleteSuccess: () => void;
  topOffset?: number;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({
  room,
  onDeleteSuccess,
  topOffset = 360,
}) => {
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

  return (
    <div
        style={{
            position: 'absolute', // fix: was 'relative'
            top: topOffset,        // now correctly uses offset
            left: 0,               // align with building sidebar
            zIndex: 10,            // ensure it's under building
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
