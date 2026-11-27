import type { CouncilRole } from "@/shared/lib/authz/navigation";

import { COUNCIL_ROLES, COUNCIL_ROLE_LABELS } from "@/shared/lib/authz/navigation";

export const STAFF_CATEGORIES = ["unclassified", "collaborator", "intern", "central_admin", ...COUNCIL_ROLES] as const;
export type StaffCategory = (typeof STAFF_CATEGORIES)[number];

export const STAFF_CATEGORY_LABELS: Record<StaffCategory, string> = {
  unclassified: "Não classificado",
  collaborator: "Colaborador",
  intern: "Estagiário",
  central_admin: "Administrador central",
  ...COUNCIL_ROLE_LABELS,
};

export interface Council {
  id: string;
  organizationType: "public_body" | "private_company";
  name: string;
  acronym: string;
  responsibleUserId: string | null;
  institutionalInfo: string | null;
  /** Celular WhatsApp em E.164 (`55` + DDD + 9 dígitos), ou null se ainda não informado. */
  whatsappE164: string | null;
  active: boolean;
}

export interface MembershipRecord {
  userId: string;
  councilId: string;
  role: CouncilRole;
}

export interface ProfileSummary {
  id: string;
  fullName: string;
  active: boolean;
  staffCategory?: StaffCategory;
}
