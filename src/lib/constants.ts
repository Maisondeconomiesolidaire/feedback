import type { CSSProperties } from "react";
import {
  Sparkles,
  Bug,
  Wand2,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * Types, statuts et couleurs des retours. Même convention que
 * `recycapp/src/lib/constants.ts` : une couleur officielle par type, des cards
 * pleines teintées à cette couleur, des badges dérivés.
 *
 * ⚠️ Les unions doivent rester alignées sur les validateurs
 * `feedbackType` / `feedbackStatus` / `feedbackApp` de
 * `~/mesoutils/convex/schema.ts` (source de vérité du backend partagé).
 */

export type FeedbackType =
  | "fonctionnalite"
  | "probleme"
  | "amelioration"
  | "question";

export type FeedbackStatus = "nouveau" | "en_cours" | "termine" | "refuse";

export type FeedbackAppKey =
  | "mesoutils"
  | "recycapp"
  | "klyde"
  | "cycleenbray"
  | "bennespro"
  | "pointeuse"
  | "feedback";

export const FEEDBACK_TYPES: FeedbackType[] = [
  "fonctionnalite",
  "probleme",
  "amelioration",
  "question",
];

/** Libellé long, tel que présenté à l'utilisateur dans le formulaire. */
export const TYPE_LABELS: Record<FeedbackType, string> = {
  fonctionnalite: "J'ai une idée de fonctionnalité",
  probleme: "J'ai un problème",
  amelioration: "J'ai une amélioration à proposer",
  question: "J'ai une question",
};

/** Libellé court, pour les badges et les cards du kanban. */
export const TYPE_SHORT_LABELS: Record<FeedbackType, string> = {
  fonctionnalite: "Fonctionnalité",
  probleme: "Problème",
  amelioration: "Amélioration",
  question: "Question",
};

export const TYPE_DESCRIPTIONS: Record<FeedbackType, string> = {
  fonctionnalite: "Quelque chose qui n'existe pas encore et vous ferait gagner du temps.",
  probleme: "Un bug, une erreur, quelque chose qui ne marche pas comme prévu.",
  amelioration: "Quelque chose qui existe mais qui pourrait être plus simple.",
  question: "Vous ne savez pas comment faire quelque chose.",
};

/** Couleur officielle (hex) de chaque type de retour. */
export const TYPE_COLORS: Record<FeedbackType, string> = {
  fonctionnalite: "#317fa0",
  probleme: "#a0315a",
  amelioration: "#782170",
  question: "#196b24",
};

export const TYPE_ICONS: Record<FeedbackType, LucideIcon> = {
  fonctionnalite: Sparkles,
  probleme: Bug,
  amelioration: Wand2,
  question: HelpCircle,
};

/** Styles inline pour un badge teinté à la couleur du type. */
export function typeBadgeStyle(type: FeedbackType): CSSProperties {
  const c = TYPE_COLORS[type];
  return {
    backgroundColor: `${c}22`,
    color: c,
    boxShadow: `inset 0 0 0 1px ${c}55`,
  };
}

/** Colonnes du kanban, dans l'ordre d'avancement. */
export const STAGES: { key: FeedbackStatus; label: string; accent: string }[] = [
  { key: "nouveau", label: "Nouveau", accent: "#317fa0" },
  { key: "en_cours", label: "En cours", accent: "#a78bfa" },
  { key: "termine", label: "Terminé", accent: "#196b24" },
];

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  termine: "Terminé",
  refuse: "Refusé",
};

export const STATUS_COLORS: Record<FeedbackStatus, string> = {
  nouveau: "#317fa0",
  en_cours: "#a78bfa",
  termine: "#196b24",
  refuse: "#ef4444",
};
