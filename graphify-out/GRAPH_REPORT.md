# Graph Report - warleysales-atas-push  (2026-11-27)

## Corpus Check
- 628 files · ~292,729 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 3723 nodes · 13148 edges · 170 communities (136 shown, 34 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 463 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7ba0c210`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- runAction
- Global Constraints
- dashboard/page.tsx
- simple-table.tsx
- process-attachment-sheet.tsx
- simple-table.tsx
- result.ts
- InMemoryPurchaseRequestRepository
- inventory/service.ts
- ProfileSummary
- formalizations.ts
- public.purchase_requests
- apply_all.sql
- Attachment
- Tarefas
- purchases/service.ts
- ok
- ProcessService
- vitest
- documentation-tab.tsx
- package.json
- identity/service.test.ts
- lucide-react
- can
- parseInput
- unwrap
- anon
- purchases/service.test.ts
- [...path]/page.tsx
- documentation-tab.tsx
- toFortalezaDate
- processes/schemas.ts
- public.profiles
- can
- pdf.ts
- public.create_contract_with_ata
- server/session.ts
- request-template.ts
- 20261102000006_fk_indexes.sql
- lucide-react
- transfer.ts
- adapters/purchases.ts
- relatorios/page.tsx
- getSession
- AuditEntry
- groq.ts
- identity.ts
- processes.ts
- formalization-card.tsx
- toDate
- InMemoryInventoryRepository
- RetentionRepository
- @playwright/test
- alert-source.ts
- contracts/actions.ts
- meetings/service.ts
- createSessionClient
- media-actions.ts
- createSessionClient
- SupabaseContractRepository
- app-shell.tsx
- components.json
- time.ts
- orders.ts
- RetentionRepository
- meetings.ts
- material-order-dialog.tsx
- compilerOptions
- toast-store.ts
- db.ts
- compilerOptions
- callback-server.mjs
- home-overview.tsx
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- react
- atas.ts
- process-view.tsx
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- contracts/service.ts
- whatsapp.ts
- PDFReport
- contracts/actions.ts
- processes.test.ts
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- agenda-board.tsx
- detailed/route.ts
- contratos/[id]/page.tsx
- atas/extract-pdf/route.ts
- Global Constraints
- actions.movement-lines.test.ts
- cnpj.ts
- MaterialOrder
- formalization.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- cnpj.ts
- ata/route.ts
- result.ts
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- material-order-dialog.tsx
- react-dom
- Diagnóstico validado de UX
- Execução local, deploy e backups
- alertas/route.ts
- processes/actions.ts
- react-dom
- Fluxos atuais e ideais
- Validação realmente executada
- atas-de-reuniao-operacao.md
- reunioes/page.tsx
- Checklist de execução
- Execução dos blocos 1 e 2
- Pendências e limitações conhecidas
- processes.ts
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
- fail
- Global Constraints
- file-upload.tsx
- repositories.ts
- Auditoria de desempenho do Warley
- 20261110000003_material_orders.sql
- movement-form.tsx
- container.ts

## God Nodes (most connected - your core abstractions)
1. `ok()` - 300 edges
2. `fail()` - 234 edges
3. `Result` - 206 edges
4. `Actor` - 135 edges
5. `next` - 123 edges
6. `vitest` - 120 edges
7. `react` - 98 edges
8. `runAction()` - 86 edges
9. `can()` - 82 edges
10. `unwrap()` - 80 edges

## Surprising Connections (you probably didn't know these)
- `Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`)` --references--> `ActionHub()`  [INFERRED]
  docs/superpowers/plans/2026-11-11-redesign-visao-geral-e-meu-painel.md → src/app/(app)/meu-conselho/action-hub.tsx
- `Task 4: Ajustar Alinhamento do Formulário em `FormalizationCard` e Criar Aba 2 (`ContractingTab`)` --references--> `FormalizationCard()`  [INFERRED]
  docs/superpowers/plans/2026-11-11-process-page-redesign.md → src/app/(app)/processos/[id]/formalization-card.tsx
- `Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters)` --references--> `AuditFilter`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda2-pedidos-justificativas-auditoria.md → src/modules/audit/schemas.ts
- `Escopo e confiança` --references--> `assertInstrumentsLinked()`  [INFERRED]
  docs/ux-improvement-plan/01-diagnostico-validado.md → src/modules/formalizations/actions.ts
- `UX-16 — Baseline de testes e tipagem` --references--> `assertInstrumentsLinked()`  [INFERRED]
  docs/ux-improvement-plan/04-roadmap-implementacao.md → src/modules/formalizations/actions.ts

## Import Cycles
- None detected.

## Communities (170 total, 34 thin omitted)

### Community 0 - "runAction"
Cohesion: 0.09
Nodes (40): Option, MarkReadForm(), input, saveAppointment(), assignMembershipFormAction(), createCouncilFormAction(), removeMembershipFormAction(), setStaffCategoryFormAction() (+32 more)

### Community 1 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 2 - "dashboard/page.tsx"
Cohesion: 0.12
Nodes (26): 5. Componentes existentes a reutilizar e mudanças propostas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor(), FormalizationQueue(), FormalizationQueueProps (+18 more)

### Community 4 - "process-attachment-sheet.tsx"
Cohesion: 0.13
Nodes (21): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, openProcessAttachment(), ProcessAttachmentSheet() (+13 more)

### Community 5 - "simple-table.tsx"
Cohesion: 0.14
Nodes (25): DataTable(), DataTableColumn, DataTableProps, Cell, collator, compareValues(), filterAndSortTableRows(), FilterDefinition (+17 more)

### Community 6 - "result.ts"
Cohesion: 0.07
Nodes (94): nextConfig, next, AuditPage(), AuditPageProps, Content(), metadata, one(), AdministrationPage() (+86 more)

### Community 7 - "InMemoryPurchaseRequestRepository"
Cohesion: 0.06
Nodes (5): InMemoryMeetingRepository, MeetingDetails, InMemoryPurchaseRequestRepository, InMemoryTransferRepository, setup()

### Community 8 - "inventory/service.ts"
Cohesion: 0.07
Nodes (45): CommitmentEventType, CommitRequest, computeAtaBalance(), validateAllocations(), validateCommitment(), none, classifyStockLevel(), CRITICAL_RATIO (+37 more)

### Community 9 - "ProfileSummary"
Cohesion: 0.12
Nodes (10): CouncilRepository, MembershipRepository, Council, ProfileSummary, assignMembershipSchema, councilFields, createCouncilSchema, MembershipService (+2 more)

### Community 10 - "formalizations.ts"
Cohesion: 0.27
Nodes (4): FormalizationRow, fromRow(), SupabaseFormalizationRepository, toRow()

### Community 11 - "public.purchase_requests"
Cohesion: 0.06
Nodes (38): public.save_contract(), public.save_purchase_request(), trg_audit_logs_immutable, trg_contract_amendments_immutable, trg_contract_amendments_no_truncate, idx_contracts_supplier_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id (+30 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.05
Nodes (110): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, calendar_appointments_scope_date_idx, check_staff_membership, council_memberships_one_director, idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_extensions_requested_by (+102 more)

### Community 13 - "Attachment"
Cohesion: 0.08
Nodes (37): Attachment, attachmentIdSchema, PreparedUpload, prepareUploadSchema, uploadDocumentSchema, CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput (+29 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.08
Nodes (30): Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, applyReceipt(), ReceiptItemResult, ReceiptItemState (+22 more)

### Community 16 - "ok"
Cohesion: 0.09
Nodes (14): 3.3. Repositório e Camada de Domínio, PriceRegistrationAta, Meeting, MeetingService, parseProcessNumber(), AdministrativeProcess, context(), guard() (+6 more)

### Community 17 - "ProcessService"
Cohesion: 0.19
Nodes (26): InMemoryAtaRepository, AtaService, setup(), InMemoryAuditRepository, AuditService, InMemoryContractRepository, ContractService, FailingRepository (+18 more)

### Community 18 - "vitest"
Cohesion: 0.09
Nodes (40): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+32 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.12
Nodes (36): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+28 more)

### Community 20 - "package.json"
Cohesion: 0.12
Nodes (22): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5, @types/react@^19 (+14 more)

### Community 21 - "identity/service.test.ts"
Cohesion: 0.13
Nodes (4): InMemoryCouncilRepository, InMemoryMembershipRepository, InMemorySupplierRepository, createMemoryRepositories()

### Community 22 - "lucide-react"
Cohesion: 0.06
Nodes (41): MonthDialog(), MonthDialogProps, citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME (+33 more)

### Community 23 - "can"
Cohesion: 0.16
Nodes (12): Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), calculateSavings(), ProcessFormalization, FormalizationRepository, FormalizationService, SavingsSummary, can(), PermissionAction (+4 more)

### Community 24 - "parseInput"
Cohesion: 0.15
Nodes (13): NavigationFixture(), AuthLayout(), NotFound(), AppShell(), AppShellProps, getServerSidebarSnapshot(), getSidebarSnapshot(), subscribeSidebar() (+5 more)

### Community 25 - "unwrap"
Cohesion: 0.11
Nodes (8): SupabaseNotificationRepository, toNotification(), SupabaseMaterialOrderRepository, SupabaseRetentionRepository, isUniqueViolation(), toIso(), unwrap(), SupabaseJobRunRepository

### Community 26 - "anon"
Cohesion: 0.12
Nodes (25): public.apply_stock_mutation(), public.correct_purchase_request(), public.register_process_ata(), public.register_process_ata_for_winner(), public.set_document_exception(), public.set_process_contracting_mode(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+17 more)

### Community 27 - "purchases/service.test.ts"
Cohesion: 0.15
Nodes (10): InMemoryStorage, createProcessWithProgress(), Ctx, PDF, approver(), ataItem(), manager(), stockOf() (+2 more)

### Community 28 - "[...path]/page.tsx"
Cohesion: 0.11
Nodes (21): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessHeader() (+13 more)

### Community 29 - "documentation-tab.tsx"
Cohesion: 0.07
Nodes (44): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_ata_commitments_council_id (+36 more)

### Community 30 - "toFortalezaDate"
Cohesion: 0.23
Nodes (14): auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, first(), kinds, parseDetailedFilter() (+6 more)

### Community 31 - "processes/schemas.ts"
Cohesion: 0.15
Nodes (13): FormalizationCardProps, ContractingTabProps, isProcessContractingMode(), needsAta(), PROCESS_CONTRACTING_MODES, ProcessContractingMode, changeProcessStatusSchema, classifyProcessSchema (+5 more)

### Community 32 - "public.profiles"
Cohesion: 0.12
Nodes (32): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+24 more)

