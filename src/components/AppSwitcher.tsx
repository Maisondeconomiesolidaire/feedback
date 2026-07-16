import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useConvexAuth, useQuery } from "convex/react";
import { X } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { APPS, type FeedbackApp } from "../lib/apps";
import type { FeedbackAppKey } from "../lib/constants";

/** Icône « applications » (grille de points, à la Google apps). */
function AppsDotsIcon({ className }: { className?: string }) {
  const dots = [5, 12, 19];
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {dots.flatMap((cy) => dots.map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2} />))}
    </svg>
  );
}

type Access = {
  isAdmin: boolean;
  isStaff: boolean;
  bootstrapMode?: boolean;
  grants: Array<{ pageKey: string; actions: string[] }>;
};

/**
 * Applications réellement accessibles à l'utilisateur — mêmes règles que le
 * portail Mes Outils : les droits vivent dans `crmPermissions`, namespacés par
 * app. L'app « Feedback » elle-même est volontairement absente de cette liste :
 * elle est ouverte à tous et n'a pas de `pageKey`.
 */
function appCanAccess(access: Access, key: FeedbackAppKey): boolean {
  if (access.isAdmin || access.bootstrapMode) return true;
  if (!access.isStaff) return false;
  if (key === "feedback") return true;
  if (key === "mesoutils") return access.grants.some((g) => g.pageKey.startsWith("mesoutils:"));
  if (key === "klyde") return access.grants.some((g) => g.pageKey.startsWith("klyde:"));
  if (key === "cycleenbray") return access.grants.some((g) => g.pageKey.startsWith("cycle:"));
  if (key === "bennespro") return access.grants.some((g) => g.pageKey.startsWith("bennespro:"));
  if (key === "pointeuse") return access.grants.some((g) => g.pageKey.startsWith("pointeuse:"));
  // recycapp : pages sans préfixe d'application (flotte, demandes, tournees…).
  return access.grants.some((g) => !g.pageKey.includes(":"));
}

function useMyApps(current?: FeedbackAppKey): FeedbackApp[] | undefined {
  const { isAuthenticated } = useConvexAuth();
  const access = useQuery(api.permissions.myAccess, isAuthenticated ? {} : "skip") as
    | Access
    | undefined;
  if (access === undefined) return undefined;
  return APPS.filter((app) => app.key !== current && appCanAccess(access, app.key));
}

/**
 * Sélecteur d'applications façon « Google apps » : un bouton en grille de points
 * qui ouvre une modale listant les applications de l'écosystème accessibles à
 * l'utilisateur. Repris à l'identique des six autres apps.
 */
export function AppSwitcher({ current }: { current?: FeedbackAppKey }) {
  const [open, setOpen] = useState(false);
  const apps = useMyApps(current);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mes applications"
        title="Mes applications"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-[var(--crm-surface-3)] hover:text-zinc-100"
      >
        <AppsDotsIcon className="h-5 w-5" />
      </button>

      {open
        ? createPortal(
            /* Le portail sort du layout : sans `crm-light`, les variables
               --crm-* seraient introuvables et la modale sans fond. */
            <div
              className="crm-light fixed inset-0 z-[400] flex items-start justify-center bg-black/40 p-4 backdrop-blur-[2px] sm:items-center"
              onClick={() => setOpen(false)}
            >
              <div
                className="w-full max-w-sm rounded-[28px] border border-[var(--crm-border)] bg-[var(--crm-surface)] p-5 shadow-[0_32px_80px_rgba(0,0,0,0.32)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-zinc-100">Mes applications</h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Fermer"
                    className="rounded-full p-1.5 text-zinc-400 transition hover:bg-[var(--crm-surface-3)] hover:text-zinc-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {apps === undefined ? (
                  <p className="py-8 text-center text-sm text-zinc-400">Chargement…</p>
                ) : apps.length === 0 ? (
                  <p className="py-8 text-center text-sm text-zinc-400">
                    Aucune autre application ne vous est attribuée.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {apps.map((app) => (
                      <a
                        key={app.key}
                        href={app.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition hover:bg-[var(--crm-surface-3)]"
                      >
                        <span
                          className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl"
                          style={{ backgroundColor: app.cardBg }}
                        >
                          <img src={app.logoSrc} alt="" className="h-9 w-auto object-contain" />
                        </span>
                        <span className="text-xs font-semibold leading-tight text-zinc-100">
                          {app.label}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
