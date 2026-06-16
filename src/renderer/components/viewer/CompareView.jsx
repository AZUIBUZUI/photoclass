import React, { useState, useEffect, useCallback } from 'react';
import CompareCell from './CompareCell';

export default function CompareView({ imageIds, cols }) {
  const [images, setImages] = useState([]);
  const [syncZoom, setSyncZoom] = useState(1);

  useEffect(() => {
    loadImages();
  }, [imageIds]);

  async function loadImages() {
    const results = [];
    for (const id of imageIds) {
      try {
        const result = await window.api.invoke('image:get', id);
        if (result.data) results.push(result.data);
      } catch (err) { /* ignore */ }
    }
    setImages(results);
  }

  const gridCols = cols === 4 ? 'grid-cols-2' : 'grid-cols-2';
  const gridRows = cols === 4 ? 'grid-rows-2' : 'grid-rows-1';

  // Fill empty slots
  const slots = [];
  for (let i = 0; i < cols; i++) {
    slots.push(images[i] || null);
  }

  return (
    <div className={`h-full grid ${gridCols} ${gridRows} gap-1 p-1 bg-surface-800`}>
      {slots.map((img, idx) => (
        <CompareCell
          key={idx}
          image={img}
          syncZoom={syncZoom}
          onZoomChange={setSyncZoom}
          index={idx}
        />
      ))}
    </div>
  );
}
