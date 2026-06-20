import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/80 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-serif text-2xl font-semibold text-foreground">
              Le Léopard <span className="italic text-primary">et les Ombres</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Un thriller politique africain de Koreen Mbombele.
              « L'Afrique n'a pas besoin qu'on lui raconte ses démons. Elle les connaît
              par leur prénom. »
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">
              Navigation
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="text-muted-foreground hover:text-foreground" href="#resume">Le récit</a></li>
              <li><a className="text-muted-foreground hover:text-foreground" href="#lire">Lire un extrait</a></li>
              <li><a className="text-muted-foreground hover:text-foreground" href="#auteure">L'auteure</a></li>
              <li><a className="text-muted-foreground hover:text-foreground" href="#acheter">Commander</a></li>
              <li><a className="text-muted-foreground hover:text-foreground" href="#faq">FAQ</a></li>
              <li><a className="text-muted-foreground hover:text-foreground" href="#contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">
              Paiements acceptés
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>MTN Mobile Money</li>
              <li>Orange Money</li>
              <li>CinetPay</li>
              <li>PayPal · Visa · Mastercard</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <div>
            © {new Date().getFullYear()} Koreen Mbombele · Tous droits réservés
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">CGV</a>
            <a href="#" className="hover:text-foreground">Confidentialité</a>
            <a href="#" className="hover:text-foreground">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
