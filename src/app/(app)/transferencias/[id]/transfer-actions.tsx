"use client";

import { advanceTransferFormAction } from "@/modules/transfers/actions";
import { TRANSFER_TRANSITIONS, type TransferStatus } from "@/modules/transfers/domain/transfer";
import { nextStates } from "@/shared/lib/state-machine";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { TextField } from "@/shared/ui/forms/fields";

interface Props {
  transferId: string;
  status: TransferStatus;
  permissions: { originDecide: boolean; originMove: boolean; destinationMove: boolean; destinationDecide: boolean };
  items: { materialId: string; label: string; quantity: number }[];
}

const LABELS: Partial<Record<TransferStatus, string>> = { em_analise: "Iniciar análise", aprovada: "Aprovar (reserva)", separada: "Marcar como separada", em_transito: "Confirmar saída", rejeitada: "Rejeitar", cancelada: "Cancelar" };

/** Ações = transições válidas ∩ permissões por conselho (origem decide/despacha; destino recebe). */
export function TransferActions({ transferId, status, permissions: p, items }: Props) {
  const allowedTo: Partial<Record<TransferStatus, boolean>> = {
    em_analise: p.originDecide, aprovada: p.originDecide, rejeitada: p.originDecide,
    separada: p.originMove, em_transito: p.originMove, cancelada: p.originDecide || p.destinationDecide, recebida: p.destinationMove,
  };
  const available = nextStates(TRANSFER_TRANSITIONS, status).filter((to) => allowedTo[to]);
  if (available.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma ação disponível para você neste status.</p>;

  return (
    <section aria-labelledby="acoes" className="space-y-4">
      <h2 id="acoes" className="text-base font-semibold">Ações</h2>
      <div className="flex flex-wrap gap-3">
        {available.filter((to) => to !== "recebida").map((to) => (
          <ActionForm key={to} action={advanceTransferFormAction} submitLabel={LABELS[to] ?? to} submitVariant={to === "rejeitada" || to === "cancelada" ? "destructive" : "default"} hiddenFields={{ transferId, to }}>{() => null}</ActionForm>
        ))}
      </div>
      {available.includes("recebida") ? (
        <div className="max-w-md rounded-lg border p-4">
          <h3 className="mb-3 text-sm font-semibold">Registrar recebimento</h3>
          <ActionForm action={advanceTransferFormAction} submitLabel="Confirmar recebimento" hiddenFields={{ transferId, to: "recebida" }}>
            {() => items.map((i) => (
              <div key={i.materialId}>
                <input type="hidden" name="receivedMaterialId" value={i.materialId} />
                <TextField name="receivedQuantity" label={`${i.label} (enviado: ${i.quantity})`} type="number" step="0.001" min="0" defaultValue={String(i.quantity)} hint="Diferenças são registradas como divergência." />
              </div>
            ))}
          </ActionForm>
        </div>
      ) : null}
    </section>
  );
}
