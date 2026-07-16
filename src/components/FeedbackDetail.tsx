import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Drawer } from "./ui/Drawer";
import { Button } from "./ui/Button";
import { FullSpinner } from "./ui/Spinner";
import { appByKey } from "../lib/apps";
import {
  FEEDBACK_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_LABELS,
  type FeedbackStatus,
  type FeedbackType,
} from "../lib/constants";
import { formatDateTime, initialsFromName, authorDisplayName } from "../lib/format";
import { cn } from "../lib/cn";

/**
 * Fiche d'un retour et sa conversation — **le même composant pour l'auteur et
 * pour l'équipe produit**. C'est le serveur qui tranche : `feedback.thread`
 * refuse la lecture à un tiers et renvoie `canModerate`, qui seul débloque le
 * changement de statut et la suppression. Une seule UI, donc pas deux versions
 * à maintenir en parallèle.
 */
export function FeedbackDetail({
  id,
  onClose,
}: {
  id: Id<"feedback"> | null;
  onClose: () => void;
}) {
  const thread = useQuery(api.feedback.thread, id ? { id } : "skip");
  const addComment = useMutation(api.feedback.addComment);
  const setStatus = useMutation(api.feedback.setStatus);
  const remove = useMutation(api.feedback.remove);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!id) return null;

  const item = thread?.item;
  const type = item?.type as FeedbackType | undefined;
  const app = item ? appByKey(item.app) : undefined;

  async function handleSend() {
    if (!id) return;
    const body = message.trim();
    if (body === "") return;
    setSending(true);
    setError(null);
    try {
      await addComment({ id, body });
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Supprimer définitivement ce retour et sa conversation ?")) return;
    await remove({ id });
    onClose();
  }

  return (
    <Drawer
      open
      onClose={() => {
        setMessage("");
        setError(null);
        onClose();
      }}
      variant="side"
      headerStyle={type ? { backgroundColor: TYPE_COLORS[type] } : undefined}
      closeButtonClassName="text-white/80 hover:bg-white/15 hover:text-white"
      title={
        type ? (
          <span className="inline-flex items-center gap-2 text-white">
            {(() => {
              const Icon = TYPE_ICONS[type];
              return <Icon className="h-4 w-4 shrink-0" />;
            })()}
            {TYPE_LABELS[type]}
          </span>
        ) : (
          <span className="text-white">Retour</span>
        )
      }
      headerContent={
        app && (
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white/85">
            <img src={app.logoSrc} alt="" className="h-4 w-4 rounded-sm object-contain" />
            {app.label}
          </p>
        )
      }
      bodyClassName="p-0"
    >
      {thread === undefined ? (
        <FullSpinner label="Chargement du retour…" />
      ) : !item ? (
        <p className="p-5 text-sm text-zinc-400">Ce retour n'existe plus.</p>
      ) : (
        <div className="flex h-full flex-col">
          <div className="space-y-6 p-5">
            {/* Demande d'origine */}
            <div className="flex items-center gap-3">
              <Avatar
                imageUrl={item.authorImageUrl}
                name={item.authorName}
                email={item.authorEmail}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-100">
                  {authorDisplayName(item.authorName, item.authorEmail)}
                </p>
                <p className="truncate text-xs text-zinc-400">{item.authorEmail}</p>
              </div>
              <span className="ml-auto shrink-0 text-xs text-zinc-400">
                {formatDateTime(item.createdAt)}
              </span>
            </div>

            <p className="whitespace-pre-wrap rounded-xl bg-[var(--crm-surface-2)] p-4 text-sm leading-6 text-zinc-100">
              {item.description}
            </p>

            {/* Statut : modifiable par l'équipe, informatif pour l'auteur */}
            <div>
              <SectionLabel>Statut</SectionLabel>
              {thread.canModerate ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {FEEDBACK_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatus({ id: item._id, status })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                        item.status === status
                          ? "text-white"
                          : "bg-[var(--crm-surface-2)] text-zinc-400 hover:text-zinc-100",
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
              ) : (
                <span
                  className="mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: STATUS_COLORS[item.status as FeedbackStatus] }}
                >
                  {STATUS_LABELS[item.status as FeedbackStatus]}
                </span>
              )}
            </div>

            {/* Conversation */}
            <div>
              <SectionLabel>
                Conversation{thread.comments.length > 0 && ` (${thread.comments.length})`}
              </SectionLabel>
              {thread.comments.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-[var(--crm-border-strong)] p-4 text-sm text-zinc-400">
                  {thread.canModerate
                    ? "Aucun échange. Écrivez à l'auteur ci-dessous — il verra votre message sur sa page « Mes retours »."
                    : "Aucune réponse pour l'instant. Vous serez notifié ici dès que l'équipe vous répond."}
                </p>
              ) : (
                <ul className="mt-2 space-y-3">
                  {thread.comments.map((comment) => (
                    <li
                      key={comment._id}
                      className={cn(
                        "rounded-xl p-3",
                        comment.fromTeam
                          ? "bg-brand-50 ring-1 ring-brand-200"
                          : "bg-[var(--crm-surface-2)]",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar
                          imageUrl={comment.authorImageUrl}
                          name={comment.authorName}
                          email={comment.authorEmail}
                          small
                        />
                        <p className="truncate text-xs font-semibold text-zinc-100">
                          {authorDisplayName(comment.authorName, comment.authorEmail)}
                        </p>
                        <span className="ml-auto shrink-0 text-[11px] text-zinc-400">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-100">
                        {comment.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Composeur, collé en bas */}
          <div className="mt-auto space-y-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] p-5">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={
                thread.canModerate
                  ? "Répondre à l'auteur…"
                  : "Ajouter une précision, répondre à l'équipe…"
              }
              className="w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/40"
            />
            {error && <p className="text-sm font-medium text-red-700">{error}</p>}
            <div className="flex items-center justify-between gap-2">
              {thread.canModerate ? (
                <Button variant="secondary" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" /> Supprimer
                </Button>
              ) : (
                <span />
              )}
              <Button size="sm" onClick={handleSend} disabled={sending || message.trim() === ""}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Avatar({
  imageUrl,
  name,
  email,
  small,
}: {
  imageUrl?: string;
  name?: string;
  email?: string;
  small?: boolean;
}) {
  const size = small ? "h-6 w-6 text-[10px]" : "h-10 w-10 text-sm";
  return imageUrl ? (
    <img src={imageUrl} alt="" className={cn(size, "shrink-0 rounded-full object-cover")} />
  ) : (
    <span
      className={cn(
        size,
        "flex shrink-0 items-center justify-center rounded-full bg-[var(--crm-surface-3)] font-semibold text-zinc-100",
      )}
    >
      {initialsFromName(name, email)}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{children}</p>
  );
}
