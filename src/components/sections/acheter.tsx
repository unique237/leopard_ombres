import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BookMarked,
  Smartphone,
  Truck,
  ShieldCheck,
  Gift,
  Clock,
  Check,
  Loader2,
  Upload,
  Copy,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";  // ← THIS WAS MISSING
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Countdown } from "@/components/countdown";
import { useSpotsRemaining } from "@/hooks/use-spots";
import { useSiteSettings } from "@/lib/settings-context";
import { api, type OrderFormat, type PaymentMethod, type Order } from "@/lib/api";

const physicalSchema = z.object({
  first_name: z.string().min(2, "Votre prénom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone requis"),
  //city: z.string().min(2, "Ville requise"),
  country: z.string().min(1, "Pays requis"),
  city: z.string().min(1, "Ville requise"),
  address: z.string().min(5, "Adresse de livraison requise"),
  delivery_method: z.enum(["home", "pickup"]),
  payment_method: z.enum(["mtn", "orange", "cinetpay", "paypal"]),
});

const digitalSchema = z.object({
  first_name: z.string().min(2, "Votre prénom est requis"),
  email: z.string().email("Email invalide"),
  payment_method: z.enum(["mtn", "orange", "cinetpay", "paypal"]),
});

type PhysicalForm = z.infer<typeof physicalSchema>;
type DigitalForm = z.infer<typeof digitalSchema>;

const physicalBonuses = [
  "Le livre physique dédicacé (édition lancement)",
  "EPUB + PDF offerts en bonus",
  "Lettre personnelle de l'auteure",
  "Extrait inédit du Tome II — Les Héritières du Léopard",
];

const digitalBonuses = [
  "EPUB + PDF (téléphone, tablette, liseuse, PC)",
  "Fond d'écran exclusif de la couverture",
  "Lettre personnelle de l'auteure",
  "Extrait inédit du Tome II — Les Héritières du Léopard",
  "Livraison en 5 minutes après vérification",
];

const COUNTRIES = [
  "Cameroun",
  "Congo",
  "Gabon",
];

const CITIES_BY_COUNTRY = {
  Cameroun: [
    "Bafang",
    "Bafia",
    "Bafoussam",
    "Bamenda",
    "Bertoua",
    "Buea",
    "Douala",
    "Dschang",
    "Ebolowa",
    "Edéa",
    "Foumban",
    "Garoua",
    "Kribi",
    "Kumba",
    "Limbe",
    "Maroua",
    "Ngaoundéré",
    "Nkongsamba",
    "Sangmélima",
    "Yaoundé",
  ],

  Congo: [
    "Brazzaville",
    "Dolisie",
    "Impfondo",
    "Kinkala",
    "Loandjili",
    "Madingou",
    "Mossendjo",
    "Nkayi",
    "Ouesso",
    "Owando",
    "Pointe-Noire",
  ],

  Gabon: [
    "Bitam",
    "Franceville",
    "Lambaréné",
    "Libreville",
    "Makokou",
    "Mouila",
    "Ntoum",
    "Oyem",
    "Port-Gentil",
    "Tchibanga",
  ],
} as const;

const PAYMENT_LOGOS: Record<string, string> = {
  mtn: "https://res.cloudinary.com/drl74dz2k/image/upload/v1781919868/momo_kxtiwg.jpg",
  orange: "https://res.cloudinary.com/drl74dz2k/image/upload/v1781919868/om-removebg-preview_en8xcc.png",
  cinetpay: "https://res.cloudinary.com/drl74dz2k/image/upload/v1781919868/cinetpay-removebg-preview_tjk79i.png",
  paypal: "https://res.cloudinary.com/drl74dz2k/image/upload/v1781919868/paypal_visa_mastercard-removebg-preview_sxrgqo.png",
};

export function Acheter() {
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (createdOrder) {
    return (
      <Confirmation
        order={createdOrder}
        onUpdate={(o) => setCreatedOrder(o)}
        onReset={() => setCreatedOrder(null)}
      />
    );
  }

  return <PurchaseForm onCreated={setCreatedOrder} />;
}

