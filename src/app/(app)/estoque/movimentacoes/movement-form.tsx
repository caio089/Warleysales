"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { receiveFormAction } from "@/modules/purchases/actions";
import { registerMovementFormAction } from "@/modules/inventory/actions";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import { parseQuantityInput } from "@/shared/lib/quantity-input";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";
import type { StockEntrySource } from "../entry-sources";
import { ProductField } from "./product-field";

type UiMode = "entry" | "consumption" | "adjust";
type LedgerType = "entry" | "consumption" | "adjustment_in" | "adjustment_out";

const UI_MODES: { value: UiMode; label: string; hint: string }[] = [
  { value: "entry", label: "Entrada", hint: "Produto entrando no meu estoque" },
  { value: "consumption", label: "Saída", hint: "Entrega do produto para o órgão" },
  { value: "adjust", label: "Ajuste", hint: "Corrigir saldo para mais ou para menos" },
];

interface MovementFormProps {
  councils: { value: string; label: string }[];
  materials: { value: string; label: string }[];
  entrySources?: StockEntrySource[];
  defaultType?: LedgerType;
  allowAdjust?: boolean;
}

type Line = { key: string; materialId: string };

function newLine(materialId = ""): Line {
  return { key: crypto.randomUUID(), materialId };
}

function uiModeFromType(type: LedgerType): UiMode {
  if (type === "consumption") return "consumption";
  if (type === "adjustment_in" || type === "adjustment_out") return "adjust";
  return "entry";
}

