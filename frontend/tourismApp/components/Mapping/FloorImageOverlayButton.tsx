import { useState } from 'react';
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
  const [pinned, setPinned] = useState<boolean>(false);

  const removeMapImageOverlay = () => {
    if (map.getLayer('floor-overlay-layer')) map.removeLayer('floor-overlay-layer');
    if (map.getSource('floor-overlay')) map.removeSource('floor-overlay');
  };

  const applyStaticImageOverlay = (
    imageUrl: string,
    map: mapboxgl.Map,
    center: LngLat,
    scale: number,
    aspectRatio: number
  ) => {
    const centerPx = map.project(center);
    const width = 100 * scale;
    const height = width / aspectRatio;

    const topLeft = map.unproject([centerPx.x - width / 2, centerPx.y - height / 2]);
    const topRight = map.unproject([centerPx.x + width / 2, centerPx.y - height / 2]);
    const bottomRight = map.unproject([centerPx.x + width / 2, centerPx.y + height / 2]);
    const bottomLeft = map.unproject([centerPx.x - width / 2, centerPx.y + height / 2]);

    const coords: LngLat[] = [
      [topLeft.lng, topLeft.lat],
      [topRight.lng, topRight.lat],
      [bottomRight.lng, bottomRight.lat],
      [bottomLeft.lng, bottomLeft.lat],
    ];

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
        'raster-opacity': 0.7,
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
      const ratio = img.width / img.height;
      const mapCenter = map.getCenter();
      const newCenter: LngLat = [mapCenter.lng, mapCenter.lat];
  
      setAspectRatio(ratio);
      setCenter(newCenter);
      setScale(1);
      setRotation(0);
      setPinned(true);
  
      removeMapImageOverlay();
      applyStaticImageOverlay(url, map, newCenter, 1, ratio); 
    };
    img.src = url;
  };

  const togglePinned = () => {
    if (!imageUrl || !center) return;

    const newPinned = !pinned;
    setPinned(newPinned);

    if (newPinned) {
      applyStaticImageOverlay(imageUrl, map, center, scale, aspectRatio);
    } else {
      removeMapImageOverlay();
    }
  };

  return (
    <>
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
          <button onClick={togglePinned}>
            {pinned ? 'Unpin Image' : 'Pin Image'}
          </button>
        )}
      </div>

      {imageUrl && center && !pinned && (
        <ImageManipulator
          map={map}
          imageUrl={imageUrl}
          center={center}
          scale={scale}
          rotation={rotation}
          aspectRatio={aspectRatio}
          disabled={false}
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
