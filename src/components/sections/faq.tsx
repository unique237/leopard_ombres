import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Comment vais-je recevoir le livre ?",
    a: "Dès vérification de votre paiement (sous 5 minutes), vous recevez un email avec votre lien de téléchargement EPUB + PDF à l'adresse indiquée lors de la commande. Pensez à vérifier votre dossier spam.",
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "Oui. Vous payez via votre opérateur Mobile Money habituel (MTN ou Orange), via CinetPay (qui sécurise carte bancaire et Mobile Money), ou via PayPal/Visa/Mastercard pour la diaspora. Aucune donnée bancaire n'est stockée chez nous.",
  },
  {
    q: "Sur quel appareil puis-je lire le livre ?",
    a: "Sur tous vos appareils : téléphone, tablette, liseuse (Kindle, Kobo) et ordinateur. Vous recevez à la fois l'EPUB et le PDF — vous choisissez le format qui vous convient le mieux.",
  },
  {
    q: "Puis-je payer depuis l'étranger ?",
    a: "Oui. Choisissez « PayPal / Visa / Mastercard » au moment de la commande. C'est l'option pensée pour la diaspora et les lecteurs hors Afrique centrale.",
  },
  {
    q: "Et si je n'ai jamais acheté un livre en ligne ?",
    a: "Vous êtes guidé étape par étape : vos coordonnées, choix du moyen de paiement, instructions claires, puis vous téléversez la capture du paiement directement sur le site. Une équipe humaine vérifie et vous envoie le livre par email.",
  },
  {
    q: "Y a-t-il un remboursement possible ?",
    a: "Le contenu étant livré numériquement dès vérification, aucun remboursement n'est possible après envoi du lien. En cas de problème technique, contactez-nous à feminina08@gmail.com — nous trouvons une solution.",
  },
  {
    q: "La promo est-elle vraiment limitée ?",
    a: "Oui — 500 exemplaires au prix de lancement, jusqu'au 31 juillet 2026. Le compteur en haut de page est mis à jour en temps réel.",
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
