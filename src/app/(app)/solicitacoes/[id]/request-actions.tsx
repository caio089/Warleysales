"use client";

import { useState } from "react";
import { receiveFormAction, requestStepFormAction } from "@/modules/purchases/actions";
import { nextStates } from "@/shared/lib/state-machine";
import { REQUEST_TRANSITIONS, type PurchaseRequestStatus } from "@/modules/purchases/domain/request-status";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextAreaField, TextField } from "@/shared/ui/forms/fields";

interface Props {
  requestId: string;
  status: PurchaseRequestStatus;
  canDecide: boolean;
  canCreate: boolean;
  canReceive: boolean;
  pendingItems: { id: string; label: string; pending: number }[];
  receiptContracts?: { value: string; label: string; items: { id: string; pending: number }[] }[];
  /** Após aprovar, leva direto à documentação do processo. */
  /** Modo resumido: só aprovar / não. */
  summaryOnly?: boolean;
}

type Panel = "decline" | "cancel" | null;

/** Decisão só com aprovar ou não. Motivo obrigatório na recusa e no cancelamento. */
export function RequestActions({
  requestId,
  status,
  canDecide,
  canCreate,
  canReceive,
  pendingItems,
  receiptContracts = [],
  summaryOnly = false,
}: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const [receiptContractId, setReceiptContractId] = useState("");
  const onlyReceiptContract = receiptContracts.length === 1 ? receiptContracts[0] : undefined;
  const receiptContract = onlyReceiptContract ?? receiptContracts.find((contract) => contract.value === receiptContractId);
  const receiptLines = new Map(receiptContract?.items.map((line) => [line.id, line]));
  const next = nextStates(REQUEST_TRANSITIONS, status);
  const pendingDecision = canDecide && (status === "enviada" || status === "em_analise");
  const canApprove = pendingDecision;
  const canSubmit = canCreate && next.includes("enviada");
  const canResubmit = status === "aguardando_correcao" && canCreate;
  const canReopen = status === "rejeitada" && canDecide;
  const canCancel = (canCreate || canDecide) && next.includes("cancelada");
  const receiving =
    !summaryOnly &&
    canReceive &&
    ["aprovada", "em_atendimento", "parcialmente_atendida"].includes(status) &&
    receiptContracts.length > 0;

  const deciding = canApprove;

  return (
    <section aria-labelledby="acoes" className="space-y-4">
      <h2 id="acoes" className="text-base font-semibold">
        {deciding ? "Pode seguir com esta compra?" : "Próxima ação"}
      </h2>

      {deciding && panel === null ? (
        <div className="space-y-3">
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
            <Button type="button" variant="outline" className="h-11" onClick={() => setPanel("decline")}>
              Não
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ao aprovar, libera a documentação do processo e o andamento no estoque.
          </p>
        </div>
      ) : null}

      {deciding && panel === "decline" ? (
        <div className="max-w-lg space-y-3 rounded-2xl border border-border/80 bg-secondary/40 p-4">
          <p className="text-sm text-muted-foreground">
            A compra para aqui. Quem pediu vê o motivo no histórico.
          </p>
          <ActionForm
            action={requestStepFormAction}
            submitLabel="Recusar a compra"
            pendingLabel="Enviando…"
            submitVariant="destructive"
            hiddenFields={{ requestId, step: "reject" }}
          >
            {(errors) => (
              <TextAreaField name="note" label="Motivo" required errors={errors.note} />
            )}
          </ActionForm>
          <button type="button" className="text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setPanel(null)}>
            Voltar para aprovar
          </button>
        </div>
      ) : null}

      {panel === "cancel" ? (
        <div className="max-w-lg space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-muted-foreground">
            A solicitação será encerrada. Informe o motivo — ele fica registrado no histórico.
          </p>
          <ActionForm
            action={requestStepFormAction}
            submitLabel="Confirmar cancelamento"
            pendingLabel="Cancelando…"
            submitVariant="destructive"
            hiddenFields={{ requestId, step: "cancel" }}
          >
            {(errors) => (
              <TextAreaField
                name="note"
                label="Motivo do cancelamento"
                required
                errors={errors.note}
              />
            )}
          </ActionForm>
          <button type="button" className="text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setPanel(null)}>
            Voltar
          </button>
        </div>
      ) : null}

      {!summaryOnly && !deciding && panel === null && canSubmit ? (
        <ActionForm action={requestStepFormAction} submitLabel="Enviar para aprovação" pendingLabel="Enviando…" submitClassName="h-11 px-6" hiddenFields={{ requestId, step: "submit" }}>
          {() => null}
        </ActionForm>
      ) : null}

      {!summaryOnly && canResubmit && panel === null ? (
        <ActionForm action={requestStepFormAction} submitLabel="Reenviar corrigida" pendingLabel="Reenviando…" submitClassName="h-11 px-6" hiddenFields={{ requestId, step: "resubmitAfterCorrection" }}>
          {() => null}
        </ActionForm>
      ) : null}

      {receiving && panel === null ? (
        <div className="surface-card w-full max-w-3xl p-4 sm:p-6">
          <h3 className="mb-1 font-heading text-lg font-semibold tracking-tight text-primary">Registrar recebimento</h3>
          <p className="mb-4 text-sm text-muted-foreground">Confira as quantidades e ajuste os itens entregues parcialmente.</p>
          <ActionForm action={receiveFormAction} submitLabel="Lançar no estoque" pendingLabel="Lançando…" hiddenFields={{ requestId, ...(onlyReceiptContract ? { contractId: onlyReceiptContract.value } : {}) }} idempotencyField="receiptKey" onSuccess={() => setReceiptContractId("")}>
            {(errors) => <>
              {onlyReceiptContract ? (
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <p className="text-muted-foreground">Contrato deste recebimento</p>
                  <p className="font-medium">{onlyReceiptContract.label}</p>
                  {errors.contractId ? <p role="alert" className="text-destructive">{errors.contractId.join(" ")}</p> : null}
                </div>
              ) : <SelectField name="contractId" label="Contrato deste recebimento" required onChange={setReceiptContractId} options={receiptContracts} errors={errors.contractId} />}
              {receiptContract ? <div className="grid gap-3 sm:grid-cols-2">
                {pendingItems.map((item) => {
                  const line = receiptLines.get(item.id);
                  if (!line) return null;
                  return (
                    <div key={`${receiptContract.value}:${item.id}`}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <TextField name="received" label={item.label} type="number" step="0.001" min="0" defaultValue={String(line.pending)} />
                    </div>
                  );
                })}
              </div> : null}
            </>}
          </ActionForm>
        </div>
      ) : null}

      {!summaryOnly && canReopen && panel === null ? (
        <ActionForm action={requestStepFormAction} submitLabel="Reabrir" submitVariant="outline" hiddenFields={{ requestId, step: "reopen" }}>
          {(errors) => <TextField name="note" label="Por que reabrir" required errors={errors.note} />}
        </ActionForm>
      ) : null}

      {canCancel && panel === null && !deciding ? (
        <Button type="button" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setPanel("cancel")}>
          Cancelar solicitação
        </Button>
      ) : null}
    </section>
  );
}
