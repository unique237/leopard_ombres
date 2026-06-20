import { useEffect, useState } from "react";
import {
  BookOpen,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { api, type Book, type BookStatus } from "@/lib/api";

type Draft = Omit<Book, "id" | "created_at" | "updated_at">;

const empty: Draft = {
  title: "",
  subtitle: "",
  tagline: "",
  author: "Koreen Mbombele",
  description: "",
  cover_url: "",
  price_promo: 4900,
  price_full: 6900,
  currency: "FCFA",
  status: "draft",
  featured: false,
  release_date: null,
};

export function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Book | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.books.listAll();
      setBooks(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (b: Book) => {
    try {
      await api.books.delete(b.id);
      toast.success("Livre supprimé");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete book");
    }
  };

  const togglePublish = async (b: Book) => {
    const next: BookStatus = b.status === "published" ? "draft" : "published";
    try {
      await api.books.update(b.id, { status: next });
      toast.success(next === "published" ? "Publié" : "Mis en brouillon");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update book");
    }
  };

  const toggleFeatured = async (b: Book) => {
    try {
      await api.books.update(b.id, { featured: !b.featured });
      toast.success(!b.featured ? "Mis en avant" : "Retiré de la mise en avant");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update book");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Catalogue</div>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Livres</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez les ouvrages publiés sur le site.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Nouveau livre
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : books.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/40">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <BookOpen className="size-10 text-muted-foreground" />
            <p className="mt-4 font-serif text-lg">Aucun livre pour le moment</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajoutez votre premier ouvrage au catalogue.
            </p>
            <Button className="mt-5" onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Ajouter un livre
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {books.map((b) => (
            <Card
              key={b.id}
              className={`relative overflow-hidden border-border/60 bg-card/60 backdrop-blur transition ${
                b.featured ? "ring-1 ring-primary/40" : ""
              }`}
            >
              {b.featured && (
                <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                  <Star className="size-3" />
                  Mis en avant
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="size-20 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/30">
                    {b.cover_url ? (
                      <img
                        src={b.cover_url}
                        alt={b.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <BookOpen className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-serif text-lg font-semibold">{b.title}</h3>
                    {b.subtitle && (
                      <div className="truncate text-xs text-muted-foreground">{b.subtitle}</div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          b.status === "published"
                            ? "border-emerald/50 text-emerald"
                            : b.status === "archived"
                            ? "border-muted-foreground/40 text-muted-foreground"
                            : "border-amber-500/50 text-amber-400"
                        }
                      >
                        {b.status === "published"
                          ? "Publié"
                          : b.status === "archived"
                          ? "Archivé"
                          : "Brouillon"}
                      </Badge>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {b.price_promo.toLocaleString("fr-FR")} {b.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {b.tagline && (
                  <p className="mt-3 line-clamp-2 font-serif text-sm italic text-muted-foreground">
                    « {b.tagline} »
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(b)}>
                    <Pencil className="size-3.5" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePublish(b)}
                  >
                    {b.status === "published" ? (
                      <>
                        <EyeOff className="size-3.5" />
                        Brouillon
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" />
                        Publier
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFeatured(b)}
                  >
                    <Star className={`size-3.5 ${b.featured ? "fill-primary text-primary" : ""}`} />
                    {b.featured ? "Retirer" : "Mettre en avant"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(b)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BookDialog
        open={creating}
        onOpenChange={(o) => !o && setCreating(false)}
        title="Nouveau livre"
        initial={empty}
        onSaved={() => {
          setCreating(false);
          load();
        }}
      />

      <BookDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Modifier le livre"
        bookId={editing?.id}
        initial={
          editing
            ? {
                title: editing.title,
                subtitle: editing.subtitle ?? "",
                tagline: editing.tagline ?? "",
                author: editing.author,
                description: editing.description ?? "",
                cover_url: editing.cover_url ?? "",
                price_promo: editing.price_promo,
                price_full: editing.price_full,
                currency: editing.currency,
                status: editing.status,
                featured: editing.featured,
                release_date: editing.release_date,
              }
            : empty
        }
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce livre ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {deleteTarget?.title} » sera retiré du catalogue. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && onDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BookDialog({
  open,
  onOpenChange,
  title,
  initial,
  bookId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial: Draft;
  bookId?: string;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    setSaving(true);
    const payload = {
      ...draft,
      subtitle: draft.subtitle?.trim() || null,
      tagline: draft.tagline?.trim() || null,
      description: draft.description?.trim() || null,
      cover_url: draft.cover_url?.trim() || null,
      release_date: draft.release_date || null,
    };

    try {
      if (bookId) {
        await api.books.update(bookId, payload);
      } else {
        await api.books.create(payload);
      }
      toast.success(bookId ? "Livre mis à jour" : "Livre ajouté");
      setSaving(false);
      onSaved();
    } catch (err) {
      setSaving(false);
      toast.error(err instanceof Error ? err.message : "Failed to save book");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field>
            <FieldLabel htmlFor="title">Titre *</FieldLabel>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="subtitle">Sous-titre</FieldLabel>
              <Input
                id="subtitle"
                value={draft.subtitle ?? ""}
                onChange={(e) => set("subtitle", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="author">Auteur·e</FieldLabel>
              <Input
                id="author"
                value={draft.author}
                onChange={(e) => set("author", e.target.value)}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="tagline">Phrase d'accroche</FieldLabel>
            <Input
              id="tagline"
              value={draft.tagline ?? ""}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="Une phrase qui donne envie de lire le livre"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              rows={4}
              value={draft.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="cover_url">URL de la couverture</FieldLabel>
            <Input
              id="cover_url"
              value={draft.cover_url ?? ""}
              onChange={(e) => set("cover_url", e.target.value)}
              placeholder="/book-cover.webp ou https://..."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="price_promo">Prix promo</FieldLabel>
              <Input
                id="price_promo"
                type="number"
                value={draft.price_promo}
                onChange={(e) => set("price_promo", Number(e.target.value))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="price_full">Prix plein</FieldLabel>
              <Input
                id="price_full"
                type="number"
                value={draft.price_full}
                onChange={(e) => set("price_full", Number(e.target.value))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="currency">Devise</FieldLabel>
              <Input
                id="currency"
                value={draft.currency}
                onChange={(e) => set("currency", e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="status">Statut</FieldLabel>
              <Select
                value={draft.status}
                onValueChange={(v) => set("status", v as BookStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="release_date">Date de sortie</FieldLabel>
              <Input
                id="release_date"
                type="date"
                value={draft.release_date ?? ""}
                onChange={(e) => set("release_date", e.target.value || null)}
              />
            </Field>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3">
            <Switch
              id="featured"
              checked={draft.featured}
              onCheckedChange={(v) => set("featured", v)}
            />
            <label htmlFor="featured" className="flex-1 text-sm">
              <div className="font-medium">Mettre en avant sur la landing page</div>
              <div className="text-xs text-muted-foreground">
                Un seul livre peut être mis en avant à la fois.
              </div>
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
