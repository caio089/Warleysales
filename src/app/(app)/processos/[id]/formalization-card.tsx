"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculateSavings,
  type InstrumentType,
  type ProcessFormalization,
} from "@/modules/formalizations/domain/formalization";
import {
  homologateFormalizationAction,
  rejectFormalizationAction,
  submitFormalizationFormAction,
} from "@/modules/formalizations/actions";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { FormField, SelectControl, TextareaControl } from "@/shared/ui/form-field";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";
import { StatusBadge } from "@/shared/ui/status-badge";
import { toast } from "@/shared/ui/toast-store";

export interface FormalizationSupplier {
  id: string;
  name: string;
  cnpj: string | null;
  active?: boolean;
}

export interface FormalizationCardProps {
  processId: string;
  councilId: string;
  documentalComplete: boolean;
  formalization: ProcessFormalization | null;
  suppliers: FormalizationSupplier[];
  isWarley: boolean;
  defaultEstimatedValue?: number | null;
  requestId?: string | null;
}

const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  ata: "Ata de Registro de Preços",
  contrato: "Contrato Administrativo",
  empenho: "Nota de Empenho",
};

const INSTRUMENT_OPTIONS: { value: InstrumentType; label: string }[] = [
  { value: "ata", label: "Ata de Registro de Preços" },
  { value: "contrato", label: "Contrato Administrativo" },
  { value: "empenho", label: "Nota de Empenho" },
];

function parseMoneyInput(val: string): number {
  if (!val) return 0;
  const str = val.replace(/R\$\s?/gi, "").trim();
  if (!str) return 0;
  if (str.includes(",") && str.includes(".")) {
    return Number(str.replace(/\./g, "").replace(",", ".")) || 0;
  }
  return Number(str.replace(",", ".")) || 0;
}