### Community 33 - "can"
Cohesion: 0.09
Nodes (22): dependencies, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, next@16.4.6 (+14 more)

### Community 34 - "pdf.ts"
Cohesion: 0.16
Nodes (22): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+14 more)

### Community 35 - "public.create_contract_with_ata"
Cohesion: 0.09
Nodes (20): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+12 more)

### Community 36 - "server/session.ts"
Cohesion: 0.16
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

### Community 37 - "request-template.ts"
Cohesion: 0.16
Nodes (19): GET(), buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias(), normalizeHeader() (+11 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (34): public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+26 more)

### Community 39 - "lucide-react"
Cohesion: 0.06
Nodes (69): 6. Valores, estados e mensagens: salvaguardas, Reutilização em painéis por perfil, lucide-react, weekdays, ApprovalQueue(), ApprovalQueueProps, PendingApprovalItem, CouncilWorkspace() (+61 more)

### Community 40 - "transfer.ts"
Cohesion: 0.17
Nodes (16): changeMeetingStatus(), MEETING_TRANSITIONS, changeProcessStatus(), PROCESS_TRANSITIONS, changeTransferStatus(), HOLDS_RESERVATION, receiveEffect(), stockEffectFor() (+8 more)

### Community 41 - "adapters/purchases.ts"
Cohesion: 0.21
Nodes (7): AtomicDecision, AtomicReceipt, LinkedRequestNotes, LinkedRequestNotesRow, SupabasePurchaseRequestRepository, toRequest(), rpcOutcomeToResult()

