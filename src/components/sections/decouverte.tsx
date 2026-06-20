import { Card, CardContent } from "@/components/ui/card";
import { Crown, Flame, ScrollText } from "lucide-react";

const items = [
  {
    icon: Crown,
    label: "Un dictateur humain",
    desc: "Le colonel Lombo-Kanda n'est pas un monstre de carton. Il aime, il doute, il prie — et c'est précisément ce qui rend ses crimes insoutenables.",
  },
  {
    icon: Flame,
    label: "Nadège, l'héroïne",
    desc: "Une institutrice qui refuse de fuir. Une voix qui devient mouvement. Le visage que la République du Nzanda voulait effacer.",
  },
  {
    icon: ScrollText,
    label: "La scène qui choque",
    desc: "Page 217. La nuit du Pacte. On en parlera longtemps autour des feux. Vous saurez pourquoi.",
  },
];

export function Decouverte() {
  return (
    <section
      id="decouverte"
      className="relative border-b border-border/40 px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">
            Ce que vous allez découvrir
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Trois raisons de ne plus poser ce livre
          </h2>
          <div className="mx-auto mt-6 hairline w-32" />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur transition hover:border-primary/40"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                <CardContent className="p-7">
                  <div className="inline-flex size-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="mt-5 font-serif text-xl font-semibold">
                    {item.label}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
