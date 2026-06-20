import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Retour en haut"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-5 right-5 z-50 inline-flex size-11 items-center justify-center rounded-full border border-primary/40 bg-background/80 text-primary shadow-lg backdrop-blur transition-all duration-300 hover:bg-primary hover:text-primary-foreground sm:bottom-8 sm:right-8",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none",
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
