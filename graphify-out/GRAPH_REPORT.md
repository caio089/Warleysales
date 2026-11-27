# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 607 files · ~279,049 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3680 nodes · 12725 edges · 186 communities (137 shown, 49 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 457 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `151e3567`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InMemoryAuditRepository
- readableCouncilIds
- simple-table.tsx
- pdf.ts
- identity/actions.ts
- vitest
- dependencies
- button.tsx
- inventory/service.ts
- container.ts
- ProcessFormalization
- time.ts
- apply_all.sql
- notifications.ts
- Tarefas
- calendario/page.tsx
- dashboard/page.tsx
- public.create_contract_with_ata
- simple-table.tsx
- documentation-tab.tsx
- parseCurrencyInput
- Result
- entry-sources.ts
- toFortalezaDate
- process-actions.tsx
- unwrap
- public.correct_purchase_request
- purchases/service.ts
- Auditoria de desempenho do Warley
- memory-repositories.ts
- result.ts
- 20261102000002_domain_tables.sql
- 20261116000001_notification_emails.sql
- reports/service.ts
- movement-form.tsx
- groq.ts
- callback-app/app/page.tsx
- 20261102000006_fk_indexes.sql
- order.ts
- db.ts
- processes/service.ts
- public.receive_purchase_request
- adapters/purchases.ts
- toFortalezaDate
- contracts/service.ts
- auth-stage.tsx
- atas.ts
- public.profiles
- AuditEntry
- next
- process-view.tsx
- @playwright/test
- atas/extract-pdf/route.ts
- extract-request/route.ts
- request-template.ts
- handler.ts
- solicitacoes/[id]/page.tsx
- createSessionClient
- 20261102000001_identity.sql
- contracts/actions.ts
- components.json
- InMemoryStorage
- app-shell.tsx
- RetentionRepository
- package.json
- atas/service.ts
- compilerOptions
- toast-store.ts
- material-order-dialog.tsx
- compilerOptions
- callback-server.mjs
- notification-destination.ts
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- runAction
- authenticated-shell.tsx
- ok
- ActionForm
- Button
- seed-demo.mjs
- documents/service.ts
- pg_temp.act_as
- PDFReport
- analysis.ts
- SupabaseDocumentRepository
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- process-history.ts
- public.receive_purchase_request_for_contract
- meetings.ts
- process-actions.tsx
- getSession
- Fluxos atuais e ideais
- cnpj.ts
- 20261110000003_material_orders.sql
- new-contract-form.tsx
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- policy.ts
- PriceRegistrationAta
- orders/actions.ts
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- whatsapp.ts
- Proposta funcional — página inicial Warley Gestão Operacional
- purchases/service.test.ts
- Execução local, deploy e backups
- media-actions.ts
- repositories.ts
- fields.tsx
- home-overview.tsx
- Validação realmente executada
- atas/service.test.ts
- Global Constraints
- Checklist de execução
- Execução dos blocos 1 e 2
- 003_fluxos_atomicos.sql
- Pendências e limitações conhecidas
- suppliers/service.ts
- Relatório de alterações recentes
- Plano de testes
- Graphify neste repositório
- E2E
- processes.ts
- Avisos de vencimento por e-mail
- README.md
- Documento de Design Técnico: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões
- AGENTS.md
- Relatórios em PDF
- 12-orgaos-e-empresas.md
- 02-permissoes.md
- 09-reunioes-audio.md
- 10-cadastro-contrato-pdf.md
- cn
- check-supabase.mjs
- identity.ts
- documentation-tab.tsx
- private.validate_meeting_details
- Global Constraints
- identity/service.test.ts
- Global Constraints
- public.spec.ts
- bundle-migrations.mjs
- validate-corrections.mjs
- playwright.config.ts
- 002_validacao_sem_pgtap.sql
- 00_supabase_stub.sql
- production-readonly-audit.mjs

