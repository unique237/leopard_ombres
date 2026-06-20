import { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  CircleDollarSign,
  BookOpen,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { api, type Order } from "@/lib/api";

interface Stats {
  visits_total: number;
  visits_unique: number;
  visits_24h: number;
  orders_total: number;
  orders_pending: number;
  revenue_confirmed: number;
  revenue_pending: number;
  books_published: number;
  books_total: number;
  recent_orders: Order[];
  daily: { day: string; visits: number; orders: number }[];
}

const chartConfig = {
  visits: { label: "Visites", color: "var(--chart-2)" },
  orders: { label: "Commandes", color: "var(--chart-1)" },
} satisfies ChartConfig;

function fmtMoney(n: number, currency = "FCFA") {
  return `${n.toLocaleString("fr-FR")} ${currency}`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "primary",
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "emerald";
}) {
  const ring = accent === "emerald" ? "border-emerald/30 bg-emerald/5" : "border-primary/30 bg-primary/5";
  const fg = accent === "emerald" ? "text-emerald" : "text-primary";
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div className={`inline-flex size-8 items-center justify-center rounded-full border ${ring} ${fg}`}>
            <Icon className="size-4" />
          </div>
        </div>
        <div className="mt-3 font-serif text-3xl font-semibold tabular-nums text-foreground">
          {value}
        </div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.stats
      .dashboard()
      .then((data) => {
        if (!mounted) return;
        // Format daily labels to readable dates
        const daily = data.daily.map(({ day, visits, orders }) => ({
          day: new Date(day).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
          visits,
          orders,
        }));
        setStats({ ...data, daily });
      })
      .catch(console.error)
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">
          Vue d'ensemble
        </div>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
          Tableau de bord
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Activité du site sur les 30 derniers jours.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Visiteurs uniques"
          value={stats.visits_unique.toLocaleString("fr-FR")}
          hint={`${stats.visits_total.toLocaleString("fr-FR")} pages vues`}
        />
        <StatCard
          icon={Clock}
          label="24 dernières heures"
          value={stats.visits_24h.toLocaleString("fr-FR")}
          hint="visites récentes"
          accent="emerald"
        />
        <StatCard
          icon={ShoppingBag}
          label="Commandes"
          value={stats.orders_total.toLocaleString("fr-FR")}
          hint={`${stats.orders_pending} en attente`}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Revenus confirmés"
          value={fmtMoney(stats.revenue_confirmed)}
          hint={`+${fmtMoney(stats.revenue_pending)} en attente`}
          accent="emerald"
        />
      </div>

      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold">Activité (14 jours)</h2>
              <p className="text-xs text-muted-foreground">Visites et commandes par jour</p>
            </div>
            <TrendingUp className="size-5 text-primary" />
          </div>
          <ChartContainer config={chartConfig} className="mt-4 min-h-[220px] w-full">
            <AreaChart accessibilityLayer data={stats.daily} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area dataKey="visits" type="monotone" stroke="var(--color-visits)" fill="url(#fillVisits)" strokeWidth={2} />
              <Area dataKey="orders" type="monotone" stroke="var(--color-orders)" fill="url(#fillOrders)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 backdrop-blur lg:col-span-2">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Dernières commandes</h2>
              <Badge variant="outline" className="border-primary/40 text-primary">
                {stats.orders_total} total
              </Badge>
            </div>
            {stats.recent_orders.length === 0 ? (
              <div className="mt-6 rounded-md border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
                Aucune commande pour le moment.
              </div>
            ) : (
              <div className="mt-4 -mx-2 overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                      <th className="px-2 py-2 font-medium">Client</th>
                      <th className="px-2 py-2 font-medium">Format</th>
                      <th className="px-2 py-2 font-medium">Statut</th>
                      <th className="px-2 py-2 text-right font-medium">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.map((o) => (
                      <tr key={o.id} className="border-t border-border/40">
                        <td className="px-2 py-3">
                          <div className="font-medium text-foreground">{o.first_name}</div>
                          <div className="text-xs text-muted-foreground">{o.email}</div>
                        </td>
                        <td className="px-2 py-3 capitalize text-muted-foreground">
                          {o.format === "physical" ? "Physique" : "Numérique"}
                        </td>
                        <td className="px-2 py-3">
                          <OrderStatusBadge status={o.status} />
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">
                          {fmtMoney(o.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Catalogue</h2>
              <BookOpen className="size-5 text-primary" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Publiés</span>
                <span className="font-serif text-2xl font-semibold text-primary">
                  {stats.books_published}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total (avec brouillons)</span>
                <span className="font-serif text-xl font-semibold text-foreground">
                  {stats.books_total}
                </span>
              </div>
            </div>
            <a
              href="/admin/livres"
              className="mt-5 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary transition hover:underline"
            >
              Gérer les livres →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], { label: string; cls: string }> = {
    pending: { label: "En attente", cls: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
    verifying: { label: "Vérification", cls: "border-sky-500/40 bg-sky-500/10 text-sky-400" },
    confirmed: { label: "Confirmé", cls: "border-emerald/50 bg-emerald/10 text-emerald" },
    delivered: { label: "Livré", cls: "border-emerald/50 bg-emerald/15 text-emerald" },
  };
  const v = map[status];
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${v.cls}`}>
      {v.label}
    </span>
  );
}
