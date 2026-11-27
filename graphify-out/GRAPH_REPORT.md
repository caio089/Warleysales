# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 631 files · ~293,735 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3736 nodes · 13140 edges · 174 communities (135 shown, 39 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 464 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e40fd448`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- next
- Global Constraints
- lucide-react
- pdf.ts
- process-attachment-sheet.tsx
- home-overview.test.tsx
- result.ts
- .insert
- inventory/service.ts
- MembershipRepository
- ProcessFormalization
- public.receive_purchase_request
- apply_all.sql
- email-delivery.ts
- Tarefas
- purchases/service.ts
- ok
- InMemoryAuditRepository
- purchases/service.test.ts
- documentation-tab.tsx
- package.json
- atomic-path.test.ts
- plan-calendar.ts
- order.ts
- relatorios/page.tsx
- unwrap
- anon
- entry-sources.ts
- can
- public.purchase_requests
- detailed.ts
- Input
- 20261102000002_domain_tables.sql
- dependencies
- KpiCard
- feedback-states.tsx
- toNumber
- simple-table.tsx
- 20261102000006_fk_indexes.sql
- alertas/page.tsx
- runAction
- Actor
- audit-trail-tab.tsx
- contracts/extract-pdf/route.ts
- AuditEntry
- groq.ts
- notifications/service.ts
- documents/service.ts
- atas/extract-pdf/route.ts
- terms.ts
- estoque/page.tsx
- orders/actions.ts
- validity.ts
- NotificationRepository
- notifications/service.ts
- request-template.ts
- log
- RetentionRepository
- createSessionClient
- SupabaseAtaRepository
- navigation.ts
- components.json
- identity.ts
- documents/schemas.ts
- RetentionRepository
- meetings/service.ts
- public.receive_purchase_request_for_contract
- compilerOptions
- toast-store.ts
- db.ts
- compilerOptions
- callback-server.mjs
- alert-source.ts
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- process-view.tsx
- InMemoryMembershipRepository
- suppliers/service.ts
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- identity/service.ts
- PageHeader
- PDFReport
- getSession
- private.business_error
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- time.ts
- badge.tsx
- process-view.tsx
- file-validation.ts
- SupabasePurchaseRequestRepository
- check-supabase.mjs
- process-history.ts
- MaterialOrder
- repositories.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- InMemoryNotificationRepository
- atas/service.ts
- Global Constraints
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- react
- @playwright/test
- Fluxos atuais e ideais
- Execução local, deploy e backups
- contracts/service.test.ts
- ProcessStatus
- documentation-tab.tsx
- InMemoryCouncilRepository
- Validação realmente executada
- atas-de-reuniao-operacao.md
- retry-button.test.tsx
- Checklist de execução
- Execução dos blocos 1 e 2
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
- contracts/service.ts
- ref_node_fs
- file-upload.tsx
- Global Constraints
- public.spec.ts
- validate-corrections.mjs
- Auditoria de desempenho do Warley
- bundle-migrations.mjs
- purchases/service.test.ts
- playwright.config.ts
- 20261110000003_material_orders.sql
- movement-form.tsx
- container.ts

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

## Communities (174 total, 39 thin omitted)

### Community 0 - "next"
Cohesion: 0.05
Nodes (66): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, nextConfig, next, zod, Option, Option, CouncilPickerProps, ArchiveProcessAction() (+58 more)

### Community 1 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 2 - "lucide-react"
Cohesion: 0.05
Nodes (93): 5. Componentes existentes a reutilizar e mudanças propostas, 6. Valores, estados e mensagens: salvaguardas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, Reutilização em painéis por perfil, lucide-react, ApprovalQueue(), ApprovalQueueProps, PendingApprovalItem (+85 more)

### Community 3 - "pdf.ts"
Cohesion: 0.20
Nodes (16): ACTION_LABELS, auditDetails(), auditReportPdf(), createBase(), dateTime(), DETAIL_LABELS, drawSection(), ENTITY_LABELS (+8 more)

