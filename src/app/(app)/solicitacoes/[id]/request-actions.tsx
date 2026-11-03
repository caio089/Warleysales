"use client";

import { receiveFormAction, requestStepFormAction } from "@/modules/purchases/actions";
import { nextStates } from "@/shared/lib/state-machine";
import { REQUEST_TRANSITIONS, type PurchaseRequestStatus } from "@/modules/purchases/domain/request-status";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { TextField } from "@/shared/ui/forms/fields";

interface Props {
  requestId: string;
  status: PurchaseRequestStatus;
  canDecide: boolean;
  canCreate: boolean;
  canReceive: boolean;
  pendingItems: { id: string; label: string; pending: number }[];
}

/** Ações disponíveis = transições válidas ∩ permissões. Sem botão = mensagem clara. */
export function RequestActions({ requestId, status, canDecide, canCreate, canReceive, pendingItems }: Props) {
  const next = nextStates(REQUEST_TRANSITIONS, status);
  const steps: {
    step: string;
    label: string;
    to: PurchaseRequestStatus;
    allowed: boolean;
    note?: boolean;
    destructive?: boolean;
  }[] = [
    { step: "submit", label: "Enviar solicitação", to: "enviada", allowed: canCreate },
    { step: "startReview", label: "Iniciar análise", to: "em_analise", allowed: canDecide },
    { step: "approve", label: "Aprovar", to: "aprovada", allowed: canDecide },
    { step: "requestCorrection", label: "Pedir correção", to: "aguardando_correcao", allowed: canDecide, note: true },
    { step: "reject", label: "Rejeitar", to: "rejeitada", allowed: canDecide, note: true, destructive: true },
    { step: "cancel", label: "Cancelar", to: "cancelada", allowed: canCreate || canDecide, destructive: true },
  ];
  const available = steps.filter(
    (s) => s.allowed && next.includes(s.to) && !(s.step === "startReview" && status === "aguardando_correcao"),
  );
  const canResubmit = status === "aguardando_correcao" && canCreate;
  const canReopen = status === "rejeitada" && canDecide;
  const receiving =
    canReceive && ["aprovada", "em_atendimento", "parcialmente_atendida"].includes(status) && pendingItems.length > 0;
  const hasActions = available.length > 0 || canResubmit || canReopen || receiving;

  return (
    <section aria-labelledby="acoes" className="space-y-4">
      <div>
        <h2 id="acoes" className="text-base font-semibold">
          O que você pode fazer agora
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Só aparecem botões permitidos para o seu perfil neste status.
        </p>
      </div>
      {!hasActions ? (
        <p className="rounded-xl border border-dashed border-border/80 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          Nenhuma ação disponível para você neste momento. Se o próximo passo for de outra pessoa (gestor ou estoque),
          acompanhe pelo status e pelo histórico.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {available.map((s) => (
          <ActionForm
            key={s.step}
            action={requestStepFormAction}
            submitLabel={s.label}
            submitVariant={s.destructive ? "destructive" : "default"}
            hiddenFields={{ requestId, step: s.step }}
          >
            {(e) => (s.note ? <TextField name="note" label="Motivo" required errors={e.note} /> : null)}
          </ActionForm>
        ))}
        {canResubmit ? (
          <ActionForm
            action={requestStepFormAction}
            submitLabel="Reenviar após correção"
            hiddenFields={{ requestId, step: "resubmitAfterCorrection" }}
          >
            {() => null}
          </ActionForm>
        ) : null}
        {canReopen ? (
          <ActionForm
            action={requestStepFormAction}
            submitLabel="Reabrir (excepcional)"
            submitVariant="outline"
            hiddenFields={{ requestId, step: "reopen" }}
          >
            {(e) => <TextField name="note" label="Justificativa da reabertura" required errors={e.note} />}
          </ActionForm>
        ) : null}
      </div>
      {receiving ? (
        <div className="surface-card max-w-md p-6">
          <h3 className="mb-1 font-heading text-lg font-medium tracking-tight text-primary">Registrar recebimento</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Informe quanto chegou de cada item. É nesta hora que o estoque sobe — não na aprovação.
          </p>
          <ActionForm
            action={receiveFormAction}
            submitLabel="Confirmar recebimento no estoque"
            hiddenFields={{ requestId }}
            idempotencyField="receiptKey"
          >
            {() =>
              pendingItems.map((i) => (
                <div key={i.id}>
                  <input type="hidden" name="itemId" value={i.id} />
                  <TextField
                    name="received"
                    label={`${i.label} (ainda falta: ${i.pending})`}
                    type="number"
                    step="0.001"
                    min="0"
                    defaultValue="0"
                  />
                </div>
              ))
            }
          </ActionForm>
        </div>
      ) : null}
    </section>
  );
}
