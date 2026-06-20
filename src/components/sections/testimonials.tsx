import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { api, type Comment } from "@/lib/api";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function Testimonials() {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    api.comments.listPublished().then(setComments).catch(() => {});
  }, []);

  if (comments.length === 0) return null;

  return (
    <section
      id="temoignages"
      className="relative border-b border-border/40 px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/2 size-[500px] -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Avis lecteurs</div>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Ce que disent les lecteurs
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Ils ont lu « Le Léopard et les Ombres ». Voici ce qu'ils en pensent.
          </p>
        </div>

        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="mb-6 break-inside-avoid rounded-xl border border-border/50 bg-card/60 p-6 backdrop-blur"
            >
              <Quote className="size-6 text-primary/40" />
              <p className="mt-3 font-serif text-sm leading-relaxed text-foreground/90 italic">
                « {c.comment} »
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-foreground">{c.author_name}</div>
                  <div className="text-xs text-muted-foreground">{fmtDate(c.created_at)}</div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="size-3 fill-primary text-primary"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
