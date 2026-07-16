import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Inbox, Loader2, Lock, Trash2 } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { PageHeader } from "../components/crm/PageHeader";
import { KanbanColumn } from "../components/crm/KanbanColumn";
import { FeedbackCard } from "../components/FeedbackCard";
import { Drawer } from "../components/ui/Drawer";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { FullSpinner } from "../components/ui/Spinner";
import { UnderlineTabs } from "../components/ui/UnderlineTabs";
import { APPS, appByKey } from "../lib/apps";
import {
  FEEDBACK_TYPES,
  STAGES,
  STATUS_COLORS,
  STATUS_LABELS,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_LABELS,
  TYPE_SHORT_LABELS,
  type FeedbackAppKey,
  type FeedbackStatus,
  type FeedbackType,
} from "../lib/constants";
import { formatDateTime, initialsFromName, authorDisplayName } from "../lib/format";
import { cn } from "../lib/cn";
import { CONTAINER } from "../lib/layout";

type Tab = "open" | "refuse";

const TABS: { key: Tab; label: string }[] = [
  { key: "open", label: "En cours de traitement" },
  { key: "refuse", label: "Refusés" },
];

/**
 * Kanban des retours — réservé à l'équipe produit. Le serveur (`feedback.list`)
 * refuse la requête pour tout autre compte ; on affiche alors un écran dédié
 * plutôt qu'une erreur brute.
 */
export function Kanban() {
  const isAdmin = useQuery(api.feedback.amIFeedbackAdmin, {});
  const items = useQuery(api.feedback.list, isAdmin ? {} : "skip");

  const [tab, setTab] = useState<Tab>("open");
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <EmptyState
          icon={<Lock className="h-10 w-10" />}
          title="Page réservée"
          description="Le suivi des retours est réservé à l'équipe produit. Vos propres retours restent visibles depuis « Mes retours »."
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <PageHeader
        title="Retours"
        subtitle="Tous les retours remontés depuis les applications du groupe."
      />

      <div className={cn(CONTAINER, "pt-4")}>
        <UnderlineTabs
          items={TABS}
          value={tab}
          onChange={setTab}
          counts={
            items
              ? {
                  open: displayed.filter((i) => i.status !== "refuse").length,
                  refuse: displayed.filter((i) => i.status === "refuse").length,
                }
              : undefined
          }
        />
      </div>

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
        ) : tab === "refuse" ? (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {displayed
              .filter((i) => i.status === "refuse")
              .map((item) => (
                <FeedbackCard key={item._id} item={item} onOpen={() => setOpenId(item._id)} />
              ))}
          </div>
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

      <FeedbackDrawer
        item={(items ?? []).find((i) => i._id === openId) ?? null}
        onClose={() => setOpenId(null)}
      />
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

/** Détail d'un retour : changement de statut, réponse à l'auteur, suppression. */
function FeedbackDrawer({
  item,
  onClose,
}: {
  item: Doc<"feedback"> | null;
  onClose: () => void;
}) {
  const setStatus = useMutation(api.feedback.setStatus);
  const setAdminNote = useMutation(api.feedback.setAdminNote);
  const remove = useMutation(api.feedback.remove);

  const [note, setNote] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  if (!item) return null;

  const type = item.type as FeedbackType;
  const Icon = TYPE_ICONS[type];
  const app = appByKey(item.app);
  // `note === null` : champ non touché depuis l'ouverture → on suit la base.
  const noteValue = note ?? item.adminNote ?? "";

  async function handleSaveNote() {
    if (!item) return;
    setSavingNote(true);
    try {
      await setAdminNote({ id: item._id, adminNote: noteValue });
      setNote(null);
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (!confirm("Supprimer définitivement ce retour ?")) return;
    await remove({ id: item._id });
    onClose();
  }

  return (
    <Drawer
      open={item !== null}
      onClose={() => {
        setNote(null);
        onClose();
      }}
      variant="side"
      headerStyle={{ backgroundColor: TYPE_COLORS[type] }}
      headerContent={
        <div className="text-white">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Icon className="h-4 w-4" />
            {TYPE_LABELS[type]}
          </span>
          {app && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/80">
              <img src={app.logoSrc} alt="" className="h-3.5 w-3.5 rounded-sm object-contain" />
              {app.label}
            </p>
          )}
        </div>
      }
    >
      <div className="space-y-6 p-4 sm:p-6">
        {/* Auteur */}
        <div className="flex items-center gap-3">
          {item.authorImageUrl ? (
            <img src={item.authorImageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--crm-surface-3)] text-sm font-semibold text-zinc-200">
              {initialsFromName(item.authorName, item.authorEmail)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-100">
              {authorDisplayName(item.authorName, item.authorEmail)}
            </p>
            <p className="truncate text-xs text-zinc-400">{item.authorEmail}</p>
          </div>
          <span className="ml-auto text-xs text-zinc-400">{formatDateTime(item.createdAt)}</span>
        </div>

        {/* Description */}
        <div>
          <SectionLabel>Retour</SectionLabel>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[var(--crm-surface-2)] p-4 text-sm leading-6 text-zinc-200">
            {item.description}
          </p>
        </div>

        {/* Statut */}
        <div>
          <SectionLabel>Statut</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatus({ id: item._id, status })}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  item.status === status
                    ? "text-white ring-2 ring-white/40"
                    : "bg-[var(--crm-surface-2)] text-zinc-400 hover:text-zinc-200",
                )}
                style={
                  item.status === status
                    ? { backgroundColor: STATUS_COLORS[status] }
                    : undefined
                }
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Réponse */}
        <div>
          <SectionLabel>Réponse à l'auteur</SectionLabel>
          <textarea
            value={noteValue}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Visible par l'auteur sur sa page « Mes retours »…"
            className="mt-2 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={handleSaveNote} disabled={savingNote}>
              {savingNote && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer la réponse
            </Button>
          </div>
        </div>

        <div className="border-t border-[var(--crm-border)] pt-4">
          <Button variant="secondary" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Supprimer ce retour
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{children}</p>
  );
}
