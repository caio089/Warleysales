# Contratos de serviço

Todos os métodos públicos recebem `(actor, input: unknown)`, validam com Zod, autorizam, auditam e devolvem `Result<T>`.
Métodos `*Internal` e `run*/generate*/reconcile` são chamados por outros serviços ou pelo cron (sem ator humano; auditoria usa `actorId: null`).

| Serviço | Operações |
|---|---|
| `CouncilService` | create, update, list, get |
| `ProcessService` | create (número `NNN/AAAA` por conselho), get, list, changeStatus, registerClosingReport |
| `DocumentService` | upload (magic bytes, SHA-256, ≤25 MB), unlink, manualDelete (só special deleter), getDownloadUrl (URL assinada), listByProcess |
| `RetentionService` | authorizeDisposal, placeHold, runCleanup (job), overview |
| `InventoryService` | createMaterial, registerMovement (idempotente), setMinimum, listLevels, listMovements, reconcile; internos: apply/reserve/release/dispatchReserved |
| `TransferService` | request, advance (reserva ao aprovar; baixa/entrada no trânsito/recebimento), list, get |
| `AtaService` | create (rascunho), activate, extend (1×), setAllocations, get, list; internos: commit/release |
| `ContractService` | create, addAmendment (histórico anterior/novo), get, list |
| `PurchaseRequestService` | create, send/analyze/approve/reject/cancel/reopen, receive (idempotente por `receiptKey`), list, get |
| `SupplierService` | create, update (CNPJ único), list |
| `MeetingService` | schedule, changeStatus, saveMinutes, addActionItem, list, get |
| `NotificationService` | generateExpiryAlerts (job; marcos 90/60/30/15/7/0), listMine, markRead |
| `ReportService` | operationalSummary |
| `AuditService` | record, list |

Padrão de erro: `{ ok:false, code, message, fieldErrors? }`. Server Actions convertem em `ActionState` (`success`/`error`).