function PurchaseForm({ onCreated }: { onCreated: (o: Order) => void }) {
  const { price_promo, price_full, currency, baseline_sold, promo_total_spots } = useSiteSettings();
  const { remaining, total, sold } = useSpotsRemaining(baseline_sold, promo_total_spots);
  const progressPct = Math.min(100, (sold / total) * 100);

  return (
    <section
      id="acheter"
      className="relative border-b border-border/40 px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">
            Offre de lancement · 500 premiers acheteurs
          </Badge>
          <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Commandez votre exemplaire
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Choisissez votre format. Réglez en un tap. Lisez ce que tout le monde lira demain.
          </p>
        </div>

        {/* Promo card */}
        <Card className="mt-10 overflow-hidden border-primary/30 bg-card/70 backdrop-blur">
          <CardContent className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Offre valable jusqu'au 31 juillet 2026
              </div>
              <Countdown variant="block" className="mt-3" />
              <Separator className="my-5" />
              <div className="flex items-end gap-3">
                <div className="font-serif text-4xl font-semibold text-primary sm:text-5xl">
                  {price_promo.toLocaleString("fr-FR")} {currency}
                </div>
                <div className="pb-2 text-base text-muted-foreground line-through">
                  {price_full.toLocaleString("fr-FR")}
                </div>
              </div>
              <div className="mt-1 text-sm text-emerald">
                Économisez {(price_full - price_promo).toLocaleString("fr-FR")} {currency}
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/50 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Places restantes</span>
                <span className="font-serif text-lg font-semibold text-emerald">
                  {remaining}/{total}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {sold} lecteurs ont déjà commandé · physique + numérique confondus
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Format selector */}
        <Tabs defaultValue="physical" className="mt-10">
          <TabsList className="mx-auto grid h-auto w-full max-w-2xl grid-cols-2 gap-2 bg-card/60 p-2">
            <TabsTrigger
              value="physical"
              className="flex h-auto flex-col gap-1 py-3 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            >
              <div className="flex items-center gap-2">
                <BookMarked className="size-4" />
                <span className="font-semibold">Version physique</span>
                <Badge className="ml-1 h-4 bg-emerald text-emerald-foreground hover:bg-emerald">
                  Le plus demandé
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Livré chez vous · Cameroun, Congo, Gabon
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="digital"
              className="flex h-auto flex-col gap-1 py-3 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="size-4" />
                <span className="font-semibold">Version numérique</span>
              </div>
              <span className="text-xs text-muted-foreground">
                EPUB + PDF · livraison 5 min
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="physical" className="mt-8">
            <PhysicalTunnel onCreated={onCreated} />
          </TabsContent>

          <TabsContent value="digital" className="mt-8">
            <DigitalTunnel onCreated={onCreated} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function BonusList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((b) => (
        <li key={b} className="flex items-start gap-2.5 text-sm">
          <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="size-3" />
          </span>
          <span className="text-foreground/90">{b}</span>
        </li>
      ))}
    </ul>
  );
}

