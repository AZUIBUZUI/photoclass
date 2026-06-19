import React, { useState } from 'react';
import useStore from '../stores';
import CompareCell from '../components/viewer/CompareCell';
import ImagePicker from '../components/viewer/ImagePicker';

export default function ComparePage() {
  const images = useStore(s => s.images);
  const [cols, setCols] = useState(2);
  const [slots, setSlots] = useState([null, null, null, null]);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncZoom, setSyncZoom] = useState(1);
  const [syncPan, setSyncPan] = useState({ x: 0, y: 0 });
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSlot, setPickerSlot] = useState(0);

  const setSlot = (i, id) => { const s = [...slots]; s[i] = id; setSlots(s); };
  const clear = () => {
    setSlots([null, null, null, null]);
    setSyncZoom(1);
    setSyncPan({ x: 0, y: 0 });
  };
  const openPicker = (i) => { setPickerSlot(i); setShowPicker(true); };

  const active = slots.slice(0, cols);

  return (
    <div className="h-full flex flex-col bg-surface-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 glass-strong border-b border-surface-200 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-surface-900">对比</span>
          <div className="flex gap-1">
            {[2, 4].map(n => (
              <button key={n} onClick={() => setCols(n)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${cols === n ? 'bg-accent-500 text-white shadow-ios' : 'bg-surface-200 text-surface-800 hover:bg-surface-300'}`}>
                {n} 张
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-surface-300" />
          <button
            onClick={() => { setSyncEnabled(!syncEnabled); if (!syncEnabled) { setSyncZoom(1); setSyncPan({ x: 0, y: 0 }); } }}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${syncEnabled ? 'bg-accent-500 text-white shadow-ios' : 'bg-surface-200 text-surface-800 hover:bg-surface-300'}`}
          >
            同步缩放
          </button>
        </div>
        <button onClick={clear} className="px-3 py-1.5 text-xs text-surface-800 hover:text-ios-red bg-surface-200 hover:bg-surface-300 rounded-lg transition-colors font-medium">
          清空
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 grid gap-2 p-2 bg-surface-100"
        style={{
          gridTemplateColumns: `repeat(${cols === 4 ? 2 : 2}, 1fr)`,
          gridTemplateRows: cols === 4 ? '1fr 1fr' : '1fr',
        }}>
        {active.map((imgId, i) => {
          const img = imgId ? images.find(x => x.id === imgId) : null;
          if (img) {
            return (
              <div key={i} className="relative bg-white rounded-2xl overflow-hidden group shadow-ios">
                <CompareCell
                  image={img}
                  syncEnabled={syncEnabled}
                  syncZoom={syncZoom}
                  syncPan={syncPan}
                  onZoomChange={setSyncZoom}
                  onPanChange={setSyncPan}
                  index={i}
                />
                {/* Hover controls */}
                <button
                  onClick={() => setSlot(i, null)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-7 h-7 bg-white/90 hover:bg-ios-red hover:text-white rounded-full flex items-center justify-center text-xs text-surface-800 transition-all shadow-ios"
                  title="移除"
                >
                  ✕
                </button>
                <button
                  onClick={() => openPicker(i)}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 px-2.5 py-1 text-xs bg-white/90 hover:bg-surface-100 rounded-lg text-surface-800 hover:text-surface-900 transition-all shadow-ios"
                  title="更换图片"
                >
                  更换
                </button>
              </div>
            );
          }
          // Empty slot
          return (
            <div
              key={i}
              onClick={() => openPicker(i)}
              className="bg-white rounded-2xl flex items-center justify-center cursor-pointer hover:shadow-ios-md border-2 border-dashed border-surface-300 hover:border-accent-500 transition-all"
            >
              <div className="text-center">
                <div className="text-4xl mb-2 text-surface-400">+</div>
                <p className="text-sm text-surface-700">选择图片</p>
              </div>
            </div>
          );
        })}
      </div>

      {showPicker && (
        <ImagePicker
          images={images}
          onSelect={(id) => { setSlot(pickerSlot, id); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
