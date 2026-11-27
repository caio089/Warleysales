"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import { can } from "@/shared/lib/authz/policy";
import { computeInitialEndDate } from "@/modules/atas/domain/validity";
import { diffInDays, isValidDateOnly } from "@/shared/lib/time";
import { createContractSchema } from "./schemas";
import { calculateContractAtaValue } from "./domain/ata-value";
import type { ActionState } from "@/shared/ui/forms/action-state";

const optionalNumber = (v: FormDataEntryValue | null) => (String(v ?? "").trim() ? Number(String(v).replace(",", ".")) : undefined);
const optionalText = (v: FormDataEntryValue | null) => (String(v ?? "").trim() ? String(v) : undefined);

/** Só aceita voltar para a pasta do processo que originou o cadastro. */
function processReturnPath(formData: FormData): string | null {
  const raw = String(formData.get("returnTo") ?? "").trim();
  if (!/^\/processos\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) return null;
  return `${raw}?aba=contratacao`;
}

export async function createContractFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const startDateRaw = String(formData.get("startDate") ?? "").trim();
  const endDateRaw = String(formData.get("endDate") ?? "").trim();
  const endDate =
    endDateRaw ||
    (isValidDateOnly(startDateRaw) ? computeInitialEndDate(startDateRaw) : endDateRaw);

  const ataItems: { ataItemId: string; quantity: number; unitPrice?: number }[] = [];
  for (const field of new Set(formData.keys())) {
    const index = /^ataItems\.(\d+)\.ataItemId$/.exec(field)?.[1];
    if (index === undefined) continue;
    const ataItemId = optionalText(formData.get(field));
    const quantity = optionalNumber(formData.get(`ataItems.${index}.quantity`));
    if (!ataItemId || quantity == null || quantity <= 0) continue;
    ataItems.push({
      ataItemId,
      quantity,
      unitPrice: optionalNumber(formData.get(`ataItems.${index}.unitPrice`)) ?? 0,
    });
  }

  const input = {
    councilId: formData.get("councilId"),
    number: formData.get("number"),
    object: formData.get("object"),
    processId: optionalText(formData.get("processId")) ?? null,
    ataId: optionalText(formData.get("ataId")) ?? null,
    startDate: startDateRaw,
    endDate,
    value:
      ataItems.length > 0
        ? calculateContractAtaValue(ataItems)
        : (optionalNumber(formData.get("value")) ?? 0),
    ataItems,
  };
  const result = await runAction(async ({ services, actor }) => {
    const parsed = createContractSchema.safeParse(input);
    if (!parsed.success) return { ok: false as const, code: "VALIDATION" as const, message: "Confira os campos do contrato." };
    if (!can(actor, "contract.manage", parsed.data.councilId)) return { ok: false as const, code: "FORBIDDEN" as const, message: "Sem permissão para este órgão." };
    if (diffInDays(parsed.data.startDate, parsed.data.endDate) < 0) return { ok: false as const, code: "VALIDATION" as const, message: "A data final não pode ser anterior ao início." };
    if (parsed.data.processId) {
      const process = await services.processes.get(actor, parsed.data.processId);
      if (!process.ok) return process;
      if (process.data.process.councilId !== parsed.data.councilId) return { ok: false as const, code: "VALIDATION" as const, message: "O processo precisa ser do mesmo órgão do contrato." };
    }
    let supplierId = optionalText(formData.get("supplierId")) ?? null;
    const supplierName = optionalText(formData.get("supplierName"));
    const supplierCnpj = optionalText(formData.get("supplierCnpj"));
    if (!supplierId && supplierName) {
      const existing = await services.suppliers.list(actor);
      if (!existing.ok) return existing;
      const matched = existing.data.find((supplier) => supplierCnpj && supplier.cnpj === supplierCnpj.replace(/\D/g, ""))
        ?? existing.data.find((supplier) => supplier.name.toLocaleLowerCase("pt-BR") === supplierName.toLocaleLowerCase("pt-BR") && (!supplierCnpj || supplier.cnpj === supplierCnpj.replace(/\D/g, "")));
      if (matched) supplierId = matched.id;
      else {
        const created = await services.suppliers.create(actor, { name: supplierName, cnpj: supplierCnpj ?? "", email: null, phone: null });
        if (!created.ok) return created;
        supplierId = created.data.id;
      }
    }
    return services.contracts.create(actor, { ...parsed.data, supplierId });
  }, "Contrato cadastrado e saldo da ata atualizado.");
  if (result.status !== "success" || !result.data) return result.status === "success" ? result : result;
  revalidatePath("/contratos");
  revalidatePath("/atas");
  revalidatePath("/estoque");
  revalidatePath("/estoque/movimentacoes");
  if (input.ataId) revalidatePath(`/atas/${String(input.ataId)}`);
  const backToProcess = processReturnPath(formData);
  if (backToProcess) {
    revalidatePath(backToProcess.split("?")[0] ?? backToProcess);
    redirect(backToProcess);
  }
  redirect(`/contratos/${result.data.id}`);
}

export async function addAmendmentFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const contractId = String(formData.get("contractId"));
  const result = await runAction(({ services, actor }) => services.contracts.addAmendment(actor, {
    contractId, reason: formData.get("reason"), endDate: optionalText(formData.get("endDate")), value: optionalNumber(formData.get("value")), signedAt: formData.get("signedAt"),
  }), "Aditivo registrado; o histórico anterior foi preservado.");
  if (result.status === "success") revalidatePath(`/contratos/${contractId}`);
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function closeContractFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const contractId = String(formData.get("contractId"));
  const result = await runAction(({ services, actor }) => services.contracts.close(actor, { contractId }), "Contrato encerrado administrativamente.");
  if (result.status === "success") {
    revalidatePath(`/contratos/${contractId}`);
    revalidatePath("/contratos");
    revalidatePath("/relatorios");
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

/** Liga o contrato ao processo já escolhido na ata, ou a outro processo do mesmo órgão. */
export async function linkContractProcessFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const contractId = String(formData.get("contractId"));
  const processId = optionalText(formData.get("processId")) ?? null;
  const result = await runAction(
    ({ services, actor }) => services.contracts.linkProcess(actor, { contractId, processId }),
    processId ? "Contrato vinculado ao processo." : "Vínculo com o processo removido.",
  );
  if (result.status === "success") {
    revalidatePath(`/contratos/${contractId}`);
    revalidatePath("/contratos");
    revalidatePath("/atas");
    revalidatePath("/processos");
    revalidatePath("/estoque");
    revalidatePath("/estoque/movimentacoes");
    if (processId) revalidatePath(`/processos/${processId}`);
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