## God Nodes (most connected - your core abstractions)
1. `ok()` - 297 edges
2. `fail()` - 229 edges
3. `Result` - 202 edges
4. `Actor` - 131 edges
5. `next` - 119 edges
6. `vitest` - 110 edges
7. `react` - 97 edges
8. `runAction()` - 86 edges
9. `ActionForm()` - 80 edges
10. `unwrap()` - 79 edges

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

## Communities (186 total, 49 thin omitted)

### Community 0 - "InMemoryAuditRepository"
Cohesion: 0.15
Nodes (25): InMemoryAtaRepository, AtaService, setup(), InMemoryAuditRepository, AuditService, InMemoryContractRepository, ContractService, FailingRepository (+17 more)

### Community 1 - "readableCouncilIds"
Cohesion: 0.09
Nodes (17): Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), FormalizationService, TransferStatus, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferEvent (+9 more)

### Community 2 - "simple-table.tsx"
Cohesion: 0.06
Nodes (64): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ApprovalQueueProps (+56 more)

### Community 3 - "pdf.ts"
Cohesion: 0.16
Nodes (22): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+14 more)

### Community 4 - "identity/actions.ts"
Cohesion: 0.16
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

### Community 5 - "vitest"
Cohesion: 0.10
Nodes (34): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, declared() (+26 more)

### Community 6 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, mammoth@^1.13.0, next@16.4.6, react@19.3.0, react-dom@19.3.0 (+10 more)

### Community 7 - "button.tsx"
Cohesion: 0.13
Nodes (21): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, weekdays, AppointmentRow, CalendarioPage() (+13 more)

### Community 8 - "inventory/service.ts"
Cohesion: 0.07
Nodes (51): CommitmentEventType, CommitRequest, computeAtaBalance(), validateCommitment(), none, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference() (+43 more)

