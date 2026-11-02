import type { CouncilRole } from "@/shared/lib/authz/navigation";

export interface Council {
  id: string;
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
}
