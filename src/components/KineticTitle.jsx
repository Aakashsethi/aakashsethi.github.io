import React, { useEffect, useState } from 'react';

/**
 * Renders `text` as individual characters that fade in + rise from y+10px,
 * staggered by index. Preserves spaces. If prefers-reduced-motion is set,
 * text appears immediately with no animation.
 */
export default function KineticTitle({ text, tag: Tag = 'h1', className = '', accentDot = false, stepMs = 22 }) {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Respect reduced motion preference
    const mql = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    setReduced(!!(mql && mql.matches));
    // Delay mount by one paint so the initial state is off-screen
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Group by word so each word stays as a single line-break unit;
  // characters within a word stagger independently.
  const words = text.split(/(\s+)/); // keep spaces as items
  let charIndex = 0;

  return (
    <Tag className={`kinetic-title ${className}`.trim()} aria-label={text}>
      {words.map((word, wi) => {
        if (/^\s+$/.test(word)) {
          const idx = charIndex++;
          return <span key={`s${wi}`} className="kinetic-space" style={{transitionDelay: `${reduced ? 0 : idx * stepMs}ms`}}> </span>;
        }
        return (
          <span key={`w${wi}`} className="kinetic-word">
            {Array.from(word).map((c) => {
              const i = charIndex++;
              const delay = reduced ? 0 : i * stepMs;
              return (
                <span
                  key={i}
                  className={`kinetic-char ${mounted ? 'is-in' : ''}`}
                  style={{ transitionDelay: `${delay}ms` }}
                  aria-hidden="true"
                >
                  {c}
                </span>
              );
            })}
          </span>
        );
      })}
      {accentDot && (
        <span
          className={`kinetic-dot ${mounted ? 'is-in' : ''}`}
          style={{ transitionDelay: `${(charIndex + 1) * stepMs}ms` }}
          aria-hidden="true"
        >
          .
        </span>
      )}
    </Tag>
  );
}
