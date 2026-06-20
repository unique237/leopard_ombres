import { useEffect, useRef } from "react";

export function useParallax<T extends HTMLElement>(speed = 0.18, clamp = 120) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const parent = el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const viewMid = window.innerHeight / 2;
      const elMid = rect.top + rect.height / 2;
      const raw = (viewMid - elMid) * speed;
      const offset = Math.max(-clamp, Math.min(clamp, raw));
      el.style.transform = `translateY(${offset.toFixed(2)}px)`;
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [speed, clamp]);
  return ref;
}
