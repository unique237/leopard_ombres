import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  PROMO_END_ISO,
  PROMO_TOTAL_SPOTS,
  BASELINE_SOLD,
  PRICE_PROMO,
  PRICE_FULL,
  CURRENCY,
  PAYMENT_METHODS,
} from "@/lib/config";

export interface SiteSettings {
  promo_end_iso: string;
  promo_total_spots: number;
  baseline_sold: number;
  price_promo: number;
  price_full: number;
  currency: string;
  payment_methods: typeof PAYMENT_METHODS;
  ready: boolean;
}

const DEFAULTS: SiteSettings = {
  promo_end_iso: PROMO_END_ISO,
  promo_total_spots: PROMO_TOTAL_SPOTS,
  baseline_sold: BASELINE_SOLD,
  price_promo: PRICE_PROMO,
  price_full: PRICE_FULL,
  currency: CURRENCY,
  payment_methods: PAYMENT_METHODS,
  ready: false,
};

function parseRow(key: string, value: unknown, out: SiteSettings) {
  if (value === null || value === undefined) return;
  switch (key) {
    case "promo":
      if (typeof value === "object" && value !== null) {
        const v = value as Record<string, unknown>;
        if (v.end_date) out.promo_end_iso = v.end_date as string;
        if (v.end_iso) out.promo_end_iso = v.end_iso as string;
        if (v.total_spots) out.promo_total_spots = Number(v.total_spots);
        if (v.baseline_sold !== undefined) out.baseline_sold = Number(v.baseline_sold);
        if (v.price_promo) out.price_promo = Number(v.price_promo);
        if (v.price_full) out.price_full = Number(v.price_full);
        if (v.currency) out.currency = v.currency as string;
      }
      break;
    case "payments": {
      if (typeof value === "object" && value !== null) {
        const v = value as Record<string, { label?: string; number?: string; enabled?: boolean }>;
        out.payment_methods = PAYMENT_METHODS.map((m) => {
          const override = v[m.id];
          if (!override) return m;
          return { ...m, label: override.label ?? m.label, number: override.number ?? m.number };
        }).filter((m) => {
          const override = (v as Record<string, { enabled?: boolean }>)[m.id];
          return override?.enabled !== false;
        });
      }
      break;
    }
  }
}

export function useSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    api.settings
      .getAll()
      .then((rows) => {
        if (cancelled) return;
        const out = { ...DEFAULTS };
        for (const row of rows) {
          parseRow(row.key, row.value, out);
        }
        out.ready = true;
        setSettings(out);
      })
      .catch(() => {
        if (!cancelled) setSettings({ ...DEFAULTS, ready: true });
      });
    return () => { cancelled = true; };
  }, []);

  return settings;
}
