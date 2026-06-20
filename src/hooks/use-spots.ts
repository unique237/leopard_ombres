import { useEffect, useState } from "react";
import { BASELINE_SOLD, PROMO_TOTAL_SPOTS } from "@/lib/config";

export function useSpotsRemaining(baselineSold?: number, totalSpots?: number) {
  const baseline = baselineSold ?? BASELINE_SOLD;
  const total = totalSpots ?? PROMO_TOTAL_SPOTS;
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const res = await fetch("/api/orders/admin");
        // Non-admin endpoint not available, fall back to direct count endpoint
        if (!res.ok) return;
        const data: Array<{ status: string }> = await res.json();
        if (!cancelled) setOrderCount(data.length);
      } catch {
        // silently fail — counter stays at baseline
      }
    }
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const sold = baseline + orderCount;
  const remaining = Math.max(0, total - sold);
  return { sold, remaining, total };
}