### Community 4 - "process-attachment-sheet.tsx"
Cohesion: 0.13
Nodes (21): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, openProcessAttachment(), ProcessAttachmentSheet() (+13 more)

### Community 5 - "home-overview.test.tsx"
Cohesion: 0.40
Nodes (4): baseAtas, baseContracts, baseDeliveries, baseStock

### Community 6 - "result.ts"
Cohesion: 0.09
Nodes (51): AuditPage(), AuditPageProps, Content(), metadata, one(), ACTION_LABEL, Content(), metadata (+43 more)

### Community 7 - ".insert"
Cohesion: 0.07
Nodes (4): InMemoryContractRepository, InMemoryMeetingRepository, MeetingDetails, InMemoryPurchaseRequestRepository

### Community 8 - "inventory/service.ts"
Cohesion: 0.08
Nodes (37): CommitmentEventType, CommitRequest, computeAtaBalance(), validateAllocations(), validateCommitment(), none, classifyStockLevel(), CRITICAL_RATIO (+29 more)

### Community 9 - "MembershipRepository"
Cohesion: 0.17
Nodes (3): MembershipRepository, MembershipRecord, SupabaseMembershipRepository

### Community 10 - "ProcessFormalization"
Cohesion: 0.09
Nodes (23): BASE_FORMALIZATION, MOCK_SUPPLIERS, calculateSavings(), contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput (+15 more)

### Community 11 - "public.receive_purchase_request"
Cohesion: 0.06
Nodes (38): public.save_contract(), public.save_purchase_request(), trg_audit_logs_immutable, trg_contract_amendments_immutable, trg_contract_amendments_no_truncate, idx_contracts_supplier_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id (+30 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.05
Nodes (110): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, calendar_appointments_scope_date_idx, check_staff_membership, council_memberships_one_director, idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_extensions_requested_by (+102 more)

### Community 13 - "email-delivery.ts"
Cohesion: 0.19
Nodes (6): digestMessage(), dispatchNotificationEmails(), EmailDispatchSummary, EmailMessage, EmailSender, groupByRecipient()

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (34): Escopo e confiança, Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço (+26 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.11
Nodes (26): Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, ReceiptItemResult, ReceiptItemState, ReceiptLine, ReceiptOutcome (+18 more)

### Community 16 - "ok"
Cohesion: 0.10
Nodes (11): AtaExtension, PriceRegistrationAta, Attachment, MeetingService, documentExceptionAction(), rpcOutcomeToResult(), guard(), fail() (+3 more)

### Community 17 - "InMemoryAuditRepository"
Cohesion: 0.11
Nodes (30): InMemoryAtaRepository, setup(), InMemoryAuditRepository, AuditService, setup(), declared(), newProcess(), PDF (+22 more)

### Community 18 - "purchases/service.test.ts"
Cohesion: 0.11
Nodes (31): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+23 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.13
Nodes (31): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+23 more)

### Community 20 - "package.json"
Cohesion: 0.11
Nodes (23): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, @playwright/test@^1.65.1, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5 (+15 more)

### Community 21 - "atomic-path.test.ts"
Cohesion: 0.11
Nodes (12): InMemorySupplierRepository, TransferStatus, InMemoryTransferRepository, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferEvent (+4 more)

### Community 22 - "plan-calendar.ts"
Cohesion: 0.08
Nodes (35): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialog(), MonthDialogProps, AppointmentRow (+27 more)

### Community 23 - "order.ts"
Cohesion: 0.11
Nodes (18): Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, approveMaterialOrder(), approveOrder, cancelMaterialOrder(), cancelOrder, changeMaterialOrderStatus(), changeOrderStatus (+10 more)

### Community 24 - "relatorios/page.tsx"
Cohesion: 0.25
Nodes (16): branding(), download(), GET(), ReportCentral(), AuditContent(), metadata, one(), OperationalContent() (+8 more)

### Community 25 - "unwrap"
Cohesion: 0.09
Nodes (14): AttachmentForProgress, SupabaseNotificationRepository, snapshotToJson(), SupabaseDocumentRepository, SupabaseProcessRepository, toAttachment(), toProcess(), toProcessChanges() (+6 more)

### Community 26 - "anon"
Cohesion: 0.12
Nodes (25): public.apply_stock_mutation(), public.correct_purchase_request(), public.register_process_ata(), public.register_process_ata_for_winner(), public.set_document_exception(), public.set_process_contracting_mode(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+17 more)

### Community 27 - "entry-sources.ts"
Cohesion: 0.17
Nodes (23): buildStockEntrySources(), RECEIVABLE, StockEntryItem, LinkedProcessCardProps, Content(), metadata, RequestPage(), AtaView (+15 more)

### Community 28 - "can"
Cohesion: 0.09
Nodes (15): 6. Estratégia de Testes, MembershipService, ReportService, ANY_MEMBER, authorize(), can(), MANAGER, MANAGER_OPERATOR (+7 more)

### Community 29 - "public.purchase_requests"
Cohesion: 0.07
Nodes (44): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_ata_commitments_council_id (+36 more)

### Community 30 - "detailed.ts"
Cohesion: 0.23
Nodes (15): auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, first(), kinds, parseDetailedFilter() (+7 more)

### Community 31 - "Input"
Cohesion: 0.07
Nodes (42): AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), ProductField(), ProductFieldProps, exactProduct(), filterProducts() (+34 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.12
Nodes (32): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+24 more)