function PaymentMethodSelector({
  value,
  onChange,
  invalid,
}: {
  value: PaymentMethod | undefined;
  onChange: (v: PaymentMethod) => void;
  invalid?: boolean;
}) {
  const { payment_methods } = useSiteSettings();
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as PaymentMethod)}
      className="grid gap-3 sm:grid-cols-2"
      aria-invalid={invalid}
    >
      {payment_methods.map((m) => (
        <label
          key={m.id}
          htmlFor={`pm-${m.id}`}
          className={cn(
            "relative flex cursor-pointer items-start gap-3 rounded-lg border bg-card/40 p-4 transition",
            value === m.id
              ? "border-primary ring-1 ring-primary/40"
              : "border-border hover:border-primary/40"
          )}
        >
          <RadioGroupItem id={`pm-${m.id}`} value={m.id} className="mt-0.5" />
          <div className="flex flex-1 items-center justify-between gap-2">
            <div className="min-w-0">
              {/*<div className="truncate font-medium text-foreground">{m.label}</div>*/}
              <div className="mt-1 text-xs text-muted-foreground">{m.number}</div>
            </div>

            {/* Logo instead of letter badge */}
            {PAYMENT_LOGOS[m.id] && (
              <div className="flex h-9 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-white p-1">
                <img
                  src={PAYMENT_LOGOS[m.id]}
                  alt={`${m.label} logo`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </label>
      ))}
    </RadioGroup>
  );
}

function PhysicalTunnel({ onCreated }: { onCreated: (o: Order) => void }) {
  const { price_promo, currency } = useSiteSettings();
  const form = useForm<PhysicalForm>({
    resolver: zodResolver(physicalSchema),
    defaultValues: {
        first_name: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        address: "",
        delivery_method: "home",
    },
  });

  const onSubmit = async (values: PhysicalForm) => {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const row: Order = {
      id,
      format: "physical",
      first_name: values.first_name,
      email: values.email,
      phone: values.phone,
      city: values.city,
      address: values.address,
      delivery_method: values.delivery_method,
      payment_method: values.payment_method,
      payment_proof_url: null,
      amount: price_promo,
      status: "pending",
      created_at,
    };

    try {
      await api.orders.create({
        id: row.id,
        format: row.format,
        first_name: row.first_name,
        email: row.email,
        phone: row.phone,
        city: row.city,
        address: row.address,
        delivery_method: row.delivery_method,
        payment_method: row.payment_method,
        amount: row.amount,
      });
      toast.success("Commande enregistrée");
      onCreated(row);
    } catch {
      toast.error("Une erreur est survenue. Réessayez dans un instant.");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <Card className="sticky top-24 border-primary/30 bg-card/70 backdrop-blur">
          <CardContent className="space-y-5 p-6">
            <div>
              <Badge className="bg-emerald text-emerald-foreground hover:bg-emerald">
                Le plus demandé
              </Badge>
              <h3 className="mt-3 font-serif text-2xl font-semibold">
                Le livre physique
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                L'objet à offrir, à dédicacer, à garder. Couverture mate, papier crème.
              </p>
            </div>

            <Separator />

            <BonusList items={physicalBonuses} />

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="size-4 text-primary" />
                Livraison Cameroun, Congo, Gabon · 3 à 7 jours
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                Paiement vérifié manuellement par l'équipe
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gift className="size-4 text-primary" />
                EPUB/PDF envoyés immédiatement en bonus
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 lg:col-span-7">
        <Card>
          <CardContent className="space-y-5 p-6">
            <h4 className="font-serif text-lg font-semibold">Vos coordonnées</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="first_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Prénom</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Marie"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Téléphone</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="+237 6XX XX XX XX"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="vous@email.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <h4 className="font-serif text-lg font-semibold">Livraison</h4>

            <Controller
              name="delivery_method"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <label
                    htmlFor="dm-home"
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border bg-card/40 p-4 transition",
                      field.value === "home"
                        ? "border-primary ring-1 ring-primary/40"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <RadioGroupItem id="dm-home" value="home" className="mt-0.5" />
                    <div>
                      <div className="font-medium">Livraison à domicile</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        À votre adresse, sous 3 à 7 jours
                      </div>
                    </div>
                  </label>
                  <label
                    htmlFor="dm-pickup"
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border bg-card/40 p-4 transition",
                      field.value === "pickup"
                        ? "border-primary ring-1 ring-primary/40"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <RadioGroupItem id="dm-pickup" value="pickup" className="mt-0.5" />
                    <div>
                      <div className="font-medium">Retrait en main propre</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Yaoundé / Douala · sur rendez-vous
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Country*/}
              <Controller
                name="country"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Pays</FieldLabel>
              
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
              
                        // reset city when country changes
                        form.setValue("city", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre pays" />
                      </SelectTrigger>
              
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
              
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/*City*/}
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => {
                  const selectedCountry = form.watch("country");
              
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Ville</FieldLabel>
              
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedCountry}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedCountry
                                ? "Choisissez votre ville"
                                : "Sélectionnez d'abord un pays"
                            }
                          />
                        </SelectTrigger>
              
                        <SelectContent>
                          {selectedCountry &&
                            CITIES_BY_COUNTRY[
                              selectedCountry as keyof typeof CITIES_BY_COUNTRY
                            ]?.map((city) => (
                              <SelectItem
                                key={city}
                                value={city}
                              >
                                {city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
              
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Adresse / quartier</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Bastos, rue 1.234"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <h4 className="font-serif text-lg font-semibold">Moyen de paiement</h4>
            <Controller
              name="payment_method"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <PaymentMethodSelector
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="h-13 w-full text-base font-semibold shadow-lg shadow-primary/20"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>Commander à {price_promo.toLocaleString("fr-FR")} {currency}</>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          En commandant vous acceptez nos CGV. Paiement vérifié sous 5 minutes.
        </p>
      </form>
    </div>
  );
}

function DigitalTunnel({ onCreated }: { onCreated: (o: Order) => void }) {
  const { price_promo, currency } = useSiteSettings();
  const form = useForm<DigitalForm>({
    resolver: zodResolver(digitalSchema),
    defaultValues: { first_name: "", email: "" },
  });

  const onSubmit = async (values: DigitalForm) => {
    const id = crypto.randomUUID();
    const row: Order = {
      id,
      format: "digital",
      first_name: values.first_name,
      email: values.email,
      phone: null,
      city: null,
      address: null,
      delivery_method: null,
      payment_method: values.payment_method,
      payment_proof_url: null,
      amount: price_promo,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      await api.orders.create({
        id: row.id,
        format: row.format,
        first_name: row.first_name,
        email: row.email,
        phone: row.phone,
        city: row.city,
        address: row.address,
        delivery_method: row.delivery_method,
        payment_method: row.payment_method,
        amount: row.amount,
      });
      toast.success("Commande enregistrée");
      onCreated(row);
    } catch {
      toast.error("Une erreur est survenue. Réessayez dans un instant.");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <Card className="sticky top-24 border-primary/30 bg-card/70 backdrop-blur">
          <CardContent className="space-y-5 p-6">
            <div>
              <Badge variant="outline" className="border-primary/40 text-primary">
                Livraison instantanée
              </Badge>
              <h3 className="mt-3 font-serif text-2xl font-semibold">
                EPUB + PDF
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Lisez sur téléphone, tablette, liseuse ou PC. Pas d'attente, pas de port.
              </p>
            </div>
            <Separator />
            <BonusList items={digitalBonuses} />
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4 text-primary" />
                Lien de téléchargement envoyé en 5 minutes
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                Paiement sécurisé et vérifié manuellement
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 lg:col-span-7">
        <Card>
          <CardContent className="space-y-5 p-6">
            <h4 className="font-serif text-lg font-semibold">Vos coordonnées</h4>
            <Controller
              name="first_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Prénom</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Marie"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email de livraison</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="vous@email.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Le lien EPUB + PDF sera envoyé à cette adresse.
                  </p>
                </Field>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <h4 className="font-serif text-lg font-semibold">Moyen de paiement</h4>
            <Controller
              name="payment_method"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <PaymentMethodSelector
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="h-13 w-full text-base font-semibold shadow-lg shadow-primary/20"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>Recevoir le livre numérique · {price_promo.toLocaleString("fr-FR")} {currency}</>
          )}
        </Button>
      </form>
    </div>
  );
}

function Confirmation({
  order,
  onUpdate,
  onReset,
}: {
  order: Order;
  onUpdate: (o: Order) => void;
  onReset: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const { currency, payment_methods } = useSiteSettings();
  const method = payment_methods.find((m) => m.id === order.payment_method);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié");
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await api.orders.updateProof(order.id, file);
      toast.success("Capture envoyée. Vérification en cours.");
      onUpdate({
        ...order,
        payment_proof_url: url,
        status: "verifying",
      });
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const isPhysical = order.format === "physical";

  return (
    <section
      id="acheter"
      className="relative border-b border-border/40 px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full border border-emerald/40 bg-emerald/15 text-emerald">
            <Check className="size-7" />
          </div>
          <h2 className="mt-5 font-serif text-3xl font-semibold sm:text-4xl">
            Commande reçue, {order.first_name}
          </h2>
          <p className="mt-3 text-muted-foreground">
            Référence : <span className="font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        {/* Status */}
        <Card className="mt-8 border-primary/30 bg-card/70">
          <CardContent className="space-y-4 p-6">
            <StatusTimeline status={order.status} format={order.format} />
          </CardContent>
        </Card>

        {/* Payment instructions */}
        {method && order.status === "pending" && (
          <Card className="mt-6">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary">
                    Étape 1 · Effectuez le paiement
                  </div>
                  <h3 className="mt-1 font-serif text-xl font-semibold">
                    {method.label}
                  </h3>
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  {method.badge}
                </Badge>
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Montant à envoyer
                </div>
                <div className="mt-1 font-serif text-3xl font-semibold text-primary">
                  {order.amount.toLocaleString("fr-FR")} {currency}
                </div>
                {(method.id === "mtn" || method.id === "orange") && (
                  <div className="mt-3 flex items-center justify-between rounded border border-border bg-background px-3 py-2">
                    <span className="font-mono text-base font-medium">
                      {method.number}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(method.number)}
                    >
                      <Copy className="size-3.5" />
                      Copier
                    </Button>
                  </div>
                )}
              </div>

              <ol className="space-y-2.5 text-sm text-foreground/90">
                {method.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>

              {(method.id === "cinetpay" || method.id === "paypal") && (
                <Button variant="outline" className="w-full" type="button">
                  <ExternalLink className="size-4" />
                  Ouvrir {method.label}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload proof */}
        {(order.status === "pending" || order.status === "verifying") && (
          <Card className="mt-6">
            <CardContent className="space-y-4 p-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary">
                  Étape 2 · Envoyez la preuve de paiement
                </div>
                <h3 className="mt-1 font-serif text-xl font-semibold">
                  Capture d'écran ou SMS de confirmation
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Téléversez la capture directement ici. L'équipe vérifie sous 5 minutes
                  et déclenche votre livraison.
                </p>
              </div>

              {order.payment_proof_url ? (
                <div className="rounded-lg border border-emerald/40 bg-emerald/10 p-4 text-sm text-emerald-foreground">
                  <div className="flex items-center gap-2 font-medium text-emerald">
                    <Check className="size-4" />
                    Capture reçue · vérification en cours
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="proof-upload"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-card/40 px-6 py-10 text-center transition hover:bg-primary/5"
                >
                  {uploading ? (
                    <Loader2 className="size-7 animate-spin text-primary" />
                  ) : (
                    <Upload className="size-7 text-primary" />
                  )}
                  <span className="text-sm font-medium">
                    {uploading ? "Envoi en cours..." : "Cliquez pour téléverser votre capture"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG ou PDF · max 5 Mo
                  </span>
                  <input
                    id="proof-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUpload(file);
                    }}
                  />
                </label>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delivery recap */}
        <Card className="mt-6">
          <CardContent className="space-y-3 p-6 text-sm">
            <h3 className="font-serif text-lg font-semibold">
              {isPhysical ? "Récapitulatif de livraison" : "Livraison numérique"}
            </h3>
            {isPhysical ? (
              <>
                <Row label="Format" value="Livre physique" />
                <Row label="Livraison" value={order.delivery_method === "home" ? "À domicile" : "Retrait en main propre"} />
                <Row label="Ville" value={order.city ?? "—"} />
                <Row label="Adresse" value={order.address ?? "—"} />
                <Row label="Téléphone" value={order.phone ?? "—"} />
                <Row label="Email" value={order.email} />
                <p className="!mt-4 rounded-md border border-emerald/30 bg-emerald/10 p-3 text-xs text-foreground/90">
                  Vous serez contacté au {order.phone} pour confirmer l'adresse. Livraison estimée
                  sous 3 à 7 jours après vérification du paiement. Vos EPUB + PDF en bonus
                  vous seront envoyés à {order.email} dès vérification.
                </p>
              </>
            ) : (
              <>
                <Row label="Format" value="EPUB + PDF" />
                <Row label="Email" value={order.email} />
                <p className="!mt-4 rounded-md border border-emerald/30 bg-emerald/10 p-3 text-xs text-foreground/90">
                  Votre EPUB + PDF arrive dans quelques minutes par email à {order.email}.
                  Pensez à vérifier votre dossier spam.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button variant="ghost" onClick={onReset} className="text-muted-foreground">
            Passer une autre commande
          </Button>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function StatusTimeline({
  status,
  format,
}: {
  status: Order["status"];
  format: OrderFormat;
}) {
  const steps = [
    { id: "pending", label: "Commande reçue" },
    { id: "verifying", label: "Paiement en vérification" },
    {
      id: "confirmed",
      label: format === "digital" ? "Livré par email" : "Préparation expédition",
    },
  ];

  const order: Record<Order["status"], number> = {
    pending: 0,
    verifying: 1,
    confirmed: 2,
    delivered: 2,
  };
  const idx = order[status] ?? 0;

  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((s, i) => {
        const reached = i <= idx;
        const active = i === idx;
        return (
          <div key={s.id} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {reached ? <Check className="size-4" /> : i + 1}
              </div>
              <div
                className={cn(
                  "text-center text-[10px] uppercase tracking-widest sm:text-xs",
                  active ? "text-primary" : reached ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mt-[-1.25rem] h-0.5 flex-1",
                  i < idx ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
