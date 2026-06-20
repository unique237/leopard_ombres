import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export function AdminLogin() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/admin";

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Email et mot de passe (6+ caracteres) requis.");
      return;
    }
    setSubmitting(true);
    const fn = tab === "signin" ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(tab === "signin" ? "Connexion reussie." : "Compte cree.");
    navigate(from, { replace: true });
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, hsl(var(--primary) / 0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, hsl(var(--primary) / 0.10) 0%, transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 size-12 rounded-full border border-primary/40 bg-primary/10 text-center font-serif text-xl font-semibold leading-[3rem] text-primary">
            L
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">
            Espace administrateur
          </div>
          <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
            Le Leopard et les Ombres
          </h1>
        </div>

        <Card className="border-primary/20 bg-card/70 backdrop-blur">
          <CardContent className="p-6 sm:p-8">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Premier acces</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={tab === "signin" ? "current-password" : "new-password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6 caracteres minimum"
                  />
                </div>

                <TabsContent value="signin" className="m-0 p-0">
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : "Se connecter"}
                  </Button>
                </TabsContent>
                <TabsContent value="signup" className="m-0 p-0">
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : "Creer le compte"}
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Le premier compte cree devient administrateur.
                  </p>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
