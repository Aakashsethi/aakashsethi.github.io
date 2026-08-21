import React, { useEffect, useRef } from 'react';

/**
 * Fixed-position full-viewport canvas that draws a very subtle dot grid.
 * Dots near the cursor brighten and grow. Nothing else on the site should
 * carry mousemove listeners at the document level to avoid double-work.
 *
 * Perf: uses requestAnimationFrame for repaints only when the cursor moves
 * or the page resizes. Dots outside the viewport are not touched.
 */
export default function CursorGrid() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ mx: -9999, my: -9999, w: 0, h: 0, dpr: 1, dirty: true });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Config
    const SPACING = 34;      // px between dots
    const BASE_R  = 0.9;     // base dot radius (px) — nearly invisible
    const MAX_R   = 3.2;     // dot radius at cursor
    const REACH   = 140;     // px — cursor influence radius
    const BASE_ALPHA = 0.16; // dot alpha when idle
    const HOT_ALPHA  = 0.85; // dot alpha when hovered

    const resize = () => {
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      canvas.width  = Math.floor(state.w * state.dpr);
      canvas.height = Math.floor(state.h * state.dpr);
      canvas.style.width  = state.w + 'px';
      canvas.style.height = state.h + 'px';
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      state.dirty = true;
    };

    const draw = () => {
      if (!state.dirty) return;
      state.dirty = false;
      ctx.clearRect(0, 0, state.w, state.h);

      const { mx, my } = state;
      const cols = Math.ceil(state.w / SPACING) + 1;
      const rows = Math.ceil(state.h / SPACING) + 1;

      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < rows; cy++) {
          const x = cx * SPACING;
          const y = cy * SPACING;
          const dx = x - mx;
          const dy = y - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > REACH) {
            ctx.beginPath();
            ctx.arc(x, y, BASE_R, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(28, 25, 23, ${BASE_ALPHA})`;
            ctx.fill();
          } else {
            const t = 1 - d / REACH;              // 0..1 near cursor
            const r = BASE_R + (MAX_R - BASE_R) * t;
            const a = BASE_ALPHA + (HOT_ALPHA - BASE_ALPHA) * t;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            // Amber tint on the hottest dots for the brand accent
            const R = 28 + Math.round(217 * t);
            const G = 25 + Math.round(140 * t);
            const B = 23 + Math.round(13 * t);
            ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${a})`;
            ctx.fill();
          }
        }
      }
    };

    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      state.mx = e.clientX;
      state.my = e.clientY;
      state.dirty = true;
    };
    const onLeave = () => {
      state.mx = -9999;
      state.my = -9999;
      state.dirty = true;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        mixBlendMode: 'multiply',
      }}
    />
  );
}
