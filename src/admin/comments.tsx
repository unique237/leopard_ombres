import { useEffect, useState } from "react";
import {
  Loader2,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { api, type Comment } from "@/lib/api";

type Draft = Omit<Comment, "id" | "created_at">;

const empty: Draft = { author_name: "", comment: "", is_published: false };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Comment | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.comments.listAll();
      setComments(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (c: Comment) => {
    try {
      await api.comments.delete(c.id);
      toast.success("Commentaire supprimé");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const togglePublish = async (c: Comment) => {
    try {
      await api.comments.update(c.id, { is_published: !c.is_published });
      toast.success(c.is_published ? "Masqué" : "Publié");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update comment");
    }
  };

  const publishedCount = comments.filter((c) => c.is_published).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Avis lecteurs</div>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Témoignages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez les commentaires affichés sur la page d'accueil.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Nouveau témoignage
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Total</div>
            <div className="mt-1 font-serif text-2xl font-semibold">{comments.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Publiés</div>
            <div className="mt-1 font-serif text-2xl font-semibold text-emerald">{publishedCount}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/40">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <MessageSquare className="size-10 text-muted-foreground" />
            <p className="mt-4 font-serif text-lg">Aucun témoignage pour le moment</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajoutez les premiers avis de vos lecteurs.
            </p>
            <Button className="mt-5" onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Ajouter un témoignage
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {comments.map((c) => (
            <Card
              key={c.id}
              className={`border-border/60 bg-card/60 backdrop-blur transition ${
                c.is_published ? "" : "opacity-60"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{c.author_name}</span>
                      {c.is_published ? (
                        <Badge variant="outline" className="border-emerald/50 text-emerald">
                          Publié
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                          Masqué
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground italic line-clamp-3">
                      « {c.comment} »
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">{fmtDate(c.created_at)}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                    <Pencil className="size-3.5" />
                    Modifier
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => togglePublish(c)}>
                    {c.is_published ? (
                      <>
                        <EyeOff className="size-3.5" />
                        Masquer
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
                    className="ml-auto text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(c)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CommentDialog
        open={creating}
        onOpenChange={(o) => !o && setCreating(false)}
        title="Nouveau témoignage"
        initial={empty}
        onSaved={() => {
          setCreating(false);
          load();
        }}
      />

      <CommentDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Modifier le témoignage"
        commentId={editing?.id}
        initial={
          editing
            ? {
                author_name: editing.author_name,
                comment: editing.comment,
                is_published: editing.is_published,
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
            <AlertDialogTitle>Supprimer ce témoignage ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le commentaire de « {deleteTarget?.author_name} » sera supprimé définitivement.
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

function CommentDialog({
  open,
  onOpenChange,
  title,
  initial,
  commentId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial: Draft;
  commentId?: string;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.author_name.trim()) {
      toast.error("Le nom de l'auteur est requis");
      return;
    }
    if (!draft.comment.trim()) {
      toast.error("Le commentaire est requis");
      return;
    }
    setSaving(true);
    try {
      if (commentId) {
        await api.comments.update(commentId, draft);
      } else {
        await api.comments.create({ ...draft, created_at: new Date().toISOString() });
      }
      toast.success(commentId ? "Témoignage mis à jour" : "Témoignage ajouté");
      setSaving(false);
      onSaved();
    } catch (err) {
      setSaving(false);
      toast.error(err instanceof Error ? err.message : "Failed to save comment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field>
            <FieldLabel htmlFor="author_name">Nom du lecteur *</FieldLabel>
            <Input
              id="author_name"
              value={draft.author_name}
              onChange={(e) => setDraft((d) => ({ ...d, author_name: e.target.value }))}
              placeholder="Marie K."
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="comment">Commentaire *</FieldLabel>
            <Textarea
              id="comment"
              rows={5}
              value={draft.comment}
              onChange={(e) => setDraft((d) => ({ ...d, comment: e.target.value }))}
              placeholder="Ce livre m'a profondément touché..."
              required
            />
          </Field>
          <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3">
            <input
              id="is_published"
              type="checkbox"
              className="size-4 accent-primary"
              checked={draft.is_published}
              onChange={(e) => setDraft((d) => ({ ...d, is_published: e.target.checked }))}
            />
            <label htmlFor="is_published" className="flex-1 text-sm">
              <div className="font-medium">Publier immédiatement</div>
              <div className="text-xs text-muted-foreground">
                Le témoignage sera visible sur la page d'accueil.
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
