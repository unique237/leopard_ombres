import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "#resume", label: "Le récit" },
  { href: "#lire", label: "Extrait" },
  { href: "#auteure", label: "L'auteure" },
  { href: "#decouverte", label: "À découvrir" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#accueil" className="flex items-center gap-2 min-w-0">
          <div className="size-7 shrink-0 rounded-full border border-primary/40 bg-primary/10 text-center font-serif text-sm font-semibold leading-7 text-primary">
            L
          </div>
          <span className="font-serif text-base font-semibold tracking-tight truncate">
            Le Léopard <span className="hidden min-[380px]:inline italic text-primary">et les Ombres</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild size="sm" className="font-semibold">
            <a href="#acheter">Commander</a>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Menu">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-l border-border/60 bg-background">
            <div className="mt-8 flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base text-foreground transition hover:bg-accent/30"
                >
                  {l.label}
                </a>
              ))}
              <Button
                asChild
                size="lg"
                className="mt-4 font-semibold"
                onClick={() => setOpen(false)}
              >
                <a href="#acheter">Commander maintenant</a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
