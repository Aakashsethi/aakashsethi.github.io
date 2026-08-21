import React, { useRef } from 'react';

/**
 * Wraps children in a container that translates slightly toward the cursor
 * when it's within `radius` px. Content is a nested span that translates a
 * fraction more, producing a subtle parallax between wrapper + label.
 *
 * Usage:
 *   <MagneticLink href="/blog/">
 *     <span>View writing <span className="arr">→</span></span>
 *   </MagneticLink>
 */
export default function MagneticLink({
  href,
  onClick,
  children,
  className = '',
  radius = 80,
  strength = 0.28,
  labelStrength = 0.5,
  as = 'a',
  ...rest
}) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  const onMove = (e) => {
    const el = outerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > radius) return reset();
    const t = 1 - d / radius;
    const tx = dx * strength * t;
    const ty = dy * strength * t;
    el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
    if (innerRef.current) {
      innerRef.current.style.transform =
        `translate(${(dx * labelStrength * t).toFixed(2)}px, ${(dy * labelStrength * t).toFixed(2)}px)`;
    }
  };

  const reset = () => {
    const el = outerRef.current;
    if (el) el.style.transform = '';
    if (innerRef.current) innerRef.current.style.transform = '';
  };

  const Tag = as;
  return (
    <Tag
      ref={outerRef}
      href={href}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`magnetic ${className}`.trim()}
      {...rest}
    >
      <span ref={innerRef} className="magnetic-inner">{children}</span>
    </Tag>
  );
}
