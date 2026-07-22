import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { CircleHelp, KanbanSquare, Lock, Menu, MessageSquarePlus, Inbox, X } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { AppSwitcher } from "./AppSwitcher";
import { EmptyState } from "./ui/EmptyState";
import { FullSpinner } from "./ui/Spinner";
import { cn } from "../lib/cn";

/**
 * Coquille de l'app — même présentation que les six autres : sidebar
 * persistante en desktop, tiroir en mobile, et le sélecteur d'applications à
 * droite du logo pour passer d'une app à l'autre.
 *
 * `crm-light` est indispensable sur la racine : c'est elle qui définit les
 * variables --crm-* et inverse l'échelle zinc pour un fond clair. Sans elle,
 * les `text-zinc-100` restent gris très clair sur blanc — illisibles.
 *
 * L'entrée « Tableau de bord » n'apparaît qu'aux comptes ayant le droit
 * `feedback:kanban` ; ce n'est qu'un confort d'affichage, `feedback.list`
 * refuse la requête côté serveur pour tout autre compte.
 */
export function AppLayout() {
  const access = useQuery(api.feedback.myFeedbackAccess, {});
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ferme le tiroir mobile à chaque changement de page.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (access === undefined) return <FullSpinner label="Vérification des droits…" />;

  // Feedback est une fonctionnalité comme une autre : sans `feedback:retours`,
  // l'app n'a rien à montrer et toutes ses requêtes seraient refusées.
  if (!access.canOpen) {
    return (
      <div className="crm-light flex min-h-screen items-center justify-center bg-[var(--crm-bg)] px-4">
        <EmptyState
          icon={<Lock className="h-10 w-10" />}
          title="Accès non attribué"
          description="L'application Feedback ne vous a pas été attribuée. Demandez le droit « Mes retours » à un administrateur depuis Mes Outils."
        />
      </div>
    );
  }

  const sidebar = <SidebarContent isAdmin={access.canModerate} />;

  return (
    <div className="crm-light min-h-screen bg-[var(--crm-bg)] text-zinc-100 lg:pl-64">
      {/* Sidebar persistante (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--crm-border)] bg-[var(--crm-surface)] lg:flex">
        {sidebar}
      </aside>

      {/* Barre supérieure minimale (mobile) */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--crm-border)] bg-[var(--crm-bg)] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-100 hover:bg-[var(--crm-surface-3)]"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/">
          <img src="/mesoutils-light.png" alt="Mes Outils" className="h-8 w-auto" />
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <AppSwitcher current="feedback" />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Tiroir mobile */}
      {mobileOpen ? (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--crm-border)] bg-[var(--crm-surface)]">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-[var(--crm-surface-3)]"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <Outlet />
    </div>
  );
}

function SidebarContent({ isAdmin }: { isAdmin: boolean }) {
  const { user } = useUser();
  const points = useQuery(api.points.myPoints, {}) ?? 100;
  const ensurePoints = useMutation(api.points.ensureMine);
  useEffect(() => { void ensurePoints({}); }, [ensurePoints]);
  return (
    <>
      <div className="flex h-20 items-center justify-between gap-2 overflow-hidden border-b border-[var(--crm-border)] px-5">
        <Link to="/">
          <img src="/mesoutils-light.png" alt="Mes Outils" className="h-16 w-auto" />
        </Link>
        <AppSwitcher current="feedback" />
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        <NavItem to="/" icon={<Inbox className="h-[18px] w-[18px]" />} label="Mes retours" end />
        <NavItem
          to="/nouveau"
          icon={<MessageSquarePlus className="h-[18px] w-[18px]" />}
          label="Nouveau retour"
        />
        {isAdmin && (
          <NavItem
            to="/kanban"
            icon={<KanbanSquare className="h-[18px] w-[18px]" />}
            label="Tableau de bord"
          />
        )}
      </nav>

      <div className="hidden border-t border-[var(--crm-border)] p-3 lg:block">
        <Link to="/" className="flex items-center gap-2 rounded-xl bg-[var(--crm-surface-2)] px-3 py-2 text-sm font-semibold text-zinc-900">
          <span className="truncate">{user?.firstName ?? user?.fullName ?? "Mon profil"}</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">{points} pts <span title="Les points récompensent vos réservations, retours et participations utiles."><CircleHelp className="h-3 w-3" /></span></span>
        </Link>
      </div>
    </>
  );
}

function NavItem({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
          isActive
            ? "bg-brand-600 text-white"
            : "text-zinc-400 hover:bg-[var(--crm-surface-3)] hover:text-zinc-100",
        )
      }
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </NavLink>
  );
}
