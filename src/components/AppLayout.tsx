import { NavLink, Outlet } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { KanbanSquare, MessageSquarePlus, Inbox } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { cn } from "../lib/cn";
import { CONTAINER } from "../lib/layout";

/**
 * Coquille de l'app : barre supérieure + navigation. L'onglet « Kanban »
 * n'apparaît que pour l'équipe produit (`amIFeedbackAdmin`). Ce n'est qu'un
 * confort d'affichage : `feedback.list` refuse la requête côté serveur pour
 * tout autre compte.
 *
 * La classe `crm-light` est indispensable : c'est elle qui définit les
 * variables `--crm-*` et qui inverse l'échelle zinc pour un fond clair. Sans
 * elle, les `text-zinc-100` restaient gris très clair sur blanc — illisibles.
 */
export function AppLayout() {
  const isAdmin = useQuery(api.feedback.amIFeedbackAdmin, {});

  return (
    <div className="crm-light min-h-screen bg-[var(--crm-bg)] text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-[var(--crm-border)] bg-[color:color-mix(in_srgb,var(--crm-bg)_84%,transparent)] backdrop-blur">
        <div className={cn(CONTAINER, "flex h-16 items-center justify-between gap-4")}>
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex shrink-0 items-center" aria-label="Accueil">
              <img
                src="/mesoutils-light.png"
                alt="Mes Outils"
                className="h-14 w-auto object-contain"
              />
            </NavLink>
            <nav className="flex items-center gap-1">
              <NavItem to="/" icon={<Inbox className="h-4 w-4" />} label="Mes retours" end />
              <NavItem
                to="/nouveau"
                icon={<MessageSquarePlus className="h-4 w-4" />}
                label="Nouveau retour"
              />
              {isAdmin && (
                <NavItem
                  to="/kanban"
                  icon={<KanbanSquare className="h-4 w-4" />}
                  label="Kanban"
                />
              )}
            </nav>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <Outlet />
    </div>
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
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition",
          isActive
            ? "bg-[var(--crm-surface-3)] text-zinc-100"
            : "text-zinc-400 hover:bg-[var(--crm-surface-2)] hover:text-zinc-100",
        )
      }
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}
