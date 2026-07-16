# Feedback — feedback.groupemes.fr

Application de retours utilisateurs de l'écosystème Groupe MES.

Tout utilisateur connecté (compte Clerk prod, le même que dans les 6 autres
apps) peut déposer un retour : application concernée, type de retour,
description. Il retrouve ensuite **ses** retours et leur statut sur la page
« Mes retours ».

Le **kanban** de traitement (Nouveau → En cours → Terminé, plus un onglet
« Refusés ») est réservé à l'équipe produit — allowlist d'adresses dans
`~/mesoutils/convex/feedback.ts` (`FEEDBACK_ADMIN_EMAILS`).

## Architecture

⚠️ Lire [`CLAUDE.md`](CLAUDE.md) avant toute intervention : cette app est la
**7ᵉ** du même écosystème et partage **le déploiement Convex de production** et
**l'instance Clerk de production** avec les 6 autres.

- Le backend de cette app vit dans `~/mesoutils/convex/feedback.ts` (+ la table
  `feedback` de `~/mesoutils/convex/schema.ts`). Le dossier `convex/` de ce
  dépôt est une **copie en lecture seule** pour le typecheck local.
- Ne jamais lancer `npx convex dev` / `npx convex deploy` depuis ce dépôt.

## Développement

```sh
npm install
npm run dev
npm run typecheck
```
