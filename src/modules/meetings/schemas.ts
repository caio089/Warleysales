import { z } from "zod";
import { idSchema } from "@/shared/lib/service-support";
import type { MeetingStatus } from "./domain/meeting-status";

/** R8: ata de REUNIÃO (registro do que foi deliberado) — não é ata de registro de preços. */
export interface MeetingMinutes {
  text: string;
  registeredBy: string;
  registeredAt: Date;
}

export interface ActionItem {
  id: string;
  description: string;
  responsibleId: string | null;
  dueDate: string | null;
  done: boolean;
  completion?: { actorId: string; at: Date; dueDate: string | null };
}

export interface Meeting {
  id: string;
  councilId: string;
  title: string;
  scheduledAt: Date; // UTC; exibição em America/Fortaleza
  status: MeetingStatus;
  minutes: MeetingMinutes | null;
  audioPath: string | null;
  transcript: string | null;
  actionItems: ActionItem[];
  createdBy: string;
  responsibleId?: string | null;
  agenda?: string | null;
  decisions?: string | null;
  participantIds?: string[];
  attachmentIds?: string[];
  attendance?: { participantId: string; recordedBy: string; at: Date }[];
}

export const scheduleMeetingSchema = z.object({
  councilId: idSchema,
  title: z.string().trim().min(3).max(200),
  scheduledAt: z.coerce.date({ error: "Data/hora inválida." }),
});
export const changeMeetingStatusSchema = z.object({
  meetingId: idSchema,
  to: z.enum(["agendada", "realizada", "cancelada", "reagendada"]),
  /** Obrigatória ao reagendar (volta a "agendada" na nova data). */
  newScheduledAt: z.coerce.date().optional(),
});
export const minutesSchema = z.object({ meetingId: idSchema, text: z.string().trim().min(5, "Registre o conteúdo da ata.").max(20000) });
export const meetingDetailsSchema = z.object({
  meetingId: idSchema,
  title: z.string().trim().min(3).max(200),
  responsibleId: idSchema.nullable(),
  agenda: z.string().trim().max(8000),
  decisions: z.string().trim().max(12000),
  participantIds: z.array(idSchema).max(100).transform((ids) => [...new Set(ids)]),
  attachmentIds: z.array(idSchema).max(100).transform((ids) => [...new Set(ids)]),
});
export type MeetingDetails = Omit<z.output<typeof meetingDetailsSchema>, "meetingId">;
export const actionItemSchema = z.object({
  meetingId: idSchema,
  description: z.string().trim().min(3).max(500),
  responsibleId: idSchema.nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});
