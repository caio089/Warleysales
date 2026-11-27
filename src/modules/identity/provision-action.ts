"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import { COUNCIL_ROLES, isStaffRole } from "@/shared/lib/authz/navigation";
import { log } from "@/shared/lib/logger";
import { fail, ok } from "@/shared/lib/result";

const schema = z.object({
  email: z.email().optional(),
  fullName: z.string().trim().min(2).max(120),
  membership: z.object({ role: z.enum(COUNCIL_ROLES), councilId: z.uuid() }).optional(),
});

export async function provisionCouncilAccess(_previous: unknown, form: FormData) {
  const result = await runAction(async ({ actor, services }) => {
    if (!actor.isSpecialDeleter) return fail("FORBIDDEN", "Somente Warley pode cadastrar usuários.");
    const parsed = schema.safeParse({
      email: String(form.get("email") ?? "").trim().toLowerCase() || undefined,
      fullName: form.get("fullName"),
      membership: form.get("linkNow") === "on"
        ? { councilId: form.get("councilId"), role: form.get("role") }
        : undefined,
    });
    if (!parsed.success) return fail("VALIDATION", "Informe o nome e confira o e-mail e os dados do vínculo.");
    const { fullName, membership } = parsed.data;

    if (membership) {
      const directory = await services.memberships.directory(actor);
      if (!directory.ok) return directory;
      const council = directory.data.councils.find((entry) => entry.id === membership.councilId && entry.active);
      if (!council) return fail("NOT_FOUND", "Organização ativa não encontrada.");
      if (isStaffRole(membership.role) && council.organizationType !== "public_body") {
        return fail("VALIDATION", "Selecione um órgão público para este perfil.");
      }
      if (membership.role === "director" && directory.data.memberships.some((m) => m.councilId === council.id && m.role === "director")) {
        return fail("CONFLICT", "Este órgão já tem um diretor.");
      }
    }

    const email = parsed.data.email ?? `usuario-${randomBytes(12).toString("hex")}@acesso.invalid`;
    const db = getServiceClient();
    const password = `${randomBytes(24).toString("base64url")}!aA1`;
    const created = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (created.error) {
      const code = created.error.code;
      log("error", "identity.provision_failed", { code, status: created.error.status });
      if (code === "email_exists" || code === "user_already_exists") {
        return fail("CONFLICT", "Já existe uma conta com esse e-mail. Use Usuário existente para vinculá-la.");
      }
      if (code === "email_address_invalid" || code === "validation_failed") {
        return fail("VALIDATION", "O serviço de autenticação rejeitou os dados do cadastro. Confira o e-mail ou informe um endereço real.");
      }
      return fail("INTERNAL", "O serviço de autenticação não conseguiu criar a conta.");
    }

    if (!membership) return ok({ email, password });

    const id = created.data.user.id;
    try {
      const assigned = await services.memberships.assign(actor, { userId: id, ...membership });
      if (!assigned.ok) {
        await db.auth.admin.deleteUser(id);
        return assigned;
      }
    } catch (error) {
      await db.auth.admin.deleteUser(id);
      throw error;
    }
    return ok({ email, password });
  }, "Acesso criado.");
  if (result.status === "success") {
    revalidatePath("/perfil");
    revalidatePath("/administracao/usuarios");
  }
  return result;
}
