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

  const slots = [];
  for (let i = 0; i < cols; i++) {
    slots.push(images[i] || null);
  }

  return (
    <div className={`h-full grid gap-1 p-1 bg-surface-200`}
      style={{
        gridTemplateColumns: `repeat(${cols === 4 ? 2 : 2}, 1fr)`,
        gridTemplateRows: cols === 4 ? '1fr 1fr' : '1fr',
      }}>
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
