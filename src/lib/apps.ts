import type { FeedbackAppKey } from "./constants";

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
};

export const APPS: FeedbackApp[] = [
  {
    key: "mesoutils",
    label: "Mes Outils",
    description: "Portail interne : accès aux applications, espace partage et réservations.",
    logoSrc: "/mesoutils-light.png",
    cardBg: "#e6f6ec",
  },
  {
    key: "recycapp",
    label: "Recyclerie",
    description: "CRM de gestion pour les demandes, la boutique, le stock et les clients.",
    logoSrc: "/recyclerie-logo.png",
    cardBg: "#ffffff",
  },
  {
    key: "klyde",
    label: "Klyd",
    description: "Boutique textile : stock, mise en ligne et suivi des commandes.",
    logoSrc: "/klyd-logo.png",
    cardBg: "#f6eee5",
  },
  {
    key: "cycleenbray",
    label: "Cycle en Bray",
    description: "Boutique et CRM de gestion pour la Recyclerie 60 et 76.",
    logoSrc: "/cycle-en-bray-logo.webp",
    cardBg: "#eef7f1",
  },
  {
    key: "bennespro",
    label: "Bennes & Pro",
    description: "Gestion déchet'lab",
    logoSrc: "/bennespro-logo.png",
    cardBg: "#a4cebe",
  },
  {
    key: "pointeuse",
    label: "Pointeuse",
    description: "Suivi des salariés et des chantiers : pointages, projets, dépenses et factures.",
    logoSrc: "/logo-lsdb.png",
    cardBg: "#fff1e5",
  },
  {
    key: "feedback",
    label: "Feedback",
    description: "Cette application : vos retours sur les outils du groupe.",
    logoSrc: "/mesoutils-light.png",
    cardBg: "#eaf1fb",
  },
];

const APPS_BY_KEY = new Map(APPS.map((app) => [app.key, app]));

export function appByKey(key: FeedbackAppKey): FeedbackApp | undefined {
  return APPS_BY_KEY.get(key);
}

export function appLabel(key: FeedbackAppKey): string {
  return APPS_BY_KEY.get(key)?.label ?? key;
}
