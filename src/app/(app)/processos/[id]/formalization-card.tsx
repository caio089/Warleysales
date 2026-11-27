"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
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
import { FormField, TextareaControl } from "@/shared/ui/form-field";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { TextField } from "@/shared/ui/forms/fields";
import { CurrencyInput } from "@/shared/ui/forms/currency-input";
import { StatusBadge } from "@/shared/ui/status-badge";
import { SavingsPanel } from "./savings-panel";
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
  defaultContractedValue?: number;
  requestId?: string | null;
  requestItems?: { materialId: string; name: string; quantity: number }[];
  /** Ata e contrato já vinculados. Sem os dois, a conclusão fica bloqueada. */
  instrumentsReady?: boolean;
  evidenceOptions?: { id: string; name: string }[];
}

const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  ata: "Ata de Registro de Preços",
  contrato: "Contrato Administrativo",
  empenho: "Nota de Empenho",
};

function formatAuctionDate(value: string): string {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function auctionLabel(formalization: ProcessFormalization): string | null {
  if (formalization.auctionDate) return formatAuctionDate(formalization.auctionDate);
  if (formalization.instrumentNumber.startsWith("Pregão ")) {
    return formalization.instrumentNumber.slice("Pregão ".length);
  }
  return null;
}

export function FormalizationCard({
  processId,
  councilId,
  documentalComplete,
  formalization,
  suppliers,
  isWarley,
  defaultEstimatedValue,
  defaultContractedValue,
  requestId,
  requestItems = [],
  instrumentsReady = true,
  evidenceOptions = [],
}: FormalizationCardProps) {
  const [estimatedInput, setEstimatedInput] = useState<string>(
    defaultEstimatedValue != null && defaultEstimatedValue > 0
      ? String(defaultEstimatedValue)
      : "",
  );
  const [contractedInput, setContractedInput] = useState<string>(defaultContractedValue == null ? "" : String(defaultContractedValue));
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [exceptionalRelease, setExceptionalRelease] = useState(false);
  const requiresException = !documentalComplete || !instrumentsReady;
  const canUseException = isWarley && requiresException && !formalization;
  const releasingExceptionally = canUseException && exceptionalRelease;
  const exceptionButton = canUseException && (
    <Button type="button" variant="outline" className="mt-4" onClick={() => setExceptionalRelease(true)}>
      Liberar estoque com justificativa
    </Button>
  );

  const currentSupplier = useMemo(
    () => suppliers.find((s) => s.id === formalization?.supplierId),
    [suppliers, formalization?.supplierId],
  );

  const contractedQuantity = formalization?.contractedQuantity
    ?? (requestItems.length > 0 ? requestItems.reduce((total, item) => total + item.quantity, 0) : null);
  const supplierName = currentSupplier?.name ?? formalization?.supplierId ?? "—";
  const supplierCnpj = currentSupplier?.cnpj ? `CNPJ: ${currentSupplier.cnpj}` : null;

  // Cálculo de economia em tempo real para o formulário
  const estimatedNum = Number(estimatedInput) || 0;
  const contractedNum = Number(contractedInput) || 0;

  // 1. Estado de Espera: Documentos incompletos (<100%)
  if (!documentalComplete && !formalization && !releasingExceptionally) {
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
        {exceptionButton}
      </section>
    );
  }

  if (!instrumentsReady && !releasingExceptionally && !formalization?.homologationNote && formalization?.status !== "homologado") {
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
              A conclusão só libera depois da ata e, em seguida, do contrato deste processo.
            </p>
          </div>
          <StatusBadge label="Falta anexar instrumentos" tone="warning" />
        </div>
        <div className="rounded-xl border border-dashed border-border/80 bg-secondary/30 p-4">
          <p className="text-sm font-medium text-foreground">
            Primeiro anexe ou crie a ata. Depois anexe ou crie o contrato.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Em processos com ata, abra a ata para cadastrar o contrato. O fornecedor, o pregão e a liberação do estoque ficam disponíveis depois disso.
          </p>
        </div>
        {exceptionButton}
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
            {auctionLabel(formalization) ? (
              <p className="text-xs text-muted-foreground">Pregão em {auctionLabel(formalization)}</p>
            ) : null}
            {contractedQuantity != null ? (
              <p className="text-xs text-muted-foreground">Quantidade: {contractedQuantity}</p>
            ) : null}
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
            {auctionLabel(formalization) ? (
              <p className="text-xs text-muted-foreground">Pregão em {auctionLabel(formalization)}</p>
            ) : null}
            {contractedQuantity != null ? (
              <p className="text-xs text-muted-foreground">Quantidade: {contractedQuantity}</p>
            ) : null}
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
                      return false;
                    }
                    if (state.status === "success") toast.success(state.message);
                    return true;
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
            {releasingExceptionally
              ? "Registre a justificativa e os dados da contratação para liberar o estoque com pendências."
              : "Documentos prontos. Informe o fornecedor, a data do pregão, o valor de referência, a quantidade e o valor comprado. A economia é gravada e o estoque é liberado."}
          </p>
        </div>
        <StatusBadge label={releasingExceptionally ? "Liberação excepcional" : "Apto para Formalização"} tone="info" />
      </div>

      <ActionForm
        action={submitFormalizationFormAction}
        submitLabel={isWarley ? "Gravar economia e liberar estoque" : "Submeter para Homologação de Warley"}
        pendingLabel="Submetendo formalização…"
        submitVariant={isWarley ? "highlight" : "default"}
        submitClassName="font-medium px-5 shadow-xs"
        hiddenFields={{
          processId,
          councilId,
          ...(releasingExceptionally ? { exceptionalRelease: "true" } : {}),
          ...(requestId ? { requestId } : {}),
        }}
      >
        {(fieldErrors) => (
          <div className="space-y-5">
            {releasingExceptionally && (
              <div className="space-y-3">
                <label className="block text-sm">
                  Justificativa da liberação
                  <textarea className="mt-1 block w-full rounded-md border p-2" name="exceptionalReleaseReason" required maxLength={850} />
                </label>
                <label className="block text-sm">
                  Evidência (opcional)
                  <select className="mt-1 block w-full rounded-md border p-2" name="evidenceId">
                    <option value="">Sem evidência</option>
                    {evidenceOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </select>
                </label>
                <p className="text-xs text-muted-foreground">Para incluir um novo arquivo como evidência, anexe-o primeiro na aba Documentação.</p>
              </div>
            )}
            {/* Linha 1: Fornecedor * */}
            <div>
              <FormField
                label="Fornecedor"
                required
                errors={fieldErrors.supplierId}
                hint="Escreva o nome de quem venceu o pregão"
              >
                {(p) => (
                  <>
                    <Input
                      {...p}
                      name="supplierName"
                      required
                      list={`fornecedores-${processId}`}
                      placeholder="Ex.: Papelaria Central Ltda"
                      autoComplete="off"
                      className="w-full"
                    />
                    <datalist id={`fornecedores-${processId}`}>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.name} />
                      ))}
                    </datalist>
                  </>
                )}
              </FormField>
            </div>

            {/* Linha 2 (grid 2 colunas): Data do pregão * e Valor de referência (R$) * */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <TextField
                  name="auctionDate"
                  label="Data do pregão"
                  type="date"
                  required
                  errors={fieldErrors.auctionDate}
                />
              </div>

              <div>
                <FormField
                  label="Valor de referência (R$)"
                  required
                  errors={fieldErrors.estimatedValue}
                  hint="Valor estimado antes do pregão"
                >
                  {(p) => (
                    <CurrencyInput
                      {...p}
                      name="estimatedValue"
                      required
                      value={estimatedInput}
                      onValueChange={setEstimatedInput}
                      placeholder="0,00"
                    />
                  )}
                </FormField>
              </div>
            </div>

            {/* Linha 3: Quantidade Contratada */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Quantidade Contratada <span className="text-destructive">*</span>
                </label>
                <span className="text-xs text-muted-foreground">
                  Volume homologado para liberação no estoque
                </span>
              </div>

              {requestItems.length > 0 ? (
                <div className="space-y-2.5">
                  {requestItems.map((item) => (
                    <div
                      key={item.materialId}
                      className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Demanda do pedido: <span className="font-medium text-foreground">{item.quantity} un.</span>
                        </p>
                      </div>
                      <input type="hidden" name="itemMaterialId" value={item.materialId} />
                      <div className="w-full sm:w-44 shrink-0">
                        {releasingExceptionally ? (
                          <input type="hidden" name="itemQuantity" value={item.quantity} />
                        ) : <TextField
                          name="itemQuantity"
                          label="Quantidade"
                          type="number"
                          min="0.001"
                          step="0.001"
                          required
                          defaultValue={String(item.quantity)}
                        />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-xs">
                  <TextField
                    name="itemQuantity"
                    label="Quantidade"
                    type="number"
                    min="0.001"
                    step="0.001"
                    required
                    hint="Quantidade correta que entra no estoque"
                  />
                </div>
              )}
            </div>

            {/* Linha 4: Valor comprado (R$) * */}
            <div>
              <FormField
                label="Valor comprado (R$)"
                required
                errors={fieldErrors.contractedValue}
                hint="Valor final da proposta vencedora"
              >
                {(p) => (
                  <CurrencyInput
                    {...p}
                    name="contractedValue"
                    required
                    value={contractedInput}
                    onValueChange={setContractedInput}
                    placeholder="0,00"
                  />
                )}
              </FormField>
            </div>

            <SavingsPanel estimatedNum={estimatedNum} contractedNum={contractedNum} live />
          </div>
        )}
      </ActionForm>
    </section>
  );
}
