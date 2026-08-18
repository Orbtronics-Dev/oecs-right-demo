"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger, in ms. Use the item index × ~60 inside a list. */
  delay?: number;
  /** Travel distance. Small is convincing; large reads as a slideshow. */
  shift?: string;
  as?: ElementType;
  className?: string;
}

/**
 * Reveals its children once, when they first scroll into view.
 *
 * Deliberately one-shot: re-animating on every scroll-past is the thing that
 * makes animated pages exhausting to read. The observer disconnects after
 * firing, and anything already on screen at mount reveals immediately rather
 * than waiting for a scroll that may never come.
 *
 * Motion lives in CSS (`[data-reveal]`), so `prefers-reduced-motion` disables
 * it in one place and the content is always present in the DOM regardless.
 */
const Reveal = ({
  children,
  delay = 0,
  shift = "1rem",
  as: Tag = "div",
  className,
}: RevealProps) => {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver, or motion is unwelcome: show it and move on.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    // Already on screen at mount — show it now rather than waiting for an
    // observer callback. Above-the-fold content is exactly the content that
    // must not depend on callback timing to become visible, and there is
    // nothing to animate into view for something the reader can already see.
    if (node.getBoundingClientRect().top < window.innerHeight) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      // Fire a little before the element is fully visible, so the motion has
      // finished by the time the reader's eye arrives.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "in" : ""}
      style={{ "--reveal-delay": `${delay}ms`, "--reveal-shift": shift } as React.CSSProperties}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
