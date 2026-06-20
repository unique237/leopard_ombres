import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const characters = [
  {
    name: "Évariste LOMBO-KANDA",
    role: "Le colonel",
    desc: "Un coup d'État nocturne, une promesse au peuple, et déjà les premiers pactes secrets qui le ligotent à l'invisible.",
  },
  {
    name: "Céleste",
    role: "L'épouse stratège",
    desc: "Dans l'ombre du palais, elle tisse les alliances qui font et défont les hommes — y compris le sien.",
  },
  {
    name: "Nadège",
    role: "Celle qui dit non",
    desc: "Quand tout un pays se courbe, sa voix tremble — mais ne rompt pas. Une héroïne pour notre temps.",
  },
  {
    name: "Pr. KASONGO",
    role: "L'intellectuel",
    desc: "Sa plume est plus dangereuse que les armées. Le pouvoir le sait. Il le sait aussi.",
  },
];

export function Resume() {
  return (
    <section
      id="resume"
      className="relative border-b border-border/40 px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">
            Le récit
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
            République du Nzanda. Une nuit. Un coup d'État.
          </h2>
          <div className="mx-auto mt-6 hairline w-32" />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="space-y-5 text-base leading-relaxed text-foreground/90 sm:text-lg">
            <p>
              Le colonel <span className="font-semibold text-primary">Évariste LOMBO-KANDA</span> prend le pouvoir par les armes
              et promet de sauver la République. Discours patriotiques, foules
              en liesse, drapeau hissé au petit matin.
            </p>
            <p>
              Mais derrière la façade officielle se trament d'autres alliances : pactes occultes, trahisons feutrées,
              dette aux ancêtres et à ceux qu'on ne nomme pas. Chaque promesse a son
              prix. Chaque silence, sa victime.
            </p>
            <p>
              Autour du pouvoir gravitent quatre destins qui vont écrire l'histoire
              du pays — et peut-être la précipiter.
            </p>
          </div>

          <Card className="relative overflow-hidden border-primary/30 bg-card/60 backdrop-blur">
            <CardContent className="px-6 py-8 sm:px-8">
              <Quote className="size-7 text-primary/60" />
              <blockquote className="mt-4 font-serif text-xl italic leading-snug text-foreground sm:text-2xl">
                « L'Afrique n'a pas besoin qu'on lui raconte ses démons. Elle les connaît
                par leur prénom. »
              </blockquote>
              <div className="mt-5 text-sm uppercase tracking-widest text-muted-foreground">
                — Koreen Mbombele
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h3 className="font-serif text-2xl font-semibold sm:text-3xl">
            Les figures du Léopard
          </h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {characters.map((c) => (
              <Card
                key={c.name}
                className="border-border/60 bg-card/50 transition hover:border-primary/40"
              >
                <CardContent className="p-6">
                  <div className="text-xs uppercase tracking-widest text-primary">
                    {c.role}
                  </div>
                  <div className="mt-1.5 font-serif text-xl font-semibold text-foreground">
                    {c.name}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