### Community 9 - "container.ts"
Cohesion: 0.05
Nodes (32): Contratos de serviço, CouncilRepository, MembershipRepository, Council, ProfileSummary, assignMembershipSchema, councilFields, CouncilService (+24 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.10
Nodes (21): contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes (+13 more)

### Community 11 - "time.ts"
Cohesion: 0.15
Nodes (27): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+19 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.04
Nodes (114): calendar_appointments_scope_date_idx, contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx (+106 more)

### Community 13 - "notifications.ts"
Cohesion: 0.10
Nodes (13): AlertEntityType, AlertMilestone, digestMessage(), dispatchNotificationEmails(), EmailDispatchSummary, EmailMessage, EmailSender, groupByRecipient() (+5 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "calendario/page.tsx"
Cohesion: 0.06
Nodes (41): MonthDialog(), MonthDialogProps, citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME (+33 more)

### Community 16 - "dashboard/page.tsx"
Cohesion: 0.09
Nodes (35): 5. Componentes existentes a reutilizar e mudanças propostas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor(), FormalizationQueue(), FormalizationQueueProps (+27 more)

### Community 17 - "public.create_contract_with_ata"
Cohesion: 0.08
Nodes (28): public.append_commitment_event(), public.save_ata(), public.save_contract(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, trg_contract_amendments_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate (+20 more)

### Community 18 - "simple-table.tsx"
Cohesion: 0.14
Nodes (25): DataTable(), DataTableColumn, DataTableProps, Cell, collator, compareValues(), filterAndSortTableRows(), FilterDefinition (+17 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.13
Nodes (35): Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected(), uploadOne() (+27 more)

### Community 20 - "parseCurrencyInput"
Cohesion: 0.27
Nodes (12): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), formatCurrencyDraft(), normalizeCurrencyDecimal(), parseCurrencyInput() (+4 more)

### Community 21 - "Result"
Cohesion: 0.13
Nodes (9): Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, 6. Estratégia de Testes, InventoryService, MaterialOrder, MaterialOrderService, ReportService, ActionContext, Services (+1 more)

### Community 22 - "entry-sources.ts"
Cohesion: 0.25
Nodes (14): buildStockEntrySources(), RECEIVABLE, StockEntryItem, LinkedProcessCardProps, DocumentalProgress, ProcessView, assertContractAllowsReceive(), assertReceiveLinesWithinContract() (+6 more)

### Community 23 - "toFortalezaDate"
Cohesion: 0.22
Nodes (10): ALERT_MILESTONES, AlertCandidate, dedupKey(), DueAlert, reachedMilestone(), selectDueAlerts(), AlertSource, AlertRunSummary (+2 more)

### Community 24 - "process-actions.tsx"
Cohesion: 0.22
Nodes (11): Option, changeProcessStatusFormAction(), classifyProcessFormAction(), createProcessFormAction(), registerClosingFormAction, registerClosingReportFormAction(), PROCESS_TRANSITIONS, authorizeDisposalFormAction() (+3 more)

### Community 25 - "unwrap"
Cohesion: 0.11
Nodes (8): SupabaseNotificationRepository, toNotification(), SupabaseMaterialOrderRepository, SupabaseRetentionRepository, isUniqueViolation(), toIso(), unwrap(), SupabaseJobRunRepository

### Community 26 - "public.correct_purchase_request"
Cohesion: 0.14
Nodes (9): trg_audit_logs_immutable, idx_administrative_processes_created_by, idx_audit_logs_actor_id, public.correct_purchase_request(), public.set_document_exception(), public.set_process_estimated_value(), public.set_process_validity_start_date(), public.set_process_contracting_mode() (+1 more)

### Community 27 - "purchases/service.ts"
Cohesion: 0.08
Nodes (28): PurchaseRequest, PurchaseRequestEvent, RequestStatus, ReceiptItemResult, ReceiptItemState, ReceiptLine, ReceiptOutcome, changeRequestStatus() (+20 more)

### Community 28 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 29 - "memory-repositories.ts"
Cohesion: 0.06
Nodes (8): InMemoryMeetingRepository, MeetingDetails, isValidAttachment(), InMemoryProcessRepository, InMemoryPurchaseRequestRepository, InMemoryTransferRepository, setup(), MemoryTable

### Community 31 - "result.ts"
Cohesion: 0.06
Nodes (101): AuditPage(), AuditPageProps, Content(), metadata, one(), AdministrationPage(), Content(), LINKS (+93 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.15
Nodes (29): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+21 more)

### Community 34 - "reports/service.ts"
Cohesion: 0.21
Nodes (12): StockSectionProps, AtaView, ContractView, StockLevelView, DashboardAttention, DashboardSnapshot, ScopedData, SummaryFilter (+4 more)

### Community 35 - "movement-form.tsx"
Cohesion: 0.10
Nodes (27): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+19 more)

### Community 36 - "groq.ts"
Cohesion: 0.12
Nodes (26): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build) (+18 more)

### Community 37 - "callback-app/app/page.tsx"
Cohesion: 0.13
Nodes (20): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, openProcessAttachment(), ProcessAttachmentSheet() (+12 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (29): public.receive_purchase_request(), public.apply_stock_mutation(), public.save_meeting(), public.save_transfer(), trg_stock_movements_immutable, idx_ata_items_material_id, idx_attachments_council_id, idx_attachments_type_code (+21 more)

### Community 39 - "order.ts"
Cohesion: 0.08
Nodes (35): Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), changeMeetingStatus(), MEETING_TRANSITIONS, ActionItem, actionItemSchema, changeMeetingStatusSchema, meetingDetailsSchema, MeetingMinutes (+27 more)

### Community 40 - "db.ts"
Cohesion: 0.11
Nodes (20): @supabase/supabase-js, toAta(), ContractRow, SupabaseContractRepository, toContract(), toPayload(), toMovement(), OrderItemRow (+12 more)

### Community 41 - "processes/service.ts"
Cohesion: 0.06
Nodes (35): Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.3. Repositório e Camada de Domínio, AuditRecorder, DocumentRepository, SavingsSummary, refreshCompletion(), CLEANUP_WAIT_DAYS, CleanupDecision (+27 more)

### Community 42 - "public.receive_purchase_request"
Cohesion: 0.09
Nodes (22): private.check_contract_ata_process(), public.cancel_purchase_request(), public.save_purchase_request(), idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, private.next_request_event_position() (+14 more)

### Community 43 - "adapters/purchases.ts"
Cohesion: 0.24
Nodes (5): AtomicDecision, LinkedRequestNotesRow, RequestRow, SupabasePurchaseRequestRepository, toRequest()

### Community 44 - "toFortalezaDate"
Cohesion: 0.15
Nodes (22): pdf-lib@^1.17.1, pdf-lib, GET(), GET(), auditEvents(), buildDetailedReport(), date(), DetailedFilter (+14 more)

### Community 45 - "contracts/service.ts"
Cohesion: 0.15
Nodes (17): ExtensionRequest, original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms, currentTerms(), elapsedPercent() (+9 more)

### Community 46 - "auth-stage.tsx"
Cohesion: 0.26
Nodes (6): AuthLayout(), NotFound(), AuthStage(), PILLARS, BrandMark(), BrandMarkProps

### Community 47 - "atas.ts"
Cohesion: 0.16
Nodes (9): CommitmentEvent, AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toCommitment(), toPayload(), DbResponse (+1 more)

### Community 48 - "public.profiles"
Cohesion: 0.14
Nodes (35): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, idx_councils_responsible_user_id, idx_process_formalizations_status, idx_retention_authorizations_authorized_by, private.check_process_responsible_membership(), private.has_council_access(), private.has_council_role() (+27 more)

### Community 49 - "AuditEntry"
Cohesion: 0.17
Nodes (11): AuditTrailTabProps, AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow (+3 more)

### Community 50 - "next"
Cohesion: 0.09
Nodes (12): FixtureReady(), FixtureLayout(), nextConfig, next, react, CouncilPickerProps, metadata, ProcessContent() (+4 more)

### Community 51 - "process-view.tsx"
Cohesion: 0.10
Nodes (28): FormalizationSupplier, PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown(), selectTab(), ProcessViewProps (+20 more)

### Community 53 - "atas/extract-pdf/route.ts"
Cohesion: 0.16
Nodes (12): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), ExtractedContract (+4 more)

