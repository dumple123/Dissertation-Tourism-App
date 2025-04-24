import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import ImageManipulator from './ImageManipulator';

interface Props {
  map: mapboxgl.Map;
}

type LngLat = [number, number];

export default function FloorImageOverlayButton({ map }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [center, setCenter] = useState<LngLat | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [editing, setEditing] = useState<boolean>(true); // toggle editing vs static overlay

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const img = new Image();
    img.onload = () => {
      setAspectRatio(img.width / img.height);
    };
    img.src = url;

    const mapCenter = map.getCenter();
    setCenter([mapCenter.lng, mapCenter.lat]);
    setScale(1);
    setRotation(0);
    setEditing(true);
  };

  // For future: convert manipulator state to Mapbox image source
  const applyStaticImageOverlay = () => {
    if (!imageUrl || !center) return;

    const width = 0.001 * scale;
    const height = width / aspectRatio;

    const coords: LngLat[] = [
      [center[0] - width / 2, center[1] + height / 2],
      [center[0] + width / 2, center[1] + height / 2],
      [center[0] + width / 2, center[1] - height / 2],
      [center[0] - width / 2, center[1] - height / 2],
    ];

    const sourceId = 'floor-overlay';
    const layerId = 'floor-overlay-layer';

    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    map.addSource(sourceId, {
      type: 'image',
      url: imageUrl,
      coordinates: coords,
    });

    map.addLayer({
      id: layerId,
      source: sourceId,
      type: 'raster',
      paint: {
        'raster-opacity': 0.7,
      },
    });

    setEditing(false);
  };

  return (
    <>
      {/* Upload + Apply UI */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 12,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 8,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
        <input type="file" accept="image/png" onChange={handleUpload} />
        {imageUrl && (
          <>
            <button onClick={applyStaticImageOverlay}>Apply to Map</button>
            <button onClick={() => setEditing(true)}>Edit</button>
          </>
        )}
      </div>

      {/* Image Manipulation UI */}
      {imageUrl && center && editing && (
        <ImageManipulator
          map={map}
          imageUrl={imageUrl}
          center={center}
          scale={scale}
          rotation={rotation}
          aspectRatio={aspectRatio}
          onChange={({ center, scale, rotation }) => {
            setCenter(center as LngLat);
            setScale(scale);
            setRotation(rotation);
          }}
        />
      )}
    </>
  );
}
