import React, { useEffect, useLayoutEffect, useRef } from 'react';
import './logo-entrance.css';

export default function LogoEntrance({ onComplete }) {
  const dock = useRef(null);

  useLayoutEffect(() => {
    function alignWithHeader() {
      const brand = document.querySelector('.brand img');
      if (!brand || !dock.current) return;
      const bounds = brand.getBoundingClientRect();
      const markWidth = bounds.width * 164 / 638;
      dock.current.style.setProperty('--dock-x', `${bounds.left + markWidth / 2 - innerWidth / 2}px`);
      dock.current.style.setProperty('--dock-y', `${bounds.top + bounds.height / 2 - innerHeight / 2}px`);
      dock.current.style.setProperty('--dock-scale', String(markWidth / dock.current.offsetWidth));
    }
    alignWithHeader();
    window.addEventListener('resize', alignWithHeader);
    return () => window.removeEventListener('resize', alignWithHeader);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const fallback = window.setTimeout(onComplete, 3400);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');

    function skip(event) {
      if (event.key === 'Escape') onComplete();
    }
    function preferenceChanged() {
      if (preference.matches) onComplete();
    }

    window.addEventListener('keydown', skip);
    preference.addEventListener('change', preferenceChanged);
    return () => {
      window.clearTimeout(fallback);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', skip);
      preference.removeEventListener('change', preferenceChanged);
    };
  }, [onComplete]);

  return (
    <div
      className="logo-entrance"
      role="status"
      aria-label="Blockstar is opening"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onComplete();
      }}
    >
      <div className="entrance-dock" ref={dock} aria-hidden="true">
      <div className="entrance-mark">
        {['purple', 'teal', 'orange', 'yellow'].map((part) => (
          <svg
            key={part}
            className={`entrance-piece entrance-piece-${part}`}
            viewBox="0 0 164 160"
            width="192"
            height="192"
            aria-hidden="true"
          >
            <image href="/assets/blockstar-logo.png" width="638" height="160" />
          </svg>
        ))}
        <svg className="entrance-sheen" viewBox="0 0 164 160" aria-hidden="true">
          <image href="/assets/blockstar-logo.png" width="638" height="160" />
        </svg>
      </div>
      </div>
      <div className="entrance-loading-track" aria-hidden="true">
        <span />
      </div>
      <button className="entrance-skip" onClick={onComplete}>
        Skip intro
      </button>
    </div>
  );
}
