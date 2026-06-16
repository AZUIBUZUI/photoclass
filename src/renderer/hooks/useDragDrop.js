import { useEffect } from 'react';

export function useDragDrop() {
  useEffect(() => {
    const fn = e => { e.preventDefault(); e.stopPropagation(); };
    document.addEventListener('dragover', fn);
    document.addEventListener('drop', fn);
    return () => {
      document.removeEventListener('dragover', fn);
      document.removeEventListener('drop', fn);
    };
  }, []);
}
