import { Flame } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import { useSpotsRemaining } from "@/hooks/use-spots";
import { useSiteSettings } from "@/lib/settings-context";
import { Button } from "@/components/ui/button";

export function UrgencyBar() {
  const { price_promo, price_full, currency, promo_end_iso, baseline_sold, promo_total_spots } = useSiteSettings();
  const { days, hours, minutes, seconds, expired } = useCountdown(promo_end_iso);
  const { remaining, total } = useSpotsRemaining(baseline_sold, promo_total_spots);

  if (expired) return null;

  return (
    <div className="sticky top-0 z-50 w-full border-b border-primary/30 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-3 py-2 sm:flex-row sm:gap-6 sm:px-6 sm:py-2.5">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-primary">
            <Flame className="size-3.5" />
            Promo lancement
          </span>
          <span className="text-foreground">
            <span className="font-semibold">{price_promo.toLocaleString("fr-FR")} {currency}</span>
            <span className="ml-1.5 text-muted-foreground line-through">
              {price_full.toLocaleString("fr-FR")} {currency}
            </span>
          </span>
          <span className="hidden text-muted-foreground sm:inline">·</span>
          <span className="tabular-nums font-medium text-foreground">
            {String(days).padStart(2, "0")}j {String(hours).padStart(2, "0")}h{" "}
            {String(minutes).padStart(2, "0")}m {String(seconds).padStart(2, "0")}s
          </span>
          <span className="hidden text-muted-foreground sm:inline">·</span>
          <span className="text-muted-foreground">
            <span className="font-semibold text-emerald">{remaining}</span>/{total} places
          </span>
        </div>
        <Button asChild size="sm" className="h-8 px-4 text-xs font-semibold">
          <a href="#acheter">Commander</a>
        </Button>
      </div>
    </div>
  );
}
