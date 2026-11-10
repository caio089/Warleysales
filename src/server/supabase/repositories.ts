import "server-only";
import type { Repositories } from "../container";
import { SupabaseAtaRepository } from "./adapters/atas";
import { SupabaseAuditRepository } from "./adapters/audit";
import { SupabaseContractRepository } from "./adapters/contracts";
import { SupabaseFormalizationRepository } from "./adapters/formalizations";
import { SupabaseCouncilRepository, SupabaseMembershipRepository } from "./adapters/identity";
import { SupabaseInventoryRepository } from "./adapters/inventory";
import { SupabaseMeetingRepository } from "./adapters/meetings";
import { SupabaseNotificationRepository } from "./adapters/notifications";
import { SupabaseDocumentRepository, SupabaseProcessRepository, SupabaseStorage } from "./adapters/processes";
import { SupabasePurchaseRequestRepository } from "./adapters/purchases";
import { SupabaseRetentionRepository } from "./adapters/retention";
import { SupabaseSupplierRepository } from "./adapters/suppliers";
import { SupabaseTransferRepository } from "./adapters/transfers";
import { getServiceClient } from "./client";

/** Raiz de composição dos adapters Supabase (todos os ports de persistência). */
export function createSupabaseRepositories(): Repositories {
  const db = getServiceClient();
  return {
    audit: new SupabaseAuditRepository(db),
    councils: new SupabaseCouncilRepository(db),
    memberships: new SupabaseMembershipRepository(db),
    processes: new SupabaseProcessRepository(db),
    documents: new SupabaseDocumentRepository(db),
    storage: new SupabaseStorage(db),
    retention: new SupabaseRetentionRepository(db),
    inventory: new SupabaseInventoryRepository(db),
    transfers: new SupabaseTransferRepository(db),
    atas: new SupabaseAtaRepository(db),
    contracts: new SupabaseContractRepository(db),
    purchases: new SupabasePurchaseRequestRepository(db),
    suppliers: new SupabaseSupplierRepository(db),
    meetings: new SupabaseMeetingRepository(db),
    notifications: new SupabaseNotificationRepository(db),
    formalizations: new SupabaseFormalizationRepository(db),
  };
}
