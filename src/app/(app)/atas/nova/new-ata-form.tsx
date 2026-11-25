"use client";

import { useState } from "react";
import { createAtaFormAction } from "@/modules/atas/actions";
import { formatCurrency } from "@/shared/lib/format";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { CurrencyField, SelectField, TextField } from "@/shared/ui/forms/fields";
import { AtaValidityField } from "./ata-validity-field";

type Option = { value: string; label: string };
type ProcessOption = Option & { councilId: string };
type SupplierOption = { value: string; label: string; cnpj: string | null };
type RequestMaterial = { materialId: string; name: string; quantity: number };

export function NewAtaForm({
  councils,
  materials,
  processes,
  defaultProcessId = "",
  lockedProcess,
}: {
  councils: Option[];
  materials: Option[];
  processes: ProcessOption[];
  defaultProcessId?: string;
  /** Dentro do processo: materiais já vêm da solicitação; só falta empresa, vigência e valor. */
  lockedProcess?: {
    councilId: string;
    councilLabel: string;
    processId: string;
    processLabel: string;
    processNumber: string;
    materials: RequestMaterial[];
    suppliers: SupplierOption[];
    defaultValue?: number | null;
    validityStartDate?: string | null;
  };
}) {
  const initial = processes.find((process) => process.value === defaultProcessId);
  const [councilId, setCouncilId] = useState(lockedProcess?.councilId ?? initial?.councilId ?? "");
  const visibleProcesses = processes.filter((process) => !councilId || process.councilId === councilId);

  if (lockedProcess) {
    const processMaterials = lockedProcess.materials ?? [];
    const lines =
      processMaterials.length > 0
        ? processMaterials
        : [{ materialId: "", name: lockedProcess.processLabel, quantity: 1 }];
    const suggestedNumber = `ARP ${lockedProcess.processNumber || "sem-número"}`.slice(0, 40);

    return (
      <ActionForm
        action={createAtaFormAction}
        submitLabel="Registrar ata"
        hiddenFields={{
          councilId: lockedProcess.councilId,
          processId: lockedProcess.processId,
          processNumber: lockedProcess.processNumber,
          number: suggestedNumber,
          itemCount: String(lines.length),
          returnTo: `/processos/${lockedProcess.processId}`,
          ...Object.fromEntries(
            lines.flatMap((line, index) => [
              [`items.${index}.description`, line.name],
              [`items.${index}.materialId`, line.materialId],
              [`items.${index}.registeredQuantity`, String(line.quantity)],
            ]),
          ),
        }}
      >
        {(e) => (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/15 px-3.5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Materiais do processo
              </p>
              <ul className="mt-2 space-y-1.5">
                {lines.map((line) => (
                  <li key={`${line.materialId}-${line.name}`} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-foreground">{line.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      qtd {line.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Órgão {lockedProcess.councilLabel} · {lockedProcess.processLabel}
              </p>
            </div>

            <SelectField
              name="supplierId"
              label="Empresa vencedora"
              required
              options={lockedProcess.suppliers.map((supplier) => ({
                value: supplier.value,
                label: supplier.cnpj ? `${supplier.label} · ${supplier.cnpj}` : supplier.label,
              }))}
              placeholder="Selecione a empresa"
              errors={e.supplierId}
            />

            <AtaValidityField
              errors={e.startDate}
              defaultStartDate={lockedProcess.validityStartDate ?? undefined}
              hint={
                lockedProcess.validityStartDate
                  ? "Puxada do Termo de Referência. Ajuste só se necessário."
                  : "Se ainda não preencheu no TR, informe aqui. Depois salve também no TR para reutilizar."
              }
            />

            <CurrencyField
              name="totalValue"
              label="Valor da ata (R$)"
              required
              defaultValue={lockedProcess.defaultValue ?? undefined}
              hint={
                lockedProcess.defaultValue != null
                  ? `Sugestão do processo/PP: ${formatCurrency(lockedProcess.defaultValue)}`
                  : "Informe o valor registrado na ata."
              }
              errors={e.totalValue ?? e["items.0.unitPrice"]}
            />
          </div>
        )}
      </ActionForm>
    );
  }

  return (
    <ActionForm action={createAtaFormAction} submitLabel="Criar ata">
      {(e) => (
        <>
          <SelectField
            name="councilId"
            label="Órgão gerenciador"
            required
            options={councils}
            defaultValue={councilId}
            errors={e.councilId}
            onChange={setCouncilId}
          />
          <SelectField
            key={`${councilId || "todos"}-${defaultProcessId}`}
            name="processId"
            label="Processo"
            options={visibleProcesses}
            optional
            placeholder="Sem processo"
            defaultValue={
              visibleProcesses.some((process) => process.value === defaultProcessId)
                ? defaultProcessId
                : ""
            }
            hint="A ata fica ligada a este processo. O contrato do mesmo processo aparece aqui."
            errors={e.processId}
          />
          <TextField name="number" label="Número da ata" required errors={e.number} />
          <AtaValidityField errors={e.startDate} />
          <TextField
            name="description"
            label="Descrição do item"
            required
            errors={e["items.0.description"]}
          />
          <SelectField
            name="materialId"
            label="Material (opcional)"
            options={materials}
            optional
            placeholder="Sem material"
            errors={e["items.0.materialId"]}
          />
          <TextField
            name="registeredQuantity"
            label="Quantidade registrada"
            type="number"
            step="0.001"
            min="0"
            required
            errors={e["items.0.registeredQuantity"]}
          />
          <CurrencyField
            name="unitPrice"
            label="Preço unitário (R$)"
            required
            errors={e["items.0.unitPrice"]}
          />
        </>
      )}
    </ActionForm>
  );
}
