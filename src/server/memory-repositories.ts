import { InMemoryAtaRepository } from "@/modules/atas/repository.memory";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { InMemoryContractRepository } from "@/modules/contracts/repository.memory";
import { InMemoryDocumentRepository, InMemoryStorage } from "@/modules/documents/repository.memory";
import { InMemoryCouncilRepository, InMemoryMembershipRepository } from "@/modules/identity/repository.memory";
import { InMemoryInventoryRepository } from "@/modules/inventory/repository.memory";
import { InMemoryMeetingRepository } from "@/modules/meetings/repository.memory";
import { InMemoryNotificationRepository } from "@/modules/notifications/repository.memory";
import { InMemoryProcessRepository } from "@/modules/processes/repository.memory";
import { InMemoryPurchaseRequestRepository } from "@/modules/purchases/repository.memory";
import { InMemoryRetentionRepository } from "@/modules/retention/repository.memory";
import { InMemorySupplierRepository } from "@/modules/suppliers/repository.memory";
import { InMemoryTransferRepository } from "@/modules/transfers/repository.memory";
import type { Repositories } from "./container";

/**
 * Repositórios em memória. USO EXCLUSIVO EM TESTES — nunca importar em telas, actions ou rotas.
 * (As telas dependem de getServices(), que só entrega adapters reais.)
 */
export function createMemoryRepositories(clock: () => Date = () => new Date()): Repositories {
  return {
    audit: new InMemoryAuditRepository(clock),
    councils: new InMemoryCouncilRepository(),
    memberships: new InMemoryMembershipRepository(),
    processes: new InMemoryProcessRepository(),
    documents: new InMemoryDocumentRepository(),
    storage: new InMemoryStorage(),
    retention: new InMemoryRetentionRepository(),
    inventory: new InMemoryInventoryRepository(clock),
    transfers: new InMemoryTransferRepository(),
    atas: new InMemoryAtaRepository(),
    contracts: new InMemoryContractRepository(),
    purchases: new InMemoryPurchaseRequestRepository(),
    suppliers: new InMemorySupplierRepository(),
    meetings: new InMemoryMeetingRepository(),
    notifications: new InMemoryNotificationRepository(),
  };
}
