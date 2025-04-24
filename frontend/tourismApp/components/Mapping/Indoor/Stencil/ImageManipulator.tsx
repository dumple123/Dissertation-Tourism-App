import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface ImageManipulatorProps {
  map: mapboxgl.Map;
  imageUrl: string;
  center: mapboxgl.LngLatLike;
  scaleX: number;
  scaleY: number;
  rotation: number;
  onChange: (data: {
    center: mapboxgl.LngLatLike;
    scaleX: number;
    scaleY: number;
    rotation: number;
  }) => void;
  disabled?: boolean;
  opacity?: number;
}

export default function ImageManipulator({
  map,
  imageUrl,
  center,
  scaleX,
  scaleY,
  rotation,
  onChange,
  disabled = false,
  opacity,
}: ImageManipulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragStartCenterPx = useRef<{ x: number; y: number } | null>(null);
  const [, forceUpdate] = useState(0);

  const getCenterPixels = () => map.project(center);

  const updateCenterFromPixel = (x: number, y: number) => {
    const lngLat = map.unproject([x, y]);
    onChange({ center: [lngLat.lng, lngLat.lat], scaleX, scaleY, rotation });
  };

  useEffect(() => {
    if (disabled) return;
  
    const update = () => forceUpdate((n) => n + 1);
    map.on('move', update);
    map.on('zoom', update);
    return () => {
      map.off('move', update);
      map.off('zoom', update);
    };
  }, [map, disabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragStartCenterPx.current = getCenterPixels();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragStart.current || !dragStartCenterPx.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const newX = dragStartCenterPx.current.x + dx;
    const newY = dragStartCenterPx.current.y + dy;
    updateCenterFromPixel(newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
    dragStartCenterPx.current = null;
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const centerPx = getCenterPixels();
    const origin = { x: centerPx.x, y: centerPx.y };
    const startAngle = Math.atan2(e.clientY - origin.y, e.clientX - origin.x);
    const initialRotation = rotation;

    const onMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - origin.y, moveEvent.clientX - origin.x);
      const angleDelta = ((currentAngle - startAngle) * 180) / Math.PI;
      const newRotation = initialRotation + angleDelta;
      onChange({ center, scaleX, scaleY, rotation: newRotation });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Edge stretching (resizes along one axis)
  const handleEdgeResize = (edge: 'left' | 'right' | 'top' | 'bottom') => (e: React.MouseEvent) => {
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY };
    const initialScaleX = scaleX;
    const initialScaleY = scaleY;

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      let newScaleX = scaleX;
      let newScaleY = scaleY;

      if (edge === 'left' || edge === 'right') {
        const direction = edge === 'right' ? 1 : -1;
        const delta = direction * dx / 100;
        let next = initialScaleX + delta;
        if (Math.abs(next) < 0.1) next = 0.1 * Math.sign(next || delta);
        newScaleX = next;
      }
      if (edge === 'top' || edge === 'bottom') {
        const direction = edge === 'bottom' ? 1 : -1;
        const delta = direction * dy / 100;
        let next = initialScaleY + delta;
        if (Math.abs(next) < 0.1) next = 0.1 * Math.sign(next || delta);
        newScaleY = next;
      }

      onChange({ center, scaleX: newScaleX, scaleY: newScaleY, rotation });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Corner resize (preserves aspect ratio)
  const handleCornerResize = () => (e: React.MouseEvent) => {
    e.stopPropagation();
    const centerPx = getCenterPixels();
    const origin = { x: centerPx.x, y: centerPx.y };
    const initialScale = Math.max(scaleX, scaleY);

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - origin.x;
      const dy = moveEvent.clientY - origin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const newScale = Math.max(0.1, distance / 100);
      onChange({ center, scaleX: newScale, scaleY: newScale, rotation });
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
  const width = 100 * scaleX;
  const height = 100 * scaleY;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: centerPx.x - Math.abs(width) / 2,
        top: centerPx.y - Math.abs(height) / 2,
        width: Math.abs(width),
        height: Math.abs(height),
        transform: `
          rotate(${rotation}deg)
          scaleX(${scaleX < 0 ? -1 : 1})
          scaleY(${scaleY < 0 ? -1 : 1})
        `,
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
          opacity: opacity ?? 0.4,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {!disabled && (
        <>
          {/* Edge drag zones */}
          <div onMouseDown={handleEdgeResize('left')} style={edgeZone('left', width, height)} />
          <div onMouseDown={handleEdgeResize('right')} style={edgeZone('right', width, height)} />
          <div onMouseDown={handleEdgeResize('top')} style={edgeZone('top', width, height)} />
          <div onMouseDown={handleEdgeResize('bottom')} style={edgeZone('bottom', width, height)} />

          {/* Corner drag zone for aspect-ratio-resize */}
          <div onMouseDown={handleCornerResize()} style={cornerZone('bottom-right', width, height)} />

          {/* Rotate handle */}
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
        </>
      )}
    </div>
  );
}

const MIN_ZONE_SIZE = 20;
const MIN_CORNER_SIZE = 28;

// Accept width/height of image and scale the hit area proportionally
function edgeZone(
  position: 'left' | 'right' | 'top' | 'bottom',
  width: number,
  height: number
): React.CSSProperties {
  const dynamicSize =
    position === 'left' || position === 'right'
      ? Math.max(MIN_ZONE_SIZE, height * 0.1)
      : Math.max(MIN_ZONE_SIZE, width * 0.1);
  const half = dynamicSize / 2;

  const common: React.CSSProperties = {
    position: 'absolute',
    zIndex: 12,
    backgroundColor: 'transparent',
    pointerEvents: 'auto',
  };

  switch (position) {
    case 'left':
      return { ...common, top: -half, bottom: -half, left: -half, width: dynamicSize, cursor: 'ew-resize' };
    case 'right':
      return { ...common, top: -half, bottom: -half, right: -half, width: dynamicSize, cursor: 'ew-resize' };
    case 'top':
      return { ...common, left: -half, right: -half, top: -half, height: dynamicSize, cursor: 'ns-resize' };
    case 'bottom':
      return { ...common, left: -half, right: -half, bottom: -half, height: dynamicSize, cursor: 'ns-resize' };
  }
}

function cornerZone(
  corner: 'bottom-right',
  width: number,
  height: number
): React.CSSProperties {
  const dynamicSize = Math.max(MIN_CORNER_SIZE, Math.min(width, height) * 0.15);
  const half = dynamicSize / 2;

  const common: React.CSSProperties = {
    position: 'absolute',
    width: dynamicSize,
    height: dynamicSize,
    zIndex: 13,
    backgroundColor: 'transparent',
    pointerEvents: 'auto',
  };

  switch (corner) {
    case 'bottom-right':
      return { ...common, right: -half, bottom: -half, cursor: 'nwse-resize' };
  }
} 