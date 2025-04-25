import mapboxgl from 'mapbox-gl';

// Creates and manages a puck-like marker showing user location and heading.
// Returns an object with update and remove methods.
export function createUserLocationPuck(map: mapboxgl.Map) {
  // Create a simple dot element
  const el = document.createElement('div');
  el.style.width = '16px';
  el.style.height = '16px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = '#2A9D8F'; // Teal-blue
  el.style.border = '3px solid white';
  el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';

  const marker = new mapboxgl.Marker({ element: el });

  let initialized = false;

  function update(coords: [number, number]) {
    marker.setLngLat(coords);
    if (!initialized) {
      marker.addTo(map);
      initialized = true;
    }
  }

  return {
    update,
    remove: () => marker.remove(),
  };
}