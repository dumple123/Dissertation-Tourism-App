import React, { useEffect, useState } from 'react';
import { createMap, getMaps } from '~/api/map';
import { getTokens } from '~/utils/tokenUtils';

interface Props {
  onSelectMap: (map: { id: string; name: string }) => void;
}

export default function MapDropdown({ onSelectMap }: Props) {
  const [maps, setMaps] = useState<{ id: string; name: string }[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string>('');
  const [addingNew, setAddingNew] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        const { accessToken } = await getTokens();
        if (!accessToken) {
          console.warn("No access token found");
          return;
        }
        const data = await getMaps();
        setMaps(data);
      } catch (err) {
        console.error('Failed to load maps:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMaps();
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__add__') {
      setAddingNew(true);
    } else {
      const selected = maps.find((map) => map.id === value);
      if (selected) {
        setSelectedMapId(value);
        onSelectMap(selected);
      }
    }
  };

  const handleAddMap = async () => {
    try {
      const newMap = await createMap(newMapName);
      setMaps((prev) => [...prev, newMap]);
      setSelectedMapId(newMap.id);
      onSelectMap(newMap);
      setAddingNew(false);
      setNewMapName('');
    } catch (err) {
      console.error('Failed to create map:', err);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
      {!addingNew ? (
        <select value={selectedMapId} onChange={handleSelect}>
          <option value="" disabled>
            {loading ? 'Loading maps...' : 'Select a map'}
          </option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
          <option value="__add__">+ Add New Map</option>
        </select>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="New map name"
            value={newMapName}
            onChange={(e) => setNewMapName(e.target.value)}
          />
          <button onClick={handleAddMap}>Create</button>
        </div>
      )}
    </div>
  );
}
