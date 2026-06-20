import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Comment vais-je recevoir le livre ?",
    a: "Pour la version physique, le livre est expédié sous 3 à 7 jours après vérification du paiement. Vous serez contacté au numéro indiqué pour confirmer l'adresse. Pour la version numérique (EPUB + PDF), le lien de téléchargement est envoyé à votre email dans les 5 minutes suivant la vérification.",
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "Oui. Vous payez via votre opérateur Mobile Money habituel (MTN ou Orange), via CinetPay (qui sécurise carte bancaire et Mobile Money), ou via PayPal/Visa/Mastercard pour la diaspora. Aucune donnée bancaire n'est stockée chez nous.",
  },
  {
    q: "Sur quel appareil puis-je lire la version numérique ?",
    a: "Téléphone, tablette, liseuse (Kindle, Kobo) et ordinateur. Vous recevez l'EPUB et le PDF — vous choisissez le format qui vous convient.",
  },
  {
    q: "Puis-je payer depuis l'étranger ?",
    a: "Oui. Choisissez « PayPal / Visa / Mastercard » au moment de la commande. C'est l'option pensée pour la diaspora.",
  },
  {
    q: "Et si je n'ai jamais acheté un livre en ligne ?",
    a: "Vous êtes guidé étape par étape : choix du format, vos coordonnées, choix du moyen de paiement, instructions claires, puis vous téléversez la capture du paiement directement sur le site. Une équipe humaine vérifie et vous écrit.",
  },
  {
    q: "Y a-t-il un remboursement possible ?",
    a: "Pour la version numérique, le contenu étant livré immédiatement, aucun remboursement après envoi. Pour la version physique, en cas de problème de livraison, contactez-nous à feminina08@gmail.com — nous trouvons une solution.",
  },
  {
    q: "La promo est-elle vraiment limitée ?",
    a: "Oui — 500 exemplaires au prix de lancement (physique + numérique confondus), jusqu'au 31 juillet 2026. Le compteur en haut de page est mis à jour en temps réel.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="relative border-b border-border/40 px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">
            Questions fréquentes
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Tout ce que vous voulez savoir
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left font-serif text-lg font-medium hover:text-primary">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
