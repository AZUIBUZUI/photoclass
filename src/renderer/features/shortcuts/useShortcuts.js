import { useEffect, useCallback } from 'react';
import useStore from '../../stores';

export function useShortcuts() {
  const store = useStore;

  const handleAction = useCallback(async (actionId) => {
    const s = store.getState();
    if (!s.currentId) return;

    // Navigation
    if (actionId === 'nav.next')  { s.nextImage(); return; }
    if (actionId === 'nav.prev')  { s.prevImage(); return; }
    if (actionId === 'nav.first') { if (s.images.length) s.setCurrentId(s.images[0].id); return; }
    if (actionId === 'nav.last')  { if (s.images.length) s.setCurrentId(s.images[s.images.length-1].id); return; }

    // Viewer
    if (actionId === 'viewer.zoomIn')  { s.setZoom(Math.min(5, s.zoom+0.25)); return; }
    if (actionId === 'viewer.zoomOut') { s.setZoom(Math.max(0.1, s.zoom-0.25)); return; }
    if (actionId === 'viewer.zoomFit') { s.setZoom(1); return; }
    if (actionId === 'viewer.fullscreen') { s.setFullscreen(!s.fullscreen); return; }

    // Rating
    if (actionId === 'tag.rate.1') { await rate(1); return; }
    if (actionId === 'tag.rate.2') { await rate(2); return; }
    if (actionId === 'tag.rate.3') { await rate(3); return; }
    if (actionId === 'tag.rate.4') { await rate(4); return; }
    if (actionId === 'tag.rate.5') { await rate(5); return; }
    if (actionId === 'tag.clearRating') { await rate(0); return; }
    if (actionId === 'tag.favorite') { await fav(); return; }

    // Tag toggle
    if (actionId.startsWith('__tag:')) {
      await toggleTag(Number(actionId.replace('__tag:', '')));
      return;
    }

    // App
    if (actionId === 'app.deleteImage') { await del(); return; }
  }, []);

  async function rate(val) {
    const s = store.getState();
    try {
      await window.api.invoke('image:updateRating', s.currentId, val);
      const updated = s.images.map(img =>
        img.id === s.currentId ? { ...img, rating: val } : img
      );
      store.setState({ images: updated });
      s.addToast(val > 0 ? `${'★'.repeat(val)}` : '评分清除', val > 0 ? 'success' : 'info');
      if (s.autoAdvance && val > 0) s.nextImage();
    } catch (e) { s.addToast('操作失败', 'error'); }
  }

  async function fav() {
    const s = store.getState();
    try {
      const r = await window.api.invoke('image:toggleFavorite', s.currentId);
      const updated = s.images.map(img =>
        img.id === s.currentId ? { ...img, is_favorite: r.data ? 1 : 0 } : img
      );
      store.setState({ images: updated });
      s.addToast(r.data ? '♥ 已收藏' : '取消收藏', 'info');
    } catch (e) { s.addToast('操作失败', 'error'); }
  }

  async function toggleTag(tagId) {
    const s = store.getState();
    try {
      const r = await window.api.invoke('tag:toggleOnImage', s.currentId, tagId);
      s.bumpTagVersion(); // notify TagPanel to refresh
      if (s.autoAdvance && r.data) s.nextImage();
    } catch (e) { s.addToast('操作失败', 'error'); }
  }

  async function del() {
    const s = store.getState();
    try {
      const c = await window.api.invoke('dialog:confirm', '确定移除此图片？（不删原文件）', '移除');
      if (!c.data) return;
      await window.api.invoke('image:delete', s.currentId);
      s.addToast('已移除', 'info');
      s.nextImage();
    } catch (e) { s.addToast('操作失败', 'error'); }
  }

  useEffect(() => {
    const unsub = window.api.onShortcut((actionId) => {
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      handleAction(actionId);
    });
    return unsub;
  }, [handleAction]);
}
