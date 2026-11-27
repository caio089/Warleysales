# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 627 files · ~289,759 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3776 nodes · 13028 edges · 195 communities (147 shown, 48 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 463 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b7324786`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- can
- container.ts
- public.forbid_mutation
- pdf.ts
- lucide-react
- vitest
- SupabasePurchaseRequestRepository
- .insert
- ok
- formalizations/actions.ts
- ProcessFormalization
- public.purchase_requests
- apply_all.sql
- alert-source.ts
- Tarefas
- purchases/service.ts
- Button
- public.create_contract_with_ata
- purchases/service.test.ts
- documentation-tab.tsx
- package.json
- request-facets.ts
- plan-calendar.ts
- service-support.ts
- getSession
- unwrap
- anon
- utils.ts
- entry-sources.ts
- public.purchase_requests
- detailed.ts
- result.ts
- 20261102000002_domain_tables.sql
- 20261116000001_notification_emails.sql
- PageHeader
- time.ts
- dashboard/page.tsx
- 20261102000006_fk_indexes.sql
- MaterialOrder
- runAction
- identity/service.ts
- atas.ts
- groq.ts
- AuditEntry
- Proposta funcional — página inicial Warley Gestão Operacional
- extract-request/route.ts
- policy.ts
- db.ts
- atas/actions.ts
- purchases/actions.ts
- orders/actions.ts
- @playwright/test
- data-table-logic.ts
- notifications/service.ts
- request-template.ts
- handler.ts
- auth-stage.tsx
- createSessionClient
- public.stock_movements
- navigation.ts
- components.json
- MembershipRepository
- document-types.ts
- RetentionRepository
- public.contracts
- public.receive_purchase_request_for_contract
- compilerOptions
- toast-store.ts
- callRpc
- compilerOptions
- callback-server.mjs
- dependencies
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- estoque/page.tsx
- next
- fail
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- app-shell.tsx
- pg_temp.act_as
- PDFReport
- analysis.ts
- private.business_error
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- time.ts
- contracts/actions.ts
- process-view.tsx
- sidebar-nav.tsx
- Arquitetura (estado atual da implementação)
- public.spec.ts
- cnpj.ts
- analysis.ts
- createSupabaseRepositories
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- process-actions.tsx
- fail
- notification-destination.ts
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- direct-upload.test.ts
- ok
- InMemoryMembershipRepository
- Execução local, deploy e backups
- media-actions.ts
- milestones.ts
- Input
- bundle-migrations.mjs
- Validação realmente executada
- atas-de-reuniao-operacao.md
- Global Constraints
- Checklist de execução
- Execução dos blocos 1 e 2
- isUniqueViolation
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
- InMemoryMaterialOrderRepository
- 003_fluxos_atomicos.sql
- contracts/service.ts
- Global Constraints
- Auditoria de desempenho do Warley
- private.validate_meeting_details
- 20261110000003_material_orders.sql
- ref_node_fs
- movement-form.tsx
- InMemoryNotificationRepository
- SupabaseDocumentRepository
- inventory/actions.ts
- processes.ts
- 20261126020200_process_assignment_contract_closure.sql
- cleanup-eligibility.ts
- Fluxos atuais e ideais
- callback-app/app/layout.tsx
- validate-corrections.mjs
- playwright.config.ts
- badge.tsx
- public.profiles
- policy.test.ts
- public.councils
- ref_server_only

## God Nodes (most connected - your core abstractions)
1. `ok()` - 300 edges
2. `fail()` - 232 edges
3. `Result` - 206 edges
4. `Actor` - 134 edges
5. `next` - 121 edges
6. `vitest` - 113 edges
7. `react` - 98 edges
8. `runAction()` - 86 edges
9. `can()` - 82 edges
10. `unwrap()` - 80 edges

## Surprising Connections (you probably didn't know these)
- `Task 3: Orquestração na Criação de Solicitação (`createProcess`)` --references--> `ProcessService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-solicitacao-processo-anexagem.md → src/modules/processes/service.ts
- `Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley` --references--> `MaterialOrderService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda2-pedidos-justificativas-auditoria.md → src/modules/orders/service.ts
- `Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação` --references--> `InventoryService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/inventory/service.ts
- `Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado)` --references--> `InventoryService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/inventory/service.ts
- `Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters)` --references--> `AuditFilter`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda2-pedidos-justificativas-auditoria.md → src/modules/audit/schemas.ts