### Community 54 - "extract-request/route.ts"
Cohesion: 0.17
Nodes (14): mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText(), RequestDocumentKind (+6 more)

### Community 55 - "request-template.ts"
Cohesion: 0.15
Nodes (20): GET(), ExtractedPurchaseRequest, buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias() (+12 more)

### Community 56 - "handler.ts"
Cohesion: 0.14
Nodes (14): GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, getServices(), isSupabaseConfigured(), createSupabaseJobRunRepository() (+6 more)

### Community 57 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.19
Nodes (13): Content(), metadata, RequestPage(), PROCESS_FLOW_STEPS, REQUEST_LIFECYCLE, REQUEST_RAIL_ALIAS, requestNextStep(), requestRailKey() (+5 more)

### Community 58 - "createSessionClient"
Cohesion: 0.13
Nodes (15): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, UX-17 — Recovery, callback e falha de provedor, @supabase/ssr (+7 more)

### Community 59 - "20261102000001_identity.sql"
Cohesion: 0.33
Nodes (13): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+5 more)

### Community 60 - "contracts/actions.ts"
Cohesion: 0.32
Nodes (9): addAmendmentFormAction(), closeContractFormAction(), createContractFormAction(), linkContractProcessFormAction(), optionalNumber(), optionalText(), processReturnPath(), calculateContractAtaValue() (+1 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 63 - "app-shell.tsx"
Cohesion: 0.31
Nodes (7): NavigationFixture(), AppShell(), AppShellProps, getServerSidebarSnapshot(), getSidebarSnapshot(), subscribeSidebar(), PageReveal()

### Community 64 - "RetentionRepository"
Cohesion: 0.24
Nodes (5): InMemoryRetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "package.json"
Cohesion: 0.11
Nodes (23): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, @playwright/test@^1.65.1, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5 (+15 more)

### Community 66 - "atas/service.ts"
Cohesion: 0.16
Nodes (20): CouncilAllocation, ATA_INITIAL_YEARS, ATA_LEGAL_BASIS, ATA_MAX_EXTENSIONS, AtaExtension, AtaValidityStatus, ataValidityStatus(), computeInitialEndDate() (+12 more)

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "material-order-dialog.tsx"
Cohesion: 0.19
Nodes (15): 6. Valores, estados e mensagens: salvaguardas, Reutilização em painéis por perfil, lucide-react, CouncilWorkspace(), CouncilWorkspaceProps, ActionHub(), ActionItem, buildCouncilActions() (+7 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "notification-destination.ts"
Cohesion: 0.36
Nodes (7): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "runAction"
Cohesion: 0.12
Nodes (31): zod, GET, Option, ProvisionCouncilForm(), input, saveAppointment(), assignMembershipFormAction(), createCouncilFormAction() (+23 more)

### Community 75 - "authenticated-shell.tsx"
Cohesion: 0.18
Nodes (17): AuthenticatedShell(), AccessContext, ALL_ROLES, filterNavigation(), NAV_GROUPS, NAV_ITEMS, NavGroup, NavItem (+9 more)

### Community 76 - "ok"
Cohesion: 0.09
Nodes (17): validateAllocations(), validateUpload(), AttachmentForProgress, StoragePort, Attachment, isVisibleAttachment(), DocumentService, MeetingRepository (+9 more)

### Community 77 - "ActionForm"
Cohesion: 0.08
Nodes (54): RetentionForms(), MembershipForms(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), AmendmentForm(), CloseContractForm(), NewMaterialForm() (+46 more)

### Community 78 - "Button"
Cohesion: 0.10
Nodes (28): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão) (+20 more)

### Community 79 - "seed-demo.mjs"
Cohesion: 0.26
Nodes (8): assertOk(), demoId(), ensureStock(), env, main(), sb, upsertCouncil(), upsertMaterial()

### Community 80 - "documents/service.ts"
Cohesion: 0.14
Nodes (17): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES, extensionOf() (+9 more)

### Community 83 - "analysis.ts"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem"
Cohesion: 0.12
Nodes (15): 1. Visão Geral e Contexto, 2. Requisitos e Casos de Uso, 3.1. Banco de Dados (PostgreSQL / Supabase), 3.2. Sequenciamento de Processos (`nextProcessNumber`), 3. Arquitetura e Modelo de Dados, 4.1. Formulário em `/solicitacoes/nova`, 4.2. Card em `/solicitacoes/[id]`, 4. Design de Interface (UI/UX) (+7 more)

### Community 87 - "public.record_meeting_evidence"
Cohesion: 0.18
Nodes (10): idx_profiles_staff_category, keep_meeting_task_completion, private.keep_meeting_task_completion(), public.meeting_attendance, public.meeting_task_completions, public.record_meeting_evidence(), keep_approved_meeting_minutes, meeting_ai_queue (+2 more)

### Community 88 - "2. Requisitos e Casos de Uso"
Cohesion: 0.13
Nodes (14): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3.2. Serviços e Ações, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade (+6 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.13
Nodes (14): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+6 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "process-history.ts"
Cohesion: 0.10
Nodes (23): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), attachmentIdSchema (+15 more)

### Community 92 - "public.receive_purchase_request_for_contract"
Cohesion: 0.14
Nodes (8): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, contract_receipt_lines_contract_idx, private.check_process_responsible_membership(), public.contract_receipt_lines, public.receive_purchase_request_for_contract(), contract_receipt_line_integrity, private.check_contract_receipt_line()

### Community 93 - "meetings.ts"
Cohesion: 0.19
Nodes (8): MeetingStatus, MeetingRow, SupabaseMeetingRepository, toMeeting(), toPayload(), toPayload(), callRpc(), toDateOrNull()

### Community 94 - "process-actions.tsx"
Cohesion: 0.33
Nodes (7): ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, ProcessStatus, ProcessRow

### Community 95 - "getSession"
Cohesion: 0.10
Nodes (21): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral, POST(), GET() (+13 more)

### Community 96 - "Fluxos atuais e ideais"
Cohesion: 0.33
Nodes (5): Escopo e leitura das evidências, Fluxos atuais e ideais, Fluxos por módulo e rota, Limites, prioridade e aceitação global, Perfis e regras transversais

### Community 97 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 98 - "20261110000003_material_orders.sql"
Cohesion: 0.36
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 99 - "new-contract-form.tsx"
Cohesion: 0.09
Nodes (36): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), matchPdfItems(), NewAtaForm() (+28 more)

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "policy.ts"
Cohesion: 0.08
Nodes (43): AtaPage(), Content(), metadata, Content(), ContractPage(), metadata, buildHoldRows(), HoldItemInput (+35 more)

