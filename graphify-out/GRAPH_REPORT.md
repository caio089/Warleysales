# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 624 files · ~287,885 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3764 nodes · 12991 edges · 189 communities (145 shown, 44 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 463 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6e295900`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Actor
- InventoryService
- solicitacoes/[id]/page.tsx
- pdf.ts
- navigation.ts
- vitest
- adapters/purchases.ts
- formalizations/service.test.ts
- inventory/service.ts
- Button
- formalization-card.tsx
- identity/service.ts
- apply_all.sql
- notifications/service.ts
- Tarefas
- formatCurrency
- dashboard/page.tsx
- public.create_contract_with_ata
- overview-lists.tsx
- documentation-tab.tsx
- package.json
- request-facets.ts
- transfers/schemas.ts
- meetings/service.ts
- runAction
- unwrap
- public.correct_purchase_request
- utils.ts
- public.forbid_mutation
- public.purchase_requests
- policy.ts
- lucide-react
- 20261102000002_domain_tables.sql
- 20261116000001_notification_emails.sql
- processes/schemas.ts
- council-workspace.tsx
- public.purchase_requests
- Button
- 20261102000006_fk_indexes.sql
- MaterialOrder
- membership-forms.tsx
- getSession
- identity.ts
- groq.ts
- toFortalezaDate
- inventory.ts
- private.business_error
- react
- public.profiles
- AuditEntry
- movement-form.tsx
- formalization-card.tsx
- @playwright/test
- data-table-logic.ts
- file-validation.ts
- request-template.ts
- handler.ts
- Screen
- createSessionClient
- documents/service.ts
- public.stock_movements
- components.json
- ok
- process-history.ts
- RetentionRepository
- request-status.ts
- public.receive_purchase_request_for_contract
- compilerOptions
- toast-store.ts
- filters.tsx
- compilerOptions
- callback-server.mjs
- public.contracts
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- result.ts
- next
- fail
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- 20261110000003_material_orders.sql
- pg_temp.act_as
- PDFReport
- analysis.ts
- public.councils
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- calendario/page.tsx
- agenda-board.tsx
- process-view.tsx
- 20261126020200_process_assignment_contract_closure.sql
- Arquitetura (estado atual da implementação)
- public.spec.ts
- cnpj.ts
- Fluxos atuais e ideais
- repositories.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- Global Constraints
- atas/service.ts
- formalization-queue.tsx
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- toFortalezaDate
- ok
- Global Constraints
- Execução local, deploy e backups
- media-actions.ts
- db.ts
- Input
- bundle-migrations.mjs
- Validação realmente executada
- atas-de-reuniao-operacao.md
- Global Constraints
- Checklist de execução
- Execução dos blocos 1 e 2
- analysis.ts
- Pendências e limitações conhecidas
- auth.users
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
- processes/service.ts
- check-supabase.mjs
- 002_validacao_sem_pgtap.sql
- progress.ts
- 003_fluxos_atomicos.sql
- atas/service.ts
- Auditoria de desempenho do Warley
- private.validate_meeting_details
- public.attachments
- ref_node_fs
- compact-document-row.test.tsx
- Material
- file-upload.tsx
- document-types.ts
- processes.ts
- Global Constraints
- cleanup-eligibility.ts
- StoragePort
- validate-corrections.mjs
- playwright.config.ts
- ref_server_only

