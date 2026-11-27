# Graph Report - warleysales-atas-push  (2026-11-27)

## Corpus Check
- 618 files · ~290,530 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 3706 nodes · 13092 edges · 164 communities (131 shown, 33 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 463 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cb5a4128`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- runAction
- container.ts
- lucide-react
- pdf.ts
- process-attachment-sheet.tsx
- home-overview.test.tsx
- SupabasePurchaseRequestRepository
- MeetingRepository
- stock.ts
- Global Constraints
- ProcessFormalization
- public.purchase_requests
- apply_all.sql
- alert-source.ts
- Tarefas
- purchases/service.ts
- Actor
- InMemoryAuditRepository
- vitest
- documentation-tab.tsx
- package.json
- purchases/service.test.ts
- calendario/page.tsx
- orders/service.ts
- getSession
- unwrap
- anon
- solicitacoes/[id]/page.tsx
- can
- public.purchase_requests
- toFortalezaDate
- next
- public.profiles
- processes/service.ts
- lucide-react
- validity.ts
- inventory/service.ts
- InMemoryPurchaseRequestRepository
- 20261102000006_fk_indexes.sql
- MaterialOrder
- process-view.tsx
- createMemoryRepositories
- atas.ts
- groq.ts
- AuditEntry
- Proposta funcional — página inicial Warley Gestão Operacional
- transfers/schemas.ts
- policy.ts
- db.ts
- new-contract-form.tsx
- Global Constraints
- inventory/repository.memory.ts
- auth-stage.tsx
- simple-table.tsx
- notifications/service.ts
- email-delivery.ts
- log
- meeting-media-panel.tsx
- createSessionClient
- SupabaseContractRepository
- navigation.ts
- components.json
- identity/service.ts
- process-history.ts
- RetentionRepository
- order.ts
- processos/page.tsx
- compilerOptions
- toast-store.ts
- callRpc
- compilerOptions
- callback-server.mjs
- gsap
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- InMemoryNotificationRepository
- callback-app/app/layout.tsx
- ok
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- transfer.ts
- whatsapp.ts
- PDFReport
- zod
- Global Constraints
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- time.ts
- balance.ts
- Button
- public.spec.ts
- Arquitetura (estado atual da implementação)
- @playwright/test
- cnpj.ts
- eslint.config.mjs
- repositories.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- bundle-migrations.mjs
- atas/service.ts
- notification-destination.ts
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- direct-upload.test.ts
- calendar-report-panel.tsx
- council-picker.tsx
- Execução local, deploy e backups
- getServiceClient
- Button
- Validação realmente executada
- atas-de-reuniao-operacao.md
- Checklist de execução
- Execução dos blocos 1 e 2
- identity.ts
- Pendências e limitações conhecidas
- Relatório de alterações recentes
- Plano de testes
- Graphify neste repositório
- E2E
- Warleysales — Prontidão para produção
- Avisos de vencimento por e-mail
- README.md
- Documento de Design Técnico: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões
- AGENTS.md
- Relatórios em PDF
- 12-orgaos-e-empresas.md
- 02-permissoes.md
- 09-reunioes-audio.md
- 10-cadastro-contrato-pdf.md
- service-support.ts
- check-supabase.mjs
- diffInDays
- Auditoria de desempenho do Warley
- 20261110000003_material_orders.sql
- movement-form.tsx
- processes.ts
- identity/actions.ts

## God Nodes (most connected - your core abstractions)
1. `ok()` - 302 edges
2. `fail()` - 232 edges
3. `Result` - 206 edges
4. `Actor` - 134 edges
5. `next` - 123 edges
6. `vitest` - 114 edges
7. `react` - 99 edges
8. `runAction()` - 86 edges
9. `can()` - 82 edges
10. `unwrap()` - 80 edges

## Surprising Connections (you probably didn't know these)
- `Task 3: Orquestração na Criação de Solicitação (`createProcess`)` --references--> `ProcessService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-solicitacao-processo-anexagem.md → src/modules/processes/service.ts
- `Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação` --references--> `InventoryService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/inventory/service.ts
- `Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado)` --references--> `InventoryService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/inventory/service.ts
- `Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters)` --references--> `AuditFilter`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda2-pedidos-justificativas-auditoria.md → src/modules/audit/schemas.ts
- `Task 4: Formulário de Nova Solicitação e Server Action` --references--> `createRequestFormAction()`  [INFERRED]
  docs/superpowers/plans/2026-11-10-solicitacao-processo-anexagem.md → src/modules/purchases/actions.ts