### Community 42 - "relatorios/page.tsx"
Cohesion: 0.11
Nodes (25): ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), AuditTrailTabProps, ENTITY_LABELS, extractJustificationOrDetails(), formatActionLabel(), formatEntityLabel() (+17 more)

### Community 43 - "getSession"
Cohesion: 0.24
Nodes (11): Arquitetura e caminho dos dados, GET(), AuthenticatedShell(), AppLayout(), Home(), RedirectHome(), getServices(), getSession() (+3 more)

### Community 44 - "AuditEntry"
Cohesion: 0.25
Nodes (6): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry

### Community 45 - "groq.ts"
Cohesion: 0.05
Nodes (50): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação, Estoque e materiais (+42 more)

### Community 46 - "identity.ts"
Cohesion: 0.09
Nodes (13): MembershipRecord, StaffCategory, MembershipDirectory, SessionState, CouncilRow, MembershipRow, SupabaseCouncilRepository, SupabaseMembershipRepository (+5 more)

### Community 47 - "processes.ts"
Cohesion: 0.15
Nodes (16): mammoth@^1.13.0, mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText() (+8 more)

### Community 48 - "formalization-card.tsx"
Cohesion: 0.09
Nodes (33): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), handleQuickHomologate(), auctionLabel(), FormalizationCard() (+25 more)

