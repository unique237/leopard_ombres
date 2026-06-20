import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const excerpts = [
  {
    title: "Prologue",
    body: `La nuit n'avait jamais été aussi calme à Mbalo. Pas un chien qui aboie. Pas une moto. Le vent même semblait retenir son souffle, comme s'il savait, comme s'il avait été prévenu. À 2h17 précises, le premier blindé franchit le pont de la Lobaye.`,
  },
  {
    title: "La Clairière",
    body: `Au cœur de la forêt, la clairière n'apparaissait sur aucune carte. Le colonel y vint seul, comme convenu. L'homme l'attendait, debout, pieds nus dans la terre rouge. « Tu veux le pouvoir, dit-il sans saluer. Le pouvoir te coûtera ce que tu aimes le plus. Réfléchis encore. »`,
  },
  {
    title: "Nadège",
    body: `Ils étaient venus à six pour la faire taire. Elle se tenait devant la porte de l'école, son cartable sur l'épaule, ses élèves derrière elle. — Madame, partez, ils vont vous tuer. Elle ne bougea pas. Elle dit simplement : « Si je pars, c'est vous qu'ils mangeront demain. »`,
  },
  {
    title: "La Larme",
    body: `Céleste regarda son mari longuement, sans un mot. Puis elle laissa une seule larme glisser sur sa joue — une seule, calibrée, parfaite — et elle sut, à cet instant, qu'elle venait de gagner la guerre qu'il n'avait même pas vue commencer.`,
  },
];

const AUTO_DELAY = 4500;

export function Lire() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((next: number, dir: 1 | -1 = 1) => {
    const i = ((next % excerpts.length) + excerpts.length) % excerpts.length;
    setDirection(dir);
    setVisible(false);
    setTimeout(() => {
      setIndex(i);
      setVisible(true);
    }, 220);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(index + 1, 1), AUTO_DELAY);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [index, go]);

  const handlePrev = () => { go(index - 1, -1); };
  const handleNext = () => { go(index + 1,  1); };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1, dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const current = excerpts[index];
  const progress = ((index + 1) / excerpts.length) * 100;

  // parallax offset alternates subtly per slide
  const parallaxY = index % 2 === 0 ? "0%" : "-4%";

  return (
    <section
      id="lire"
      className="relative border-b border-border/40 px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">
            Lire un extrait
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Quelques pages, déjà l'orage
          </h2>
        </div>

        {/* Card */}
        <Card
          className="relative mt-10 overflow-hidden border-primary/20 bg-card/70 backdrop-blur"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Parallax ambient layer */}
          <div
            className="pointer-events-none absolute inset-[-20%] opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 70% 30%, hsl(var(--primary) / 0.08) 0%, transparent 65%)",
              transform: `translateY(${parallaxY})`,
              transition: "transform 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />

          {/* Progress bar */}
          <div
            className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-700 ease-in-out"
            style={{ width: `${progress}%` }}
          />

          <CardContent className="relative px-5 py-9 sm:px-12 sm:py-14">
            {/* Counter */}
            <div className="absolute left-1/2 top-4 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-primary">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(excerpts.length).padStart(2, "0")}
            </div>

            {/* Animated content */}
            <div
              className="text-center transition-all duration-500 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible
                  ? "translateX(0)"
                  : `translateX(${direction * 24}px)`,
              }}
            >
              <h3 className="font-serif text-2xl italic text-primary sm:text-3xl">
                {current.title}
              </h3>
            </div>

            <p
              className="mx-auto mt-8 max-w-2xl whitespace-pre-line text-pretty font-serif text-base leading-relaxed text-foreground/95 transition-all duration-500 ease-out sm:text-lg"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible
                  ? "translateX(0)"
                  : `translateX(${direction * 32}px)`,
                transitionDelay: visible ? "70ms" : "0ms",
              }}
            >
              {current.body}
            </p>

            {/* Controls */}
            <div className="mt-10 flex items-center justify-between gap-4">
              <Button
                size="icon"
                variant="outline"
                onClick={handlePrev}
                aria-label="Extrait précédent"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex items-center gap-1.5">
                {excerpts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i, i > index ? 1 : -1)}
                    aria-label={`Aller à l'extrait ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === index
                        ? "w-8 bg-primary"
                        : "w-1.5 bg-muted-foreground/40"
                    )}
                  />
                ))}
              </div>

              <Button
                size="icon"
                variant="outline"
                onClick={handleNext}
                aria-label="Extrait suivant"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Vous avez aimé ces lignes ? Le roman entier vous attend.
          </p>
          <Button asChild size="lg" className="mt-4 h-11 px-7 font-semibold">
            <a href="#acheter">Lire le roman complet</a>
          </Button>
        </div>
      </div>
    </section>
  );
}