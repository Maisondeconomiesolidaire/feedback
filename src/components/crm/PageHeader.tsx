import { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CONTAINER } from "../../lib/layout";

/**
 * Titre de page. Il partage la gouttière `CONTAINER` avec la barre de
 * navigation : sans elle, le titre partait du bord de l'écran alors que la nav
 * était centrée, et rien ne s'alignait.
 *
 * `top-16` colle sous l'en-tête, qui fait exactement `h-16`.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-16 z-20 border-b border-[var(--crm-border)] bg-[color:color-mix(in_srgb,var(--crm-bg)_84%,transparent)] backdrop-blur">
      <div
        className={cn(
          CONTAINER,
          "flex min-h-16 flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-0",
        )}
      >
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>}
        </div>
        {actions && (
          <div className="w-full min-w-0 lg:w-auto">
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div>
          </div>
        )}
      </div>
    </header>
  );
}