### Community 49 - "toDate"
Cohesion: 0.36
Nodes (7): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract

### Community 50 - "InMemoryInventoryRepository"
Cohesion: 0.23
Nodes (8): StockBalance, InMemoryInventoryRepository, keyOf(), StockKey, StockMutation, StockRow, StockState, MovementRecord

### Community 52 - "@playwright/test"
Cohesion: 0.09
Nodes (14): evidence, routes, sanitizeText(), sanitizeUrl(), destinations, @playwright/test@^1.65.1, envFiles, envNames (+6 more)

### Community 53 - "alert-source.ts"
Cohesion: 0.14
Nodes (11): AlertEntityType, AlertMilestone, digestMessage(), dispatchNotificationEmails(), EmailDispatchSummary, EmailMessage, groupByRecipient(), NotificationRepository (+3 more)

### Community 54 - "contracts/actions.ts"
Cohesion: 0.16
Nodes (12): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), ExtractedContract (+4 more)

### Community 55 - "meetings/service.ts"
Cohesion: 0.25
Nodes (5): SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema

### Community 56 - "createSessionClient"
Cohesion: 0.15
Nodes (12): GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createSupabaseJobRunRepository(), JobOutcome, JobRunRepository (+4 more)

### Community 57 - "media-actions.ts"
Cohesion: 0.14
Nodes (19): draftSchema, GET(), maxDuration, MeetingFile(), getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio() (+11 more)

### Community 58 - "createSessionClient"
Cohesion: 0.21
Nodes (10): UX-17 — Recovery, callback e falha de provedor, @supabase/ssr, ALLOWED_NEXT, GET(), createClient, config, proxy(), getSupabaseConfig() (+2 more)

### Community 59 - "SupabaseContractRepository"
Cohesion: 0.27
Nodes (3): SupabaseContractRepository, toContract(), toPayload()

