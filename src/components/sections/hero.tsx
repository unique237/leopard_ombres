import { ShieldCheck, BookOpenText, Truck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSpotsRemaining } from "@/hooks/use-spots";
import { useParallax } from "@/hooks/use-parallax";
import { useSiteSettings } from "@/lib/settings-context";

export function Hero() {
  const { price_promo, price_full, currency, baseline_sold, promo_total_spots } = useSiteSettings();
  const { remaining, total, sold } = useSpotsRemaining(baseline_sold, promo_total_spots);
  const progressPct = Math.min(100, (sold / total) * 100);
  const coverRef = useParallax<HTMLDivElement>(0.14, 80);
  const blobRef = useParallax<HTMLDivElement>(-0.06, 40);

  return (
    <section
      id="accueil"
      className="relative overflow-hidden border-b border-border/40"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          ref={blobRef}
          className="absolute -top-32 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-emerald/10 blur-3xl will-change-transform"
        />
        <div className="absolute bottom-0 right-0 size-[400px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <div className="lg:col-span-7 lg:order-1 fade-in">
          <Badge
            variant="outline"
            className="mb-5 border-primary/40 bg-primary/5 text-primary"
          >
            Roman politique africain · 2025
          </Badge>

          <h1 className="font-serif text-3xl leading-[1.05] tracking-tight text-foreground min-[480px]:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
            Le Léopard
            <br />
            <span className="italic text-gold-gradient">et les Ombres</span>
          </h1>

          <p className="mt-5 max-w-xl font-serif text-lg italic text-muted-foreground sm:text-xl">
            « Quand le pouvoir rencontre l'occulte, l'Afrique retient son souffle. »
          </p>

          <div className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Un roman de <span className="text-foreground">Koreen MBOMBELE</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild className="h-12 px-7 text-base font-semibold shadow-lg shadow-primary/20">
              <a href="#acheter">Obtenir le livre maintenant</a>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-7 text-base">
              <a href="#lire">Lire un extrait</a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <BookOpenText className="size-4 text-primary" />
              Livre physique + EPUB/PDF
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Paiement sécurisé
            </span>
            <span className="inline-flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              Livraison Cameroun · Congo · Gabon
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Numérique en 5 minutes
            </span>
          </div>

          <div className="mt-8 max-w-md rounded-xl border border-primary/30 bg-card/60 p-4 backdrop-blur-sm">
            <div className="flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Prix de lancement
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-semibold text-primary">
                    {price_promo.toLocaleString("fr-FR")} {currency}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {price_full.toLocaleString("fr-FR")}
                  </span>
                </div>
              </div>
              <div className="min-[400px]:text-right">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Places restantes
                </div>
                <div className="mt-0.5 font-serif text-2xl font-semibold text-emerald">
                  {remaining}<span className="text-sm text-muted-foreground">/{total}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{sold}</span> lecteurs ont déjà commandé · réservé aux 500 premiers
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:order-2 fade-in">
          <div className="relative mx-auto max-w-xs sm:max-w-sm md:max-w-md">
            <div className="absolute -inset-6 -z-10 bg-gradient-to-tr from-primary/30 via-emerald/15 to-transparent blur-3xl" />
            <div ref={coverRef} className="will-change-transform">
              <img
                src="/book-cover-red.png"
                alt="Couverture du roman Le Léopard et les Ombres de Koreen Mbombele"
                className="w-full rounded-md shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/40 bg-background/80 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
              Édition collector · Tome I
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
