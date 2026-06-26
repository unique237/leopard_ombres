import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Check,
  RotateCcw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api, type Order, type OrderStatus } from "@/lib/api";

const statusOptions: { value: "all" | OrderStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "verifying", label: "Vérification" },
  { value: "confirmed", label: "Confirmé" },
  { value: "delivered", label: "Livré" },
];

const paymentLabels: Record<Order["payment_method"], string> = {
  mtn: "MTN MoMo",
  orange: "Orange Money",
  cinetpay: "CinetPay",
  paypal: "PayPal",
};

function fmtMoney(n: number, currency = "FCFA") {
  return `${n.toLocaleString("fr-FR")} ${currency}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string }> = {
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

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.orders.list();
      setOrders(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.orders.updateStatus(id, status);
      toast.success("Statut mis à jour");
      setOpen((o) => (o && o.id === id ? { ...o, status } : o));
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "all") list = list.filter((o) => o.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.first_name.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          (o.phone ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, filter, query]);

  const counts = useMemo(() => {
    const map = { pending: 0, verifying: 0, confirmed: 0, delivered: 0 } as Record<OrderStatus, number>;
    for (const o of orders) map[o.status] += 1;
    return map;
  }, [orders]);

  const totalRevenue = orders
    .filter((o) => o.status === "confirmed" || o.status === "delivered")
    .reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Ventes</div>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Commandes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivez les paiements et confirmez les commandes reçues.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Total</div>
            <div className="mt-1 font-serif text-2xl font-semibold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">À traiter</div>
            <div className="mt-1 font-serif text-2xl font-semibold text-amber-400">
              {counts.pending + counts.verifying}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Confirmées</div>
            <div className="mt-1 font-serif text-2xl font-semibold text-emerald">
              {counts.confirmed + counts.delivered}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Revenus</div>
            <div className="mt-1 font-serif text-2xl font-semibold text-primary tabular-nums">
              {fmtMoney(totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone…"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/40">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="mt-4 font-serif text-lg">Aucune commande</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === "all"
                ? "Les commandes apparaîtront ici dès la première vente."
                : "Aucune commande ne correspond à ce filtre."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Format</th>
                    <th className="px-4 py-3 font-medium">Paiement</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 text-right font-medium">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => setOpen(o)}
                      className="cursor-pointer border-b border-border/30 transition hover:bg-accent/20"
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {fmtDate(o.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{o.first_name}</div>
                        <div className="text-xs text-muted-foreground">{o.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {o.format === "physical" ? "Physique" : "EPUB + PDF"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {paymentLabels[o.payment_method]}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {fmtMoney(o.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <OrderDialog
        order={open}
        onOpenChange={(o) => !o && setOpen(null)}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
}

function OrderDialog({
  order,
  onOpenChange,
  onUpdateStatus,
}: {
  order: Order | null;
  onOpenChange: (o: boolean) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}) {
  if (!order) return null;
  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Commande {order.first_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground">{fmtDate(order.created_at)}</span>
          </div>

          <div className="rounded-md border border-border/60 bg-muted/20 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Montant
              </span>
              <span className="font-serif text-2xl font-semibold tabular-nums text-primary">
                {fmtMoney(order.amount)}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Format</span>
              <span className="font-medium">
                {order.format === "physical" ? "Livre physique" : "EPUB + PDF"}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Paiement</span>
              <span className="font-medium">{paymentLabels[order.payment_method]}</span>
            </div>
            {order.delivery_method && (
              <div className="mt-1 flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span className="font-medium capitalize">
                  {order.delivery_method === "home" ? "À domicile" : "Point relais"}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-md border border-border/60 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Coordonnées
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              <a href={`mailto:${order.email}`} className="hover:text-primary">
                {order.email}
              </a>
            </div>
            {order.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <a href={`tel:${order.phone}`} className="hover:text-primary">
                  {order.phone}
                </a>
              </div>
            )}
            {(order.address || order.city) && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                <span>
                  {order.address ? `${order.address}, ` : ""}
                  {order.city}
                </span>
              </div>
            )}
          </div>

          {order.payment_proof_url && (
            <a
              href={order.payment_proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm transition hover:bg-primary/10"
            >
              <span className="font-medium text-primary">Voir la preuve de paiement</span>
              <ExternalLink className="size-4 text-primary" />
            </a>
          )}

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Mettre à jour
            </div>
            <div className="flex flex-wrap gap-2">
              {order.status !== "verifying" && order.status !== "confirmed" && order.status !== "delivered" && (
                <Button size="sm" variant="outline" onClick={() => onUpdateStatus(order.id, "verifying")}>
                  Marquer en vérification
                </Button>
              )}
              {order.status !== "confirmed" && order.status !== "delivered" && (
                <Button size="sm" onClick={() => onUpdateStatus(order.id, "confirmed")}>
                  <Check className="size-4" />
                  Confirmer le paiement
                </Button>
              )}
              {order.status === "confirmed" && (
                <Button size="sm" onClick={() => onUpdateStatus(order.id, "delivered")}>
                  <Check className="size-4" />
                  {order.format === "physical" ? "Marquer livré" : "EPUB + PDF envoyé"}
                </Button>
              )}
              {order.status !== "pending" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUpdateStatus(order.id, "pending")}
                >
                  <RotateCcw className="size-4" />
                  Remettre en attente
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
