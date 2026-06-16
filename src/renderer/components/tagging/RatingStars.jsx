import React, { useEffect, useState } from 'react';
import useStore from '../../stores';

export default function RatingStars({ imageId }) {
  const [rating, setRating] = useState(0);
  const [fav, setFav] = useState(false);
  const addToast = useStore(s => s.addToast);
  const images = useStore(s => s.images);

  // Read from store (updated by shortcuts), fallback to DB on image change
  useEffect(() => {
    if (!imageId) return;
    const img = images.find(i => i.id === imageId);
    if (img) {
      setRating(img.rating || 0);
      setFav(img.is_favorite === 1);
    } else {
      // First load — fetch from DB
      (async () => {
        try {
          const r = await window.api.invoke('image:get', imageId);
          if (r.data) { setRating(r.data.rating || 0); setFav(r.data.is_favorite === 1); }
        } catch (e) { /* ignore */ }
      })();
    }
  }, [imageId, images]);

  async function setRate(v) {
    try {
      await window.api.invoke('image:updateRating', imageId, v);
      setRating(v);
    } catch (e) { addToast('评分失败', 'error'); }
  }

  async function toggleFav() {
    try {
      const r = await window.api.invoke('image:toggleFavorite', imageId);
      if (r.data !== undefined) setFav(r.data);
    } catch (e) { addToast('操作失败', 'error'); }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(s => (
          <button
            key={s}
            onClick={() => setRate(rating === s ? 0 : s)}
            className={`text-lg transition-colors ${s <= rating ? 'text-amber-400 hover:text-amber-300' : 'text-slate-700 hover:text-slate-500'}`}
            title={`${s}星`}
          >
            ★
          </button>
        ))}
      </div>
      <button
        onClick={toggleFav}
        className={`text-lg transition-all ${fav ? 'text-red-400 scale-110' : 'text-slate-700 hover:text-slate-400'}`}
        title={fav ? '取消收藏' : '收藏'}
      >
        ♥
      </button>
    </div>
  );
}
