import { MessageSquare } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import {
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_SHORT_LABELS,
  type FeedbackType,
} from "../lib/constants";
import { appByKey } from "../lib/apps";
import { formatDate, formatRelative, initialsFromName, authorDisplayName } from "../lib/format";

/**
 * Card du kanban — même dessin que `RequestCard` de Recycapp : fond plein à la
 * couleur du type, texte blanc, badges en blanc translucide.
 */
export function FeedbackCard({
  item,
  onOpen,
}: {
  /** `commentCount` vient de `feedback.list`, pas de la table. */
  item: Doc<"feedback"> & { commentCount: number };
  onOpen: () => void;
}) {
  const type = item.type as FeedbackType;
  const Icon = TYPE_ICONS[type];
  const app = appByKey(item.app);

  return (
    <button
      onClick={onOpen}
      style={{ backgroundColor: TYPE_COLORS[type] }}
      className="block w-full text-left rounded-xl p-3 text-white shadow-sm ring-1 ring-black/10 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
          <Icon className="h-3.5 w-3.5" />
          {TYPE_SHORT_LABELS[type]}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {app && (
            <span className="inline-flex items-center gap-1 rounded bg-white/18 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
              <img src={app.logoSrc} alt="" className="h-3 w-3 rounded-sm object-contain" />
              {app.label}
            </span>
          )}
          <span className="rounded bg-white/18 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
            {formatDate(item.createdAt)}
          </span>
        </div>
      </div>

      <p className="mt-2.5 line-clamp-3 text-sm leading-5 text-white/95">
        {item.description}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {item.authorImageUrl ? (
          <img
            src={item.authorImageUrl}
            alt=""
            className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/30"
          />
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
            {initialsFromName(item.authorName, item.authorEmail)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {authorDisplayName(item.authorName, item.authorEmail)}
          </p>
          <p className="truncate text-[11px] text-white/75">{item.authorEmail}</p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-3 text-[11px] text-white/80">
        <span>{formatRelative(item.createdAt)}</span>
        {item.commentCount > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 font-medium text-white">
            <MessageSquare className="h-3 w-3" />
            {item.commentCount}
          </span>
        )}
      </div>
    </button>
  );
}
