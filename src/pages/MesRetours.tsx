import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { Inbox, MessageSquarePlus } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { PageHeader } from "../components/crm/PageHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { FullSpinner } from "../components/ui/Spinner";
import { appByKey } from "../lib/apps";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_LABELS,
  type FeedbackStatus,
  type FeedbackType,
} from "../lib/constants";
import { formatDateTime, formatRelative } from "../lib/format";

/**
 * Page de l'utilisateur « normal » : ses propres retours, en grosses cards
 * dominées par le type. Pas de kanban, pas de retours des autres — la query
 * `listMine` ne renvoie que les siens.
 */
export function MesRetours() {
  const items = useQuery(api.feedback.listMine, {});

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <PageHeader
        title="Mes retours"
        subtitle="Suivez ce que vous nous avez remonté et où ça en est."
        actions={
          <Link to="/nouveau">
            <Button size="sm">
              <MessageSquarePlus className="h-4 w-4" /> Nouveau retour
            </Button>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {items === undefined ? (
          <FullSpinner label="Chargement de vos retours…" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-10 w-10" />}
            title="Aucun retour pour le moment"
            description="Une idée, un bug, une question ? Dites-le nous, c'est ici que ça commence."
            action={
              <Link to="/nouveau">
                <Button>
                  <MessageSquarePlus className="h-4 w-4" /> Nouveau retour
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {items.map((item) => (
              <BigFeedbackCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BigFeedbackCard({ item }: { item: Doc<"feedback"> }) {
  const type = item.type as FeedbackType;
  const status = item.status as FeedbackStatus;
  const Icon = TYPE_ICONS[type];
  const app = appByKey(item.app);

  return (
    <article
      style={{ backgroundColor: TYPE_COLORS[type] }}
      className="flex flex-col rounded-2xl p-6 text-white shadow-lg ring-1 ring-black/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-tight">{TYPE_LABELS[type]}</h3>
            {app && (
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-white/80">
                <img src={app.logoSrc} alt="" className="h-3.5 w-3.5 rounded-sm object-contain" />
                {app.label}
              </p>
            )}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/30"
          style={{ backgroundColor: STATUS_COLORS[status] }}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-white/95">
        {item.description}
      </p>

      {item.adminNote && (
        <div className="mt-5 rounded-xl bg-white/15 p-4 ring-1 ring-white/20">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">
            Réponse de l'équipe
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-white">
            {item.adminNote}
          </p>
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 pt-5 text-[11px] text-white/75">
        <span title={formatDateTime(item.createdAt)}>Envoyé {formatRelative(item.createdAt)}</span>
      </div>
    </article>
  );
}