## Import Cycles
- None detected.

## Communities (164 total, 33 thin omitted)

### Community 0 - "runAction"
Cohesion: 0.06
Nodes (55): Option, Option, ataStepFormAction(), createAtaFormAction(), linkAtaProcessFormAction(), optionalId(), processReturnPath(), readProcessItems() (+47 more)

### Community 1 - "container.ts"
Cohesion: 0.08
Nodes (20): Contratos de serviço, Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.2. Serviços e Ações, 3.3. Repositório e Camada de Domínio, AuditRecorder, StoragePort, FormalizationRepository, CouncilService (+12 more)

### Community 2 - "lucide-react"
Cohesion: 0.08
Nodes (45): 5. Componentes existentes a reutilizar e mudanças propostas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, lucide-react, weekdays, ApprovalQueueProps, PendingApprovalItem, CouncilWorkspace(), DashboardFilters() (+37 more)

### Community 3 - "pdf.ts"
Cohesion: 0.17
Nodes (21): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+13 more)

### Community 4 - "process-attachment-sheet.tsx"
Cohesion: 0.16
Nodes (15): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, Sheet(), SheetClose() (+7 more)

### Community 5 - "home-overview.test.tsx"
Cohesion: 0.40
Nodes (4): baseAtas, baseContracts, baseDeliveries, baseStock

### Community 6 - "SupabasePurchaseRequestRepository"
Cohesion: 0.23
Nodes (6): AtomicDecision, AtomicReceipt, LinkedRequestNotesRow, SupabasePurchaseRequestRepository, toRequest(), rpcOutcomeToResult()

### Community 7 - "MeetingRepository"
Cohesion: 0.09
Nodes (5): InMemoryContractRepository, FailingRepository, input, InMemoryMeetingRepository, MeetingDetails

### Community 8 - "stock.ts"
Cohesion: 0.24
Nodes (17): none, applyMovement(), availableOf(), dispatchReservedStock(), INCREASING, MovementOutcome, physicalFromLedger(), provisionBlocked() (+9 more)

### Community 9 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

### Community 10 - "ProcessFormalization"
Cohesion: 0.10
Nodes (21): calculateSavings(), contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType (+13 more)

### Community 11 - "public.purchase_requests"
Cohesion: 0.04
Nodes (55): public.append_commitment_event(), public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), public.save_contract(), public.save_purchase_request(), trg_ata_commitments_immutable, trg_ata_extensions_immutable (+47 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.04
Nodes (104): administrative_processes_responsible_id_idx, calendar_appointments_scope_date_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_lines_contract_idx, contracts_ata_id_idx, council_memberships_one_director (+96 more)

### Community 13 - "alert-source.ts"
Cohesion: 0.15
Nodes (8): RepositoryAlertSource, AlertEntityType, AlertMilestone, AlertSource, NotificationRepository, AppNotification, ExpiringItem, NotificationRow

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.07
Nodes (37): 6. Estratégia de Testes, Props, changeMeetingStatus(), MEETING_TRANSITIONS, PurchaseRequest, PurchaseRequestEvent, RequestStatus, applyReceipt() (+29 more)

### Community 16 - "Actor"
Cohesion: 0.14
Nodes (13): MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting, meetingDetailsSchema, MeetingMinutes, minutesSchema (+5 more)

### Community 17 - "InMemoryAuditRepository"
Cohesion: 0.19
Nodes (21): InMemoryAtaRepository, setup(), InMemoryAuditRepository, AuditService, setup(), setup(), InMemoryDocumentRepository, setup() (+13 more)

### Community 18 - "vitest"
Cohesion: 0.10
Nodes (35): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+27 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.08
Nodes (52): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+44 more)

