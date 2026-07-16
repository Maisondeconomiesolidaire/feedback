import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(ts: number): string {
  return format(new Date(ts), "d MMM yyyy", { locale: fr });
}

export function formatDateTime(ts: number): string {
  return format(new Date(ts), "d MMM yyyy 'à' HH:mm", { locale: fr });
}

export function formatRelative(ts: number): string {
  return formatDistanceToNow(new Date(ts), { addSuffix: true, locale: fr });
}

/**
 * Initiales d'un auteur. Le nom vient de Clerk (`identity.name`) et peut être
 * vide ou ne contenir qu'un mot : on retombe alors sur l'email, puis sur « ? »,
 * pour ne jamais afficher une pastille vide.
 */
export function initialsFromName(name?: string, email?: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const local = (email ?? "").split("@")[0];
  return local ? local.slice(0, 2).toUpperCase() : "?";
}

/** Nom affichable d'un auteur, avec repli sur la partie locale de l'email. */
export function authorDisplayName(name?: string, email?: string): string {
  const trimmed = (name ?? "").trim();
  if (trimmed) return trimmed;
  return (email ?? "").split("@")[0] || "Utilisateur";
}
