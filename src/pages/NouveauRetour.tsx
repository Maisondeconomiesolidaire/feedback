import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, Send } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { PageHeader } from "../components/crm/PageHeader";
import { Button } from "../components/ui/Button";
import { APPS } from "../lib/apps";
import {
  FEEDBACK_TYPES,
  TYPE_COLORS,
  TYPE_DESCRIPTIONS,
  TYPE_ICONS,
  TYPE_LABELS,
  type FeedbackAppKey,
  type FeedbackType,
} from "../lib/constants";
import { cn } from "../lib/cn";

/**
 * Dépôt d'un retour, en trois temps : application concernée, type, description.
 *
 * Les tuiles d'application reprennent le dessin de `MyApps` (logo, fond
 * coloré, description). On les affiche **toutes**, sans filtrer par droits :
 * le but est que n'importe quel utilisateur puisse remonter un problème, y
 * compris sur une app où il n'a aucun grant CRM.
 */
export function NouveauRetour() {
  const navigate = useNavigate();
  const submit = useMutation(api.feedback.submit);

  const [app, setApp] = useState<FeedbackAppKey | null>(null);
  const [type, setType] = useState<FeedbackType | null>(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = app !== null && type !== null && description.trim() !== "" && !saving;

  async function handleSubmit() {
    if (app === null || type === null) return;
    const trimmed = description.trim();
    if (trimmed === "") return;

    setSaving(true);
    setError(null);
    try {
      await submit({ app, type, description: trimmed });
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible pour le moment.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <PageHeader
        title="Nouveau retour"
        subtitle="Dites-nous ce qui vous manque ou ce qui ne va pas — on s'en occupe."
      />

      <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-8 sm:px-6">
        {/* 1 — Application */}
        <section>
          <StepTitle step={1} title="Quelle application ?" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {APPS.map((item) => {
              const selected = app === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setApp(item.key)}
                  className={cn(
                    "block h-full rounded-lg border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg",
                    selected
                      ? "border-transparent ring-2 ring-white"
                      : "border-black/5 hover:shadow-lg",
                  )}
                  style={{ backgroundColor: item.cardBg, color: "#1f1b18" }}
                  aria-pressed={selected}
                >
                  <div className="flex items-start justify-between gap-4">
                    <img
                      src={item.logoSrc}
                      alt={item.label}
                      className="h-14 w-auto object-contain"
                    />
                    {selected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1f1b18] text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#1f1b18]/70">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2 — Type de retour */}
        <section>
          <StepTitle step={2} title="De quel type de retour s'agit-il ?" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {FEEDBACK_TYPES.map((key) => {
              const Icon = TYPE_ICONS[key];
              const selected = type === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  aria-pressed={selected}
                  style={{ backgroundColor: TYPE_COLORS[key] }}
                  className={cn(
                    "rounded-xl p-4 text-left text-white shadow-sm ring-1 ring-black/10 transition hover:brightness-110",
                    selected && "ring-2 ring-white brightness-110",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4" />
                      {TYPE_LABELS[key]}
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0" />}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/80">
                    {TYPE_DESCRIPTIONS[key]}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3 — Description */}
        <section>
          <StepTitle step={3} title="Décrivez votre retour" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={7}
            placeholder="Le plus précis possible : ce que vous faisiez, ce que vous attendiez, ce qui s'est passé…"
            className="mt-4 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white/40"
          />
        </section>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/30">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pb-4">
          <Button variant="secondary" onClick={() => navigate("/")} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Envoyer mon retour
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--crm-surface-3)] text-xs font-bold text-zinc-300">
        {step}
      </span>
      <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
    </div>
  );
}