### Community 20 - "package.json"
Cohesion: 0.12
Nodes (21): shadcn@^4.23.0, tw-animate-css@^1.4.0, devDependencies, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5, @types/react@^19, @types/react-dom@^19 (+13 more)

### Community 21 - "purchases/service.test.ts"
Cohesion: 0.15
Nodes (10): InMemoryStorage, createProcessWithProgress(), Ctx, PDF, approver(), ataItem(), manager(), stockOf() (+2 more)

### Community 22 - "calendario/page.tsx"
Cohesion: 0.06
Nodes (43): MonthDialog(), MonthDialogProps, citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME (+35 more)

### Community 23 - "orders/service.ts"
Cohesion: 0.14
Nodes (16): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros (+8 more)

### Community 24 - "getSession"
Cohesion: 0.15
Nodes (19): pdf-lib@^1.17.1, pdf-lib, GET(), GET(), GET(), Home(), RedirectHome(), DetailedReport (+11 more)

### Community 25 - "unwrap"
Cohesion: 0.11
Nodes (7): SupabaseNotificationRepository, SupabaseMaterialOrderRepository, SupabaseDocumentRepository, toAttachment(), SupabaseRetentionRepository, toIso(), unwrap()

### Community 26 - "anon"
Cohesion: 0.09
Nodes (43): administrative_processes_responsible_membership, check_staff_membership, private.check_process_responsible_membership(), private.check_staff_membership(), private.has_council_access(), private.has_council_role(), private.has_request_access(), public.administrative_processes (+35 more)

### Community 27 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.13
Nodes (22): buildStockEntrySources(), RECEIVABLE, StockEntryItem, Content(), metadata, RequestPage(), assertContractAllowsReceive(), contractedQuantityByAtaItem() (+14 more)

### Community 28 - "can"
Cohesion: 0.16
Nodes (10): FormalizationService, SavingsSummary, saveProcessValidityStartDate(), authorize(), can(), PermissionAction, readableCouncilIds(), admin (+2 more)

### Community 29 - "public.purchase_requests"
Cohesion: 0.13
Nodes (27): contract_ata_items_ata_item_id_idx, contract_receipt_line_integrity, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_stock_balances_material_id, private.business_error(), private.check_contract_ata_process(), private.check_contract_receipt_line() (+19 more)

### Community 30 - "toFortalezaDate"
Cohesion: 0.23
Nodes (14): auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, first(), kinds, parseDetailedFilter() (+6 more)

### Community 31 - "next"
Cohesion: 0.06
Nodes (45): nextConfig, next, react, LINKS, metadata, ACTION_LABEL, metadata, metadata (+37 more)

### Community 32 - "public.profiles"
Cohesion: 0.10
Nodes (35): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+27 more)

### Community 33 - "processes/service.ts"
Cohesion: 0.06
Nodes (51): Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), DocumentRepository (+43 more)

### Community 34 - "lucide-react"
Cohesion: 0.09
Nodes (80): AdministrationPage(), Content(), Content(), RetentionPage(), Content(), UsersPage(), AlertsPage(), Content() (+72 more)

### Community 35 - "validity.ts"
Cohesion: 0.31
Nodes (10): ATA_INITIAL_YEARS, ATA_LEGAL_BASIS, ATA_MAX_EXTENSIONS, AtaValidityStatus, ataValidityStatus(), computeInitialEndDate(), currentEndDate(), requestExtension() (+2 more)

