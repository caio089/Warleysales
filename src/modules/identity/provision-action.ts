"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import { fail, ok } from "@/shared/lib/result";

const schema = z.object({
  email: z.email(),
  councilId: z.uuid(),
});

export async function provisionCouncilAccess(_previous: unknown, form: FormData) {
  const result = await runAction(async ({ actor, services }) => {
    if (!actor.isCentralAdmin) return fail("FORBIDDEN", "Apenas a administração central pode criar acessos.");
    const parsed = schema.safeParse({
      email: String(form.get("email") ?? "").trim().toLowerCase(),
      councilId: form.get("councilId"),
    });
    if (!parsed.success) return fail("VALIDATION", "Informe um e-mail válido e selecione o órgão.");

    const directory = await services.memberships.directory(actor);
    if (!directory.ok) return directory;
    const council = directory.data.councils.find((entry) => entry.id === parsed.data.councilId && entry.active);
    if (!council) return fail("NOT_FOUND", "Órgão ativo não encontrado.");

    const db = getServiceClient();
    const password = `${randomBytes(24).toString("base64url")}!aA1`;
    const created = await db.auth.admin.createUser({
      email: parsed.data.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: council.acronym },
    });
    if (created.error) return fail("VALIDATION", "Não foi possível criar o acesso. Verifique se o e-mail já está cadastrado.");

    const id = created.data.user.id;
    try {
      const assigned = await services.memberships.assign(actor, { userId: id, councilId: council.id, role: "council_operator" });
      if (!assigned.ok) {
        await db.auth.admin.deleteUser(id);
        return assigned;
      }
    } catch (error) {
      await db.auth.admin.deleteUser(id);
      throw error;
    }
    return ok({ email: parsed.data.email, password });
  }, "Acesso criado.");
  if (result.status === "success") revalidatePath("/administracao/usuarios");
  return result;
}
