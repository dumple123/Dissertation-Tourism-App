import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import ImageManipulator from './ImageManipulator';

interface Props {
  map: mapboxgl.Map;
}

type LngLat = [number, number];

export default function FloorImageOverlayButton({ map }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [center, setCenter] = useState<LngLat | null>(null);
  const [scaleX, setScaleX] = useState<number>(1);
  const [scaleY, setScaleY] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pinned, setPinned] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(0.4); // NEW

  useEffect(() => {
    if (!pinned || !map.getLayer('floor-overlay-layer')) return;
  
    map.setPaintProperty('floor-overlay-layer', 'raster-opacity', opacity);
  }, [opacity, pinned, map]);

  const removeMapImageOverlay = () => {
    if (map.getLayer('floor-overlay-layer')) map.removeLayer('floor-overlay-layer');
    if (map.getSource('floor-overlay')) map.removeSource('floor-overlay');
  };

  const applyStaticImageOverlay = (
    imageUrl: string,
    map: mapboxgl.Map,
    center: LngLat,
    scaleX: number,
    scaleY: number,
    rotation: number
  ) => {
    const centerPx = map.project(center);
    const width = 100 * scaleX;
    const height = 100 * scaleY;
  
    // Get corner points in pixel space
    const cornersPx = [
      [-width / 2, -height / 2], // top-left
      [width / 2, -height / 2],  // top-right
      [width / 2, height / 2],   // bottom-right
      [-width / 2, height / 2],  // bottom-left
    ];
  
    // Apply rotation (around center)
    const angle = (rotation * Math.PI) / 180;
    const rotated = cornersPx.map(([x, y]) => {
      const rx = x * Math.cos(angle) - y * Math.sin(angle);
      const ry = x * Math.sin(angle) + y * Math.cos(angle);
      return [centerPx.x + rx, centerPx.y + ry];
    });
  
    // Convert back to geographic coordinates
    const coords: LngLat[] = rotated.map(([x, y]) => {
      const { lng, lat } = map.unproject([x, y]);
      return [lng, lat];
    });
  
    removeMapImageOverlay();
  
    map.addSource('floor-overlay', {
      type: 'image',
      url: imageUrl,
      coordinates: coords,
    });
  
    map.addLayer({
      id: 'floor-overlay-layer',
      source: 'floor-overlay',
      type: 'raster',
      paint: {
        'raster-opacity': opacity,
      },
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const img = new Image();
    img.onload = () => {
      const mapCenter = map.getCenter();
      const newCenter: LngLat = [mapCenter.lng, mapCenter.lat];

      setCenter(newCenter);
      setScaleX(1);
      setScaleY(1);
      setRotation(0);
      setPinned(true);

      removeMapImageOverlay();
      applyStaticImageOverlay(url, map, newCenter, 1, 1, 0);
    };
    img.src = url;
  };

  const togglePinned = () => {
    if (!imageUrl || !center) return;

    const newPinned = !pinned;
    setPinned(newPinned);

    if (newPinned) {
      applyStaticImageOverlay(imageUrl, map, center, scaleX, scaleY, rotation);
    } else {
      removeMapImageOverlay();
    }
  };

  return (
    <>
      {/* Upload & Controls */}
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
        gap: 12,
        alignItems: 'center',
      }}>
        <input type="file" accept="image/png" onChange={handleUpload} />
        {imageUrl && (
          <>
            <button onClick={togglePinned}>
              {pinned ? 'Unpin Image' : 'Pin Image'}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Opacity
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
              />
            </label>
          </>
        )}
      </div>

      {/* Editable Image Manipulator */}
      {imageUrl && center && !pinned && (
        <ImageManipulator
          map={map}
          imageUrl={imageUrl}
          center={center}
          scaleX={scaleX}
          scaleY={scaleY}
          rotation={rotation}
          disabled={false}
          opacity={opacity} // pass opacity to image
          onChange={({ center, scaleX, scaleY, rotation }) => {
            setCenter(center as LngLat);
            setScaleX(scaleX);
            setScaleY(scaleY);
            setRotation(rotation);
          }}
        />
      )}
    </>
  );
}