### Community 33 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, @base-ui/react@^1.9.0, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, mammoth@^1.13.0, next@16.4.6 (+12 more)

### Community 34 - "KpiCard"
Cohesion: 0.10
Nodes (35): Content(), metadata, UsersPage(), AtasPage(), Content(), metadata, Content(), ContractsPage() (+27 more)

### Community 35 - "feedback-states.tsx"
Cohesion: 0.09
Nodes (20): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+12 more)

### Community 36 - "toNumber"
Cohesion: 0.08
Nodes (42): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessesTable() (+34 more)

### Community 37 - "simple-table.tsx"
Cohesion: 0.16
Nodes (19): GET(), buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias(), normalizeHeader() (+11 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (34): public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+26 more)

### Community 39 - "alertas/page.tsx"
Cohesion: 0.25
Nodes (12): MarkReadForm(), Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract (+4 more)

### Community 40 - "runAction"
Cohesion: 0.09
Nodes (32): Content(), metadata, RequestsPage(), citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes() (+24 more)

### Community 41 - "Actor"
Cohesion: 0.13
Nodes (10): Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), 3.3. Repositório e Camada de Domínio, 6. Estratégia de Testes, changeRequestStatus(), AtomicDecision, PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService (+2 more)

### Community 42 - "audit-trail-tab.tsx"
Cohesion: 0.26
Nodes (9): ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), AuditTrailTabProps, ENTITY_LABELS, extractJustificationOrDetails(), formatActionLabel(), formatEntityLabel() (+1 more)

### Community 43 - "contracts/extract-pdf/route.ts"
Cohesion: 0.19
Nodes (10): ai@^7.0.159, unpdf@^1.6.2, ai, unpdf, POST(), ExtractedContract, extractedItemSchema, extractedSchema (+2 more)

### Community 44 - "AuditEntry"
Cohesion: 0.18
Nodes (10): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange() (+2 more)

### Community 45 - "groq.ts"
Cohesion: 0.07
Nodes (42): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação, Estoque e materiais (+34 more)

### Community 46 - "notifications/service.ts"
Cohesion: 0.31
Nodes (9): ALERT_MILESTONES, AlertCandidate, dedupKey(), DueAlert, reachedMilestone(), selectDueAlerts(), AlertRunSummary, markReadSchema (+1 more)

### Community 47 - "documents/service.ts"
Cohesion: 0.16
Nodes (15): mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText(), RequestDocumentKind (+7 more)

### Community 48 - "atas/extract-pdf/route.ts"
Cohesion: 0.21
Nodes (9): @ai-sdk/groq@^4.0.74, @ai-sdk/groq, POST(), ExtractedAta, ExtractedAtaItem, extractedItemSchema, extractedSchema, parseExtractedAta() (+1 more)