## God Nodes (most connected - your core abstractions)
1. `ok()` - 300 edges
2. `fail()` - 232 edges
3. `Result` - 206 edges
4. `Actor` - 134 edges
5. `next` - 121 edges
6. `vitest` - 112 edges
7. `react` - 98 edges
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
- `Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`)` --references--> `BriefingFacts`  [INFERRED]
  docs/superpowers/plans/2026-11-11-redesign-visao-geral-e-meu-painel.md → src/modules/insights/briefing.ts
- `Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters)` --references--> `AuditFilter`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda2-pedidos-justificativas-auditoria.md → src/modules/audit/schemas.ts

## Import Cycles
- None detected.

## Communities (189 total, 44 thin omitted)

### Community 0 - "Actor"
Cohesion: 0.13
Nodes (8): 3.3. Repositório e Camada de Domínio, Props, changeRequestStatus(), PurchaseRequestStatus, PurchaseRequest, PurchaseRequestService, RequestRow, Result

### Community 1 - "InventoryService"
Cohesion: 0.17
Nodes (35): Contratos de serviço, Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), 3.2. Serviços e Ações, InMemoryAtaRepository, AtaService, setup(), InMemoryAuditRepository, AuditService (+27 more)

### Community 2 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.12
Nodes (26): buildStockEntrySources(), RECEIVABLE, StockEntryItem, Content(), metadata, RequestPage(), Fact(), PlanDossierCard() (+18 more)

### Community 3 - "pdf.ts"
Cohesion: 0.17
Nodes (21): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+13 more)

### Community 4 - "navigation.ts"
Cohesion: 0.06
Nodes (40): NavigationFixture(), AuthenticatedShell(), AppLayout(), AuthLayout(), LoginPage(), metadata, metadata, RecoveryPage() (+32 more)

### Community 5 - "vitest"
Cohesion: 0.09
Nodes (37): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+29 more)

### Community 6 - "adapters/purchases.ts"
Cohesion: 0.11
Nodes (13): AtomicDecision, AtomicReceipt, ContractRow, SupabaseContractRepository, toContract(), toPayload(), LinkedRequestNotesRow, SupabasePurchaseRequestRepository (+5 more)

### Community 7 - "formalizations/service.test.ts"
Cohesion: 0.05
Nodes (19): InMemoryContractRepository, FailingRepository, InMemoryStorage, createProcessWithProgress(), Ctx, PDF, InMemoryCouncilRepository, InMemoryInventoryRepository (+11 more)

### Community 8 - "inventory/service.ts"
Cohesion: 0.10
Nodes (42): CommitmentEventType, CommitRequest, computeAtaBalance(), validateAllocations(), validateCommitment(), none, classifyStockLevel(), CRITICAL_RATIO (+34 more)

### Community 9 - "Button"
Cohesion: 0.12
Nodes (27): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, FormalizationQueue(), handleQuickHomologate(), FormalizationQueueProps, INSTRUMENT_LABELS, PendingFormalizationItem, auctionLabel(), FormalizationCard() (+19 more)

### Community 10 - "formalization-card.tsx"
Cohesion: 0.10
Nodes (21): contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes (+13 more)

### Community 11 - "identity/service.ts"
Cohesion: 0.11
Nodes (14): AtaRepository, CouncilRepository, MembershipRepository, InMemoryMembershipRepository, assignMembershipSchema, councilFields, createCouncilSchema, MembershipService (+6 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.08
Nodes (41): administrative_processes_responsible_id_idx, idx_administrative_processes_created_by, idx_audit_logs_actor_id, idx_document_cleanup_runs_process_id, idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at (+33 more)

### Community 13 - "notifications/service.ts"
Cohesion: 0.06
Nodes (29): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract, ALERT_MILESTONES (+21 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "formatCurrency"
Cohesion: 0.22
Nodes (11): INSTRUMENT_LABELS, SavingsHistoryDialog(), SavingsHistoryDialogProps, SavingsHistoryItem, SavingsSummaryProps, ProcessHeader(), ProcessHeaderProps, BASE_PROPS (+3 more)

### Community 16 - "dashboard/page.tsx"
Cohesion: 0.11
Nodes (39): Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, ApprovalQueue(), ApprovalQueueProps, PendingApprovalItem, DashboardContent(), DashboardHeading(), DashboardPage(), metadata (+31 more)

### Community 17 - "public.create_contract_with_ata"
Cohesion: 0.08
Nodes (22): public.append_commitment_event(), public.save_ata(), public.save_contract(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, trg_contract_amendments_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate (+14 more)

### Community 18 - "overview-lists.tsx"
Cohesion: 0.36
Nodes (9): DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview(), RequestsOverview(), Row(), RowLink, statusOf() (+1 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.14
Nodes (33): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+25 more)

### Community 20 - "package.json"
Cohesion: 0.05
Nodes (49): eslintConfig, dependencies, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0 (+41 more)

### Community 21 - "request-facets.ts"
Cohesion: 0.14
Nodes (25): Content(), metadata, RequestsPage(), citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes() (+17 more)

### Community 22 - "transfers/schemas.ts"
Cohesion: 0.19
Nodes (9): InMemoryTransferRepository, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferItem, setup(), TransferService (+1 more)

### Community 23 - "meetings/service.ts"
Cohesion: 0.19
Nodes (10): MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, MeetingDetails, meetingDetailsSchema, MeetingMinutes, minutesSchema (+2 more)

### Community 24 - "runAction"
Cohesion: 0.08
Nodes (50): zod, Option, MarkReadForm(), input, saveAppointment(), addAmendmentFormAction(), closeContractFormAction(), createContractFormAction() (+42 more)

### Community 25 - "unwrap"
Cohesion: 0.11
Nodes (9): SupabaseNotificationRepository, toNotification(), SupabaseMaterialOrderRepository, SupabaseRetentionRepository, isUniqueViolation(), toDateOrNull(), toIso(), unwrap() (+1 more)

### Community 26 - "public.correct_purchase_request"
Cohesion: 0.13
Nodes (12): trg_audit_logs_immutable, trg_audit_logs_no_truncate, idx_administrative_processes_created_by, idx_audit_logs_actor_id, private.business_error(), public.correct_purchase_request(), public.set_document_exception(), public.set_process_estimated_value() (+4 more)

### Community 27 - "utils.ts"
Cohesion: 0.15
Nodes (17): react-dom, BigStat(), ChartCard(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, baseAtas (+9 more)

### Community 28 - "public.forbid_mutation"
Cohesion: 0.10
Nodes (30): idx_ata_allocations_council_id, idx_ata_commitments_council_id, idx_ata_extensions_requested_by, idx_ata_items_material_id, idx_price_registration_atas_process_id, idx_price_registration_atas_supplier_id, idx_stock_movements_actor_id, idx_stock_movements_material_id (+22 more)

### Community 29 - "public.purchase_requests"
Cohesion: 0.11
Nodes (29): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_contracts_process_id (+21 more)

### Community 30 - "policy.ts"
Cohesion: 0.11
Nodes (25): Content(), ContractsPage(), metadata, buildHoldRows(), HoldItemInput, HoldRow, Content(), MaterialsPage() (+17 more)

### Community 31 - "lucide-react"
Cohesion: 0.10
Nodes (44): lucide-react, Content(), metadata, UsersPage(), AlertsPage(), Content(), metadata, AtasPage() (+36 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.15
Nodes (29): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+21 more)

### Community 34 - "processes/schemas.ts"
Cohesion: 0.12
Nodes (19): buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, BASE_PROPS, isProcessContractingMode(), needsAta(), PROCESS_CONTRACTING_MODES (+11 more)

### Community 35 - "council-workspace.tsx"
Cohesion: 0.20
Nodes (14): 5. Componentes existentes a reutilizar e mudanças propostas, CouncilWorkspace(), CouncilWorkspaceProps, ActionHub(), ActionItem, buildCouncilActions(), AvailableStockItem, MaterialOrdersSectionProps (+6 more)

### Community 36 - "public.purchase_requests"
Cohesion: 0.10
Nodes (16): public.save_purchase_request(), idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, private.next_request_event_position(), public.cancel_purchase_request(), idx_purchase_requests_process_id (+8 more)

### Community 37 - "Button"
Cohesion: 0.14
Nodes (19): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, openProcessAttachment(), ProcessAttachmentSheet() (+11 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.07
Nodes (20): public.save_meeting(), public.save_transfer(), idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_councils_responsible_user_id, idx_document_cleanup_runs_process_id, idx_meeting_action_items_meeting_id (+12 more)

### Community 39 - "MaterialOrder"
Cohesion: 0.06
Nodes (41): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros (+33 more)

### Community 40 - "membership-forms.tsx"
Cohesion: 0.21
Nodes (12): MembershipForms(), Option, ProvisionCouncilForm(), assignMembershipFormAction(), createCouncilFormAction(), removeMembershipFormAction(), setStaffCategoryFormAction(), updateCouncilFormAction() (+4 more)

### Community 41 - "getSession"
Cohesion: 0.23
Nodes (11): GET(), GET(), Home(), RedirectHome(), config, proxy(), getServices(), getSession() (+3 more)

### Community 42 - "identity.ts"
Cohesion: 0.10
Nodes (10): MembershipRecord, StaffCategory, MembershipDirectory, CouncilRow, MembershipRow, SupabaseCouncilRepository, SupabaseMembershipRepository, toCouncil() (+2 more)

### Community 43 - "groq.ts"
Cohesion: 0.07
Nodes (38): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação (+30 more)

### Community 44 - "toFortalezaDate"
Cohesion: 0.18
Nodes (19): pdf-lib, GET(), auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, DetailedReport (+11 more)

### Community 45 - "inventory.ts"
Cohesion: 0.13
Nodes (17): MovementType, StockBalance, keyOf(), StockKey, StockMutation, StockRow, StockState, createMaterialSchema (+9 more)

### Community 46 - "private.business_error"
Cohesion: 0.21
Nodes (13): idx_stock_balances_material_id, idx_stock_transfer_events_actor_id, idx_stock_transfer_items_material_id, idx_stock_transfers_destination_council_id, idx_stock_transfers_origin_council_id, private.business_error(), private.next_transfer_event_position(), public.advance_transfer() (+5 more)

### Community 47 - "react"
Cohesion: 0.13
Nodes (17): FixtureReady(), FixtureLayout(), react, AdministrationPage(), Content(), LINKS, metadata, GlobalError() (+9 more)

### Community 48 - "public.profiles"
Cohesion: 0.18
Nodes (26): administrative_processes_responsible_membership, check_staff_membership, council_memberships_one_director, idx_profiles_staff_category, idx_retention_holds_created_by, private.check_process_responsible_membership(), private.check_staff_membership(), private.has_council_access() (+18 more)

### Community 49 - "AuditEntry"
Cohesion: 0.19
Nodes (10): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange() (+2 more)

### Community 50 - "movement-form.tsx"
Cohesion: 0.13
Nodes (23): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+15 more)

### Community 51 - "formalization-card.tsx"
Cohesion: 0.08
Nodes (35): AtaBalancePanel(), AtaBalanceRow, matchPdfItems(), NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber() (+27 more)

### Community 53 - "data-table-logic.ts"
Cohesion: 0.07
Nodes (53): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessesTable() (+45 more)

### Community 54 - "file-validation.ts"
Cohesion: 0.21
Nodes (11): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES (+3 more)

### Community 55 - "request-template.ts"
Cohesion: 0.08
Nodes (36): mammoth@^1.13.0, xlsx@^0.18.5, mammoth, xlsx, POST(), GET(), detectRequestDocument(), extractRequestDocumentText() (+28 more)

### Community 56 - "handler.ts"
Cohesion: 0.14
Nodes (12): GET, GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createResendSender(), createSupabaseJobRunRepository() (+4 more)

### Community 57 - "Screen"
Cohesion: 0.30
Nodes (12): kinds, ReportCentral(), AuditContent(), metadata, one(), OperationalContent(), ReportsPage(), ReportsPageProps (+4 more)

### Community 58 - "createSessionClient"
Cohesion: 0.12
Nodes (16): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, UX-17 — Recovery, callback e falha de provedor, ALLOWED_NEXT (+8 more)

### Community 59 - "documents/service.ts"
Cohesion: 0.24
Nodes (11): AttachmentForProgress, Attachment, attachmentIdSchema, isVisibleAttachment(), PreparedUpload, prepareUploadSchema, uploadDocumentSchema, DocumentLinkStatus (+3 more)

### Community 60 - "public.stock_movements"
Cohesion: 0.19
Nodes (9): public.apply_stock_mutation(), trg_stock_movements_immutable, idx_stock_balances_material_id, idx_stock_movements_actor_id, idx_stock_movements_material_id, idx_process_formalizations_council, idx_process_formalizations_status, public.apply_stock_mutation() (+1 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "ok"
Cohesion: 0.07
Nodes (10): Council, ProfileSummary, toRow(), Actor, authorize(), readableCouncilIds(), admin, Role (+2 more)

### Community 63 - "process-history.ts"
Cohesion: 0.36
Nodes (7): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso()

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "request-status.ts"
Cohesion: 0.11
Nodes (23): changeMeetingStatus(), MEETING_TRANSITIONS, changeProcessStatus(), PROCESS_TRANSITIONS, PurchaseRequest, PurchaseRequestEvent, RequestStatus, reopenRejected() (+15 more)

### Community 66 - "public.receive_purchase_request_for_contract"
Cohesion: 0.18
Nodes (4): public.contract_receipt_lines, public.receive_purchase_request_for_contract(), contract_receipt_line_integrity, private.check_contract_receipt_line()

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "filters.tsx"
Cohesion: 0.23
Nodes (10): DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor(), DASHBOARD_FOCUS, DashboardFocus, first(), focusSchema (+2 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "public.contracts"
Cohesion: 0.29
Nodes (8): idx_contracts_supplier_id, contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contracts_ata_id_idx, public.contract_ata_items, public.save_contract(), contract_ata_process_insert, contract_ata_process_update

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "result.ts"
Cohesion: 0.11
Nodes (34): ACTION_LABEL, Content(), metadata, RetentionPage(), buildAtaBalanceRows(), AtaPage(), Content(), metadata (+26 more)

### Community 75 - "next"
Cohesion: 0.12
Nodes (3): nextConfig, next, CouncilPickerProps

### Community 76 - "fail"
Cohesion: 0.10
Nodes (9): Meeting, MeetingService, refreshCompletion(), parseProcessNumber(), AdministrativeProcess, guard(), fail(), internalError() (+1 more)

### Community 77 - "ActionForm"
Cohesion: 0.10
Nodes (46): RetentionForms(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), AmendmentForm(), NewMaterialForm(), MinimumForm(), Option (+38 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "20261110000003_material_orders.sql"
Cohesion: 0.36
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 83 - "analysis.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 84 - "public.councils"
Cohesion: 0.22
Nodes (9): calendar_appointments_scope_date_idx, idx_councils_organization_type, idx_councils_responsible_user_id, idx_process_formalizations_council, idx_process_formalizations_status, public.calendar_appointments, public.councils, public.process_formalizations (+1 more)

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem"
Cohesion: 0.13
Nodes (14): 1. Visão Geral e Contexto, 2. Requisitos e Casos de Uso, 3.1. Banco de Dados (PostgreSQL / Supabase), 3.2. Sequenciamento de Processos (`nextProcessNumber`), 3. Arquitetura e Modelo de Dados, 4.1. Formulário em `/solicitacoes/nova`, 4.2. Card em `/solicitacoes/[id]`, 4. Design de Interface (UI/UX) (+6 more)

### Community 87 - "public.record_meeting_evidence"
Cohesion: 0.20
Nodes (11): idx_profiles_staff_category, keep_meeting_task_completion, private.keep_meeting_task_completion(), public.meeting_attendance, public.meeting_task_completions, public.record_meeting_evidence(), keep_approved_meeting_minutes, meeting_ai_queue (+3 more)

### Community 88 - "2. Requisitos e Casos de Uso"
Cohesion: 0.14
Nodes (13): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, UC-01: Registro do Valor Estimado e Bloqueio de Estoque (+5 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.12
Nodes (15): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+7 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "calendario/page.tsx"
Cohesion: 0.08
Nodes (34): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialog(), MonthDialogProps, weekdays (+26 more)

### Community 92 - "agenda-board.tsx"
Cohesion: 0.11
Nodes (38): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), AgendaBoard(), dateLabel() (+30 more)

### Community 93 - "process-view.tsx"
Cohesion: 0.12
Nodes (23): PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown(), selectTab(), ProcessViewProps, TabDefinition (+15 more)

### Community 94 - "20261126020200_process_assignment_contract_closure.sql"
Cohesion: 0.38
Nodes (4): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, contract_receipt_lines_contract_idx, private.check_process_responsible_membership()

### Community 95 - "Arquitetura (estado atual da implementação)"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 96 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 97 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 98 - "Fluxos atuais e ideais"
Cohesion: 0.33
Nodes (5): Escopo e leitura das evidências, Fluxos atuais e ideais, Fluxos por módulo e rota, Limites, prioridade e aceitação global, Perfis e regras transversais

### Community 99 - "repositories.ts"
Cohesion: 0.10
Nodes (9): MeetingStatus, MeetingRow, SupabaseMeetingRepository, toMeeting(), toPayload(), SupabaseStorage, SupabaseSupplierRepository, selectAll() (+1 more)

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

### Community 112 - "atas/service.ts"
Cohesion: 0.08
Nodes (17): AtaBalance, CommitmentEvent, ATA_INITIAL_YEARS, ATA_LEGAL_BASIS, AtaExtension, ataValidityStatus(), currentEndDate(), ExtensionRequest (+9 more)

### Community 113 - "formalization-queue.tsx"
Cohesion: 0.12
Nodes (22): OrderQueue(), handleApprove(), handleConfirmReject(), OrderQueueProps, PendingOrderItem, MaterialOrderDialog(), MaterialOrderDialogProps, MaterialOrderForm() (+14 more)

### Community 114 - "Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria"
Cohesion: 0.13
Nodes (14): 1. Contexto e Objetivos, 2.1 Modelo de Dados (Supabase Migration), 2.2 Regras de Negócio e Domínio de Estoque, 2.3 Interfaces de Usuário para Pedidos, 2. Subsistema 1: Pedidos de Materiais (`material_orders`), 3.1 Encerramento de Processo com Documentação Parcial, 3.2 Recebimento de Materiais com Saldo Pendente, 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%) (+6 more)

### Community 115 - "Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos"
Cohesion: 0.18
Nodes (10): 1. Contexto e Diagnóstico dos Problemas Atuais, 2. Objetivos do Redesign, 3.1 Cabeçalho & Régua de 4 Métricas (`ProcessHeader`), 3.2 Aba 1: `📁 Documentação (7+N)` (`ProcessDocumentationTab`), 3.3 Aba 2: `🤝 Contratação, Atas & Economia` (`ProcessContractingTab`), 3.4 Aba 3: `⚙️ Governança & Histórico` (`ProcessGovernanceTab`), 3. Arquitetura da Solução e Componentes, 4. Garantia de Compatibilidade e Invariantes (+2 more)

### Community 116 - "Global Constraints"
Cohesion: 0.20
Nodes (9): Global Constraints, Redesign Visual da Página de Processos — Plano de Implementação, Task 1: Componente de Topo Executivo e Régua de Métricas (`ProcessHeader`), Task 2: Linha Compacta de Documento (`CompactDocumentRow`), Task 3: Aba 1 — Pasta Documental (`DocumentationTab`), Task 4: Ajustar Alinhamento do Formulário em `FormalizationCard` e Criar Aba 2 (`ContractingTab`), Task 5: Aba 3 — Governança e Histórico (`GovernanceTab`), Task 6: Orquestração da Página Principal com Tabs (`/processos/[id]/page.tsx`) (+1 more)

### Community 117 - "Plano de testes e validação UX"
Cohesion: 0.20
Nodes (9): Camadas e evidência, E2E e navegação, Estado da execução, Estados e segurança, Gate de baseline técnica, Integridade backend prioritária, Matriz navegador e acessibilidade, Plano de testes e validação UX (+1 more)

### Community 118 - "toFortalezaDate"
Cohesion: 0.14
Nodes (20): AuditPage(), AuditPageProps, Content(), metadata, one(), CloseContractForm(), Content(), ContractPage() (+12 more)

### Community 119 - "ok"
Cohesion: 0.16
Nodes (6): InMemorySupplierRepository, SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema

### Community 120 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build)

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "media-actions.ts"
Cohesion: 0.11
Nodes (23): draftSchema, GET(), maxDuration, MeetingFile(), getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio() (+15 more)

### Community 123 - "db.ts"
Cohesion: 0.10
Nodes (22): @supabase/supabase-js, AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toAta(), toCommitment(), toPayload() (+14 more)

### Community 124 - "Input"
Cohesion: 0.12
Nodes (27): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), ProductField(), ProductFieldProps, exactProduct() (+19 more)

### Community 125 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 128 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 131 - "analysis.ts"
Cohesion: 0.28
Nodes (10): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+2 more)

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 134 - "auth.users"
Cohesion: 0.40
Nodes (3): auth.users, storage.buckets, storage.objects

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

### Community 150 - "processes/service.ts"
Cohesion: 0.08
Nodes (28): Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 6. Estratégia de Testes, AuditRecorder, DocumentRepository, SavingsSummary, formatProcessNumber(), ProcessRepository, LinkedRequestNotes (+20 more)

### Community 151 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 152 - "002_validacao_sem_pgtap.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 153 - "progress.ts"
Cohesion: 0.16
Nodes (17): Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), buildSnapshot(), CompletionEvent, CompletionState, CompletionTransition, DocumentalSnapshot, effectiveProgressPercent(), reevaluateCompletion() (+9 more)

### Community 154 - "003_fluxos_atomicos.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 155 - "atas/service.ts"
Cohesion: 0.11
Nodes (23): CouncilAllocation, AtaValidityStatus, ataIdSchema, AtaItem, createAtaSchema, linkAtaProcessSchema, setAllocationsSchema, AtaItemView (+15 more)

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 162 - "private.validate_meeting_details"
Cohesion: 0.18
Nodes (9): calendar_appointments_scope_date_idx, public.calendar_appointments, private.validate_meeting_details(), validate_meeting_details, check_staff_membership, council_memberships_one_director, private.check_staff_membership(), private.has_council_access() (+1 more)

### Community 173 - "public.attachments"
Cohesion: 0.40
Nodes (6): idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, public.attachments, public.document_types, public.v_process_progress

### Community 175 - "compact-document-row.test.tsx"
Cohesion: 0.50
Nodes (3): CompactDocumentRowProps, PENDING_ROW_PROPS, VALID_ROW_PROPS

### Community 178 - "file-upload.tsx"
Cohesion: 0.20
Nodes (10): currencyFormat, integerFormat, numberFormat, FileUpload(), handleFile(), handleFiles(), onDrop(), FileUploadProps (+2 more)

### Community 179 - "document-types.ts"
Cohesion: 0.25
Nodes (7): ADDITIONAL_DOCUMENT_TYPE_CODES, ADDITIONAL_DOCUMENT_TYPES, AdditionalDocumentTypeCode, ALL_DOCUMENT_TYPE_CODES, ALL_DOCUMENT_TYPES, AllDocumentTypeCode, REQUIRED_DOCUMENT_COUNT

### Community 180 - "processes.ts"
Cohesion: 0.15
Nodes (10): ProcessActionsProps, ProcessStatus, ProcessRow, snapshotToJson(), SupabaseDocumentRepository, SupabaseProcessRepository, toAttachment(), toProcess() (+2 more)

### Community 181 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 182 - "cleanup-eligibility.ts"
Cohesion: 0.40
Nodes (5): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), addDaysToInstant()

### Community 186 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 197 - "ref_server_only"
Cohesion: 0.18
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 994 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `Actor`, `solicitacoes/[id]/page.tsx`, `vitest`, `adapters/purchases.ts`, `formalizations/service.test.ts`, `inventory/service.ts`, `Button`, `identity/service.ts`, `notifications/service.ts`, `dashboard/page.tsx`, `documentation-tab.tsx`, `request-facets.ts`, `processes/service.ts`, `meetings/service.ts`, `runAction`, `transfers/schemas.ts`, `atas/service.ts`, `policy.ts`, `lucide-react`, `MaterialOrder`, `identity.ts`, `groq.ts`, `toFortalezaDate`, `inventory.ts`, `react`, `Material`, `AuditEntry`, `movement-form.tsx`, `processes.ts`, `file-validation.ts`, `Screen`, `createSessionClient`, `documents/service.ts`, `request-status.ts`, `result.ts`, `fail`, `ActionForm`, `calendario/page.tsx`, `repositories.ts`, `atas/service.ts`, `toFortalezaDate`, `ok`, `media-actions.ts`, `db.ts`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Actor` be split into smaller, more focused modules?**
  _Cohesion score 0.12657004830917876 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `InventoryService`, `solicitacoes/[id]/page.tsx`, `analysis.ts`, `pdf.ts`, `navigation.ts`, `formalizations/service.test.ts`, `inventory/service.ts`, `Button`, `formalization-card.tsx`, `notifications/service.ts`, `formatCurrency`, `dashboard/page.tsx`, `overview-lists.tsx`, `documentation-tab.tsx`, `package.json`, `request-facets.ts`, `progress.ts`, `atas/service.ts`, `utils.ts`, `policy.ts`, `lucide-react`, `processes/schemas.ts`, `council-workspace.tsx`, `Button`, `MaterialOrder`, `groq.ts`, `toFortalezaDate`, `compact-document-row.test.tsx`, `react`, `formalization-card.tsx`, `data-table-logic.ts`, `file-validation.ts`, `request-template.ts`, `handler.ts`, `createSessionClient`, `ok`, `process-history.ts`, `request-status.ts`, `callback-server.mjs`, `result.ts`, `analysis.ts`, `calendario/page.tsx`, `agenda-board.tsx`, `process-view.tsx`, `cnpj.ts`, `atas/service.ts`, `formalization-queue.tsx`, `toFortalezaDate`, `media-actions.ts`, `Input`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `solicitacoes/[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11561561561561562 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `solicitacoes/[id]/page.tsx`, `navigation.ts`, `Button`, `formatCurrency`, `dashboard/page.tsx`, `overview-lists.tsx`, `documentation-tab.tsx`, `package.json`, `request-facets.ts`, `runAction`, `utils.ts`, `policy.ts`, `lucide-react`, `council-workspace.tsx`, `Button`, `membership-forms.tsx`, `getSession`, `groq.ts`, `react`, `movement-form.tsx`, `formalization-card.tsx`, `data-table-logic.ts`, `handler.ts`, `Screen`, `createSessionClient`, `toast-store.ts`, `filters.tsx`, `ref_server_only`, `callback-server.mjs`, `result.ts`, `ActionForm`, `calendario/page.tsx`, `agenda-board.tsx`, `process-view.tsx`, `formalization-queue.tsx`, `toFortalezaDate`, `media-actions.ts`, `Input`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `navigation.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06440677966101695 - nodes in this community are weakly interconnected._