### Community 36 - "inventory/service.ts"
Cohesion: 0.17
Nodes (15): StockSectionProps, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel, stockLevelLabel, MovementType, createMaterialSchema (+7 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (39): on_auth_user_created, public.handle_new_user(), public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code (+31 more)

### Community 39 - "MaterialOrder"
Cohesion: 0.06
Nodes (39): CouncilWorkspaceProps, handleApprove(), handleConfirmReject(), AvailableStockItem, MaterialOrderDialog(), MaterialOrderDialogProps, MaterialOrderForm(), handleSubmit() (+31 more)

### Community 40 - "process-view.tsx"
Cohesion: 0.08
Nodes (33): ArchiveProcessAction(), ProcessActions(), ProcessActionsProps, PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown() (+25 more)

### Community 41 - "createMemoryRepositories"
Cohesion: 0.12
Nodes (5): InMemoryCouncilRepository, InMemoryMembershipRepository, InMemoryTransferRepository, setup(), createMemoryRepositories()

### Community 42 - "atas.ts"
Cohesion: 0.19
Nodes (5): CommitmentEvent, CommitmentRow, SupabaseAtaRepository, toCommitment(), toPayload()

### Community 43 - "groq.ts"
Cohesion: 0.08
Nodes (35): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build) (+27 more)

### Community 44 - "AuditEntry"
Cohesion: 0.18
Nodes (10): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange() (+2 more)

### Community 45 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.12
Nodes (15): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação (+7 more)

### Community 46 - "transfers/schemas.ts"
Cohesion: 0.21
Nodes (9): TransferStatus, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferEvent, TransferItem, TransferRow (+1 more)

### Community 47 - "policy.ts"
Cohesion: 0.08
Nodes (35): AuditPage(), AuditPageProps, Content(), metadata, one(), Content(), ContractPage(), metadata (+27 more)

### Community 48 - "db.ts"
Cohesion: 0.14
Nodes (23): @supabase/supabase-js, AtaStatus, AtaRow, toAta(), ContractRow, BalanceRow, MaterialRow, toMovement() (+15 more)

### Community 49 - "new-contract-form.tsx"
Cohesion: 0.11
Nodes (20): matchPdfItems(), NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption, CloseContractForm() (+12 more)

### Community 50 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 51 - "inventory/repository.memory.ts"
Cohesion: 0.33
Nodes (8): StockBalance, keyOf(), StockKey, StockMutation, StockRow, StockState, MovementRecord, ReconciliationIssue

### Community 52 - "auth-stage.tsx"
Cohesion: 0.26
Nodes (6): AuthLayout(), NotFound(), AuthStage(), PILLARS, BrandMark(), BrandMarkProps

### Community 53 - "simple-table.tsx"
Cohesion: 0.05
Nodes (85): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, MaterialOrdersSection() (+77 more)

### Community 54 - "notifications/service.ts"
Cohesion: 0.30
Nodes (8): ALERT_MILESTONES, AlertCandidate, dedupKey(), DueAlert, reachedMilestone(), selectDueAlerts(), AlertRunSummary, markReadSchema

### Community 55 - "email-delivery.ts"
Cohesion: 0.26
Nodes (6): digestMessage(), dispatchNotificationEmails(), EmailDispatchSummary, EmailMessage, EmailSender, groupByRecipient()

### Community 56 - "log"
Cohesion: 0.12
Nodes (16): GET, GET, provisionCouncilAccess(), schema, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createSupabaseJobRunRepository() (+8 more)

### Community 57 - "meeting-media-panel.tsx"
Cohesion: 0.24
Nodes (7): MeetingFile(), getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio(), MeetingOption, meetingAudioUrlAction()

### Community 58 - "createSessionClient"
Cohesion: 0.09
Nodes (21): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências, Fluxos atuais e ideais (+13 more)

### Community 59 - "SupabaseContractRepository"
Cohesion: 0.27
Nodes (3): SupabaseContractRepository, toContract(), toPayload()

