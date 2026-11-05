"use client";

import { useState } from "react";
import { receiveFormAction, requestStepFormAction } from "@/modules/purchases/actions";
import { nextStates } from "@/shared/lib/state-machine";
import { REQUEST_TRANSITIONS, type PurchaseRequestStatus } from "@/modules/purchases/domain/request-status";
import { Button } from "@/components/ui/button";
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

type DeclinePath = "fix" | "reject";

/** Uma ação principal por vez. Motivo só aparece se a compra não for aprovada. */
export function RequestActions({ requestId, status, canDecide, canCreate, canReceive, pendingItems }: Props) {
  const [decline, setDecline] = useState<DeclinePath | null>(null);
  const next = nextStates(REQUEST_TRANSITIONS, status);
  const canApprove = canDecide && next.includes("aprovada");
  const canFix = canDecide && next.includes("aguardando_correcao");
  const canReject = canDecide && next.includes("rejeitada");
  const canSubmit = canCreate && next.includes("enviada");
  const canStartReview = canDecide && next.includes("em_analise") && status !== "aguardando_correcao";
  const canResubmit = status === "aguardando_correcao" && canCreate;
  const canReopen = status === "rejeitada" && canDecide;
  const canCancel = (canCreate || canDecide) && next.includes("cancelada");
  const receiving =
    canReceive && ["aprovada", "em_atendimento", "parcialmente_atendida"].includes(status) && pendingItems.length > 0;

  const deciding = canApprove && (canFix || canReject);

  return (
    <section aria-labelledby="acoes" className="space-y-4">
      <h2 id="acoes" className="text-base font-semibold">
        {deciding ? "Pode seguir com esta compra?" : "Próxima ação"}
      </h2>

      {deciding && decline === null ? (
        <div className="flex flex-wrap items-center gap-3">
          <ActionForm
            action={requestStepFormAction}
            submitLabel="Sim, aprovar"
            pendingLabel="Aprovando…"
            submitClassName="h-11 px-6"
            hiddenFields={{ requestId, step: "approve" }}
          >
            {() => null}
          </ActionForm>
          <Button type="button" variant="outline" className="h-11" onClick={() => setDecline(canFix ? "fix" : "reject")}>
            Não
          </Button>
        </div>
      ) : null}

      {deciding && decline !== null ? (
        <div className="max-w-lg space-y-3 rounded-2xl border border-border/80 bg-secondary/40 p-4">
          <p className="text-sm text-muted-foreground">
            {decline === "fix"
              ? "A solicitação volta para quem pediu, com o seu recado."
              : "A compra para aqui. Quem pediu vê o motivo no histórico."}
          </p>
          <div className="flex gap-2">
            {canFix ? (
              <Button type="button" variant={decline === "fix" ? "default" : "outline"} size="sm" onClick={() => setDecline("fix")}>
                Pedir ajuste
              </Button>
            ) : null}
            {canReject ? (
              <Button type="button" variant={decline === "reject" ? "destructive" : "outline"} size="sm" onClick={() => setDecline("reject")}>
                Recusar
              </Button>
            ) : null}
          </div>
          <ActionForm
            action={requestStepFormAction}
            submitLabel={decline === "fix" ? "Enviar para ajuste" : "Recusar a compra"}
            pendingLabel="Enviando…"
            submitVariant={decline === "reject" ? "destructive" : "default"}
            hiddenFields={{ requestId, step: decline === "fix" ? "requestCorrection" : "reject" }}
          >
            {(errors) => (
              <TextField name="note" label="Motivo" required placeholder="Uma frase basta" errors={errors.note} />
            )}
          </ActionForm>
          <button type="button" className="text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setDecline(null)}>
            Voltar para aprovar
          </button>
        </div>
      ) : null}

      {!deciding && canSubmit ? (
        <ActionForm action={requestStepFormAction} submitLabel="Enviar para análise" pendingLabel="Enviando…" submitClassName="h-11 px-6" hiddenFields={{ requestId, step: "submit" }}>
          {() => null}
        </ActionForm>
      ) : null}

      {!deciding && canStartReview ? (
        <ActionForm action={requestStepFormAction} submitLabel="Abrir para decidir" pendingLabel="Abrindo…" submitClassName="h-11 px-6" hiddenFields={{ requestId, step: "startReview" }}>
          {() => null}
        </ActionForm>
      ) : null}

      {canResubmit ? (
        <ActionForm action={requestStepFormAction} submitLabel="Reenviar corrigida" pendingLabel="Reenviando…" submitClassName="h-11 px-6" hiddenFields={{ requestId, step: "resubmitAfterCorrection" }}>
          {() => null}
        </ActionForm>
      ) : null}

      {receiving ? (
        <div className="surface-card max-w-md p-6">
          <h3 className="mb-1 font-heading text-lg font-medium tracking-tight text-primary">O que chegou?</h3>
          <p className="mb-4 text-sm text-muted-foreground">O número já vem preenchido com tudo. Diminua só se chegou menos.</p>
          <ActionForm action={receiveFormAction} submitLabel="Lançar no estoque" pendingLabel="Lançando…" hiddenFields={{ requestId }} idempotencyField="receiptKey">
            {() =>
              pendingItems.map((item) => (
                <div key={item.id}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <TextField name="received" label={item.label} type="number" step="0.001" min="0" defaultValue={String(item.pending)} />
                </div>
              ))
            }
          </ActionForm>
        </div>
      ) : null}

      {canReopen ? (
        <ActionForm action={requestStepFormAction} submitLabel="Reabrir" submitVariant="outline" hiddenFields={{ requestId, step: "reopen" }}>
          {(errors) => <TextField name="note" label="Por que reabrir" required errors={errors.note} />}
        </ActionForm>
      ) : null}

      {canCancel && !deciding ? (
        <ActionForm action={requestStepFormAction} submitLabel="Cancelar solicitação" submitVariant="outline" hiddenFields={{ requestId, step: "cancel" }}>
          {() => null}
        </ActionForm>
      ) : null}
    </section>
  );
}
