import React from 'react';
import EditBuildingButton from './EditBuildingButton';
import DeleteBuildingButton from './DeleteBuildingButton';

interface BuildingSidebarProps {
  name: string;
  id: string;
  onDeleteSuccess: () => void;
}

const BuildingSidebar: React.FC<BuildingSidebarProps> = ({ name, id, onDeleteSuccess }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        left: 20,
        backgroundColor: '#ffffff',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 11,
        minWidth: 200,
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>{name}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <EditBuildingButton buildingId={id} />
        <DeleteBuildingButton buildingId={id} onDeleteSuccess={onDeleteSuccess} />
      </div>
    </div>
  );
};

export default BuildingSidebar;
