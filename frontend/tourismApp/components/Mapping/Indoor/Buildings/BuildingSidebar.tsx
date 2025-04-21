import React, { useState, useEffect } from 'react';
import EditBuildingButton from './EditBuildingButton';
import DeleteBuildingButton from './DeleteBuildingButton';
import { getTokens } from '~/utils/tokenUtils';

interface BuildingSidebarProps {
  name: string;
  id: string;
  onDeleteSuccess: () => void;
}

const BuildingSidebar: React.FC<BuildingSidebarProps> = ({ name, id, onDeleteSuccess }) => {
  const [buildingName, setBuildingName] = useState(name);
  const [numFloors, setNumFloors] = useState<number>(1);
  const [bottomFloor, setBottomFloor] = useState<number>(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { accessToken } = await getTokens();
        const res = await fetch(`http://localhost:3000/api/buildings/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (data) {
          setNumFloors(data.numFloors || 1);
          setBottomFloor(data.bottomFloor ?? 0);
        }
      } catch (err) {
        console.error('Failed to fetch building details:', err);
      }
    };

    fetchDetails();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const { accessToken } = await getTokens();
      const res = await fetch(`http://localhost:3000/api/buildings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: buildingName,
          numFloors,
          bottomFloor,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      alert('Building updated!');
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update building');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        left: 20,
        backgroundColor: '#ffffff',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 11,
        width: 260,
        boxSizing: 'border-box',
        fontFamily: 'Open Sans, sans-serif',
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 18, marginBottom: 16 }}>Building Details</h3>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Name</label>
        <input
          type="text"
          value={buildingName}
          onChange={(e) => setBuildingName(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Number of Floors</label>
        <input
          type="number"
          value={numFloors}
          onChange={(e) => setNumFloors(parseInt(e.target.value))}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Bottom Floor Number</label>
        <input
          type="number"
          value={bottomFloor}
          onChange={(e) => setBottomFloor(parseInt(e.target.value))}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={handleUpdate}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#2A9D8F',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          marginBottom: 10,
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        Save Changes
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <EditBuildingButton buildingId={id} />
        <DeleteBuildingButton buildingId={id} onDeleteSuccess={onDeleteSuccess} />
      </div>
    </div>
  );
};

export default BuildingSidebar;
