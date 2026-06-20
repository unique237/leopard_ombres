import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useParallax } from "@/hooks/use-parallax";

export function Auteure() {
  const portraitRef = useParallax<HTMLDivElement>(0.12, 60);
  return (
    <section
      id="auteure"
      className="relative border-b border-border/40 px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-xs sm:max-w-sm">
            <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-primary/30 to-emerald/20 blur-2xl" />
            <div ref={portraitRef} className="will-change-transform">
              <img
                src="/author-portrait.webp"
                alt="Portrait de Koreen Mbombele, auteure du roman"
                className="w-full rounded-md border border-primary/30 shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">
            L'auteure
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Koreen Mbombele
          </h2>
          <div className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">
            Fonctionnaire camerounaise · Militante politique · Premier roman
          </div>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
            <p>
              Née et formée au Cameroun, Koreen Mbombele a passé près de vingt ans à
              observer de l'intérieur les rouages de l'État, des cabinets ministériels
              aux campagnes électorales du Centre.
            </p>
            <p>
              <span className="text-foreground">Le Léopard et les Ombres</span> est son
              premier roman — l'aboutissement d'années de notes, d'archives et de témoignages
              recueillis auprès de ceux qui font, défont, et survivent au pouvoir.
            </p>
          </div>

          <Card className="mt-8 border-primary/30 bg-card/60 backdrop-blur">
            <CardContent className="flex gap-4 px-6 py-6">
              <Quote className="size-6 shrink-0 text-primary" />
              <p className="font-serif text-lg italic text-foreground sm:text-xl">
                « J'écris pour celles qui n'ont pas le droit de parler.
                Pour ceux qui ne lisent plus que les nouvelles. Pour les enfants
                qui hériteront du silence si on n'écrit pas. »
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
