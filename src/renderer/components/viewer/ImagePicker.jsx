import React, { useState, useMemo } from 'react';
import { getThumbnailUrl } from '../../hooks/useThumbnail';
import { useObserver } from '../../hooks/useObserver';
import Icon from '../common/Icon';

function PickerCell({ image, onSelect }) {
  const [ref, visible] = useObserver();
  return (
    <div
      ref={ref}
      onClick={() => onSelect(image.id)}
      className="bg-surface-100 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-accent-500 hover:shadow-ios-md transition-all group"
    >
      <div className="w-full bg-surface-200 flex items-center justify-center rounded-t-xl" style={{ height: 64 }}>
        {visible ? (
          <img
            src={getThumbnailUrl(image.file_hash)}
            alt={image.file_name}
            className="max-w-full max-h-full object-contain rounded-t-xl"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-surface-200 animate-pulse rounded-t-xl" />
        )}
      </div>
      <div className="px-1.5 py-1">
        <p className="text-2xs text-surface-800 truncate">{image.file_name}</p>
      </div>
    </div>
  );
}

export default function ImagePicker({ images, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return images;
    const q = search.toLowerCase();
    return images.filter(img => img.file_name.toLowerCase().includes(q));
  }, [images, search]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-ios-lg w-[520px] max-h-[75vh] flex flex-col border border-surface-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 shrink-0">
          <span className="text-sm font-semibold text-surface-900">选择图片</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-200 text-surface-800 hover:text-surface-900 transition-colors"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2.5 border-b border-surface-200 shrink-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索文件名..."
            className="w-full px-3 py-2 bg-surface-100 border border-surface-300 rounded-xl text-sm text-surface-900 placeholder-surface-700 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
            autoFocus
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-surface-700">
              {search ? '无匹配图片' : '暂无图片'}
            </div>
          ) : (
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
              {filtered.map(img => (
                <PickerCell key={img.id} image={img} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-surface-200 text-2xs text-surface-800 shrink-0">
          共 {filtered.length} 张{search && ` · 搜索"${search}"`}
        </div>
      </div>
    </div>
  );
}
