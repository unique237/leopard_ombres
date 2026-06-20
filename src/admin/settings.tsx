import { useEffect, useState } from "react";
import {
  Loader2,
  Save,
  Megaphone,
  AtSign,
  Smartphone,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  api,
  type PromoSettings,
  type ContactSettings,
  type PaymentsSettings,
  type BankSettings,
} from "@/lib/api";

interface AllSettings {
  promo: PromoSettings;
  contact: ContactSettings;
  payments: PaymentsSettings;
  bank: BankSettings;
}

const defaults: AllSettings = {
  promo: {
    end_iso: "2026-07-31T23:59:00+01:00",
    total_spots: 500,
    baseline_sold: 247,
    price_promo: 4900,
    price_full: 6900,
    currency: "FCFA",
    enabled: true,
  },
  contact: { email: "", phone: "", whatsapp: "" },
  payments: {
    mtn: { label: "MTN Mobile Money", number: "", enabled: true },
    orange: { label: "Orange Money", number: "", enabled: true },
    cinetpay: { label: "CinetPay", enabled: true },
    paypal: { label: "PayPal / Visa / Mastercard", enabled: true },
  },
  bank: {
    bank_name: "",
    account_holder: "",
    account_number: "",
    iban: "",
    swift: "",
    enabled: false,
  },
};

