import { useEffect, useState } from "react";
import { PROMO_END_ISO } from "@/lib/config";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function compute(target: number): Remaining {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    expired: false,
  };
}

export function useCountdown(endIso?: string): Remaining {
  const iso = endIso ?? PROMO_END_ISO;
  const target = new Date(iso).getTime();
  const [remaining, setRemaining] = useState<Remaining>(() => compute(target));

  useEffect(() => {
    setRemaining(compute(target));
    const id = setInterval(() => setRemaining(compute(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return remaining;
}
