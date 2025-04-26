import React, { useState, useEffect } from 'react';

type POISidePanelProps = {
  poi: any;
  onSave: (updatedPOI: any) => Promise<void>;
  onCancel: () => void;
  onEditPosition: () => void;
  isEditingPosition: boolean;
};

export default function POISidePanel({
  poi,
  onSave,
  onCancel,
  onEditPosition,
  isEditingPosition,
}: POISidePanelProps) {
  const [name, setName] = useState(poi.name);
  const [description, setDescription] = useState(poi.description || '');
  const [hidden, setHidden] = useState(poi.hidden);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(poi.name);
    setDescription(poi.description || '');
    setHidden(poi.hidden);
  }, [poi]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...poi,
        name: name.trim(),
        description: description.trim(),
        hidden,
      });
      alert('POI saved successfully!');
    } catch (error) {
      console.error('Failed to save POI:', error);
      alert('Failed to save POI.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
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
      {/* Close "X" button */}
      <button
        onClick={onCancel}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#999',
          cursor: 'pointer',
        }}
        aria-label="Close POI panel"
      >
        ×
      </button>

      <h3 style={{ marginTop: 0, fontSize: 18, marginBottom: 16 }}>POI Details</h3>

      {/* Name input */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Description textarea */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            resize: 'vertical',
            minHeight: '60px',
          }}
        />
      </div>

      {/* Hidden checkbox */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
        }}>
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          Hidden
        </label>
      </div>

      {/* Edit Position button */}
      <button
        onClick={onEditPosition}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '10px',
          backgroundColor: isEditingPosition ? '#2A9D8F' : '#E9C46A',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        {isEditingPosition ? 'Save Position' : 'Edit Position'}
      </button>

      {/* Save Changes button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '10px',
          backgroundColor: '#2A9D8F',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.8 : 1,
          boxSizing: 'border-box',
        }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Cancel button */}
      <button
        onClick={onCancel}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#ccc',
          color: '#333',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        Cancel
      </button>
    </div>
  );
}