export function AdminSettings() {
  const [settings, setSettings] = useState<AllSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<keyof AllSettings | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await api.settings.getAll();
        const next = { ...defaults };
        for (const row of rows) {
          const k = row.key as keyof AllSettings;
          if (next[k]) (next[k] as unknown) = { ...next[k], ...(row.value as object) };
        }
        setSettings(next);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async <K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSaving(key);
    try {
      await api.settings.update(key, value);
      setSettings((s) => ({ ...s, [key]: value }));
      toast.success("Paramètres enregistrés");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Configuration</div>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez la promo, les contacts, les paiements et les coordonnées bancaires.
        </p>
      </div>

      <Tabs defaultValue="promo">
        <TabsList className="flex w-full flex-wrap gap-1 bg-muted/40">
          <TabsTrigger value="promo" className="gap-1.5">
            <Megaphone className="size-3.5" />
            Promo
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5">
            <AtSign className="size-3.5" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5">
            <Smartphone className="size-3.5" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-1.5">
            <Landmark className="size-3.5" />
            Banque
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promo" className="mt-6">
          <PromoTab
            value={settings.promo}
            saving={saving === "promo"}
            onSave={(v) => save("promo", v)}
          />
        </TabsContent>
        <TabsContent value="contact" className="mt-6">
          <ContactTab
            value={settings.contact}
            saving={saving === "contact"}
            onSave={(v) => save("contact", v)}
          />
        </TabsContent>
        <TabsContent value="payments" className="mt-6">
          <PaymentsTab
            value={settings.payments}
            saving={saving === "payments"}
            onSave={(v) => save("payments", v)}
          />
        </TabsContent>
        <TabsContent value="bank" className="mt-6">
          <BankTab
            value={settings.bank}
            saving={saving === "bank"}
            onSave={(v) => save("bank", v)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <Button type="submit" disabled={saving}>
      {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      Enregistrer
    </Button>
  );
}

function PromoTab({
  value,
  saving,
  onSave,
}: {
  value: PromoSettings;
  saving: boolean;
  onSave: (v: PromoSettings) => void;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);

  const toLocalInput = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 16);
  };

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-5 sm:p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(v);
          }}
        >
          <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3">
            <Switch
              id="promo-enabled"
              checked={v.enabled}
              onCheckedChange={(b) => setV({ ...v, enabled: b })}
            />
            <label htmlFor="promo-enabled" className="flex-1 text-sm">
              <div className="font-medium">Promo de lancement active</div>
              <div className="text-xs text-muted-foreground">
                Affiche le compte à rebours et le prix promo.
              </div>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="promo-end">Fin de la promo</FieldLabel>
              <Input
                id="promo-end"
                type="datetime-local"
                value={toLocalInput(v.end_iso)}
                onChange={(e) =>
                  setV({
                    ...v,
                    end_iso: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : v.end_iso,
                  })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="promo-currency">Devise</FieldLabel>
              <Input
                id="promo-currency"
                value={v.currency}
                onChange={(e) => setV({ ...v, currency: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="promo-price">Prix promo</FieldLabel>
              <Input
                id="promo-price"
                type="number"
                value={v.price_promo}
                onChange={(e) => setV({ ...v, price_promo: Number(e.target.value) })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="full-price">Prix plein</FieldLabel>
              <Input
                id="full-price"
                type="number"
                value={v.price_full}
                onChange={(e) => setV({ ...v, price_full: Number(e.target.value) })}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="total-spots">Places totales</FieldLabel>
              <Input
                id="total-spots"
                type="number"
                value={v.total_spots}
                onChange={(e) => setV({ ...v, total_spots: Number(e.target.value) })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="baseline">Ventes initiales (compteur)</FieldLabel>
              <Input
                id="baseline"
                type="number"
                value={v.baseline_sold}
                onChange={(e) => setV({ ...v, baseline_sold: Number(e.target.value) })}
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <SaveButton saving={saving} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ContactTab({
  value,
  saving,
  onSave,
}: {
  value: ContactSettings;
  saving: boolean;
  onSave: (v: ContactSettings) => void;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-5 sm:p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(v);
          }}
        >
          <Field>
            <FieldLabel htmlFor="contact-email">Adresse email</FieldLabel>
            <Input
              id="contact-email"
              type="email"
              value={v.email}
              onChange={(e) => setV({ ...v, email: e.target.value })}
              placeholder="contact@exemple.com"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="contact-phone">Téléphone</FieldLabel>
              <Input
                id="contact-phone"
                value={v.phone}
                onChange={(e) => setV({ ...v, phone: e.target.value })}
                placeholder="+237 6 XX XX XX XX"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-whatsapp">WhatsApp</FieldLabel>
              <Input
                id="contact-whatsapp"
                value={v.whatsapp}
                onChange={(e) => setV({ ...v, whatsapp: e.target.value })}
                placeholder="+237 6 XX XX XX XX"
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <SaveButton saving={saving} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PaymentsTab({
  value,
  saving,
  onSave,
}: {
  value: PaymentsSettings;
  saving: boolean;
  onSave: (v: PaymentsSettings) => void;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);

  type Key = keyof PaymentsSettings;
  const update = (k: Key, patch: Partial<PaymentsSettings[Key]>) =>
    setV({ ...v, [k]: { ...v[k], ...patch } });

  const channels: { key: Key; title: string; subtitle: string; hasNumber: boolean }[] = [
    { key: "mtn", title: "MTN Mobile Money", subtitle: "Numéro MoMo MTN", hasNumber: true },
    { key: "orange", title: "Orange Money", subtitle: "Numéro Orange Money", hasNumber: true },
    { key: "cinetpay", title: "CinetPay", subtitle: "Carte bancaire / Mobile Money", hasNumber: false },
    { key: "paypal", title: "PayPal / Visa / Mastercard", subtitle: "International", hasNumber: false },
  ];

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-5 sm:p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(v);
          }}
        >
          {channels.map((c) => (
            <div
              key={c.key}
              className="space-y-3 rounded-md border border-border/60 bg-muted/20 p-4"
            >
              <div className="flex items-center gap-3">
                <Switch
                  id={`pay-${c.key}`}
                  checked={v[c.key].enabled}
                  onCheckedChange={(b) => update(c.key, { enabled: b })}
                />
                <label htmlFor={`pay-${c.key}`} className="flex-1 text-sm">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.subtitle}</div>
                </label>
              </div>
              {c.hasNumber && (
                <Field>
                  <FieldLabel htmlFor={`pay-${c.key}-number`}>Numéro</FieldLabel>
                  <Input
                    id={`pay-${c.key}-number`}
                    value={v[c.key].number ?? ""}
                    onChange={(e) => update(c.key, { number: e.target.value })}
                    placeholder="6XX XXX XXX"
                  />
                </Field>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <SaveButton saving={saving} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function BankTab({
  value,
  saving,
  onSave,
}: {
  value: BankSettings;
  saving: boolean;
  onSave: (v: BankSettings) => void;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-5 sm:p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(v);
          }}
        >
          <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3">
            <Switch
              id="bank-enabled"
              checked={v.enabled}
              onCheckedChange={(b) => setV({ ...v, enabled: b })}
            />
            <label htmlFor="bank-enabled" className="flex-1 text-sm">
              <div className="font-medium">Virement bancaire activé</div>
              <div className="text-xs text-muted-foreground">
                Affiche les coordonnées bancaires comme méthode de paiement.
              </div>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="bank-name">Nom de la banque</FieldLabel>
              <Input
                id="bank-name"
                value={v.bank_name}
                onChange={(e) => setV({ ...v, bank_name: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="bank-holder">Titulaire</FieldLabel>
              <Input
                id="bank-holder"
                value={v.account_holder}
                onChange={(e) => setV({ ...v, account_holder: e.target.value })}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="bank-account">Numéro de compte</FieldLabel>
            <Input
              id="bank-account"
              value={v.account_number}
              onChange={(e) => setV({ ...v, account_number: e.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="bank-iban">IBAN</FieldLabel>
              <Input
                id="bank-iban"
                value={v.iban}
                onChange={(e) => setV({ ...v, iban: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="bank-swift">Code SWIFT / BIC</FieldLabel>
              <Input
                id="bank-swift"
                value={v.swift}
                onChange={(e) => setV({ ...v, swift: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <SaveButton saving={saving} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
