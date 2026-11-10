"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
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
  const supplierId = String(formData.get("supplierId") ?? "");
  const instrumentType = String(formData.get("instrumentType") ?? "");
  const instrumentNumber = String(formData.get("instrumentNumber") ?? "");
  const requestIdRaw = formData.get("requestId");
  const requestId =
    requestIdRaw && String(requestIdRaw).trim() !== "" ? String(requestIdRaw).trim() : null;

  const estimatedValue = parseMoney(formData.get("estimatedValue"));
  const contractedValue = parseMoney(formData.get("contractedValue"));

  const result = await runAction(
    ({ services, actor }) =>
      services.formalizations.submit(actor, {
        processId,
        councilId,
        supplierId,
        instrumentType,
        instrumentNumber,
        estimatedValue,
        contractedValue,
        requestId,
      }),
    "Formalização submetida com sucesso. Aguardando homologação de Warley.",
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
