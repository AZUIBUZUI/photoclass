import { useEffect } from 'react';

export function usePaste() {
  useEffect(() => {
    const fn = () => {}; // clipboard paste handled by main process
    document.addEventListener('paste', fn);
    return () => document.removeEventListener('paste', fn);
  }, []);
}
