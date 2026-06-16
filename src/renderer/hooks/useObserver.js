import { useEffect, useRef, useState } from 'react';

export function useObserver() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); ob.unobserve(el); } }, { rootMargin: '100px' });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return [ref, vis];
}
