"use client";

import { useEffect, useRef, useState } from "react";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Counts a figure up once, when it scrolls into view.
 *
 * The final value is rendered on the server and is the initial state, so the
 * real number is in the DOM before any JavaScript runs - the animation is an
 * enhancement over correct output, never a prerequisite for it. Under
 * reduced-motion it simply never animates.
 */
const CountUp = ({
  value,
  durationMs = 1100,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    let safety = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        setDisplay(Math.round(easeOutExpo(progress) * value));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);

      // requestAnimationFrame is throttled or suspended in a background tab, so
      // a reader who opens the page in a new tab and comes back later could
      // otherwise be left staring at a half-counted figure - i.e. the wrong
      // number, presented as a government statistic. This guarantees the true
      // value lands regardless of what the frame loop does.
      safety = window.setTimeout(() => {
        cancelAnimationFrame(frame);
        setDisplay(value);
      }, durationMs + 400);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!started.current && entries.some((entry) => entry.isIntersecting)) {
          started.current = true;
          setDisplay(0);
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(safety);
    };
  }, [value, durationMs]);

  const trueValue = value.toLocaleString("en-GB");

  return (
    <span
      ref={ref}
      className={className}
      data-numeric=""
      /* Assistive tech and copy-paste always get the real figure, never an
         intermediate frame of the animation. */
      aria-label={trueValue}
      title={trueValue}
    >
      <span aria-hidden="true">{display.toLocaleString("en-GB")}</span>
    </span>
  );
};

export default CountUp;
