"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedStatProps = {
  value: string | number;
  className?: string;
  duration?: number;
};

export function AnimatedStat({
  value,
  className = "",
  duration = 1400,
}: AnimatedStatProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  const target = String(value);
  const match = target.match(/^(\d+(?:[.,]\d+)?)(.*)$/);

  const number = match
    ? Number(match[1].replace(",", "."))
    : 0;

  const suffix = match?.[2] ?? "";
  const decimals = match?.[1].split(/[.,]/)[1]?.length ?? 0;
  const isNumeric = Boolean(match);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || !isNumeric) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setProgress(1);
      return;
    }

    const startTime = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const linear = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - linear, 3);

      setProgress(eased);

      if (linear < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [started, duration, isNumeric]);

  const display = isNumeric
    ? `${(number * progress).toFixed(decimals)}${suffix}`
    : target;

  return (
    <p
      ref={ref}
      className={className}
      aria-label={target}
      aria-live="off"
    >
      {display}
    </p>
  );
}