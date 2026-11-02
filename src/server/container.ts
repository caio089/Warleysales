import { AtaService } from "@/modules/atas/service";
import type { AtaRepository } from "@/modules/atas/repository";
import { AuditService } from "@/modules/audit/service";
import type { AuditRepository } from "@/modules/audit/repository";
import { ContractService } from "@/modules/contracts/service";
import type { ContractRepository } from "@/modules/contracts/repository";
import { DocumentService } from "@/modules/documents/service";
import type { DocumentRepository, StoragePort } from "@/modules/documents/repository";
import { CouncilService, MembershipService } from "@/modules/identity/service";
import type { CouncilRepository, MembershipRepository } from "@/modules/identity/repository";
import { InventoryService } from "@/modules/inventory/service";
import type { InventoryRepository } from "@/modules/inventory/repository";
import { MeetingService } from "@/modules/meetings/service";
import type { MeetingRepository } from "@/modules/meetings/repository";
import { RepositoryAlertSource } from "@/modules/notifications/alert-source";
import { NotificationService } from "@/modules/notifications/service";
import type { NotificationRepository } from "@/modules/notifications/repository";
import type { ProcessRepository } from "@/modules/processes/repository";
import { ProcessService } from "@/modules/processes/service";
import { PurchaseRequestService } from "@/modules/purchases/service";
import type { PurchaseRequestRepository } from "@/modules/purchases/repository";
import { ReportService } from "@/modules/reports/service";
import { RetentionService } from "@/modules/retention/service";
import type { RetentionRepository } from "@/modules/retention/repository";
import { SupplierService } from "@/modules/suppliers/service";
import type { SupplierRepository } from "@/modules/suppliers/repository";
import { TransferService } from "@/modules/transfers/service";
import type { TransferRepository } from "@/modules/transfers/repository";
import type { RuntimeDeps } from "@/shared/lib/service-support";

/** Todos os ports de persistência necessários. Adapters Supabase e em memória implementam este contrato. */
export interface Repositories {
  audit: AuditRepository;
  councils: CouncilRepository;
  memberships: MembershipRepository;
  processes: ProcessRepository;
  documents: DocumentRepository;
  storage: StoragePort;
  retention: RetentionRepository;
  inventory: InventoryRepository;
  transfers: TransferRepository;
  atas: AtaRepository;
  contracts: ContractRepository;
  purchases: PurchaseRequestRepository;
  suppliers: SupplierRepository;
  meetings: MeetingRepository;
  notifications: NotificationRepository;
}

export interface Services {
  audit: AuditService;
  councils: CouncilService;
  memberships: MembershipService;
  processes: ProcessService;
  documents: DocumentService;
  retention: RetentionService;
  inventory: InventoryService;
  transfers: TransferService;
  atas: AtaService;
  contracts: ContractService;
  purchases: PurchaseRequestService;
  suppliers: SupplierService;
  meetings: MeetingService;
  notifications: NotificationService;
  reports: ReportService;
}

/** Composição das dependências (raiz de composição). Pura: sem acesso a env nem a rede. */
export function createServices(repos: Repositories, runtime: RuntimeDeps): Services {
  const audit = new AuditService(repos.audit);
  const inventory = new InventoryService(repos.inventory, audit, runtime);
  const atas = new AtaService(repos.atas, audit, runtime);
  const contracts = new ContractService(repos.contracts, audit, runtime);
  const processes = new ProcessService(repos.processes, repos.documents, audit, runtime);
  const alertSource = new RepositoryAlertSource(repos.atas, repos.contracts, repos.memberships);

  return {
    audit,
    councils: new CouncilService(repos.councils, audit, runtime),
    memberships: new MembershipService(repos.memberships, repos.councils, audit),
    processes,
    documents: new DocumentService(repos.documents, repos.processes, repos.storage, audit, runtime),
    retention: new RetentionService(repos.retention, repos.processes, repos.documents, repos.storage, audit, runtime),
    inventory,
    transfers: new TransferService(repos.transfers, inventory, audit, runtime),
    atas,
    contracts,
    purchases: new PurchaseRequestService(repos.purchases, atas, inventory, audit, runtime),
    suppliers: new SupplierService(repos.suppliers, audit, runtime),
    meetings: new MeetingService(repos.meetings, audit, runtime),
    notifications: new NotificationService(repos.notifications, alertSource, audit, runtime),
    reports: new ReportService(processes, inventory, contracts, atas, runtime),
  };
}
