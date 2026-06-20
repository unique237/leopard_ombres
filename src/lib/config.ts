// Promo end: 31 July 2026 23:59 (local Africa/Douala time, UTC+1)
export const PROMO_END_ISO = "2026-07-31T23:59:00+01:00";
export const PROMO_TOTAL_SPOTS = 500;
// Baseline already-sold count to seed the displayed counter.
// Real-time orders from Supabase are added on top.
export const BASELINE_SOLD = 247;

export const PRICE_PROMO = 4900;
export const PRICE_FULL = 6900;
export const CURRENCY = "FCFA";

export const PAYMENT_METHODS = [
  {
    id: "mtn" as const,
    label: "MTN Mobile Money",
    number: "651 645 025",
    icon: "M",
    color: "from-yellow-500/20 to-yellow-600/10",
    badge: "MTN MoMo",
    instructions: [
      "Composez *126# sur votre téléphone MTN",
      "Choisissez « Transfert d'argent »",
      "Envoyez le montant au 651 645 025",
      "Conservez le SMS de confirmation",
    ],
  },
  {
    id: "orange" as const,
    label: "Orange Money",
    number: "697 693 595",
    icon: "O",
    color: "from-orange-500/20 to-orange-600/10",
    badge: "Orange Money",
    instructions: [
      "Composez #150# sur votre téléphone Orange",
      "Choisissez « Transfert d'argent »",
      "Envoyez le montant au 697 693 595",
      "Conservez le SMS de confirmation",
    ],
  },
  {
    id: "cinetpay" as const,
    label: "CinetPay",
    number: "Carte bancaire / Mobile Money",
    icon: "C",
    color: "from-emerald/20 to-emerald/5",
    badge: "CinetPay",
    instructions: [
      "Cliquez sur « Payer avec CinetPay »",
      "Choisissez carte bancaire ou Mobile Money",
      "Validez le paiement sécurisé",
      "Vous serez redirigé automatiquement",
    ],
  },
  {
    id: "paypal" as const,
    label: "PayPal / Visa / Mastercard",
    number: "Pour la diaspora",
    icon: "P",
    color: "from-sky-500/20 to-sky-600/10",
    badge: "International",
    instructions: [
      "Cliquez sur « Payer avec PayPal »",
      "Connectez-vous ou utilisez votre carte",
      "Validez la transaction sécurisée",
      "Recevez la confirmation par email",
    ],
  },
];