### Community 60 - "app-shell.tsx"
Cohesion: 0.14
Nodes (20): STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, ALL_ROLES, COUNCIL_ROLE_LABELS, COUNCIL_ROLES, filterNavigation(), NAV_GROUPS, NAV_ITEMS (+12 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "time.ts"
Cohesion: 0.08
Nodes (49): AtaBalancePanel(), AtaBalanceRow, buildAtaBalanceRows(), AtaPage(), Content(), metadata, AtaValidityField(), applyStart() (+41 more)

### Community 63 - "orders.ts"
Cohesion: 0.16
Nodes (16): matchPdfItems(), NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption, ataStepFormAction() (+8 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.24
Nodes (5): InMemoryRetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "meetings.ts"
Cohesion: 0.19
Nodes (8): MeetingStatus, MeetingRow, SupabaseMeetingRepository, toMeeting(), toPayload(), toPayload(), callRpc(), toDateOrNull()

### Community 66 - "material-order-dialog.tsx"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "db.ts"
Cohesion: 0.09
Nodes (23): @supabase/supabase-js, MovementType, InternalMovement, ContractRow, BalanceRow, MaterialRow, MovementRow, SupabaseInventoryRepository (+15 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "home-overview.tsx"
Cohesion: 0.22
Nodes (12): BigStat(), ChartCard(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, BarStatItem, BarStatList() (+4 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "react"
Cohesion: 0.25
Nodes (6): FixtureReady(), FixtureLayout(), react, RetryButton(), refresh, startTransition

### Community 75 - "atas.ts"
Cohesion: 0.18
Nodes (8): AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toAta(), toCommitment(), toPayload(), DbResponse

### Community 76 - "process-view.tsx"
Cohesion: 0.06
Nodes (52): buildStockEntrySources(), RECEIVABLE, StockEntryItem, ArchiveProcessAction(), FormalizationSupplier, PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId (+44 more)

### Community 77 - "ActionForm"
Cohesion: 0.11
Nodes (40): RetentionForms(), MembershipForms(), ProvisionCouncilForm(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), AmendmentForm(), NewMaterialForm() (+32 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "contracts/service.ts"
Cohesion: 0.07
Nodes (36): AtaExtension, ExtensionRequest, AtaView, original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms (+28 more)

### Community 81 - "whatsapp.ts"
Cohesion: 0.32
Nodes (8): CouncilsContent(), CouncilsPage(), metadata, formatWhatsapp(), onlyDigits(), parseWhatsapp(), whatsappHref(), WhatsappParse

### Community 83 - "contracts/actions.ts"
Cohesion: 0.28
Nodes (9): CloseContractForm(), addAmendmentFormAction(), closeContractFormAction(), createContractFormAction(), linkContractProcessFormAction(), optionalNumber(), optionalText(), processReturnPath() (+1 more)

### Community 84 - "processes.test.ts"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem"
Cohesion: 0.12
Nodes (15): 1. Visão Geral e Contexto, 2. Requisitos e Casos de Uso, 3.1. Banco de Dados (PostgreSQL / Supabase), 3.2. Sequenciamento de Processos (`nextProcessNumber`), 3. Arquitetura e Modelo de Dados, 4.1. Formulário em `/solicitacoes/nova`, 4.2. Card em `/solicitacoes/[id]`, 4. Design de Interface (UI/UX) (+7 more)

### Community 87 - "public.record_meeting_evidence"
Cohesion: 0.14
Nodes (16): public.save_meeting(), idx_meeting_action_items_meeting_id, idx_meeting_action_items_responsible_id, idx_meetings_created_by, idx_meetings_minutes_registered_by, keep_meeting_task_completion, private.keep_meeting_task_completion(), public.meeting_attendance (+8 more)

### Community 88 - "2. Requisitos e Casos de Uso"
Cohesion: 0.13
Nodes (14): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3.2. Serviços e Ações, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade (+6 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.13
Nodes (14): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+6 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "agenda-board.tsx"
Cohesion: 0.15
Nodes (26): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+18 more)

### Community 92 - "detailed/route.ts"
Cohesion: 0.35
Nodes (7): GET(), loadReportNames(), localDate(), presentDetailedReport(), readable(), ReportNames, terms

### Community 93 - "contratos/[id]/page.tsx"
Cohesion: 0.21
Nodes (12): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, AppointmentRow, CalendarioPage(), Content() (+4 more)

### Community 94 - "atas/extract-pdf/route.ts"
Cohesion: 0.27
Nodes (7): POST(), ExtractedAta, ExtractedAtaItem, extractedItemSchema, extractedSchema, parseExtractedAta(), valid

### Community 95 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

### Community 96 - "actions.movement-lines.test.ts"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 97 - "cnpj.ts"
Cohesion: 0.36
Nodes (7): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso()

### Community 98 - "MaterialOrder"
Cohesion: 0.07
Nodes (33): Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, approveMaterialOrder(), approveOrder, cancelMaterialOrder(), cancelOrder, changeMaterialOrderStatus(), changeOrderStatus (+25 more)

### Community 99 - "formalization.ts"
Cohesion: 0.10
Nodes (17): BASE_FORMALIZATION, MOCK_SUPPLIERS, contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema (+9 more)

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 112 - "ata/route.ts"
Cohesion: 0.46
Nodes (5): pdf-lib, GET(), DetailedReport, clean(), detailedReportPdf()

### Community 113 - "result.ts"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

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

### Community 118 - "material-order-dialog.tsx"
Cohesion: 0.08
Nodes (30): @base-ui/react, cn, OrderQueue(), handleApprove(), handleConfirmReject(), OrderQueueProps, PendingOrderItem, MaterialOrderDialog() (+22 more)

### Community 119 - "react-dom"
Cohesion: 0.25
Nodes (5): react-dom, baseAtas, baseContracts, baseStock, BASE_PROPS

### Community 120 - "Diagnóstico validado de UX"
Cohesion: 0.29
Nodes (6): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "alertas/route.ts"
Cohesion: 0.38
Nodes (3): GET, EmailSender, createResendSender()

### Community 123 - "processes/actions.ts"
Cohesion: 0.14
Nodes (18): Option, ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, changeProcessStatusFormAction(), classifyProcessFormAction() (+10 more)

### Community 124 - "react-dom"
Cohesion: 0.20
Nodes (18): CurrencyFixture(), buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, lineSchema, saveProcessPriceResearch(), PriceResearchItemInput (+10 more)

### Community 125 - "Fluxos atuais e ideais"
Cohesion: 0.33
Nodes (5): Escopo e leitura das evidências, Fluxos atuais e ideais, Fluxos por módulo e rota, Limites, prioridade e aceitação global, Perfis e regras transversais

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 128 - "reunioes/page.tsx"
Cohesion: 0.28
Nodes (8): AttachmentRow, calendarHref(), detailHref(), MeetingCard(), meetingStatus(), metadata, Option, Query

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 134 - "processes.ts"
Cohesion: 0.18
Nodes (7): snapshotToJson(), SupabaseDocumentRepository, SupabaseProcessRepository, toAttachment(), toProcess(), toProcessChanges(), toIsoOrNull()

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

### Community 150 - "fail"
Cohesion: 0.10
Nodes (21): AtaBalance, CommitmentEvent, CouncilAllocation, ATA_INITIAL_YEARS, ATA_LEGAL_BASIS, ATA_MAX_EXTENSIONS, AtaValidityStatus, ataValidityStatus() (+13 more)

### Community 151 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 153 - "file-upload.tsx"
Cohesion: 0.14
Nodes (18): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES (+10 more)

### Community 154 - "repositories.ts"
Cohesion: 0.13
Nodes (7): AuditRow, parseDateRange(), SupabaseAuditRepository, toEntry(), SupabaseStorage, SupabaseSupplierRepository, createSupabaseRepositories()

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.20
Nodes (9): Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão, Medições e limites (+1 more)

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.12
Nodes (24): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+16 more)

### Community 180 - "container.ts"
Cohesion: 0.06
Nodes (45): Contratos de serviço, Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), zod, AuditRecorder, AttachmentForProgress, DocumentRepository, StoragePort, isVisibleAttachment() (+37 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 951 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `reunioes/page.tsx`, `runAction`, `dashboard/page.tsx`, `process-attachment-sheet.tsx`, `result.ts`, `processes.ts`, `inventory/service.ts`, `ProfileSummary`, `purchases/service.ts`, `ProcessService`, `vitest`, `documentation-tab.tsx`, `identity/service.test.ts`, `fail`, `can`, `file-upload.tsx`, `repositories.ts`, `purchases/service.test.ts`, `toFortalezaDate`, `server/session.ts`, `lucide-react`, `transfer.ts`, `adapters/purchases.ts`, `relatorios/page.tsx`, `AuditEntry`, `groq.ts`, `identity.ts`, `formalization-card.tsx`, `InMemoryInventoryRepository`, `RetentionRepository`, `container.ts`, `meetings/service.ts`, `media-actions.ts`, `time.ts`, `db.ts`, `atas.ts`, `process-view.tsx`, `contracts/service.ts`, `contratos/[id]/page.tsx`, `MaterialOrder`, `react-dom`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `runAction` be split into smaller, more focused modules?**
  _Cohesion score 0.08870056497175141 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `dashboard/page.tsx`, `process-attachment-sheet.tsx`, `simple-table.tsx`, `result.ts`, `inventory/service.ts`, `Attachment`, `purchases/service.ts`, `ok`, `ProcessService`, `documentation-tab.tsx`, `package.json`, `lucide-react`, `fail`, `can`, `file-upload.tsx`, `purchases/service.test.ts`, `[...path]/page.tsx`, `toFortalezaDate`, `processes/schemas.ts`, `pdf.ts`, `request-template.ts`, `lucide-react`, `transfer.ts`, `relatorios/page.tsx`, `groq.ts`, `movement-form.tsx`, `formalization-card.tsx`, `toDate`, `processes.ts`, `alert-source.ts`, `contracts/actions.ts`, `createSessionClient`, `media-actions.ts`, `createSessionClient`, `app-shell.tsx`, `time.ts`, `orders.ts`, `db.ts`, `callback-server.mjs`, `home-overview.tsx`, `react`, `process-view.tsx`, `contracts/service.ts`, `whatsapp.ts`, `contracts/actions.ts`, `agenda-board.tsx`, `detailed/route.ts`, `atas/extract-pdf/route.ts`, `cnpj.ts`, `MaterialOrder`, `formalization.ts`, `cnpj.ts`, `ata/route.ts`, `result.ts`, `material-order-dialog.tsx`, `react-dom`, `processes/actions.ts`, `react-dom`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Why does `fail()` connect `ok` to `reunioes/page.tsx`, `runAction`, `process-attachment-sheet.tsx`, `result.ts`, `processes.ts`, `inventory/service.ts`, `ProfileSummary`, `purchases/service.ts`, `ProcessService`, `vitest`, `documentation-tab.tsx`, `identity/service.test.ts`, `fail`, `can`, `file-upload.tsx`, `repositories.ts`, `purchases/service.test.ts`, `toFortalezaDate`, `server/session.ts`, `transfer.ts`, `adapters/purchases.ts`, `relatorios/page.tsx`, `AuditEntry`, `groq.ts`, `identity.ts`, `formalization-card.tsx`, `InMemoryInventoryRepository`, `container.ts`, `meetings/service.ts`, `media-actions.ts`, `SupabaseContractRepository`, `db.ts`, `atas.ts`, `process-view.tsx`, `contracts/service.ts`, `contratos/[id]/page.tsx`, `MaterialOrder`, `processes/actions.ts`, `react-dom`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `process-attachment-sheet.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12773109243697478 - nodes in this community are weakly interconnected._