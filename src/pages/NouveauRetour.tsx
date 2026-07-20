import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Send } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/Button";
import { APPS, appByKey } from "../lib/apps";
import {
  FEEDBACK_PRIORITIES,
  FEEDBACK_TYPES,
  PRIORITY_COLORS,
  PRIORITY_DESCRIPTIONS,
  PRIORITY_ICONS,
  PRIORITY_LABELS,
  TYPE_COLORS,
  TYPE_DESCRIPTIONS,
  TYPE_ICONS,
  TYPE_LABELS,
  type FeedbackAppKey,
  type FeedbackPriority,
  type FeedbackType,
} from "../lib/constants";
import { cn } from "../lib/cn";
import { CONTAINER } from "../lib/layout";

type Step = 1 | 2 | 3 | 4;

const STEP_TITLES: Record<Step, string> = {
  1: "Votre retour concerne quelle application ?",
  2: "De quel type de retour s'agit-il ?",
  3: "Quelle est l'urgence ?",
  4: "Décrivez votre retour",
};

/**
 * Dépôt d'un retour sous forme d'assistant : une décision par écran
 * (application → type → description). Chaque choix fait avancer l'étape, et le
 * fil d'Ariane permet de revenir sur une étape déjà remplie.
 *
 * Les applications sont **toutes** proposées, sans filtrer par droits : le but
 * est que n'importe qui puisse remonter un problème, y compris sur une app où
 * il n'a aucun grant CRM.
 */
export function NouveauRetour() {
  const navigate = useNavigate();
  const submit = useMutation(api.feedback.submit);

  const [step, setStep] = useState<Step>(1);
  const [app, setApp] = useState<FeedbackAppKey | null>(null);
  const [type, setType] = useState<FeedbackType | null>(null);
  const [priority, setPriority] = useState<FeedbackPriority | null>(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    app !== null && type !== null && priority !== null && description.trim() !== "" && !saving;

  function chooseApp(key: FeedbackAppKey) {
    setApp(key);
    setStep(2);
  }

  function chooseType(key: FeedbackType) {
    setType(key);
    setStep(3);
  }

  function choosePriority(key: FeedbackPriority) {
    setPriority(key);
    setStep(4);
  }

  async function handleSubmit() {
    if (app === null || type === null || priority === null) return;
    const trimmed = description.trim();
    if (trimmed === "") return;

    setSaving(true);
    setError(null);
    try {
      await submit({ app, type, priority, description: trimmed });
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible pour le moment.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex-col">
      {/* Pas de bandeau de page ici : la navigation dit déjà « Nouveau retour »,
          et l'assistant doit s'ouvrir directement sur sa question. */}
      <div className={cn(CONTAINER, "flex-1 py-8")}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
          {STEP_TITLES[step]}
        </h2>

        <div className="mt-4">
          <Steps step={step} app={app} type={type} priority={priority} onGoTo={setStep} />
        </div>

        {step === 1 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {APPS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => chooseApp(item.key)}
                aria-pressed={app === item.key}
                style={{ backgroundColor: item.cardBg }}
                className={cn(
                  "flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg",
                  app === item.key
                    ? "border-transparent ring-2 ring-brand-600"
                    : "border-black/5",
                )}
              >
                <img src={item.logoSrc} alt="" className="h-20 w-auto object-contain" />
                <span className="text-xl font-bold text-[#1f1b18]">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEEDBACK_TYPES.map((key) => {
              const Icon = TYPE_ICONS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => chooseType(key)}
                  aria-pressed={type === key}
                  style={{ backgroundColor: TYPE_COLORS[key] }}
                  className={cn(
                    "rounded-2xl p-5 text-left text-white shadow-sm transition hover:brightness-110",
                    type === key ? "ring-2 ring-brand-600" : "ring-1 ring-black/10",
                  )}
                >
                  <span className="inline-flex items-center gap-2 text-base font-semibold">
                    <Icon className="h-5 w-5" />
                    {TYPE_LABELS[key]}
                  </span>
                  <p className="mt-2 text-sm leading-5 text-white/85">
                    {TYPE_DESCRIPTIONS[key]}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEEDBACK_PRIORITIES.map((key) => {
              const Icon = PRIORITY_ICONS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => choosePriority(key)}
                  aria-pressed={priority === key}
                  style={{ backgroundColor: PRIORITY_COLORS[key] }}
                  className={cn(
                    "rounded-2xl p-5 text-left text-white shadow-sm transition hover:brightness-110",
                    priority === key ? "ring-2 ring-brand-600" : "ring-1 ring-black/10",
                  )}
                >
                  <span className="inline-flex items-center gap-2 text-base font-semibold">
                    <Icon className="h-5 w-5" />
                    {PRIORITY_LABELS[key]}
                  </span>
                  <p className="mt-2 text-sm leading-5 text-white/85">
                    {PRIORITY_DESCRIPTIONS[key]}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={9}
              autoFocus
              placeholder="Le plus précis possible : ce que vous faisiez, ce que vous attendiez, ce qui s'est passé…"
              className="mt-6 w-full rounded-2xl border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/40"
            />

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="secondary" onClick={() => setStep(3)} disabled={saving}>
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <Button size="lg" onClick={handleSubmit} disabled={!canSubmit}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Envoyer mon retour
              </Button>
            </div>
          </>
        )}

        {step !== 4 && (
          <div className="mt-6">
            <Button
              variant="secondary"
              onClick={() => (step === 1 ? navigate("/") : setStep((step - 1) as Step))}
            >
              <ArrowLeft className="h-4 w-4" /> {step === 1 ? "Annuler" : "Retour"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Fil d'Ariane cliquable : montre où l'on en est, rappelle les choix déjà faits
 * et permet d'y revenir. On ne peut pas sauter vers une étape non atteinte.
 */
function Steps({
  step,
  app,
  type,
  priority,
  onGoTo,
}: {
  step: Step;
  app: FeedbackAppKey | null;
  type: FeedbackType | null;
  priority: FeedbackPriority | null;
  onGoTo: (step: Step) => void;
}) {
  const items: Array<{ step: Step; label: string; value: string | null }> = [
    { step: 1, label: "Application", value: app ? appByKey(app)?.label ?? null : null },
    { step: 2, label: "Type", value: type ? TYPE_LABELS[type] : null },
    { step: 3, label: "Urgence", value: priority ? PRIORITY_LABELS[priority] : null },
    { step: 4, label: "Description", value: null },
  ];

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => {
        const done = item.step < step;
        const current = item.step === step;
        const reachable = item.step <= step;
        return (
          <li key={item.step} className="flex items-center gap-2">
            {index > 0 && <span className="text-zinc-400">›</span>}
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onGoTo(item.step)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition",
                current && "bg-[var(--crm-surface-3)] text-zinc-100",
                !current && reachable && "text-zinc-400 hover:bg-[var(--crm-surface-2)]",
                !reachable && "cursor-default text-zinc-400",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
                  done && "bg-brand-600 text-white",
                  current && "bg-zinc-100 text-[var(--crm-bg)]",
                  !done && !current && "bg-[var(--crm-surface-3)] text-zinc-400",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : item.step}
              </span>
              {item.value ?? item.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
