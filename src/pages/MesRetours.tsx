import { useState } from "react";
import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { Inbox, MessageSquare, MessageSquarePlus } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { PageHeader } from "../components/crm/PageHeader";
import { FeedbackDetail } from "../components/FeedbackDetail";
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
import { cn } from "../lib/cn";
import { CONTAINER } from "../lib/layout";

/**
 * Page de l'utilisateur « normal » : ses propres retours, en grosses cards
 * dominées par le type. Pas de kanban, pas de retours des autres — la query
 * `listMine` ne renvoie que les siens.
 */
export function MesRetours() {
  const items = useQuery(api.feedback.listMine, {});
  const [openId, setOpenId] = useState<Id<"feedback"> | null>(null);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex-col">
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

      <div className={cn(CONTAINER, "flex-1 py-8")}>
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
              <BigFeedbackCard
                key={item._id}
                item={item}
                onOpen={() => setOpenId(item._id)}
              />
            ))}
          </div>
        )}
      </div>

      <FeedbackDetail id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

/** Card d'un retour. Cliquable : ouvre la fiche et sa conversation. */
function BigFeedbackCard({
  item,
  onOpen,
}: {
  item: Doc<"feedback"> & { commentCount: number; teamReplyCount: number };
  onOpen: () => void;
}) {
  const type = item.type as FeedbackType;
  const status = item.status as FeedbackStatus;
  const Icon = TYPE_ICONS[type];
  const app = appByKey(item.app);

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ backgroundColor: TYPE_COLORS[type] }}
      className="flex flex-col rounded-2xl p-6 text-left text-white shadow-lg ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Logo de l'app concernée, sur fond blanc : les logos sont dessinés
              pour un fond clair et deviennent illisibles sur la couleur du type.
              Repli sur l'icône du type si l'app est inconnue. */}
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
            {app ? (
              <img src={app.logoSrc} alt="" className="h-full w-full object-contain" />
            ) : (
              <Icon className="h-5 w-5 text-[#1f1b18]" />
            )}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-tight">{TYPE_LABELS[type]}</h3>
            {app && <p className="mt-0.5 text-xs text-white/80">{app.label}</p>}
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

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-[11px] text-white/80">
        <span title={formatDateTime(item.createdAt)}>Envoyé {formatRelative(item.createdAt)}</span>
        {item.teamReplyCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 font-bold text-white">
            <MessageSquare className="h-3 w-3" />
            {item.teamReplyCount} réponse{item.teamReplyCount > 1 ? "s" : ""} de l'équipe
          </span>
        )}
      </div>
    </button>
  );
}
