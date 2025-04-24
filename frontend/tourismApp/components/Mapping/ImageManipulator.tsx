import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface ImageManipulatorProps {
  map: mapboxgl.Map;
  imageUrl: string;
  center: mapboxgl.LngLatLike;
  scale: number;
  rotation: number; // in degrees
  onChange: (data: {
    center: mapboxgl.LngLatLike;
    scale: number;
    rotation: number;
  }) => void;
  aspectRatio: number;
  disabled?: boolean;
}

export default function ImageManipulator({
  map,
  imageUrl,
  center,
  scale,
  rotation,
  aspectRatio,
  onChange,
  disabled = false,
}: ImageManipulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const getCenterPixels = () => {
    return map.project(center);
  };

  const updateCenterFromPixel = (x: number, y: number) => {
    const lngLat = map.unproject([x, y]);
    onChange({ center: [lngLat.lng, lngLat.lat], scale, rotation });
  };

  // Drag entire image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    dragStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const centerPx = getCenterPixels();
    updateCenterFromPixel(centerPx.x + dx, centerPx.y + dy);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  // Rotation
  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const centerPx = getCenterPixels();
    const origin = { x: centerPx.x, y: centerPx.y };

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - origin.x;
      const dy = moveEvent.clientY - origin.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      onChange({ center, scale, rotation: angle });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Resize (from corner)
  const handleResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const centerPx = getCenterPixels();
    const origin = { x: centerPx.x, y: centerPx.y };
    const start = { x: e.clientX, y: e.clientY };
    const initialScale = scale;

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - origin.x;
      const dy = moveEvent.clientY - origin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const newScale = Math.max(0.1, distance / 100); // arbitrary scale base
      onChange({ center, scale: newScale, rotation });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const centerPx = getCenterPixels();
  const width = 100 * scale;
  const height = width / aspectRatio;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: centerPx.x - width / 2,
        top: centerPx.y - height / 2,
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: 11,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <img
        src={imageUrl}
        alt="floor"
        style={{
          width: '100%',
          height: '100%',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Resize Handle (bottom-right corner) */}
      {!disabled && (
        <div
          onMouseDown={handleResize}
          style={{
            position: 'absolute',
            right: -6,
            bottom: -6,
            width: 12,
            height: 12,
            backgroundColor: '#E76F51',
            borderRadius: '50%',
            border: '2px solid white',
            cursor: 'nwse-resize',
          }}
        />
      )}

      {/* Rotate Handle (top-center) */}
      {!disabled && (
        <div
          onMouseDown={handleRotate}
          style={{
            position: 'absolute',
            left: '50%',
            top: -30,
            transform: 'translateX(-50%)',
            width: 14,
            height: 14,
            backgroundColor: '#F4A261',
            border: '2px solid white',
            borderRadius: '50%',
            cursor: 'grab',
          }}
        />
      )}
    </div>
  );
}