### Community 60 - "navigation.ts"
Cohesion: 0.09
Nodes (31): NavigationFixture(), AuthenticatedShell(), AppLayout(), STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, AccessContext, ALL_ROLES, COUNCIL_ROLE_LABELS (+23 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "identity/service.ts"
Cohesion: 0.11
Nodes (11): CouncilRepository, MembershipRepository, Council, ProfileSummary, assignMembershipSchema, councilFields, createCouncilSchema, MembershipDirectory (+3 more)

### Community 63 - "process-history.ts"
Cohesion: 0.15
Nodes (15): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ADDITIONAL_DOCUMENT_TYPE_CODES (+7 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "order.ts"
Cohesion: 0.20
Nodes (9): approveOrder, cancelOrder, changeOrderStatus, CreateMaterialOrderDomainInput, createOrder, CreateOrderItemDomainInput, MATERIAL_ORDER_TRANSITIONS, rejectOrder (+1 more)

### Community 66 - "processos/page.tsx"
Cohesion: 0.39
Nodes (6): ApprovalQueue(), Content(), metadata, ProcessesPage(), planExpiryFromNotes(), processDisplayStatus()

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.19
Nodes (11): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), showToast(), ToastKind (+3 more)

### Community 69 - "callRpc"
Cohesion: 0.15
Nodes (9): MeetingStatus, MeetingRow, SupabaseMeetingRepository, toMeeting(), toPayload(), toNotification(), toPayload(), callRpc() (+1 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "gsap"
Cohesion: 0.40
Nodes (4): gsap@^3.15.0, @gsap/react@^2.1.2, gsap, @gsap/react

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 76 - "ok"
Cohesion: 0.09
Nodes (11): Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), Material, InventoryService, parseProcessNumber(), InMemorySupplierRepository, SupplierRepository, Supplier, SupplierService (+3 more)

### Community 77 - "ActionForm"
Cohesion: 0.09
Nodes (46): RetentionForms(), MembershipForms(), ProvisionCouncilForm(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), AmendmentForm(), MinimumForm() (+38 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.05
Nodes (60): mammoth, xlsx, assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv() (+52 more)

### Community 80 - "transfer.ts"
Cohesion: 0.43
Nodes (6): changeTransferStatus(), HOLDS_RESERVATION, receiveEffect(), stockEffectFor(), TRANSFER_TRANSITIONS, TransferStockEffect

### Community 81 - "whatsapp.ts"
Cohesion: 0.48
Nodes (5): formatWhatsapp(), onlyDigits(), parseWhatsapp(), whatsappHref(), WhatsappParse

### Community 83 - "zod"
Cohesion: 0.06
Nodes (41): dependencies, ai@^7.0.159, @ai-sdk/groq@^4.0.74, @base-ui/react@^1.9.0, cn@^0.5.2, lucide-react@^1.66.0, mammoth@^1.13.0, next@16.4.6 (+33 more)

### Community 84 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem"
Cohesion: 0.13
Nodes (14): 1. Visão Geral e Contexto, 2. Requisitos e Casos de Uso, 3.1. Banco de Dados (PostgreSQL / Supabase), 3.2. Sequenciamento de Processos (`nextProcessNumber`), 3. Arquitetura e Modelo de Dados, 4.1. Formulário em `/solicitacoes/nova`, 4.2. Card em `/solicitacoes/[id]`, 4. Design de Interface (UI/UX) (+6 more)

### Community 87 - "public.record_meeting_evidence"
Cohesion: 0.14
Nodes (16): public.save_meeting(), idx_meeting_action_items_meeting_id, idx_meeting_action_items_responsible_id, idx_meetings_created_by, idx_meetings_minutes_registered_by, keep_meeting_task_completion, private.keep_meeting_task_completion(), public.meeting_attendance (+8 more)

### Community 88 - "2. Requisitos e Casos de Uso"
Cohesion: 0.14
Nodes (13): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, UC-01: Registro do Valor Estimado e Bloqueio de Estoque (+5 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.12
Nodes (15): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+7 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "time.ts"
Cohesion: 0.10
Nodes (41): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), AgendaBoard(), dateLabel() (+33 more)

### Community 92 - "balance.ts"
Cohesion: 0.23
Nodes (12): CommitmentEventType, CommitRequest, computeAtaBalance(), setBlocked(), calculateStockSummary(), PERCENT_SCALE, percentage(), QUANTITY_SCALE (+4 more)

### Community 93 - "Button"
Cohesion: 0.05
Nodes (64): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, class-variance-authority@^0.7.1, @base-ui/react, class-variance-authority, cn, react-dom, AtaBalanceRow, NewContractForm() (+56 more)

### Community 94 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 95 - "Arquitetura (estado atual da implementação)"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 96 - "@playwright/test"
Cohesion: 0.17
Nodes (6): destinations, @playwright/test@^1.65.1, envFiles, envNames, isolatedEnv, @playwright/test

### Community 97 - "cnpj.ts"
Cohesion: 0.38
Nodes (7): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits(), createSupplierSchema, supplierFields, updateSupplierSchema

### Community 98 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.6, eslint, eslint-config-next

### Community 99 - "repositories.ts"
Cohesion: 0.10
Nodes (5): SupabaseInventoryRepository, SupabaseStorage, SupabaseSupplierRepository, SupabaseTransferRepository, createSupabaseRepositories()

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

### Community 112 - "atas/service.ts"
Cohesion: 0.12
Nodes (14): AtaBalance, CouncilAllocation, validateAllocations(), validateCommitment(), AtaRepository, ataIdSchema, AtaItem, createAtaSchema (+6 more)

### Community 113 - "notification-destination.ts"
Cohesion: 0.36
Nodes (7): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract

### Community 114 - "Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria"
Cohesion: 0.18
Nodes (10): 1. Contexto e Objetivos, 2.1 Modelo de Dados (Supabase Migration), 2.2 Regras de Negócio e Domínio de Estoque, 2.3 Interfaces de Usuário para Pedidos, 2. Subsistema 1: Pedidos de Materiais (`material_orders`), 4.1 Expansão dos Filtros de Auditoria (`AuditService.list`), 4.2 Reformulação da Página de Relatórios (`/relatorios`), 4. Subsistema 3: Trilha de Auditoria Multidimensional & Relatórios Consolidados (+2 more)

### Community 115 - "Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos"
Cohesion: 0.18
Nodes (10): 1. Contexto e Diagnóstico dos Problemas Atuais, 2. Objetivos do Redesign, 3.1 Cabeçalho & Régua de 4 Métricas (`ProcessHeader`), 3.2 Aba 1: `📁 Documentação (7+N)` (`ProcessDocumentationTab`), 3.3 Aba 2: `🤝 Contratação, Atas & Economia` (`ProcessContractingTab`), 3.4 Aba 3: `⚙️ Governança & Histórico` (`ProcessGovernanceTab`), 3. Arquitetura da Solução e Componentes, 4. Garantia de Compatibilidade e Invariantes (+2 more)

### Community 116 - "Global Constraints"
Cohesion: 0.20
Nodes (9): Global Constraints, Redesign Visual da Página de Processos — Plano de Implementação, Task 1: Componente de Topo Executivo e Régua de Métricas (`ProcessHeader`), Task 2: Linha Compacta de Documento (`CompactDocumentRow`), Task 3: Aba 1 — Pasta Documental (`DocumentationTab`), Task 4: Ajustar Alinhamento do Formulário em `FormalizationCard` e Criar Aba 2 (`ContractingTab`), Task 5: Aba 3 — Governança e Histórico (`GovernanceTab`), Task 6: Orquestração da Página Principal com Tabs (`/processos/[id]/page.tsx`) (+1 more)

### Community 117 - "Plano de testes e validação UX"
Cohesion: 0.20
Nodes (9): Camadas e evidência, E2E e navegação, Estado da execução, Estados e segurança, Gate de baseline técnica, Integridade backend prioritária, Matriz navegador e acessibilidade, Plano de testes e validação UX (+1 more)

### Community 118 - "direct-upload.test.ts"
Cohesion: 0.50
Nodes (4): declared(), newProcess(), PDF, sha()

### Community 119 - "calendar-report-panel.tsx"
Cohesion: 0.67
Nodes (3): CalendarReportPanel(), CalendarReportPanelProps, CalendarReport

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "getServiceClient"
Cohesion: 0.14
Nodes (18): GET, draftSchema, GET(), maxDuration, saveAudio(), submit(), work(), confirmMeetingAudioAction() (+10 more)

### Community 124 - "Button"
Cohesion: 0.08
Nodes (42): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), ProductField(), ProductFieldProps, exactProduct() (+34 more)

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 131 - "identity.ts"
Cohesion: 0.13
Nodes (8): MembershipRecord, StaffCategory, CouncilRow, SupabaseCouncilRepository, SupabaseMembershipRepository, toCouncil(), toRow(), isUniqueViolation()

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 135 - "Relatório de alterações recentes"
Cohesion: 0.33
Nodes (5): Alterações locais ainda não commitadas, Confirmado em commits, Evidências e limite de autoria, Relatório de alterações recentes, Validação comprovada

### Community 136 - "Plano de testes"
Cohesion: 0.40
Nodes (4): Ainda faltam, Automatizados (rodam sem banco): `npm run typecheck && npm test && npm run lint && npm run build`, Plano de testes, SQL/RLS/concorrência (executados em Postgres 16 local com stub do Supabase)

### Community 137 - "Graphify neste repositório"
Cohesion: 0.40
Nodes (4): Atualizar após mudanças de código, Consultar antes de abrir muitos arquivos, Graphify neste repositório, Preparar no Windows

### Community 138 - "E2E"
Cohesion: 0.40
Nodes (4): E2E, Escopo e limites, Fixture de callback e configuração, Resultados estabilizados

### Community 139 - "Warleysales — Prontidão para produção"
Cohesion: 0.18
Nodes (9): Checklist antes de autorizar publicação, Compatibilidade e ordem de migrations, Conferência no Dashboard, Controle de versão, Evidências do ensaio antes da autorização, Execuções e correções, Funcionamento local, Matriz para reconciliar com produção (+1 more)

### Community 140 - "Avisos de vencimento por e-mail"
Cohesion: 0.50
Nodes (3): Avisos de vencimento por e-mail, Configuração, Entrega e limites

### Community 141 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 142 - "Documento de Design Técnico: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões"
Cohesion: 0.15
Nodes (12): 1. Contexto e Objetivos, 2.1 Modelo de Dados e Banco (Supabase Migration), 2.2 Domínio de Processos e Cálculo de Progresso, 2.3 Interface do Usuário (UI), 2. Subsistema 1: Artefatos Adicionais nos Processos Administrativos, 3.1 Unificação dos Grupos de Navegação (`src/shared/lib/authz/navigation.ts`), 3. Subsistema 2: Centralização da Navegação e Nomenclatura Institucional, 4.1 KPIs e Indicadores no Topo de `/reunioes` (+4 more)

### Community 150 - "service-support.ts"
Cohesion: 0.10
Nodes (20): contractedMaterialsByProcess(), HoldItemInput, HoldRow, AtaView, ContractRepository, addAmendmentSchema, closeContractSchema, Contract (+12 more)

### Community 151 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 155 - "diffInDays"
Cohesion: 0.26
Nodes (11): AtaExtension, ExtensionRequest, original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms, currentTerms() (+3 more)

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.36
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.16
Nodes (15): 3.1 Encerramento de Processo com Documentação Parcial, 3.2 Recebimento de Materiais com Saldo Pendente, 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%), StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line (+7 more)

