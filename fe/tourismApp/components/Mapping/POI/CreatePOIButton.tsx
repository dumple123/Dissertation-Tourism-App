import React, { useState } from 'react';

type CreatePOIButtonProps = {
  onStartPlacing: (name: string, description: string, hidden: boolean) => void;
  onSuccess: () => void;
};

export default function CreatePOIButton({ onStartPlacing, onSuccess }: CreatePOIButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hidden, setHidden] = useState(false);

  const handleStart = () => {
    if (!name.trim()) {
      alert('Please enter a POI name.');
      return;
    }
    onStartPlacing(name.trim(), description.trim(), hidden);
    onSuccess();
    setShowForm(false);
    setName('');
    setDescription('');
    setHidden(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setName('');
    setDescription('');
    setHidden(false);
  };

  return (
    <>
      {showForm ? (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#ffffff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          width: '320px',
          zIndex: 1000,
          fontFamily: 'sans-serif'
        }}>
          <button
            onClick={handleCancel}
            style={{
              position: 'absolute',
              top: 8,
              right: 12,
              background: 'none',
              border: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#999',
              cursor: 'pointer',
            }}
            aria-label="Close POI form"
          >
            ×
          </button>

          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>New POI</h3>

          <input
            type="text"
            placeholder="POI Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              marginBottom: '12px',
              padding: '10px',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />

          <textarea
            placeholder="POI Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              marginBottom: '12px',
              padding: '10px',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              resize: 'vertical',
              minHeight: '70px'
            }}
          />

          <label style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#333'
          }}>
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              style={{ marginRight: '8px', transform: 'scale(1.1)' }}
            />
            Make POI hidden
          </label>

          <button
            onClick={handleStart}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2A9D8F',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            Place POI
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#E9C46A',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4A261')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E9C46A')}
        >
          + Create POI
        </button>
      )}
    </>
  );
}
