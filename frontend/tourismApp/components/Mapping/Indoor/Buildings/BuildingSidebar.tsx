import React, { useState, useEffect, forwardRef } from 'react';
import EditBuildingButton from './EditBuildingButton';
import DeleteBuildingButton from './DeleteBuildingButton';
import { updateBuilding } from '~/api/building';
import { useDrawingContext } from '../Drawing/useDrawing';

interface BuildingSidebarProps {
  building: {
    id: string;
    name: string;
    numFloors: number;
    bottomFloor: number;
    [key: string]: any;
  };
  onDeleteSuccess: () => void;
  onEditSuccess: () => void; 
}

// Wrap in forwardRef so we can measure height from parent
const BuildingSidebar = forwardRef<HTMLDivElement, BuildingSidebarProps>(
  ({ building, onDeleteSuccess, onEditSuccess }, ref) => {
    const [buildingName, setBuildingName] = useState(building.name);
    const [numFloors, setNumFloors] = useState<number>(building.numFloors ?? 1);
    const [bottomFloor, setBottomFloor] = useState<number>(building.bottomFloor ?? 0);
    const { rings, exitDrawing } = useDrawingContext();

    // Update local state if a new building is selected
    useEffect(() => {
      setBuildingName(building.name);
      setNumFloors(building.numFloors ?? 1);
      setBottomFloor(building.bottomFloor ?? 0);
    }, [building]);

    const handleUpdate = async () => {
      try {
        await updateBuilding(building.id, {
          name: buildingName,
          numFloors,
          bottomFloor,
          geojson: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: rings.map((ring) => [...ring, ring[0]]),
            },
            properties: {
              name: buildingName,
            },
          },
        });
        alert('Building updated!');
        exitDrawing();
        onEditSuccess();
      } catch (err) {
        console.error('Update error:', err);
        alert('Failed to update building');
      }
    };

    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
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
          <EditBuildingButton
            buildingId={building.id}
            onEditSuccess={onEditSuccess} 
          />
          <DeleteBuildingButton
            buildingId={building.id}
            onDeleteSuccess={onDeleteSuccess}
          />
        </div>
      </div>
    );
  }
);

BuildingSidebar.displayName = 'BuildingSidebar';
export default BuildingSidebar;
