import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiZHVtcGxlMTIzIiwiYSI6ImNtOWFhbDd2YzAzMWoyaXNnemY3ZmkxamEifQ.l0vmJeNqgqNpL7vD94RrMA';

export default function MapViewComponent() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        new mapboxgl.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 14,
        });
      },
      (err) => {
        console.warn(err);
        new mapboxgl.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-1.615, 54.978], // fallback
          zoom: 14,
        });
      }
    );
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
}