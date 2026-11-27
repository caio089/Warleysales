"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import { createSessionClient } from "@/server/supabase/session-client";
import { can } from "@/shared/lib/authz/policy";
import { fail, ok } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";
import { parseLocalInstant } from "./agenda";

const input = z.object({
  id: z.uuid().optional(),
  councilId: z.uuid(),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000),
  start: z.string(),
  end: z.string(),
});

export async function saveAppointment(_state: ActionState, form: FormData): Promise<ActionState> {
  const result = await runAction(async ({ actor }) => {
    const parsed = input.safeParse({
      id: form.get("id") || undefined, councilId: form.get("councilId"),
      title: form.get("title"), description: form.get("description"), start: form.get("start"), end: form.get("end"),
    });
    if (!parsed.success) return fail("VALIDATION", "Confira o título, o órgão e os horários do compromisso.");
    const { id, councilId, title, description, start, end } = parsed.data;
    if (!can(actor, "meeting.manage", councilId)) return fail("FORBIDDEN", "Você não pode editar a agenda deste órgão.");
    const instant = (value: string) => {
      const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value);
      return match ? parseLocalInstant(match[1], match[2]) : null;
    };
    const startsAt = instant(start), endsAt = instant(end);
    if (!startsAt || !endsAt || startsAt >= endsAt) return fail("VALIDATION", "Informe horários válidos. O término deve ser depois do início.");
    const db = await createSessionClient();
    const fields = { title, description, starts_at: startsAt, ends_at: endsAt };
    const query = id
      ? db.from("calendar_appointments").update(fields).eq("id", id).eq("council_id", councilId)
      : db.from("calendar_appointments").insert({ ...fields, council_id: councilId });
    const { data, error } = await query.select("id").maybeSingle();
    if (error || !data) return fail("FORBIDDEN", "Não foi possível salvar o compromisso neste órgão.");
    revalidatePath("/calendario");
    return ok(true);
  }, "Compromisso salvo.");
  return result;
}