## Import Cycles
- None detected.

## Communities (195 total, 48 thin omitted)

### Community 0 - "can"
Cohesion: 0.17
Nodes (22): zod, parseLocalInstant(), input, saveAppointment(), submit(), meetingReviewAction(), saveProcessContractingMode(), saveProcessEstimatedValue() (+14 more)

### Community 1 - "container.ts"
Cohesion: 0.17
Nodes (34): Contratos de serviço, Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), InMemoryAtaRepository, AtaService, setup(), InMemoryAuditRepository, AuditService, ContractService (+26 more)

### Community 2 - "public.forbid_mutation"
Cohesion: 0.12
Nodes (24): idx_ata_allocations_council_id, idx_ata_commitments_council_id, idx_ata_extensions_requested_by, idx_ata_items_material_id, idx_price_registration_atas_process_id, idx_price_registration_atas_supplier_id, prevent_cancelled_ata_reactivation, public.append_commitment_event() (+16 more)

### Community 3 - "pdf.ts"
Cohesion: 0.16
Nodes (22): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+14 more)

### Community 4 - "lucide-react"
Cohesion: 0.07
Nodes (40): 5. Componentes existentes a reutilizar e mudanças propostas, ComponentShowcase(), fixtureOrder, props, rows, cn, lucide-react, weekdays (+32 more)

### Community 5 - "vitest"
Cohesion: 0.09
Nodes (35): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+27 more)

### Community 6 - "SupabasePurchaseRequestRepository"
Cohesion: 0.31
Nodes (3): AtomicDecision, SupabasePurchaseRequestRepository, toRequest()

### Community 7 - ".insert"
Cohesion: 0.09
Nodes (4): InMemoryMeetingRepository, InMemoryTransferRepository, TransferRepository, setup()

### Community 8 - "ok"
Cohesion: 0.07
Nodes (50): none, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel, stockLevelLabel, applyMovement(), availableOf() (+42 more)

