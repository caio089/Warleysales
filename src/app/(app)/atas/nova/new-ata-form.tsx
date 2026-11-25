"use client";

import { useState } from "react";
import { createAtaFormAction } from "@/modules/atas/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { CurrencyField, SelectField, TextField } from "@/shared/ui/forms/fields";
import { AtaMaterialsValues } from "./ata-materials-values";
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
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">1. Empresa vencedora</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Digite o nome da empresa. Se já existir, reutilizamos; se não, cadastramos.
                </p>
              </div>
              <TextField
                name="supplierName"
                label="Nome da empresa"
                required
                placeholder="Ex.: Fornecedor Alfa Ltda"
                errors={e.supplierName ?? e.supplierId}
              />
              {lockedProcess.suppliers.length > 0 ? (
                <SelectField
                  name="supplierId"
                  label="Ou escolha uma já cadastrada (opcional)"
                  optional
                  options={lockedProcess.suppliers.map((supplier) => ({
                    value: supplier.value,
                    label: supplier.cnpj ? `${supplier.label} · ${supplier.cnpj}` : supplier.label,
                  }))}
                  placeholder="Deixe em branco se digitou o nome acima"
                  errors={e.supplierId}
                />
              ) : null}
            </div>

            <AtaMaterialsValues
              lines={lines}
              councilLabel={lockedProcess.councilLabel}
              processLabel={lockedProcess.processLabel}
              defaultTotal={lockedProcess.defaultValue}
              errors={e}
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
