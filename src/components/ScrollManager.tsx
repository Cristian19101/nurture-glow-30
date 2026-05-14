import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NAV_OFFSET = 72;

export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      // retry a few times in case the section mounts after route change
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
          window.scrollTo({ top, behavior: 'smooth' });
          return;
        }
        if (tries++ < 20) requestAnimationFrame(tick);
      };
      tick();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);

  return null;
}