"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

export async function createSupplierFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.suppliers.create(actor, {
    name: formData.get("name"), cnpj: formData.get("cnpj") || undefined, email: formData.get("email") || null, phone: formData.get("phone") || null,
  }), "Fornecedor cadastrado.");
  if (result.status === "success") revalidatePath("/fornecedores");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
