"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

const toNumber = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", "."));

const optionalId = (value: FormDataEntryValue | null) => {
  const text = String(value ?? "").trim();
  return text || null;
};

/** Só aceita voltar para a pasta do processo que originou o cadastro. */
function processReturnPath(formData: FormData): string | null {
  const raw = String(formData.get("returnTo") ?? "").trim();
  if (!/^\/processos\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) return null;
  return `${raw}?aba=contratacao`;
}

function readProcessItems(formData: FormData): {
  description: string;
  materialId: string | null;
  registeredQuantity: number;
  unitPrice: number;
}[] | null {
  const itemCount = Number(formData.get("itemCount") ?? 0);
  if (!Number.isFinite(itemCount) || itemCount < 1) return null;

  const rows = Array.from({ length: itemCount }, (_, index) => ({
    description: String(formData.get(`items.${index}.description`) ?? "").trim(),
    materialId: optionalId(formData.get(`items.${index}.materialId`)),
    registeredQuantity: toNumber(formData.get(`items.${index}.registeredQuantity`)),
  }));

  const totalValue = toNumber(formData.get("totalValue"));
  if (!Number.isFinite(totalValue) || totalValue < 0) return null;

  const sumQty = rows.reduce((total, row) => total + (Number.isFinite(row.registeredQuantity) ? row.registeredQuantity : 0), 0);
  const unitPrice = sumQty > 0 ? totalValue / sumQty : totalValue;

  return rows.map((row) => ({
    ...row,
    unitPrice,
  }));
}

export async function createAtaFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const processId = optionalId(formData.get("processId"));
  const supplierId = optionalId(formData.get("supplierId"));
  const processItems = readProcessItems(formData);

  let number = String(formData.get("number") ?? "").trim();
  if (!number && processId) {
    const processNumber = String(formData.get("processNumber") ?? "").trim();
    number = processNumber ? `ARP ${processNumber}` : `ARP-${processId.slice(0, 8)}`;
  }

  const items = processItems ?? [{
    description: formData.get("description"),
    materialId: optionalId(formData.get("materialId")),
    registeredQuantity: toNumber(formData.get("registeredQuantity")),
    unitPrice: toNumber(formData.get("unitPrice")),
  }];

  if (processId && !supplierId) {
    return {
      status: "error",
      message: "Selecione a empresa vencedora.",
      fieldErrors: { supplierId: ["Informe a empresa que ganhou."] },
    };
  }

  if (processItems && (!Number.isFinite(toNumber(formData.get("totalValue"))) || toNumber(formData.get("totalValue")) < 0)) {
    return {
      status: "error",
      message: "Informe o valor da ata.",
      fieldErrors: { totalValue: ["Informe o valor da ata."] },
    };
  }

  const result = await runAction(({ services, actor }) => services.atas.create(actor, {
    councilId: formData.get("councilId"),
    number,
    startDate: formData.get("startDate"),
    processId,
    supplierId,
    items,
  }), "Ata criada como rascunho.");
  if (result.status !== "success" || !result.data) return result.status === "success" ? result : result;
  revalidatePath("/atas");
  const backToProcess = processReturnPath(formData);
  if (backToProcess) {
    revalidatePath(backToProcess.split("?")[0] ?? backToProcess);
    redirect(backToProcess);
  }
  redirect(`/atas/${result.data.id}`);
}

export async function ataStepFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const ataId = String(formData.get("ataId"));
  const step = String(formData.get("step"));
  const result = await runAction(({ services, actor }) => (step === "extend" ? services.atas.extend(actor, { ataId }) : services.atas.activate(actor, { ataId })), step === "extend" ? "Ata prorrogada por 1 ano." : "Ata ativada.");
  if (result.status === "success") revalidatePath(`/atas/${ataId}`);
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

/** Alocação opcional por conselho (P5). Substitui as alocações do item. */
export async function setAllocationsFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const ataId = String(formData.get("ataId"));
  const councilId = String(formData.get("councilId") ?? "");
  const rawQty = String(formData.get("quantity") ?? "").trim();
  const allocations = councilId && rawQty ? [{ councilId, quantity: toNumber(formData.get("quantity")) }] : [];
  const result = await runAction(({ services, actor }) => services.atas.setAllocations(actor, {
    ataId, itemId: formData.get("itemId"), allocations,
  }), allocations.length ? "Alocação registrada." : "Alocação removida: saldo comum.");
  if (result.status === "success") revalidatePath(`/atas/${ataId}`);
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

/** Liga a ata a um processo do mesmo órgão. */
export async function linkAtaProcessFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const ataId = String(formData.get("ataId"));
  const processId = optionalId(formData.get("processId"));
  const result = await runAction(
    ({ services, actor }) => services.atas.linkProcess(actor, { ataId, processId }),
    processId ? "Processo vinculado à ata." : "Vínculo com o processo removido.",
  );
  if (result.status === "success") {
    revalidatePath(`/atas/${ataId}`);
    revalidatePath("/atas");
    revalidatePath("/processos");
    if (processId) revalidatePath(`/processos/${processId}`);
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
