import React from 'react';

interface BuildingSidebarProps {
  name: string;
}

const BuildingSidebar: React.FC<BuildingSidebarProps> = ({ name }) => {
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
    </div>
  );
};

export default BuildingSidebar;