export function FormalizationCard({
  processId,
  councilId,
  documentalComplete,
  formalization,
  suppliers,
  isWarley,
  defaultEstimatedValue,
  requestId,
}: FormalizationCardProps) {
  const [estimatedInput, setEstimatedInput] = useState<string>(
    defaultEstimatedValue != null && defaultEstimatedValue > 0
      ? String(defaultEstimatedValue)
      : "",
  );
  const [contractedInput, setContractedInput] = useState<string>("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const supplierOptions = useMemo(
    () =>
      suppliers.map((s) => ({
        value: s.id,
        label: s.cnpj ? `${s.name} (${s.cnpj})` : s.name,
      })),
    [suppliers],
  );

  const currentSupplier = useMemo(
    () => suppliers.find((s) => s.id === formalization?.supplierId),
    [suppliers, formalization?.supplierId],
  );

  const supplierName = currentSupplier?.name ?? formalization?.supplierId ?? "—";
  const supplierCnpj = currentSupplier?.cnpj ? `CNPJ: ${currentSupplier.cnpj}` : null;

  // Cálculo de economia em tempo real para o formulário
  const estimatedNum = parseMoneyInput(estimatedInput);
  const contractedNum = parseMoneyInput(contractedInput);

  const { savingsValue, savingsPercent } = useMemo(() => {
    if (estimatedNum > 0 && contractedNum >= 0) {
      return calculateSavings(estimatedNum, contractedNum);
    }
    return { savingsValue: 0, savingsPercent: 0 };
  }, [estimatedNum, contractedNum]);

  // 1. Estado de Espera: Documentos incompletos (<100%)
  if (!documentalComplete && !formalization) {
    return (
      <section aria-labelledby="formalizacao-heading" className="surface-card mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2
              id="formalizacao-heading"
              className="font-heading text-lg font-medium tracking-tight text-primary"
            >
              Formalização da Contratação
            </h2>
            <p className="text-sm text-muted-foreground">
              Registro do instrumento contratual e cálculo de economia obtida.
            </p>
          </div>
          <StatusBadge label="Aguardando Documentação" tone="neutral" />
        </div>
        <div className="rounded-xl border border-dashed border-border/80 bg-secondary/30 p-4">
          <p className="text-sm font-medium text-foreground">
            Complete os 7 documentos obrigatórios para formalizar a contratação.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            O formulário de formalização e a apuração de economia em tempo real serão desbloqueados
            assim que todos os 7 documentos obrigatórios forem anexados e validados no processo.
          </p>
        </div>
      </section>
    );
  }

  // 2. Estado Homologado: Exibe resumo consolidado
  if (formalization && formalization.status === "homologado") {
    return (
      <section aria-labelledby="formalizacao-heading" className="surface-card mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2
              id="formalizacao-heading"
              className="font-heading text-lg font-medium tracking-tight text-primary"
            >
              Formalização da Contratação
            </h2>
            <p className="text-sm text-muted-foreground">
              Contratação finalizada e homologada pela Central do Warley.
            </p>
          </div>
          <StatusBadge label="Homologado por Warley" tone="success" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-xs text-muted-foreground">Fornecedor Contratado</p>
            <p className="mt-1 font-semibold text-foreground">{supplierName}</p>
            {supplierCnpj ? <p className="text-xs text-muted-foreground">{supplierCnpj}</p> : null}
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-xs text-muted-foreground">Instrumento Formal</p>
            <p className="mt-1 font-semibold text-foreground">
              {INSTRUMENT_LABELS[formalization.instrumentType]}
            </p>
            <p className="text-xs text-muted-foreground">nº {formalization.instrumentNumber}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-xs text-muted-foreground">Valor Estimado vs Contratado</p>
            <p className="mt-1 text-xs text-muted-foreground line-through">
              Ref.: {formatCurrency(formalization.estimatedValue)}
            </p>
            <p className="font-semibold text-foreground">
              Final: {formatCurrency(formalization.contractedValue)}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 dark:border-emerald-500/20">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Economia Obtida
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(formalization.savingsValue)}
            </p>
            <span className="inline-flex items-center rounded-full bg-emerald-600/20 px-2 py-0.5 text-[0.7rem] font-bold text-emerald-800 dark:text-emerald-300">
              +{formatPercent(formalization.savingsPercent)} de economia
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <div>
            {formalization.homologatedAt ? (
              <span>Homologado em {formatDateTimeFortaleza(formalization.homologatedAt)}</span>
            ) : null}
            {formalization.homologationNote ? (
              <span className="ml-2 font-medium text-foreground">
                · Despacho de Warley: “{formalization.homologationNote}”
              </span>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500" />
            Estoque liberado para pronto uso (saldo físico)
          </span>
        </div>
      </section>
    );
  }

  // 3. Estado Rejeitada: Exibe motivo da recusa por Warley
  if (formalization && formalization.status === "rejeitada") {
    return (
      <section aria-labelledby="formalizacao-heading" className="surface-card mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2
              id="formalizacao-heading"
              className="font-heading text-lg font-medium tracking-tight text-primary"
            >
              Formalização da Contratação
            </h2>
            <p className="text-sm text-muted-foreground">
              A formalização submetida foi analisada e recusada por Warley.
            </p>
          </div>
          <StatusBadge label="Rejeitada por Warley" tone="danger" />
        </div>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
            Motivo da Recusa
          </p>
          <p className="text-sm font-medium text-foreground">
            {formalization.homologationNote || "Sem justificativa detalhada registrada."}
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground border-t border-destructive/20">
            <span>Fornecedor: {supplierName}</span>
            <span>
              Instrumento: {INSTRUMENT_LABELS[formalization.instrumentType]} nº{" "}
              {formalization.instrumentNumber}
            </span>
            {formalization.homologatedAt ? (
              <span>Recusado em: {formatDateTimeFortaleza(formalization.homologatedAt)}</span>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  // 4. Estado Aguardando Homologação de Warley
  if (formalization && formalization.status === "aguardando_homologacao") {
    return (
      <section aria-labelledby="formalizacao-heading" className="surface-card mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2
              id="formalizacao-heading"
              className="font-heading text-lg font-medium tracking-tight text-primary"
            >
              Formalização da Contratação
            </h2>
            <p className="text-sm text-muted-foreground">
              Formalização enviada aos autos e aguardando veredito da Central do Warley.
            </p>
          </div>
          <StatusBadge label="Aguardando Homologação do Warley" tone="warning" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-xs text-muted-foreground">Fornecedor</p>
            <p className="mt-1 font-semibold text-foreground">{supplierName}</p>
            {supplierCnpj ? <p className="text-xs text-muted-foreground">{supplierCnpj}</p> : null}
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-xs text-muted-foreground">Instrumento</p>
            <p className="mt-1 font-semibold text-foreground">
              {INSTRUMENT_LABELS[formalization.instrumentType]}
            </p>
            <p className="text-xs text-muted-foreground">nº {formalization.instrumentNumber}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-xs text-muted-foreground">Valores</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Estimado: {formatCurrency(formalization.estimatedValue)}
            </p>
            <p className="font-semibold text-foreground">
              Contratado: {formatCurrency(formalization.contractedValue)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-xs text-muted-foreground">Economia Apurada</p>
            <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(formalization.savingsValue)}
            </p>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.7rem] font-bold text-emerald-700 dark:text-emerald-400">
              +{formatPercent(formalization.savingsPercent)}
            </span>
          </div>
        </div>

        {isWarley ? (
          <div className="mt-6 pt-5 border-t border-border/70">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-primary">Decisão do Warley</h3>
              <p className="text-xs text-muted-foreground">
                Como Administrador Central, homologue a contratação para converter o estoque
                bloqueado em saldo físico disponível ou recuse com justificativa.
              </p>
            </div>

            {!showRejectForm ? (
              <div className="flex flex-wrap items-center gap-3">
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="default" className="gap-2">
                      Homologar e Liberar Estoque
                    </Button>
                  }
                  title="Homologar Formalização e Liberar Estoque?"
                  description="Ao homologar a formalização, o veredito favorável de Warley será registrado e o saldo de estoque bloqueado deste processo será convertido imediatamente em saldo físico disponível (Pronto para Uso) no conselho. Esta ação é definitiva."
                  confirmLabel="Homologar e Liberar Estoque"
                  onConfirm={async () => {
                    const body = new FormData();
                    body.set("processId", processId);
                    const state = await homologateFormalizationAction({ status: "idle" }, body);
                    if (state.status === "error") {
                      toast.error(state.message);
                    } else if (state.status === "success") {
                      toast.success(state.message);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setShowRejectForm(true)}
                >
                  Recusar com Justificativa
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-destructive">
                    Recusa com Justificativa Obrigatória
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRejectForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Apresente o motivo formal da recusa. O processo permanecerá com status de
                  formalização rejeitada e o estoque bloqueado não será liberado.
                </p>
                <ActionForm
                  action={rejectFormalizationAction}
                  submitLabel="Confirmar Recusa"
                  pendingLabel="Recusando…"
                  submitVariant="destructive"
                  hiddenFields={{ processId }}
                >
                  {(errors) => (
                    <FormField
                      label="Motivo da Recusa"
                      required
                      errors={errors.note}
                    >
                      {(p) => (
                        <TextareaControl
                          {...p}
                          name="note"
                          required
                          placeholder="Ex.: Valor da proposta final acima do valor de mercado; especificações divergentes..."
                        />
                      )}
                    </FormField>
                  )}
                </ActionForm>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
            <p className="font-medium text-warning-foreground">
              Aguardando Homologação de Warley
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              A formalização foi cadastrada. Somente a Central de Warley (Administrador Central)
              possui autorização para homologar a contratação e liberar o estoque físico no sistema.
            </p>
          </div>
        )}
      </section>
    );
  }

  // 5. Estado Formulário: Documentação 100% e formalização ainda não cadastrada
  return (
    <section aria-labelledby="formalizacao-heading" className="surface-card mb-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2
            id="formalizacao-heading"
            className="font-heading text-lg font-medium tracking-tight text-primary"
          >
            Formalização da Contratação
          </h2>
          <p className="text-sm text-muted-foreground">
            Documentação 100% anexada. Registre o fornecedor vencedor, tipo de instrumento e valores
            para apuração da economia.
          </p>
        </div>
        <StatusBadge label="Apto para Formalização" tone="info" />
      </div>

      <ActionForm
        action={submitFormalizationFormAction}
        submitLabel="Submeter para Homologação de Warley"
        pendingLabel="Submetendo formalização…"
        hiddenFields={{
          processId,
          councilId,
          ...(requestId ? { requestId } : {}),
        }}
      >
        {(fieldErrors) => (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <SelectField
                  name="supplierId"
                  label="Fornecedor Vencedor"
                  required
                  options={supplierOptions}
                  placeholder={
                    supplierOptions.length > 0
                      ? "Selecione o fornecedor…"
                      : "Nenhum fornecedor cadastrado"
                  }
                  errors={fieldErrors.supplierId}
                />
              </div>

              <div>
                <SelectField
                  name="instrumentType"
                  label="Tipo de Instrumento"
                  required
                  options={INSTRUMENT_OPTIONS}
                  placeholder="Selecione o tipo…"
                  errors={fieldErrors.instrumentType}
                />
              </div>

              <div>
                <TextField
                  name="instrumentNumber"
                  label="Número do Instrumento"
                  placeholder="Ex.: ARP 012/2026 ou CTR 005/2026"
                  required
                  errors={fieldErrors.instrumentNumber}
                />
              </div>

              <div>
                <FormField
                  label="Valor Estimado (R$)"
                  required
                  errors={fieldErrors.estimatedValue}
                  hint="Valor de referência do processo"
                >
                  {(p) => (
                    <Input
                      {...p}
                      name="estimatedValue"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={estimatedInput}
                      onChange={(e) => setEstimatedInput(e.target.value)}
                      placeholder="0,00"
                    />
                  )}
                </FormField>
              </div>

              <div>
                <FormField
                  label="Valor Contratado (R$)"
                  required
                  errors={fieldErrors.contractedValue}
                  hint="Valor final homologado na proposta vencedora"
                >
                  {(p) => (
                    <Input
                      {...p}
                      name="contractedValue"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={contractedInput}
                      onChange={(e) => setContractedInput(e.target.value)}
                      placeholder="0,00"
                    />
                  )}
                </FormField>
              </div>
            </div>

            {/* Painel Reativo de Economia em Tempo Real */}
            <div className="rounded-xl border border-border/80 bg-secondary/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Cálculo de Economia em Tempo Real
                </span>
                {estimatedNum > 0 && contractedNum >= 0 ? (
                  savingsValue > 0 ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-600/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      +{formatPercent(savingsPercent)} de economia
                    </span>
                  ) : savingsValue < 0 ? (
                    <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                      Acréscimo de {formatPercent(Math.abs(savingsPercent))}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      0,00% (Sem variação)
                    </span>
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">Aguardando valores</span>
                )}
              </div>

              {estimatedNum > 0 && contractedNum >= 0 ? (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <p className="text-[0.7rem] text-muted-foreground uppercase">Valor Estimado</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(estimatedNum)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] text-muted-foreground uppercase">Valor Contratado</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(contractedNum)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] text-muted-foreground uppercase">Economia Gerada</p>
                    <p
                      className={`text-sm font-bold ${
                        savingsValue > 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : savingsValue < 0
                            ? "text-destructive"
                            : "text-foreground"
                      }`}
                    >
                      {formatCurrency(savingsValue)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Informe o valor estimado e contratado acima para visualizar a economia obtida em
                  relação ao teto do processo.
                </p>
              )}

              {savingsValue < 0 ? (
                <p className="mt-2 text-xs font-medium text-destructive">
                  Atenção: O valor contratado é superior ao valor estimado inicialmente.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </ActionForm>
    </section>
  );
}
