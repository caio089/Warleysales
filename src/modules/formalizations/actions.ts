"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import { fail } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";

function parseMoney(value: FormDataEntryValue | null): number {
  if (!value) return 0;
  const str = String(value).replace(/R\$\s?/gi, "").trim();
  if (!str) return 0;
  if (str.includes(",") && str.includes(".")) {
    return Number(str.replace(/\./g, "").replace(",", "."));
  }
  return Number(str.replace(",", "."));
}

export async function submitFormalizationFormAction(
  previousOrFormData?: ActionState | FormData,
  maybeFormData?: FormData,
): Promise<ActionState> {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : previousOrFormData instanceof FormData
        ? previousOrFormData
        : new FormData();

  const processId = String(formData.get("processId") ?? "");
  const councilId = String(formData.get("councilId") ?? "");
  const supplierName = String(formData.get("supplierName") ?? "").trim();
  const supplierIdField = String(formData.get("supplierId") ?? "").trim();
  const auctionDate = String(formData.get("auctionDate") ?? "").trim();
  const instrumentType = String(formData.get("instrumentType") ?? "").trim() || "ata";
  const instrumentNumber = String(formData.get("instrumentNumber") ?? "").trim();
  const requestIdRaw = formData.get("requestId");
  const requestId =
    requestIdRaw && String(requestIdRaw).trim() !== "" ? String(requestIdRaw).trim() : null;

  const estimatedValue = parseMoney(formData.get("estimatedValue"));
  const contractedValue = parseMoney(formData.get("contractedValue"));
  const materialIds = formData.getAll("itemMaterialId").map((value) => String(value));
  const quantities = formData.getAll("itemQuantity").map((value) => Number(String(value).replace(",", ".")));
  const items = materialIds
    .map((materialId, index) => ({ materialId, quantity: quantities[index] ?? 0 }))
    .filter((item) => item.materialId);
  const loneQuantity = items.length === 0 ? quantities[0] : undefined;
  const contractedQuantity = items.length > 0
    ? items.reduce((total, item) => total + item.quantity, 0)
    : loneQuantity;

  const result = await runAction(
    async ({ services, actor }) => {
      if (auctionDate && !/^\d{4}-\d{2}-\d{2}$/.test(auctionDate)) {
        return fail("VALIDATION", "Informe a data do pregão.");
      }
      if (items.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
        return fail("VALIDATION", "Informe a quantidade contratada.");
      }
      if (loneQuantity !== undefined && (!Number.isFinite(loneQuantity) || loneQuantity <= 0)) {
        return fail("VALIDATION", "Informe a quantidade contratada.");
      }

      let supplierId = supplierIdField;
      if (!supplierId) {
        const supplier = await services.suppliers.ensureByName(actor, supplierName);
        if (!supplier.ok) return supplier;
        supplierId = supplier.data.id;
      }

      const submitted = await services.formalizations.submit(actor, {
        processId,
        councilId,
        supplierId,
        instrumentType,
        instrumentNumber: instrumentNumber || undefined,
        auctionDate: auctionDate || undefined,
        contractedQuantity,
        items: items.length > 0 ? items : undefined,
        estimatedValue,
        contractedValue,
        requestId,
      });
      if (!submitted.ok || !actor.isCentralAdmin) return submitted;
      return services.formalizations.homologate(actor, {
        processId,
        note: "Liberação após registro do fornecedor, da data do pregão, do valor e da quantidade.",
        items: items.length > 0 ? items : undefined,
      });
    },
    (formalization) =>
      formalization.status === "homologado"
        ? "Economia gravada e estoque liberado. O status passou para disponível."
        : "Formalização registrada. O estoque continua bloqueado até a liberação.",
  );

  if (result.status === "success") {
    revalidatePath(`/processos/${processId}`);
    revalidatePath("/processos");
    revalidatePath("/dashboard");
    revalidatePath("/estoque");
    revalidatePath("/meu-conselho");
  }

  return result.status === "success"
    ? { status: "success", message: result.message }
    : result;
}

export async function homologateFormalizationAction(
  previousOrFormData?: ActionState | FormData,
  maybeFormData?: FormData,
): Promise<ActionState> {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : previousOrFormData instanceof FormData
        ? previousOrFormData
        : new FormData();

  const processId = String(formData.get("processId") ?? "");
  const noteRaw = formData.get("note");
  const note = noteRaw && String(noteRaw).trim() !== "" ? String(noteRaw).trim() : undefined;

  const result = await runAction(
    ({ services, actor }) =>
      services.formalizations.homologate(actor, {
        processId,
        note,
      }),
    "Formalização homologada e estoque liberado com sucesso.",
  );

  if (result.status === "success") {
    revalidatePath(`/processos/${processId}`);
    revalidatePath("/processos");
    revalidatePath("/estoque");
    revalidatePath("/dashboard");
    revalidatePath("/meu-conselho");
  }

  return result.status === "success"
    ? { status: "success", message: result.message }
    : result;
}

export async function rejectFormalizationAction(
  previousOrFormData?: ActionState | FormData,
  maybeFormData?: FormData,
): Promise<ActionState> {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : previousOrFormData instanceof FormData
        ? previousOrFormData
        : new FormData();

  const processId = String(formData.get("processId") ?? "");
  const note = String(formData.get("note") ?? "");

  const result = await runAction(
    ({ services, actor }) =>
      services.formalizations.reject(actor, {
        processId,
        note,
      }),
    "Formalização rejeitada.",
  );

  if (result.status === "success") {
    revalidatePath(`/processos/${processId}`);
    revalidatePath("/processos");
    revalidatePath("/dashboard");
  }

  return result.status === "success"
    ? { status: "success", message: result.message }
    : result;
}