### Community 112 - "PriceRegistrationAta"
Cohesion: 0.20
Nodes (3): AtaBalance, AtaRepository, PriceRegistrationAta

### Community 113 - "orders/actions.ts"
Cohesion: 0.14
Nodes (18): OrderQueue(), handleApprove(), handleConfirmReject(), OrderQueueProps, PendingOrderItem, MaterialOrderForm(), handleSubmit(), resetForm() (+10 more)

### Community 114 - "Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria"
Cohesion: 0.14
Nodes (13): 1. Contexto e Objetivos, 2.1 Modelo de Dados (Supabase Migration), 2.2 Regras de Negócio e Domínio de Estoque, 2.3 Interfaces de Usuário para Pedidos, 2. Subsistema 1: Pedidos de Materiais (`material_orders`), 3.1 Encerramento de Processo com Documentação Parcial, 3.2 Recebimento de Materiais com Saldo Pendente, 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%) (+5 more)

### Community 115 - "Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos"
Cohesion: 0.18
Nodes (10): 1. Contexto e Diagnóstico dos Problemas Atuais, 2. Objetivos do Redesign, 3.1 Cabeçalho & Régua de 4 Métricas (`ProcessHeader`), 3.2 Aba 1: `📁 Documentação (7+N)` (`ProcessDocumentationTab`), 3.3 Aba 2: `🤝 Contratação, Atas & Economia` (`ProcessContractingTab`), 3.4 Aba 3: `⚙️ Governança & Histórico` (`ProcessGovernanceTab`), 3. Arquitetura da Solução e Componentes, 4. Garantia de Compatibilidade e Invariantes (+2 more)

