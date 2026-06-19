import React, { useCallback, useEffect, useRef } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import useStore from '../../stores';
import ThumbnailCell from './ThumbnailCell';
import GridToolbar from './GridToolbar';
import Icon from '../common/Icon';

export default function ThumbnailGrid() {
  const images = useStore(s => s.images);
  const cellSize = useStore(s => s.cellSize);
  const currentId = useStore(s => s.currentId);
  const setCurrentId = useStore(s => s.setCurrentId);
  const selectedIds = useStore(s => s.selectedIds);
  const toggleSelect = useStore(s => s.toggleSelect);
  const clearSelection = useStore(s => s.clearSelection);

  const gridRef = useRef(null);
  const colsRef = useRef(1);
  const rowH = cellSize + 28;

  const onClick = useCallback((id, e) => {
    if (e.ctrlKey) { toggleSelect(id); return; }
    if (e.shiftKey && currentId) {
      const a = images.findIndex(i => i.id === currentId);
      const b = images.findIndex(i => i.id === id);
      const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
      clearSelection();
      for (let j = lo; j <= hi; j++) toggleSelect(images[j].id);
      return;
    }
    setCurrentId(id);
  }, [currentId, images]);

  useEffect(() => {
    if (!currentId || !gridRef.current) return;
    const idx = images.findIndex(img => img.id === currentId);
    if (idx < 0) return;
    const row = Math.floor(idx / colsRef.current);
    const col = idx % colsRef.current;
    gridRef.current.scrollToItem({ rowIndex: row, columnIndex: col, align: 'smart' });
  }, [currentId, images.length]);

  if (!images.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-surface-700">
        <Icon name="empty" size={48} className="mb-3 text-surface-400" />
        <p className="text-sm">拖拽图片到此处或点击导入</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <GridToolbar />
      <div className="flex-1 overflow-hidden">
        <AutoSizer>
          {({ width, height }) => {
            const cols = Math.max(1, Math.floor((width + 4) / (cellSize + 4)));
            const rows = Math.ceil(images.length / cols);
            const cw = (width - (cols - 1) * 4) / cols;
            colsRef.current = cols;
            return (
              <FixedSizeGrid ref={gridRef} columnCount={cols} columnWidth={cw} rowCount={rows} rowHeight={rowH}
                width={width} height={height} overscanRowCount={2}
                itemData={{ images, cols, cw, cellSize, currentId, selectedIds, onClick }}>
                {ThumbnailCell}
              </FixedSizeGrid>
            );
          }}
        </AutoSizer>
      </div>
    </div>
  );
}
