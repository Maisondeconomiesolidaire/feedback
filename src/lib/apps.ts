import type { FeedbackAppKey } from "./constants";

const env = import.meta.env as Record<string, string | undefined>;

/**
 * URL d'app depuis l'env avec repli. Les variables Vercel peuvent exister en
 * chaîne VIDE, et `"" ?? repli` renvoie `""` : on traite le vide comme absent.
 */
function appUrl(key: string, fallback: string): string {
  return env[key]?.trim() || fallback;
}

/**
 * Catalogue des applications de l'écosystème — **repris à l'identique** de
 * `MyApps.tsx` (présent dans les 6 apps) : mêmes logos, mêmes libellés, mêmes
 * couleurs de card. L'utilisateur retrouve donc exactement les tuiles qu'il
 * connaît du portail Mes Outils au moment de choisir l'app concernée.
 *
 * Si une tuile change dans `MyApps.tsx`, la répercuter ici.
 */

export type FeedbackApp = {
  key: FeedbackAppKey;
  label: string;
  description: string;
  logoSrc: string;
  cardBg: string;
  /** Où mène la tuile du sélecteur d'applications. */
  href: string;
};

export const APPS: FeedbackApp[] = [
  {
    key: "mesoutils",
    label: "Mes Outils",
    description: "Portail interne : accès aux applications, espace partage et réservations.",
    logoSrc: "/mesoutils-light.png",
    cardBg: "#e6f6ec",
    href: appUrl("VITE_MESOUTILS_URL", "https://mesoutils.groupemes.fr"),
  },
  {
    key: "recycapp",
    label: "Recyclerie",
    description: "CRM de gestion pour les demandes, la boutique, le stock et les clients.",
    logoSrc: "/recyclerie-logo.png",
    cardBg: "#ffffff",
    href: appUrl("VITE_RECYCAPP_URL", "https://mesrecycleries.groupemes.fr/crm"),
  },
  {
    key: "klyde",
    label: "Klyd",
    description: "Boutique textile : stock, mise en ligne et suivi des commandes.",
    logoSrc: "/klyd-logo.png",
    cardBg: "#f6eee5",
    href: appUrl("VITE_KLYD_URL", "https://klyd.groupemes.fr"),
  },
  {
    key: "cycleenbray",
    label: "Cycle en Bray",
    description: "Boutique et CRM de gestion pour la Recyclerie 60 et 76.",
    logoSrc: "/cycle-en-bray-logo.webp",
    cardBg: "#eef7f1",
    href: appUrl("VITE_CYCLEENBRAY_URL", "https://cycleenbray.groupemes.fr/crm"),
  },
  {
    key: "bennespro",
    label: "Bennes & Pro",
    description: "Gestion déchet'lab",
    logoSrc: "/bennespro-logo.png",
    cardBg: "#a4cebe",
    href: appUrl("VITE_BENNESPRO_URL", "https://materiosol.groupemes.fr"),
  },
  {
    key: "pointeuse",
    label: "Pointeuse",
    description: "Suivi des salariés et des chantiers : pointages, projets, dépenses et factures.",
    logoSrc: "/logo-lsdb.png",
    cardBg: "#fff1e5",
    href: appUrl("VITE_POINTEUSE_URL", "https://pointeuselsdb.groupemes.fr"),
  },
  {
    key: "feedback",
    label: "Feedback",
    description: "Cette application : vos retours sur les outils du groupe.",
    logoSrc: "/mesoutils-light.png",
    cardBg: "#eaf1fb",
    href: appUrl("VITE_FEEDBACK_URL", "https://feedback.groupemes.fr"),
  },
];

const APPS_BY_KEY = new Map(APPS.map((app) => [app.key, app]));

export function appByKey(key: FeedbackAppKey): FeedbackApp | undefined {
  return APPS_BY_KEY.get(key);
}

export function appLabel(key: FeedbackAppKey): string {
  return APPS_BY_KEY.get(key)?.label ?? key;
}
