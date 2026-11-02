import type { CouncilRole } from "@/shared/lib/authz/navigation";

export interface Council {
  id: string;
  name: string;
  acronym: string;
  responsibleUserId: string | null;
  institutionalInfo: string | null;
  active: boolean;
}

export interface MembershipRecord {
  userId: string;
  councilId: string;
  role: CouncilRole;
}