### Community 116 - "Global Constraints"
Cohesion: 0.20
Nodes (9): Global Constraints, Redesign Visual da Página de Processos — Plano de Implementação, Task 1: Componente de Topo Executivo e Régua de Métricas (`ProcessHeader`), Task 2: Linha Compacta de Documento (`CompactDocumentRow`), Task 3: Aba 1 — Pasta Documental (`DocumentationTab`), Task 4: Ajustar Alinhamento do Formulário em `FormalizationCard` e Criar Aba 2 (`ContractingTab`), Task 5: Aba 3 — Governança e Histórico (`GovernanceTab`), Task 6: Orquestração da Página Principal com Tabs (`/processos/[id]/page.tsx`) (+1 more)

### Community 117 - "Plano de testes e validação UX"
Cohesion: 0.20
Nodes (9): Camadas e evidência, E2E e navegação, Estado da execução, Estados e segurança, Gate de baseline técnica, Integridade backend prioritária, Matriz navegador e acessibilidade, Plano de testes e validação UX (+1 more)

### Community 118 - "whatsapp.ts"
Cohesion: 0.53
Nodes (4): formatWhatsapp(), onlyDigits(), parseWhatsapp(), WhatsappParse

### Community 119 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.13
Nodes (14): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação, Estoque e materiais (+6 more)

