import { useCountdown } from "@/hooks/use-countdown";
import { useSiteSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";

interface CountdownProps {
  variant?: "bar" | "block";
  className?: string;
}

function Cell({ value, label, compact }: { value: number; label: string; compact?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "tabular-nums font-serif font-semibold text-primary leading-none",
          compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-5xl"
        )}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div
        className={cn(
          "uppercase tracking-widest text-muted-foreground mt-1",
          compact ? "text-[10px]" : "text-[10px] sm:text-xs"
        )}
      >
        {label}
      </div>
    </div>
  );
}

function Sep({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "text-primary/40 font-serif",
        compact ? "text-xl" : "text-3xl sm:text-5xl"
      )}
      aria-hidden
    >
      :
    </div>
  );
}

export function Countdown({ variant = "block", className }: CountdownProps) {
  const { promo_end_iso } = useSiteSettings();
  const { days, hours, minutes, seconds, expired } = useCountdown(promo_end_iso);
  const compact = variant === "bar";

  if (expired) {
    return (
      <div className={cn("text-sm font-medium", className)}>
        Promo de lancement terminée
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3",
        compact ? "gap-1.5" : "gap-3",
        className
      )}
      aria-label="Compte à rebours jusqu'à la fin de la promo"
    >
      <Cell value={days} label="Jours" compact={compact} />
      <Sep compact={compact} />
      <Cell value={hours} label="Heures" compact={compact} />
      <Sep compact={compact} />
      <Cell value={minutes} label="Min" compact={compact} />
      <Sep compact={compact} />
      <Cell value={seconds} label="Sec" compact={compact} />
    </div>
  );
}