export function MovementForm({
  councils,
  materials,
  entrySources = [],
  defaultType = "entry",
  allowAdjust = false,
}: MovementFormProps) {
  const params = useSearchParams();
  const presetCouncil = params.get("council") ?? "";
  const presetMaterial = params.get("material") ?? "";
  const presetProcess = params.get("process") ?? "";
  const presetType = params.get("type");
  const initialLedger = (presetType && isLedgerType(presetType) ? presetType : defaultType) as LedgerType;
  const [mode, setMode] = useState<UiMode>(uiModeFromType(initialLedger));
  const [adjustDirection, setAdjustDirection] = useState<"adjustment_in" | "adjustment_out">(
    initialLedger === "adjustment_out" ? "adjustment_out" : "adjustment_in",
  );
  const [councilId, setCouncilId] = useState(
    presetCouncil || (councils.length === 1 ? councils[0]!.value : ""),
  );
  const [processId, setProcessId] = useState(presetProcess);
  const [lines, setLines] = useState<Line[]>(() => [
    newLine(presetMaterial || (materials.length === 1 ? materials[0]!.value : "")),
  ]);
  const choices = allowAdjust ? UI_MODES : UI_MODES.filter((choice) => choice.value !== "adjust");
  const ledgerType: LedgerType =
    mode === "entry" ? "entry" : mode === "consumption" ? "consumption" : adjustDirection;

  const processesForCouncil = useMemo(
    () => entrySources.filter((source) => !councilId || source.councilId === councilId),
    [councilId, entrySources],
  );

  const selectedSource = useMemo(() => {
    const match = processesForCouncil.find((source) => source.processId === processId);
    return match ?? processesForCouncil[0] ?? null;
  }, [processId, processesForCouncil]);

  const effectiveProcessId = selectedSource?.processId ?? "";
  const submitLabel =
    mode === "entry"
      ? "Lançar entrada no estoque"
      : mode === "consumption"
        ? "Registrar entrega ao órgão"
        : "Registrar ajuste";

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">O que você quer lançar?</legend>
        <div className={cn("grid gap-2", choices.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          {choices.map((choice) => {
            const selected = mode === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(choice.value)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <span className="block text-sm font-semibold">{choice.label}</span>
                <span className="mt-0.5 block text-xs">{choice.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {mode === "entry" ? (
        <EntryFromProcessForm
          key={selectedSource?.requestId ?? "no-source"}
          councils={councils}
          councilId={councilId}
          onCouncilChange={(value) => {
            setCouncilId(value);
            setProcessId("");
          }}
          processes={processesForCouncil}
          processId={effectiveProcessId}
          onProcessChange={setProcessId}
          source={selectedSource}
          submitLabel={submitLabel}
        />
      ) : (
        <ActionForm action={registerMovementFormAction} submitLabel={submitLabel} idempotencyField="idempotencyKey">
          {(errors) => (
            <div className="space-y-4">
              <input type="hidden" name="type" value={ledgerType} />
              {mode === "adjust" ? (
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-foreground">Direção do ajuste</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        { value: "adjustment_in" as const, label: "Para mais", hint: "Aumenta o saldo" },
                        { value: "adjustment_out" as const, label: "Para menos", hint: "Diminui o saldo" },
                      ] as const
                    ).map((option) => {
                      const selected = adjustDirection === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setAdjustDirection(option.value)}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-left transition-colors",
                            selected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40",
                          )}
                        >
                          <span className="block text-sm font-semibold">{option.label}</span>
                          <span className="mt-0.5 block text-xs">{option.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.type?.[0] ? <p className="mt-1 text-xs text-destructive">{errors.type[0]}</p> : null}
                </fieldset>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  key={`council-${councilId}`}
                  name="councilId"
                  label="Órgão"
                  required
                  options={councils}
                  defaultValue={councilId}
                  errors={errors.councilId}
                />
                <TextField
                  name="reason"
                  label="Motivo"
                  required
                  placeholder={
                    mode === "consumption"
                      ? "Ex.: entrega para o órgão, distribuição"
                      : "Ex.: inventário, correção de saldo"
                  }
                  errors={errors.reason}
                />
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-foreground">
                  {mode === "consumption" ? "Produtos entregues ao órgão" : "Itens do ajuste"}
                </legend>
                {errors.items?.[0] ? <p className="text-xs text-destructive">{errors.items[0]}</p> : null}
                <ul className="space-y-3">
                  {lines.map((line, index) => (
                    <li
                      key={line.key}
                      className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end"
                    >
                      <ProductField
                        options={materials}
                        defaultValue={line.materialId}
                        name={`items.${index}.materialId`}
                        label={lines.length > 1 ? `Produto ${index + 1}` : "Produto"}
                        errors={errors[`items.${index}.materialId`]}
                      />
                      <TextField
                        name={`items.${index}.quantity`}
                        label="Quantidade"
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex.: 10"
                        required
                        hint="Maior que zero"
                        errors={errors[`items.${index}.quantity`] ?? (index === 0 ? errors.quantity : undefined)}
                      />
                      <div className="flex justify-end pb-0.5">
                        <button
                          type="button"
                          aria-label={`Remover item ${index + 1}`}
                          disabled={lines.length <= 1}
                          onClick={() => setLines((current) => current.filter((row) => row.key !== line.key))}
                          className={cn(
                            "inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors",
                            lines.length <= 1
                              ? "cursor-not-allowed opacity-40"
                              : "hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
                          )}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setLines((current) => [...current, newLine()])}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <Plus className="size-4" aria-hidden />
                  Adicionar outro item
                </button>
              </fieldset>
            </div>
          )}
        </ActionForm>
      )}
    </div>
  );
}

function EntryFromProcessForm({
  councils,
  councilId,
  onCouncilChange,
  processes,
  processId,
  onProcessChange,
  source,
  submitLabel,
}: {
  councils: { value: string; label: string }[];
  councilId: string;
  onCouncilChange: (value: string) => void;
  processes: StockEntrySource[];
  processId: string;
  onProcessChange: (value: string) => void;
  source: StockEntrySource | null;
  submitLabel: string;
}) {
  const processOptions = processes.map((row) => ({ value: row.processId, label: row.label }));
  const [receivedDrafts, setReceivedDrafts] = useState<Record<string, string>>({});
  const receivedQuantity = (item: StockEntrySource["items"][number]) =>
    parseQuantityInput(receivedDrafts[item.itemId] ?? String(item.pending));
  const totalValue = source?.items.reduce((sum, item) => {
    const quantity = receivedQuantity(item);
    return sum + (item.unitPrice != null && Number.isFinite(quantity) ? quantity * item.unitPrice : 0);
  }, 0) ?? 0;
  const hasInvalidQuantity = source?.items.some((item) => !Number.isFinite(receivedQuantity(item))) ?? false;
  const hasPrices = source?.items.some((item) => item.unitPrice != null) ?? false;

  if (processes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
        <div className="mb-3 max-w-sm">
          <SelectField
            name="councilIdPreview"
            label="Órgão"
            required
            options={councils}
            defaultValue={councilId}
            onChange={onCouncilChange}
          />
        </div>
        Nenhum processo deste órgão está pronto para entrada no estoque. Aprove a solicitação e registre o contrato (vinculado à ata, no registro de preços) para liberar os itens aqui.
      </div>
    );
  }

  return (
    <ActionForm
      key={source?.requestId ?? "empty"}
      action={receiveFormAction}
      submitLabel={submitLabel}
      idempotencyField="receiptKey"
      hiddenFields={source ? { requestId: source.requestId } : undefined}
    >
      {(errors) => (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium text-foreground">
                Órgão <span className="text-destructive">*</span>
              </span>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={councilId}
                onChange={(event) => onCouncilChange(event.target.value)}
                required
              >
                <option value="">Selecione…</option>
                {councils.map((council) => (
                  <option key={council.value} value={council.value}>
                    {council.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5 text-sm">
              <span className="font-medium text-foreground">
                Processo <span className="text-destructive">*</span>
              </span>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={processId}
                onChange={(event) => onProcessChange(event.target.value)}
                required
              >
                {processOptions.map((process) => (
                  <option key={process.value} value={process.value}>
                    {process.label}
                  </option>
                ))}
              </select>
              {errors.requestId?.[0] ? <p className="text-xs text-destructive">{errors.requestId[0]}</p> : null}
            </label>
          </div>

          {source ? (
            <>
              <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
                <p className="font-medium text-foreground">Entrada no meu estoque — já montada pelo processo</p>
                <p className="mt-1 text-muted-foreground">
                  Itens, quantidades e valores vêm da solicitação. Confira e lance a entrada no estoque.
                </p>
                {source.estimatedValue != null ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Valor de referência do processo:{" "}
                    <span className="font-semibold text-foreground">{formatCurrency(source.estimatedValue)}</span>
                  </p>
                ) : null}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border/70">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <caption className="sr-only">Itens puxados do processo para entrada</caption>
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Produto</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Pedido</th>
                      <th className="px-3 py-2.5 text-right font-semibold">A receber</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Unitário</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {source.items.map((item) => (
                      <tr key={item.itemId}>
                        <td className="px-3 py-3 font-medium text-foreground">
                          {item.materialLabel}
                          <input type="hidden" name="itemId" value={item.itemId} />
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                          {formatNumber(item.ordered)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            name="received"
                            type="text"
                            inputMode="decimal"
                            required
                            value={receivedDrafts[item.itemId] ?? String(item.pending)}
                            onChange={(event) => setReceivedDrafts((current) => ({ ...current, [item.itemId]: event.target.value }))}
                            className="h-9 w-24 rounded-md border border-input bg-background px-2 text-right text-sm tabular-nums"
                            aria-label={`Quantidade a receber de ${item.materialLabel}`}
                          />
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                          {item.unitPrice != null ? formatCurrency(item.unitPrice) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-medium">
                          {item.unitPrice != null && Number.isFinite(receivedQuantity(item))
                            ? formatCurrency(receivedQuantity(item) * item.unitPrice)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {hasPrices ? (
                    <tfoot>
                      <tr className="bg-muted/40">
                        <td colSpan={4} className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                           Total desta entrada
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums">
                           {hasInvalidQuantity ? "—" : formatCurrency(totalValue)}
                        </td>
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}
    </ActionForm>
  );
}

function isLedgerType(value: string): value is LedgerType {
  return (
    value === "entry" ||
    value === "consumption" ||
    value === "adjustment_in" ||
    value === "adjustment_out"
  );
}