### Community 180 - "processes.ts"
Cohesion: 0.23
Nodes (9): AttachmentForProgress, DocumentTypeCode, AttachmentRow, SnapshotJson, snapshotToJson(), SupabaseProcessRepository, toProcess(), toProcessChanges() (+1 more)

### Community 197 - "identity/actions.ts"
Cohesion: 0.16
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 951 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `runAction`, `container.ts`, `lucide-react`, `identity.ts`, `SupabasePurchaseRequestRepository`, `stock.ts`, `purchases/service.ts`, `Actor`, `InMemoryAuditRepository`, `vitest`, `documentation-tab.tsx`, `purchases/service.test.ts`, `service-support.ts`, `orders/service.ts`, `diffInDays`, `can`, `solicitacoes/[id]/page.tsx`, `toFortalezaDate`, `next`, `processes/service.ts`, `lucide-react`, `validity.ts`, `inventory/service.ts`, `atas.ts`, `groq.ts`, `policy.ts`, `db.ts`, `inventory/repository.memory.ts`, `processes.ts`, `notifications/service.ts`, `log`, `meeting-media-panel.tsx`, `identity/service.ts`, `order.ts`, `processos/page.tsx`, `identity/actions.ts`, `ActionForm`, `transfer.ts`, `time.ts`, `balance.ts`, `Button`, `repositories.ts`, `atas/service.ts`, `getServiceClient`, `Button`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `runAction` be split into smaller, more focused modules?**
  _Cohesion score 0.06354642313546423 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `lucide-react`, `pdf.ts`, `process-attachment-sheet.tsx`, `home-overview.test.tsx`, `MeetingRepository`, `stock.ts`, `ProcessFormalization`, `purchases/service.ts`, `InMemoryAuditRepository`, `documentation-tab.tsx`, `package.json`, `purchases/service.test.ts`, `service-support.ts`, `calendario/page.tsx`, `orders/service.ts`, `getSession`, `diffInDays`, `solicitacoes/[id]/page.tsx`, `can`, `toFortalezaDate`, `next`, `processes/service.ts`, `validity.ts`, `MaterialOrder`, `process-view.tsx`, `groq.ts`, `movement-form.tsx`, `policy.ts`, `new-contract-form.tsx`, `simple-table.tsx`, `notifications/service.ts`, `email-delivery.ts`, `log`, `createSessionClient`, `navigation.ts`, `process-history.ts`, `callback-server.mjs`, `ok`, `import-pca-crcpi-2027.mjs`, `transfer.ts`, `whatsapp.ts`, `zod`, `time.ts`, `Button`, `cnpj.ts`, `notification-destination.ts`, `direct-upload.test.ts`, `getServiceClient`, `Button`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `container.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07826694619147449 - nodes in this community are weakly interconnected._
- **Why does `fail()` connect `ok` to `runAction`, `container.ts`, `identity.ts`, `SupabasePurchaseRequestRepository`, `stock.ts`, `purchases/service.ts`, `Actor`, `InMemoryAuditRepository`, `vitest`, `documentation-tab.tsx`, `purchases/service.test.ts`, `service-support.ts`, `orders/service.ts`, `diffInDays`, `can`, `solicitacoes/[id]/page.tsx`, `toFortalezaDate`, `next`, `processes/service.ts`, `lucide-react`, `validity.ts`, `inventory/service.ts`, `atas.ts`, `groq.ts`, `policy.ts`, `db.ts`, `inventory/repository.memory.ts`, `processes.ts`, `notifications/service.ts`, `log`, `meeting-media-panel.tsx`, `identity/service.ts`, `order.ts`, `identity/actions.ts`, `ActionForm`, `transfer.ts`, `time.ts`, `balance.ts`, `Button`, `repositories.ts`, `atas/service.ts`, `getServiceClient`, `Button`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.07514124293785311 - nodes in this community are weakly interconnected._