### Community 49 - "terms.ts"
Cohesion: 0.21
Nodes (12): calculateContractAtaValue(), original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms, currentTerms(), elapsedPercent() (+4 more)

### Community 50 - "estoque/page.tsx"
Cohesion: 0.33
Nodes (8): buildHoldRows(), contractedMaterialsByProcess(), HoldItemInput, HoldRow, Content(), metadata, StockPage(), calculateStockSummary()

### Community 51 - "orders/actions.ts"
Cohesion: 0.13
Nodes (20): MovementType, StockBalance, keyOf(), StockKey, StockMutation, StockRow, StockState, createMaterialSchema (+12 more)

### Community 52 - "validity.ts"
Cohesion: 0.27
Nodes (8): ATA_INITIAL_YEARS, ATA_LEGAL_BASIS, ATA_MAX_EXTENSIONS, AtaValidityStatus, ataValidityStatus(), currentEndDate(), ExtensionRequest, requestExtension()

### Community 53 - "NotificationRepository"
Cohesion: 0.25
Nodes (4): AlertMilestone, NotificationRepository, AppNotification, NotificationRow

### Community 54 - "notifications/service.ts"
Cohesion: 0.13
Nodes (24): CurrencyFixture(), matchPdfItems(), NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption (+16 more)

### Community 55 - "request-template.ts"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

### Community 56 - "log"
Cohesion: 0.13
Nodes (13): GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createSupabaseJobRunRepository(), SupabaseJobRunRepository, JobOutcome (+5 more)

### Community 57 - "RetentionRepository"
Cohesion: 0.14
Nodes (21): GET, draftSchema, GET(), maxDuration, saveAudio(), audioPath(), claimed(), manager (+13 more)

### Community 58 - "createSessionClient"
Cohesion: 0.09
Nodes (20): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, UX-17 — Recovery, callback e falha de provedor, @supabase/ssr@^0.12.7, @supabase/ssr (+12 more)

### Community 59 - "SupabaseAtaRepository"
Cohesion: 0.24
Nodes (4): SupabaseAtaRepository, toAta(), toCommitment(), toPayload()

