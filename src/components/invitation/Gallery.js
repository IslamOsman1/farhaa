'use client';

import { useState } from 'react';

export default function Gallery({ images }) {
  const [selectedImg, setSelectedImg] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <section className="inv-section">
      <h2 className="inv-title">لحظاتنا</h2>
      <div className="gallery-grid">
        {images.map((img, idx) => (
          <img 
            key={idx} 
            src={img.url} 
            alt="Gallery item" 
            className="gallery-item"
            onClick={() => setSelectedImg(img.url)}
          />
        ))}
      </div>

      {selectedImg && (
        <div className="gallery-modal" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} alt="Enlarged" className="gallery-modal-img" />
        </div>
      )}
    </section>
  );
}
