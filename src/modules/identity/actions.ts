"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authUnavailable, getAuthGateway } from "@/server/auth-gateway";
import { parseInput } from "@/shared/lib/service-support";
import type { ActionState } from "@/shared/ui/forms/action-state";

const credentialsSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres.").max(200),
});
const emailSchema = credentialsSchema.pick({ email: true });

/** Login: cadastro é somente por convite (P7); aqui só autenticamos usuários já existentes. */
export async function signInAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseInput(credentialsSchema, { email: formData.get("email"), password: formData.get("password") });
  if (!parsed.ok) return { status: "error", message: parsed.message, fieldErrors: parsed.fieldErrors };

  const gateway = getAuthGateway();
  const result = gateway ? await gateway.signIn(parsed.data.email, parsed.data.password) : authUnavailable();
  if (!result.ok) return { status: "error", message: result.message };
  redirect("/dashboard");
}

/** Resposta neutra: não revela se o e-mail existe (evita enumeração de usuários). */
export async function requestPasswordRecoveryAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseInput(emailSchema, { email: formData.get("email") });
  if (!parsed.ok) return { status: "error", message: parsed.message, fieldErrors: parsed.fieldErrors };

  const gateway = getAuthGateway();
  if (!gateway) return { status: "error", message: "Autenticação não configurada neste ambiente." };
  await gateway.sendPasswordRecovery(parsed.data.email);
  return { status: "success", message: "Se o e-mail estiver cadastrado, você receberá as instruções de recuperação." };
}

const newPasswordSchema = z.object({
  password: z.string().min(10, "A senha deve ter ao menos 10 caracteres.").max(200),
  confirmation: z.string(),
}).refine((v) => v.password === v.confirmation, { message: "As senhas não conferem.", path: ["confirmation"] });

/** Define a nova senha (convite/recuperação): exige a sessão criada pelo link do e-mail. */
export async function updatePasswordAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseInput(newPasswordSchema, { password: formData.get("password"), confirmation: formData.get("confirmation") });
  if (!parsed.ok) return { status: "error", message: parsed.message, fieldErrors: parsed.fieldErrors };

  const gateway = getAuthGateway();
  const result = gateway ? await gateway.updatePassword(parsed.data.password) : authUnavailable();
  if (!result.ok) return { status: "error", message: result.message };
  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  await getAuthGateway()?.signOut();
  redirect("/login");
}