### Community 60 - "navigation.ts"
Cohesion: 0.17
Nodes (17): Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, AccessContext, ALL_ROLES, filterNavigation(), NAV_GROUPS, NavGroup, NavItem, STAFF_ROLES (+9 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "identity.ts"
Cohesion: 0.24
Nodes (9): CouncilRepository, Council, ProfileSummary, STAFF_CATEGORY_LABELS, StaffCategory, MembershipDirectory, CouncilRow, MembershipRow (+1 more)

### Community 63 - "documents/schemas.ts"
Cohesion: 0.08
Nodes (38): attachmentIdSchema, prepareUploadSchema, uploadDocumentSchema, refreshCompletion(), CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility() (+30 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "meetings/service.ts"
Cohesion: 0.10
Nodes (22): changeMeetingStatus(), MEETING_TRANSITIONS, MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting, meetingDetailsSchema (+14 more)

### Community 66 - "public.receive_purchase_request_for_contract"
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
Nodes (24): @supabase/supabase-js, AtaStatus, MeetingStatus, AtaRow, CommitmentRow, ContractRow, toPayload(), MeetingRow (+16 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "alert-source.ts"
Cohesion: 0.36
Nodes (4): RepositoryAlertSource, AlertEntityType, AlertSource, ExpiringItem

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "process-view.tsx"
Cohesion: 0.11
Nodes (27): FormalizationSupplier, PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown(), selectTab(), ProcessViewProps (+19 more)

### Community 76 - "suppliers/service.ts"
Cohesion: 0.24
Nodes (6): SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema, SupplierService

### Community 77 - "ActionForm"
Cohesion: 0.08
Nodes (54): RetentionForms(), MembershipForms(), ProvisionCouncilForm(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), metadata, NewCouncilPage() (+46 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "identity/service.ts"
Cohesion: 0.18
Nodes (11): provisionCouncilAccess(), schema, STAFF_CATEGORIES, assignMembershipSchema, councilFields, createCouncilSchema, removeMembershipSchema, updateCouncilSchema (+3 more)

### Community 81 - "PageHeader"
Cohesion: 0.13
Nodes (23): AdministrationPage(), Content(), LINKS, metadata, CouncilsContent(), CouncilsPage(), metadata, CouncilContent() (+15 more)

### Community 83 - "getSession"
Cohesion: 0.21
Nodes (14): pdf-lib, GET(), GET(), GET(), Home(), RedirectHome(), DetailedReport, clean() (+6 more)

### Community 84 - "private.business_error"
Cohesion: 0.33
Nodes (5): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

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
Cohesion: 0.13
Nodes (14): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+6 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "time.ts"
Cohesion: 0.11
Nodes (36): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), AgendaBoard(), dateLabel() (+28 more)

### Community 92 - "badge.tsx"
Cohesion: 0.50
Nodes (4): class-variance-authority@^0.7.1, class-variance-authority, Badge(), badgeVariants

### Community 93 - "process-view.tsx"
Cohesion: 0.10
Nodes (42): AtaBalancePanel(), AtaBalanceRow, buildAtaBalanceRows(), AtaPage(), Content(), metadata, CloseContractForm(), Content() (+34 more)

### Community 94 - "file-validation.ts"
Cohesion: 0.39
Nodes (3): SupabaseCouncilRepository, toCouncil(), toRow()

### Community 95 - "SupabasePurchaseRequestRepository"
Cohesion: 0.27
Nodes (3): SupabasePurchaseRequestRepository, toPayload(), toRequest()

### Community 96 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 97 - "process-history.ts"
Cohesion: 0.36
Nodes (7): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso()

### Community 98 - "MaterialOrder"
Cohesion: 0.08
Nodes (22): MaterialOrderDialogProps, MaterialOrderFormProps, MaterialOrderFilter, InMemoryMaterialOrderRepository, ApproveMaterialOrderInput, approveMaterialOrderSchema, CancelMaterialOrderInput, cancelMaterialOrderSchema (+14 more)

### Community 99 - "repositories.ts"
Cohesion: 0.13
Nodes (6): SupabaseContractRepository, toContract(), SupabaseStorage, SupabaseTransferRepository, toTransfer(), createSupabaseRepositories()

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 112 - "atas/service.ts"
Cohesion: 0.17
Nodes (10): AtaBalance, CommitmentEvent, CouncilAllocation, ataIdSchema, AtaItem, createAtaSchema, linkAtaProcessSchema, setAllocationsSchema (+2 more)

### Community 113 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

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

### Community 118 - "react"
Cohesion: 0.05
Nodes (57): FixtureReady(), FixtureLayout(), NavigationFixture(), @base-ui/react, cn, react, react-dom, AuthenticatedShell() (+49 more)

### Community 120 - "Fluxos atuais e ideais"
Cohesion: 0.33
Nodes (5): Escopo e leitura das evidências, Fluxos atuais e ideais, Fluxos por módulo e rota, Limites, prioridade e aceitação global, Perfis e regras transversais

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 123 - "ProcessStatus"
Cohesion: 0.36
Nodes (6): ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, ProcessStatus, ProcessRow

### Community 124 - "documentation-tab.tsx"
Cohesion: 0.11
Nodes (27): buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, isActiveDoc(), isArchivedDoc(), MANDATORY_DOCUMENT_CODES, MANDATORY_DOCUMENTS (+19 more)

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

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

### Community 150 - "contracts/service.ts"
Cohesion: 0.16
Nodes (9): ContractRepository, addAmendmentSchema, closeContractSchema, Contract, ContractAtaItem, createContractSchema, linkContractProcessSchema, dateOnlySchema (+1 more)

### Community 153 - "file-upload.tsx"
Cohesion: 0.14
Nodes (18): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES (+10 more)

### Community 154 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

### Community 159 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 160 - "validate-corrections.mjs"
Cohesion: 0.33
Nodes (4): request(), data, db, revision()

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 162 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

### Community 163 - "purchases/service.test.ts"
Cohesion: 0.53
Nodes (5): approver(), ataItem(), manager(), stockOf(), submitted()

### Community 171 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.23
Nodes (11): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+3 more)

### Community 180 - "container.ts"
Cohesion: 0.06
Nodes (37): Contratos de serviço, Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.2. Serviços e Ações, AtaRepository, AtaService, AuditRecorder, ContractService (+29 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 968 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `next`, `lucide-react`, `process-attachment-sheet.tsx`, `result.ts`, `inventory/service.ts`, `Tarefas`, `purchases/service.ts`, `purchases/service.test.ts`, `documentation-tab.tsx`, `atomic-path.test.ts`, `plan-calendar.ts`, `contracts/service.ts`, `relatorios/page.tsx`, `file-upload.tsx`, `order.ts`, `entry-sources.ts`, `can`, `unwrap`, `detailed.ts`, `KpiCard`, `runAction`, `Actor`, `AuditEntry`, `groq.ts`, `notifications/service.ts`, `terms.ts`, `estoque/page.tsx`, `orders/actions.ts`, `validity.ts`, `container.ts`, `RetentionRepository`, `createSessionClient`, `SupabaseAtaRepository`, `identity.ts`, `meetings/service.ts`, `db.ts`, `suppliers/service.ts`, `ActionForm`, `identity/service.ts`, `PageHeader`, `process-view.tsx`, `file-validation.ts`, `atas/service.ts`, `documentation-tab.tsx`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.04667662434652726 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `purchases/service.test.ts` to `next`, `retry-button.test.tsx`, `lucide-react`, `pdf.ts`, `process-attachment-sheet.tsx`, `home-overview.test.tsx`, `result.ts`, `inventory/service.ts`, `ProcessFormalization`, `email-delivery.ts`, `purchases/service.ts`, `ok`, `InMemoryAuditRepository`, `documentation-tab.tsx`, `package.json`, `atomic-path.test.ts`, `plan-calendar.ts`, `order.ts`, `relatorios/page.tsx`, `file-upload.tsx`, `entry-sources.ts`, `can`, `detailed.ts`, `Input`, `KpiCard`, `purchases/service.test.ts`, `toNumber`, `simple-table.tsx`, `alertas/page.tsx`, `runAction`, `audit-trail-tab.tsx`, `contracts/extract-pdf/route.ts`, `groq.ts`, `notifications/service.ts`, `movement-form.tsx`, `atas/extract-pdf/route.ts`, `terms.ts`, `estoque/page.tsx`, `documents/service.ts`, `validity.ts`, `notifications/service.ts`, `request-template.ts`, `log`, `RetentionRepository`, `createSessionClient`, `navigation.ts`, `documents/schemas.ts`, `meetings/service.ts`, `callback-server.mjs`, `process-view.tsx`, `PageHeader`, `getSession`, `time.ts`, `process-view.tsx`, `process-history.ts`, `react`, `contracts/service.test.ts`, `ProcessStatus`, `documentation-tab.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.04696969696969697 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `lucide-react`, `process-attachment-sheet.tsx`, `result.ts`, `documentation-tab.tsx`, `package.json`, `plan-calendar.ts`, `relatorios/page.tsx`, `entry-sources.ts`, `Input`, `dependencies`, `KpiCard`, `toNumber`, `alertas/page.tsx`, `runAction`, `audit-trail-tab.tsx`, `groq.ts`, `movement-form.tsx`, `estoque/page.tsx`, `notifications/service.ts`, `request-template.ts`, `log`, `RetentionRepository`, `createSessionClient`, `navigation.ts`, `toast-store.ts`, `callback-server.mjs`, `process-view.tsx`, `ActionForm`, `identity/service.ts`, `PageHeader`, `getSession`, `time.ts`, `process-view.tsx`, `react`, `documentation-tab.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `process-attachment-sheet.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12773109243697478 - nodes in this community are weakly interconnected._