### Community 120 - "purchases/service.test.ts"
Cohesion: 0.53
Nodes (5): approver(), ataItem(), manager(), stockOf(), submitted()

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "media-actions.ts"
Cohesion: 0.13
Nodes (20): draftSchema, GET(), maxDuration, MeetingFile(), getUrl(), makeDraft(), AUDIO_TYPES, MeetingMediaPanel() (+12 more)

### Community 123 - "repositories.ts"
Cohesion: 0.12
Nodes (5): SupabaseInventoryRepository, SupabaseStorage, SupabaseSupplierRepository, selectAll(), createSupabaseRepositories()

### Community 124 - "fields.tsx"
Cohesion: 0.11
Nodes (24): ProductField(), ProductFieldProps, exactProduct(), filterProducts(), normalizeProductQuery(), ProductOption, options, CorrectionForm() (+16 more)

### Community 125 - "home-overview.tsx"
Cohesion: 0.22
Nodes (11): BigStat(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, BarStatItem, BarStatList(), describeArc() (+3 more)

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

### Community 131 - "003_fluxos_atomicos.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 134 - "suppliers/service.ts"
Cohesion: 0.20
Nodes (6): SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema, SupplierService

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

### Community 139 - "processes.ts"
Cohesion: 0.23
Nodes (9): DocumentalSnapshot, DocumentTypeCode, AttachmentRow, SnapshotJson, snapshotToJson(), SupabaseProcessRepository, toProcess(), toProcessChanges() (+1 more)

### Community 140 - "Avisos de vencimento por e-mail"
Cohesion: 0.50
Nodes (3): Avisos de vencimento por e-mail, Configuração, Entrega e limites

### Community 141 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 142 - "Documento de Design Técnico: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões"
Cohesion: 0.15
Nodes (12): 1. Contexto e Objetivos, 2.1 Modelo de Dados e Banco (Supabase Migration), 2.2 Domínio de Processos e Cálculo de Progresso, 2.3 Interface do Usuário (UI), 2. Subsistema 1: Artefatos Adicionais nos Processos Administrativos, 3.1 Unificação dos Grupos de Navegação (`src/shared/lib/authz/navigation.ts`), 3. Subsistema 2: Centralização da Navegação e Nomenclatura Institucional, 4.1 KPIs e Indicadores no Topo de `/reunioes` (+4 more)

### Community 150 - "cn"
Cohesion: 0.22
Nodes (8): @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, @base-ui/react, class-variance-authority, cn, Badge(), badgeVariants

### Community 151 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 153 - "identity.ts"
Cohesion: 0.13
Nodes (9): MembershipRecord, MembershipDirectory, CouncilRow, MembershipRow, SupabaseCouncilRepository, SupabaseMembershipRepository, toCouncil(), toRow() (+1 more)

### Community 154 - "documentation-tab.tsx"
Cohesion: 0.15
Nodes (15): react-dom, buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, BASE_PROPS, PriceResearchItemInput, PriceResearchLine (+7 more)

### Community 162 - "private.validate_meeting_details"
Cohesion: 0.24
Nodes (4): calendar_appointments_scope_date_idx, public.calendar_appointments, private.validate_meeting_details(), validate_meeting_details

### Community 174 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build, loadProcessDocumentsAction()

### Community 175 - "identity/service.test.ts"
Cohesion: 0.12
Nodes (6): InMemoryCouncilRepository, InMemoryMembershipRepository, base, setup(), InMemorySupplierRepository, createMemoryRepositories()

### Community 178 - "Global Constraints"
Cohesion: 0.22
Nodes (7): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 180 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 181 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

### Community 184 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 185 - "002_validacao_sem_pgtap.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 982 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `InMemoryAuditRepository`, `readableCouncilIds`, `simple-table.tsx`, `pdf.ts`, `inventory/service.ts`, `ProcessFormalization`, `time.ts`, `notifications.ts`, `calendario/page.tsx`, `dashboard/page.tsx`, `simple-table.tsx`, `documentation-tab.tsx`, `parseCurrencyInput`, `entry-sources.ts`, `toFortalezaDate`, `documentation-tab.tsx`, `purchases/service.ts`, `memory-repositories.ts`, `result.ts`, `groq.ts`, `callback-app/app/page.tsx`, `order.ts`, `processes/service.ts`, `toFortalezaDate`, `contracts/service.ts`, `identity/service.test.ts`, `next`, `process-view.tsx`, `atas/extract-pdf/route.ts`, `extract-request/route.ts`, `request-template.ts`, `handler.ts`, `createSessionClient`, `contracts/actions.ts`, `package.json`, `atas/service.ts`, `material-order-dialog.tsx`, `callback-server.mjs`, `notification-destination.ts`, `authenticated-shell.tsx`, `ok`, `Button`, `documents/service.ts`, `analysis.ts`, `process-history.ts`, `process-actions.tsx`, `getSession`, `cnpj.ts`, `new-contract-form.tsx`, `policy.ts`, `orders/actions.ts`, `whatsapp.ts`, `purchases/service.test.ts`, `media-actions.ts`, `fields.tsx`, `home-overview.tsx`, `atas/service.test.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `readableCouncilIds` be split into smaller, more focused modules?**
  _Cohesion score 0.0946969696969697 - nodes in this community are weakly interconnected._
- **Why does `ok()` connect `ok` to `readableCouncilIds`, `simple-table.tsx`, `identity/actions.ts`, `vitest`, `suppliers/service.ts`, `button.tsx`, `inventory/service.ts`, `container.ts`, `processes.ts`, `dashboard/page.tsx`, `documentation-tab.tsx`, `Result`, `entry-sources.ts`, `toFortalezaDate`, `identity.ts`, `purchases/service.ts`, `memory-repositories.ts`, `result.ts`, `reports/service.ts`, `groq.ts`, `order.ts`, `db.ts`, `processes/service.ts`, `adapters/purchases.ts`, `toFortalezaDate`, `contracts/service.ts`, `Global Constraints`, `identity/service.test.ts`, `atas.ts`, `AuditEntry`, `next`, `solicitacoes/[id]/page.tsx`, `atas/service.ts`, `runAction`, `ActionForm`, `Button`, `documents/service.ts`, `policy.ts`, `PriceRegistrationAta`, `media-actions.ts`, `repositories.ts`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `simple-table.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06302521008403361 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `simple-table.tsx`, `identity/actions.ts`, `dependencies`, `button.tsx`, `time.ts`, `dashboard/page.tsx`, `documentation-tab.tsx`, `process-actions.tsx`, `result.ts`, `movement-form.tsx`, `groq.ts`, `callback-app/app/page.tsx`, `auth-stage.tsx`, `process-view.tsx`, `handler.ts`, `solicitacoes/[id]/page.tsx`, `createSessionClient`, `contracts/actions.ts`, `package.json`, `toast-store.ts`, `material-order-dialog.tsx`, `callback-server.mjs`, `runAction`, `authenticated-shell.tsx`, `ActionForm`, `Button`, `getSession`, `new-contract-form.tsx`, `policy.ts`, `orders/actions.ts`, `media-actions.ts`, `fields.tsx`, `home-overview.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.10235690235690235 - nodes in this community are weakly interconnected._