import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Inbox, Lock } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PageHeader } from "../components/crm/PageHeader";
import { KanbanColumn } from "../components/crm/KanbanColumn";
import { FeedbackCard } from "../components/FeedbackCard";
import { FeedbackDetail } from "../components/FeedbackDetail";
import { EmptyState } from "../components/ui/EmptyState";
import { FullSpinner } from "../components/ui/Spinner";
import { APPS } from "../lib/apps";
import {
  FEEDBACK_TYPES,
  STAGES,
  TYPE_COLORS,
  TYPE_SHORT_LABELS,
  type FeedbackAppKey,
  type FeedbackType,
} from "../lib/constants";
import { cn } from "../lib/cn";
import { CONTAINER } from "../lib/layout";

/**
 * Kanban des retours — réservé à l'équipe produit. Le serveur (`feedback.list`)
 * refuse la requête pour tout autre compte ; on affiche alors un écran dédié
 * plutôt qu'une erreur brute.
 */
export function Kanban() {
  const access = useQuery(api.feedback.myFeedbackAccess, {});
  const isAdmin = access?.canModerate;
  const items = useQuery(api.feedback.list, isAdmin ? {} : "skip");

  const [typeFilter, setTypeFilter] = useState<FeedbackType | null>(null);
  const [appFilter, setAppFilter] = useState<FeedbackAppKey | null>(null);
  const [openId, setOpenId] = useState<Id<"feedback"> | null>(null);

  const displayed = useMemo(
    () =>
      (items ?? [])
        .filter((item) => !typeFilter || item.type === typeFilter)
        .filter((item) => !appFilter || item.app === appFilter),
    [items, typeFilter, appFilter],
  );

  if (isAdmin === undefined) {
    return <FullSpinner label="Vérification des droits…" />;
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen items-center justify-center px-4">
        <EmptyState
          icon={<Lock className="h-10 w-10" />}
          title="Page réservée"
          description="Le suivi des retours est réservé à l'équipe produit. Vos propres retours restent visibles depuis « Mes retours »."
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex-col">
      <PageHeader
        title="Retours"
        subtitle="Tous les retours remontés depuis les applications du groupe."
      />

      {/* Filtres */}
      <div className="relative z-10 border-b border-[var(--crm-border)]">
        <div className={CONTAINER}>
        <div className="flex flex-wrap items-center gap-2 py-3">
          <FilterChip
            label="Tous les types"
            active={typeFilter === null}
            onClick={() => setTypeFilter(null)}
          />
          {FEEDBACK_TYPES.map((key) => (
            <FilterChip
              key={key}
              label={TYPE_SHORT_LABELS[key]}
              color={TYPE_COLORS[key]}
              active={typeFilter === key}
              onClick={() => setTypeFilter(typeFilter === key ? null : key)}
            />
          ))}
          <div className="h-4 w-px shrink-0 bg-[var(--crm-surface-3)]" />
          <FilterChip
            label="Toutes les apps"
            active={appFilter === null}
            onClick={() => setAppFilter(null)}
          />
          {APPS.map((app) => (
            <FilterChip
              key={app.key}
              label={app.label}
              active={appFilter === app.key}
              onClick={() => setAppFilter(appFilter === app.key ? null : app.key)}
            />
          ))}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className={cn(CONTAINER, "flex-1 overflow-auto py-6")}>
        {items === undefined ? (
          <FullSpinner label="Chargement des retours…" />
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-10 w-10" />}
            title="Aucun retour"
            description="Les retours envoyés par les utilisateurs apparaîtront ici."
          />
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row">
            {STAGES.map((stage) => {
              const cards = displayed.filter((i) => i.status === stage.key);
              return (
                <KanbanColumn
                  key={stage.key}
                  title={stage.label}
                  count={cards.length}
                  accent={stage.accent}
                >
                  {cards.map((item) => (
                    <FeedbackCard
                      key={item._id}
                      item={item}
                      onOpen={() => setOpenId(item._id)}
                    />
                  ))}
                </KanbanColumn>
              );
            })}
          </div>
        )}
      </div>

      <FeedbackDetail id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function FilterChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
        active
          ? "bg-[var(--crm-surface-3)] text-zinc-100 ring-1 ring-white/20"
          : "text-zinc-400 hover:bg-[var(--crm-surface-2)] hover:text-zinc-200",
      )}
    >
      {color && (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      )}
      {label}
    </button>
  );
}
