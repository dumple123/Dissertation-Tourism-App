export function createUserLocationMarker(): HTMLDivElement {
    const el = document.createElement('div');
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#2A9D8F'; // teal blue-green
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
    return el;
  }
  