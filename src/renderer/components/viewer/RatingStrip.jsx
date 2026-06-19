import React, { useEffect, useState } from 'react';
import useStore from '../../stores';
import Icon from '../common/Icon';

export default function RatingStrip({ imageId }) {
  const [rating, setRating] = useState(0);
  const [fav, setFav] = useState(false);
  const addToast = useStore(s => s.addToast);
  const images = useStore(s => s.images);

  useEffect(() => {
    if (!imageId) return;
    const img = images.find(i => i.id === imageId);
    if (img) {
      setRating(img.rating || 0);
      setFav(img.is_favorite === 1);
    } else {
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

  if (!imageId) return null;

  return (
    <div className="h-8 shrink-0 bg-white border-t border-surface-200 flex items-center justify-center gap-3 z-10">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => setRate(rating === s ? 0 : s)}
            className={`text-base transition-all duration-150 ${s <= rating ? 'text-ios-orange hover:scale-110' : 'text-surface-300 hover:text-surface-600'}`}
            title={`${s}星`}
          >
            ★
          </button>
        ))}
      </div>
      <button
        onClick={toggleFav}
        className={`text-base transition-all duration-150 ${fav ? 'text-ios-red scale-110' : 'text-surface-300 hover:text-ios-red'}`}
        title={fav ? '取消收藏' : '收藏'}
      >
        <Icon name={fav ? 'heart-filled' : 'heart'} size={16} />
      </button>
    </div>
  );
}
