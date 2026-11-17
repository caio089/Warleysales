import { formatDateOnly } from "@/shared/lib/time";
import type { PlanDossier } from "./request-facets";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-3.5 py-3">
      <dt className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-snug text-foreground">{value}</dd>
    </div>
  );
}

/** Ficha do plano: objeto completo e cada data que o PCA registrou. */
export function PlanDossierCard({ dossier, objectText }: { dossier: PlanDossier; objectText: string }) {
  if (!dossier.itemNumber) return null;

  const identifiedDate = dossier.expiry?.day
    ? formatDateOnly(dossier.expiry.day)
    : dossier.expiry?.monthLabel;

  return (
    <section aria-labelledby="ficha-pca" className="surface-card space-y-4 p-4 sm:p-5">
      <div>
        <h2 id="ficha-pca" className="font-heading text-lg font-semibold text-primary">Ficha do PCA 2027</h2>
        <p className="mt-1 text-sm text-muted-foreground">Objeto, datas e forma de contratação tirados do plano anual.</p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Fact label="O que é" value={dossier.natureza} />
        <Fact label="Item do plano" value={dossier.itemNumber} />
        <Fact label="Grupo" value={dossier.group} />
        <Fact label="Prioridade" value={dossier.priority} />
        <Fact label="Origem" value={dossier.origin} />
        <Fact label="Mês para concluir" value={dossier.plannedMonth} />
        <Fact label="Vencimento atual" value={dossier.expiry?.raw ?? "Não informado"} />
        <Fact label="Data identificada" value={identifiedDate ?? "Sem dia fechado no plano"} />
        <Fact label="Forma prevista" value={dossier.contractingForm} />
        <Fact label="Valor no plano" value={dossier.planValueText} />
      </dl>
      <div>
        <h3 className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Objeto</h3>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{objectText}</p>
      </div>
      {dossier.instruments.length > 0 ? (
        <div>
          <h3 className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Instrumentos citados</h3>
          <p className="mt-1 text-sm text-foreground">{dossier.instruments.join(" · ")}</p>
        </div>
      ) : null}
      {dossier.valueReading ? <p className="text-sm text-muted-foreground">{dossier.valueReading}</p> : null}
      {dossier.needsVerification ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          O plano marcou esta data com [VERIFICAR]. Confirme o vencimento nos autos antes de abrir a renovação.
        </p>
      ) : null}
    </section>
  );
}
