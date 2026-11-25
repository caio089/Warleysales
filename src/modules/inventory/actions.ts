"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

const toNumber = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", "."));
const done = (r: ActionState): ActionState => (r.status === "success" ? { status: "success", message: r.message } : r);

export async function createMaterialFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.inventory.createMaterial(actor, { code: formData.get("code"), name: formData.get("name"), unit: formData.get("unit") }), "Material cadastrado.");
  if (result.status === "success") revalidatePath("/estoque/materiais");
  return done(result);
}

function readMovementLines(formData: FormData): { materialId: string; quantity: number }[] {
  const lines: { materialId: string; quantity: number }[] = [];
  for (let index = 0; index < 40; index += 1) {
    const materialId = String(formData.get(`items.${index}.materialId`) ?? "").trim();
    const quantityRaw = formData.get(`items.${index}.quantity`);
    if (!materialId && (quantityRaw == null || String(quantityRaw).trim() === "")) continue;
    lines.push({ materialId, quantity: toNumber(quantityRaw) });
  }
  if (lines.length > 0) return lines;

  // Compatibilidade com o formulário antigo (um único item).
  const materialId = String(formData.get("materialId") ?? "").trim();
  const quantity = toNumber(formData.get("quantity"));
  if (materialId || Number.isFinite(quantity)) return [{ materialId, quantity }];
  return [];
}

export async function registerMovementFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const lines = readMovementLines(formData);
  if (lines.length === 0) {
    return { status: "error", message: "Informe ao menos um item.", fieldErrors: { items: ["Adicione pelo menos um produto."] } };
  }

  const councilId = formData.get("councilId");
  const type = formData.get("type");
  const reason = formData.get("reason");
  const baseKey = String(formData.get("idempotencyKey") ?? "").trim() || crypto.randomUUID();

  let registered = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    const result = await runAction(
      ({ services, actor }) =>
        services.inventory.registerMovement(actor, {
          councilId,
          materialId: line.materialId,
          type,
          quantity: line.quantity,
          idempotencyKey: `${baseKey}:${index}`,
          reason,
        }),
      lines.length === 1 ? "Movimentação registrada." : `Item ${index + 1} de ${lines.length} registrado.`,
    );
    if (result.status === "error") {
      const fieldErrors = { ...(result.fieldErrors ?? {}) };
      if (fieldErrors.materialId) {
        fieldErrors[`items.${index}.materialId`] = fieldErrors.materialId;
        delete fieldErrors.materialId;
      }
      if (fieldErrors.quantity) {
        fieldErrors[`items.${index}.quantity`] = fieldErrors.quantity;
        delete fieldErrors.quantity;
      }
      return {
        status: "error",
        message:
          registered > 0
            ? `${registered} item(ns) já gravado(s). Falha no item ${index + 1}: ${result.message}`
            : result.message,
        fieldErrors,
      };
    }
    if (result.status !== "success") {
      return { status: "error", message: "Não foi possível registrar a movimentação." };
    }
    registered += 1;
  }

  revalidatePath("/estoque");
  revalidatePath("/estoque/movimentacoes");
  return done({
    status: "success",
    message: registered === 1 ? "Movimentação registrada." : `${registered} movimentações registradas.`,
  });
}

export async function setMinimumFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.inventory.setMinimum(actor, {
    councilId: formData.get("councilId"), materialId: formData.get("materialId"), minimum: toNumber(formData.get("minimum")),
  }), "Estoque mínimo atualizado.");
  if (result.status === "success") revalidatePath("/estoque");
  return done(result);
}