### Community 9 - "formalizations/actions.ts"
Cohesion: 0.27
Nodes (12): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, handleQuickHomologate(), assertInstrumentsLinked(), homologateFormalizationAction(), parseMoney(), rejectFormalizationAction(), submitFormalizationFormAction(), mockRunAction (+4 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.09
Nodes (22): calculateSavings(), contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType (+14 more)

### Community 11 - "public.purchase_requests"
Cohesion: 0.22
Nodes (11): public.save_purchase_request(), private.business_error(), private.next_request_event_position(), public.approve_purchase_request(), public.cancel_purchase_request(), idx_purchase_requests_process_id, public.save_purchase_request(), public.save_purchase_request() (+3 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.07
Nodes (45): administrative_processes_responsible_id_idx, council_memberships_one_director, idx_administrative_processes_created_by, idx_audit_logs_actor_id, idx_document_cleanup_runs_process_id, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by (+37 more)

### Community 13 - "alert-source.ts"
Cohesion: 0.19
Nodes (7): AlertEntityType, AlertMilestone, AlertSource, NotificationRepository, AppNotification, ExpiringItem, NotificationRow

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.11
Nodes (25): Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, ReceiptItemResult, ReceiptItemState, ReceiptLine, ReceiptOutcome (+17 more)

### Community 16 - "Button"
Cohesion: 0.09
Nodes (23): @base-ui/react, react-dom, FormalizationQueue(), FormalizationQueueProps, INSTRUMENT_LABELS, PendingFormalizationItem, OrderQueueProps, PendingOrderItem (+15 more)

### Community 17 - "public.create_contract_with_ata"
Cohesion: 0.07
Nodes (29): public.append_commitment_event(), public.save_ata(), public.save_contract(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, trg_contract_amendments_immutable, trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+21 more)

### Community 18 - "purchases/service.test.ts"
Cohesion: 0.07
Nodes (18): InMemoryContractRepository, FailingRepository, InMemoryDocumentRepository, createProcessWithProgress(), Ctx, PDF, InMemoryCouncilRepository, InMemoryInventoryRepository (+10 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.08
Nodes (50): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+42 more)

### Community 20 - "package.json"
Cohesion: 0.11
Nodes (23): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, @playwright/test@^1.65.1, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5 (+15 more)

### Community 21 - "request-facets.ts"
Cohesion: 0.09
Nodes (32): Content(), metadata, RequestsPage(), citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes() (+24 more)

### Community 22 - "plan-calendar.ts"
Cohesion: 0.08
Nodes (34): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialog(), MonthDialogProps, AppointmentRow (+26 more)

### Community 23 - "service-support.ts"
Cohesion: 0.06
Nodes (37): changeMeetingStatus(), MEETING_TRANSITIONS, MeetingStatus, MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting (+29 more)

### Community 24 - "getSession"
Cohesion: 0.18
Nodes (16): pdf-lib, GET(), GET(), GET(), Home(), RedirectHome(), DetailedReport, clean() (+8 more)

### Community 25 - "unwrap"
Cohesion: 0.07
Nodes (11): SupabaseMembershipRepository, SupabaseNotificationRepository, toNotification(), SupabaseMaterialOrderRepository, SupabaseRetentionRepository, SupabaseSupplierRepository, DatabaseError, isUniqueViolation() (+3 more)

### Community 26 - "anon"
Cohesion: 0.09
Nodes (18): trg_audit_logs_immutable, public.append_commitment_event(), idx_administrative_processes_created_by, idx_audit_logs_actor_id, public.correct_purchase_request(), public.set_document_exception(), public.v_process_progress, public.set_process_estimated_value() (+10 more)

### Community 27 - "utils.ts"
Cohesion: 0.15
Nodes (16): BigStat(), ChartCard(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, baseAtas, baseContracts (+8 more)

### Community 28 - "entry-sources.ts"
Cohesion: 0.19
Nodes (20): buildStockEntrySources(), RECEIVABLE, StockEntryItem, LinkedProcessCardProps, Content(), metadata, RequestPage(), Fact() (+12 more)

### Community 29 - "public.purchase_requests"
Cohesion: 0.10
Nodes (21): contract_receipt_line_integrity, contract_receipt_lines_contract_idx, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, private.check_contract_ata_process(), private.check_contract_receipt_line() (+13 more)

### Community 30 - "detailed.ts"
Cohesion: 0.20
Nodes (18): kinds, ReportCentral(), auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, first() (+10 more)

### Community 31 - "result.ts"
Cohesion: 0.10
Nodes (41): ACTION_LABEL, Content(), metadata, RetentionPage(), buildAtaBalanceRows(), AtaPage(), metadata, AtasPage() (+33 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.14
Nodes (30): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+22 more)

### Community 34 - "PageHeader"
Cohesion: 0.12
Nodes (27): AdministrationPage(), Content(), LINKS, metadata, MarkReadForm(), AlertsPage(), Content(), metadata (+19 more)

### Community 35 - "time.ts"
Cohesion: 0.19
Nodes (19): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), ATA_INITIAL_YEARS, ATA_LEGAL_BASIS (+11 more)

### Community 37 - "dashboard/page.tsx"
Cohesion: 0.07
Nodes (63): Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, ApprovalQueue(), ApprovalQueueProps, PendingApprovalItem, CouncilWorkspaceProps, DashboardContent(), DashboardHeading(), DashboardPage() (+55 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.07
Nodes (23): public.save_meeting(), public.save_transfer(), idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_document_cleanup_runs_process_id, idx_meeting_action_items_meeting_id, idx_meeting_action_items_responsible_id (+15 more)

### Community 39 - "MaterialOrder"
Cohesion: 0.08
Nodes (34): Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), MaterialOrderDialogProps, MaterialOrderFormProps, approveMaterialOrder(), approveOrder, cancelMaterialOrder(), cancelOrder, changeMaterialOrderStatus() (+26 more)

### Community 40 - "runAction"
Cohesion: 0.12
Nodes (26): Option, assignMembershipFormAction(), createCouncilFormAction(), removeMembershipFormAction(), setStaffCategoryFormAction(), updateCouncilFormAction(), addActionItemFormAction(), fortalezaLocalToIso() (+18 more)

### Community 41 - "identity/service.ts"
Cohesion: 0.17
Nodes (16): CouncilRepository, Council, MembershipRecord, STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, StaffCategory, assignMembershipSchema, councilFields (+8 more)

### Community 42 - "atas.ts"
Cohesion: 0.16
Nodes (9): CommitmentEvent, AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toCommitment(), toPayload(), DbResponse (+1 more)

### Community 43 - "groq.ts"
Cohesion: 0.08
Nodes (35): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build) (+27 more)

### Community 44 - "AuditEntry"
Cohesion: 0.17
Nodes (11): AuditTrailTabProps, AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow (+3 more)

### Community 45 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.12
Nodes (15): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação (+7 more)

### Community 46 - "extract-request/route.ts"
Cohesion: 0.17
Nodes (14): mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText(), RequestDocumentKind (+6 more)

### Community 47 - "policy.ts"
Cohesion: 0.12
Nodes (25): AuditPage(), AuditPageProps, Content(), metadata, one(), Content(), metadata, ProcessesPage() (+17 more)

### Community 48 - "db.ts"
Cohesion: 0.17
Nodes (20): @supabase/supabase-js, toAta(), ContractRow, toMovement(), toMeeting(), OrderItemRow, OrderRow, toOrder() (+12 more)

### Community 49 - "atas/actions.ts"
Cohesion: 0.42
Nodes (9): ataStepFormAction(), createAtaFormAction(), linkAtaProcessFormAction(), optionalId(), processReturnPath(), readProcessItems(), setAllocationsFormAction(), toMoney() (+1 more)

### Community 50 - "purchases/actions.ts"
Cohesion: 0.13
Nodes (15): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase, createRequestFormAction() (+7 more)

### Community 51 - "orders/actions.ts"
Cohesion: 0.28
Nodes (13): OrderQueue(), handleApprove(), handleConfirmReject(), approveMaterialOrderAction(), cancelMaterialOrderAction(), createMaterialOrderAction(), extractCreatePayload(), extractOrderId() (+5 more)

### Community 53 - "data-table-logic.ts"
Cohesion: 0.08
Nodes (44): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessesTable() (+36 more)

### Community 54 - "notifications/service.ts"
Cohesion: 0.21
Nodes (8): digestMessage(), dispatchNotificationEmails(), EmailDispatchSummary, EmailMessage, EmailSender, groupByRecipient(), AlertRunSummary, markReadSchema

### Community 55 - "request-template.ts"
Cohesion: 0.15
Nodes (20): GET(), ExtractedPurchaseRequest, buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias() (+12 more)

### Community 56 - "handler.ts"
Cohesion: 0.11
Nodes (17): GET, GET, GET, provisionCouncilAccess(), schema, isCronAuthorized(), createCronHandler(), CronHandlerOptions (+9 more)

### Community 57 - "auth-stage.tsx"
Cohesion: 0.26
Nodes (6): AuthLayout(), NotFound(), AuthStage(), PILLARS, BrandMark(), BrandMarkProps

### Community 58 - "createSessionClient"
Cohesion: 0.14
Nodes (14): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, UX-17 — Recovery, callback e falha de provedor, ALLOWED_NEXT (+6 more)

### Community 59 - "public.stock_movements"
Cohesion: 0.19
Nodes (9): public.apply_stock_mutation(), trg_stock_movements_immutable, idx_stock_balances_material_id, idx_stock_movements_actor_id, idx_stock_movements_material_id, idx_process_formalizations_council, idx_process_formalizations_status, public.apply_stock_mutation() (+1 more)

### Community 60 - "navigation.ts"
Cohesion: 0.17
Nodes (13): Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, AuthenticatedShell(), AppLayout(), AccessContext, ALL_ROLES, COUNCIL_ROLES, filterNavigation(), NAV_GROUPS (+5 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 63 - "document-types.ts"
Cohesion: 0.12
Nodes (19): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), HistoryTab() (+11 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "public.contracts"
Cohesion: 0.18
Nodes (13): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contracts_ata_id_idx, idx_contracts_process_id, idx_contracts_supplier_id, public.contract_amendments (+5 more)

### Community 66 - "public.receive_purchase_request_for_contract"
Cohesion: 0.18
Nodes (4): public.contract_receipt_lines, public.receive_purchase_request_for_contract(), contract_receipt_line_integrity, private.check_contract_receipt_line()

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "callRpc"
Cohesion: 0.13
Nodes (7): SupabaseContractRepository, toContract(), toPayload(), SupabaseMeetingRepository, toPayload(), toPayload(), callRpc()

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, @base-ui/react@^1.9.0, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, mammoth@^1.13.0, next@16.4.6 (+14 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "estoque/page.tsx"
Cohesion: 0.12
Nodes (32): Content(), metadata, UsersPage(), CloseContractForm(), Content(), ContractPage(), metadata, Content() (+24 more)

### Community 75 - "next"
Cohesion: 0.09
Nodes (13): nextConfig, next, CouncilPickerProps, GlobalError(), ScreenResult, DataSourceUnavailableState(), ErrorState(), ForbiddenState() (+5 more)

### Community 76 - "fail"
Cohesion: 0.07
Nodes (16): Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), 3.3. Repositório e Camada de Domínio, isVisibleAttachment(), AdministrativeProcess, changeRequestStatus(), AtomicReceipt, PurchaseRequestRepository, PurchaseRequest (+8 more)

### Community 77 - "ActionForm"
Cohesion: 0.08
Nodes (58): react, RetentionForms(), MembershipForms(), Option, ProvisionCouncilForm(), StaffCategoryForm(), NewAtaForm(), Option (+50 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "app-shell.tsx"
Cohesion: 0.31
Nodes (7): NavigationFixture(), AppShell(), AppShellProps, getServerSidebarSnapshot(), getSidebarSnapshot(), subscribeSidebar(), PageReveal()

### Community 83 - "analysis.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 84 - "private.business_error"
Cohesion: 0.12
Nodes (22): idx_material_order_items_material, idx_material_order_items_order, idx_stock_balances_material_id, idx_stock_movements_actor_id, idx_stock_movements_material_id, idx_stock_transfer_events_actor_id, idx_stock_transfer_items_material_id, idx_stock_transfers_destination_council_id (+14 more)

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem"
Cohesion: 0.12
Nodes (15): 1. Visão Geral e Contexto, 2. Requisitos e Casos de Uso, 3.1. Banco de Dados (PostgreSQL / Supabase), 3.2. Sequenciamento de Processos (`nextProcessNumber`), 3. Arquitetura e Modelo de Dados, 4.1. Formulário em `/solicitacoes/nova`, 4.2. Card em `/solicitacoes/[id]`, 4. Design de Interface (UI/UX) (+7 more)

### Community 87 - "public.record_meeting_evidence"
Cohesion: 0.29
Nodes (7): idx_profiles_staff_category, keep_meeting_task_completion, private.keep_meeting_task_completion(), public.meeting_attendance, public.meeting_task_completions, public.record_meeting_evidence(), meeting_minutes_task_key

### Community 88 - "2. Requisitos e Casos de Uso"
Cohesion: 0.13
Nodes (14): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3.2. Serviços e Ações, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade (+6 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.12
Nodes (15): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+7 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "time.ts"
Cohesion: 0.15
Nodes (24): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+16 more)

### Community 92 - "contracts/actions.ts"
Cohesion: 0.29
Nodes (9): addAmendmentFormAction(), closeContractFormAction(), createContractFormAction(), linkContractProcessFormAction(), optionalNumber(), optionalText(), processReturnPath(), calculateContractAtaValue() (+1 more)

### Community 93 - "process-view.tsx"
Cohesion: 0.06
Nodes (61): AtaBalancePanel(), AtaBalanceRow, Content(), matchPdfItems(), ContractAtaOption, NewContractForm(), Option, ProcessOption (+53 more)

### Community 94 - "sidebar-nav.tsx"
Cohesion: 0.44
Nodes (9): NavItem, CollapsedGroup(), ExpandedGroup(), ExpandedHome(), isItemActive(), matchesPath(), resolveInitialOpen(), SidebarNav() (+1 more)

### Community 95 - "Arquitetura (estado atual da implementação)"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 96 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 97 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 98 - "analysis.ts"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

### Community 99 - "createSupabaseRepositories"
Cohesion: 0.11
Nodes (4): SupabaseInventoryRepository, SupabaseStorage, SupabaseTransferRepository, createSupabaseRepositories()

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "process-actions.tsx"
Cohesion: 0.29
Nodes (7): ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, PROCESS_TRANSITIONS, ProcessStatus, ProcessRow

### Community 112 - "fail"
Cohesion: 0.12
Nodes (17): AtaBalance, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation, validateAllocations(), validateCommitment(), ataValidityStatus() (+9 more)

### Community 113 - "notification-destination.ts"
Cohesion: 0.36
Nodes (7): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract

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

### Community 118 - "direct-upload.test.ts"
Cohesion: 0.20
Nodes (5): declared(), newProcess(), PDF, sha(), InMemoryStorage

### Community 119 - "ok"
Cohesion: 0.22
Nodes (5): SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "media-actions.ts"
Cohesion: 0.15
Nodes (16): draftSchema, GET(), maxDuration, getUrl(), MeetingMediaPanel(), openSavedAudio(), saveAudio(), work() (+8 more)

### Community 123 - "milestones.ts"
Cohesion: 0.39
Nodes (6): ALERT_MILESTONES, AlertCandidate, dedupKey(), DueAlert, reachedMilestone(), selectDueAlerts()

### Community 124 - "Input"
Cohesion: 0.09
Nodes (30): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), ProductField(), ProductFieldProps, exactProduct() (+22 more)

### Community 125 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 128 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 131 - "isUniqueViolation"
Cohesion: 0.39
Nodes (3): SupabaseCouncilRepository, toCouncil(), toRow()

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
Cohesion: 0.04
Nodes (56): Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), AuditRecorder, sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile (+48 more)

### Community 151 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 152 - "002_validacao_sem_pgtap.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 153 - "InMemoryMaterialOrderRepository"
Cohesion: 0.13
Nodes (8): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build, InMemoryMaterialOrderRepository

### Community 154 - "003_fluxos_atomicos.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 155 - "contracts/service.ts"
Cohesion: 0.10
Nodes (30): buildHoldRows(), contractedMaterialsByProcess(), HoldItemInput, HoldRow, StockSectionProps, AtaValidityStatus, AtaView, original (+22 more)

### Community 159 - "Global Constraints"
Cohesion: 0.40
Nodes (4): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 162 - "private.validate_meeting_details"
Cohesion: 0.18
Nodes (9): calendar_appointments_scope_date_idx, public.calendar_appointments, private.validate_meeting_details(), validate_meeting_details, check_staff_membership, council_memberships_one_director, private.check_staff_membership(), private.has_council_access() (+1 more)

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.24
Nodes (10): StockEntrySource, isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine(), UI_MODES (+2 more)

### Community 179 - "inventory/actions.ts"
Cohesion: 0.57
Nodes (6): createMaterialFormAction(), done(), readMovementLines(), registerMovementFormAction(), setMinimumFormAction(), toNumber()

### Community 180 - "processes.ts"
Cohesion: 0.21
Nodes (9): DocumentalSnapshot, DocumentTypeCode, AttachmentRow, SnapshotJson, snapshotToJson(), SupabaseProcessRepository, toProcess(), toProcessChanges() (+1 more)

### Community 181 - "20261126020200_process_assignment_contract_closure.sql"
Cohesion: 0.38
Nodes (4): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, contract_receipt_lines_contract_idx, private.check_process_responsible_membership()

### Community 182 - "cleanup-eligibility.ts"
Cohesion: 0.40
Nodes (4): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, addDaysToInstant()

### Community 183 - "Fluxos atuais e ideais"
Cohesion: 0.33
Nodes (5): Escopo e leitura das evidências, Fluxos atuais e ideais, Fluxos por módulo e rota, Limites, prioridade e aceitação global, Perfis e regras transversais

### Community 186 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 188 - "badge.tsx"
Cohesion: 0.50
Nodes (4): class-variance-authority@^0.7.1, class-variance-authority, Badge(), badgeVariants

### Community 189 - "public.profiles"
Cohesion: 0.18
Nodes (28): administrative_processes_responsible_membership, check_staff_membership, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, private.check_process_responsible_membership(), private.check_staff_membership(), private.has_council_access() (+20 more)

### Community 190 - "policy.test.ts"
Cohesion: 0.40
Nodes (3): admin, Role, roleMatrix

### Community 192 - "public.councils"
Cohesion: 0.40
Nodes (5): calendar_appointments_scope_date_idx, idx_councils_organization_type, idx_councils_responsible_user_id, public.calendar_appointments, public.councils

### Community 197 - "ref_server_only"
Cohesion: 0.16
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 997 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `can`, `isUniqueViolation`, `lucide-react`, `vitest`, `SupabasePurchaseRequestRepository`, `formalizations/actions.ts`, `purchases/service.ts`, `purchases/service.test.ts`, `documentation-tab.tsx`, `request-facets.ts`, `plan-calendar.ts`, `processes/service.ts`, `service-support.ts`, `unwrap`, `contracts/service.ts`, `entry-sources.ts`, `detailed.ts`, `result.ts`, `PageHeader`, `time.ts`, `.loadScoped`, `dashboard/page.tsx`, `MaterialOrder`, `identity/service.ts`, `atas.ts`, `groq.ts`, `AuditEntry`, `policy.ts`, `db.ts`, `purchases/actions.ts`, `processes.ts`, `notifications/service.ts`, `handler.ts`, `ref_server_only`, `estoque/page.tsx`, `fail`, `ActionForm`, `process-view.tsx`, `fail`, `ok`, `media-actions.ts`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `public.forbid_mutation` be split into smaller, more focused modules?**
  _Cohesion score 0.11724137931034483 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `container.ts`, `pdf.ts`, `lucide-react`, `ok`, `formalizations/actions.ts`, `ProcessFormalization`, `purchases/service.ts`, `Button`, `purchases/service.test.ts`, `documentation-tab.tsx`, `package.json`, `request-facets.ts`, `plan-calendar.ts`, `processes/service.ts`, `getSession`, `service-support.ts`, `contracts/service.ts`, `entry-sources.ts`, `utils.ts`, `detailed.ts`, `result.ts`, `PageHeader`, `time.ts`, `dashboard/page.tsx`, `MaterialOrder`, `groq.ts`, `extract-request/route.ts`, `movement-form.tsx`, `policy.ts`, `orders/actions.ts`, `data-table-logic.ts`, `notifications/service.ts`, `request-template.ts`, `handler.ts`, `createSessionClient`, `navigation.ts`, `policy.test.ts`, `document-types.ts`, `callback-server.mjs`, `next`, `fail`, `ActionForm`, `analysis.ts`, `time.ts`, `contracts/actions.ts`, `process-view.tsx`, `cnpj.ts`, `analysis.ts`, `process-actions.tsx`, `fail`, `notification-destination.ts`, `direct-upload.test.ts`, `media-actions.ts`, `milestones.ts`, `Input`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.07213114754098361 - nodes in this community are weakly interconnected._
- **Why does `fail()` connect `fail` to `can`, `isUniqueViolation`, `lucide-react`, `vitest`, `SupabasePurchaseRequestRepository`, `ok`, `formalizations/actions.ts`, `purchases/service.ts`, `purchases/service.test.ts`, `documentation-tab.tsx`, `plan-calendar.ts`, `processes/service.ts`, `service-support.ts`, `unwrap`, `contracts/service.ts`, `entry-sources.ts`, `detailed.ts`, `result.ts`, `PageHeader`, `time.ts`, `.loadScoped`, `MaterialOrder`, `runAction`, `identity/service.ts`, `atas.ts`, `groq.ts`, `AuditEntry`, `policy.ts`, `db.ts`, `purchases/actions.ts`, `processes.ts`, `notifications/service.ts`, `handler.ts`, `ref_server_only`, `ActionForm`, `fail`, `ok`, `media-actions.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.09435028248587571 - nodes in this community are weakly interconnected._