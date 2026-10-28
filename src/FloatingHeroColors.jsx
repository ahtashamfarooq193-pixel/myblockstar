import React, { useEffect, useRef } from 'react';

export default function FloatingHeroColors() {
  const layer = useRef(null);

  useEffect(() => {
    const element = layer.current;
    const hero = element.closest('.hero-composition');
    const media = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let lastTime = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function tick(time) {
      const elapsed = Math.min(time - lastTime || 16, 50);
      lastTime = time;
      const easing = 1 - Math.exp(-elapsed / 190);
      currentX += (targetX - currentX) * easing;
      currentY += (targetY - currentY) * easing;
      element.style.setProperty('--mouse-color-x', `${currentX.toFixed(2)}px`);
      element.style.setProperty('--mouse-color-y', `${currentY.toFixed(2)}px`);
      frame = Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.1
        ? requestAnimationFrame(tick)
        : 0;
    }

    function start() {
      if (!frame) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    }

    function reset() {
      targetX = 0;
      targetY = 0;
      start();
    }

    function move(event) {
      if (!media.matches || event.pointerType === 'touch') return;
      const bounds = hero.getBoundingClientRect();
      if (event.clientY > bounds.bottom || bounds.bottom <= 0) {
        reset();
        return;
      }
      targetX = (event.clientX / window.innerWidth - 0.5) * Math.min(420, bounds.width * 0.4);
      targetY = (Math.max(0, event.clientY - bounds.top) / bounds.height - 0.5) * 260;
      start();
    }

    function preferenceChanged() {
      if (!media.matches) reset();
    }

    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    media.addEventListener('change', preferenceChanged);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      media.removeEventListener('change', preferenceChanged);
    };
  }, []);

  return (
    <div ref={layer} className="hero-floating-colors" aria-hidden="true" />
  );
}
