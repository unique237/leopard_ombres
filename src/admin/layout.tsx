import { useState } from "react";
import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Settings,
  LogOut,
  Loader2,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/livres", label: "Livres", icon: BookOpen },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/commentaires", label: "Témoignages", icon: MessageSquare },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border/40">
        <div className="size-8 rounded-full border border-primary/40 bg-primary/10 text-center font-serif text-base font-semibold leading-8 text-primary">
          L
        </div>
        <div className="min-w-0">
          <div className="truncate font-serif text-sm font-semibold">
            Le Léopard
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Admin
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-accent/30 hover:text-foreground border border-transparent"
                )
              }
            >
              <Icon className="size-4" />
              {l.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border/40 p-3">
        <div className="rounded-md bg-muted/30 px-3 py-2.5 mb-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Connecté
          </div>
          <div className="mt-0.5 truncate text-xs font-medium text-foreground">
            {user?.email}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={signOut}
        >
          <LogOut className="size-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border/40 bg-card/40 backdrop-blur lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-r border-border/60 bg-card p-0">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border/40 bg-background/80 px-4 backdrop-blur lg:hidden">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <span className="font-serif text-base font-semibold">Admin</span>
        </header>
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
