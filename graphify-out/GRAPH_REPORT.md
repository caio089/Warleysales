# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 631 files · ~293,260 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3735 nodes · 13133 edges · 185 communities (150 shown, 35 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 464 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `44431b87`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- overview-lists.tsx
- Global Constraints
- dashboard/page.tsx
- pdf.ts
- process-attachment-sheet.tsx
- home-overview.test.tsx
- result.ts
- .insert
- stock.ts
- processes.ts
- ProcessFormalization
- public.receive_purchase_request
- apply_all.sql
- alert-source.ts
- Tarefas
- purchases/service.ts
- ok
- InMemoryAuditRepository
- purchases/service.test.ts
- documentation-tab.tsx
- package.json
- formalizations/service.test.ts
- plan-calendar.ts
- fail
- pdf/route.ts
- unwrap
- anon
- entry-sources.ts
- can
- public.purchase_requests
- detailed.ts
- formalization-card.tsx
- 20261102000002_domain_tables.sql
- dependencies
- council-detail-page.tsx
- feedback-states.tsx
- toNumber
- simple-table.tsx
- 20261102000006_fk_indexes.sql
- MaterialOrder
- runAction
- ProcessService
- atas.ts
- groq.ts
- AuditEntry
- groq.ts
- extract-request/route.ts
- documents/service.ts
- policy.ts
- decimal.ts
- can
- orders/actions.ts
- @playwright/test
- simple-table.tsx
- notifications/service.ts
- request-template.ts
- log
- RetentionRepository
- createSessionClient
- formalizations/actions.ts
- sidebar-nav.tsx
- components.json
- MembershipRepository
- document-types.ts
- RetentionRepository
- meetings/service.ts
- public.receive_purchase_request_for_contract
- compilerOptions
- toast-store.ts
- db.ts
- compilerOptions
- callback-server.mjs
- MaterialOrder
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- process-view.tsx
- new-contract-form.tsx
- container.ts
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- identity/service.ts
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
- @base-ui/react
- process-view.tsx
- file-validation.ts
- plan-calendar.ts
- check-supabase.mjs
- cnpj.ts
- orders/schemas.ts
- repositories.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- material-order-dialog.tsx
- fail
- inventory/service.ts
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- formalization-queue.tsx
- @playwright/test
- InMemoryMembershipRepository
- Execução local, deploy e backups
- Proposta funcional — página inicial Warley Gestão Operacional
- process-actions.tsx
- Input
- flow-guide.tsx
- Validação realmente executada
- atas-de-reuniao-operacao.md
- authenticated-shell.tsx
- Checklist de execução
- Execução dos blocos 1 e 2
- order.ts
- Pendências e limitações conhecidas
- [...path]/page.tsx
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
- ref_node_fs
- Global Constraints
- file-upload.tsx
- Global Constraints
- briefing-card.tsx
- MaterialOrderForm
- public.spec.ts
- validate-corrections.mjs
- Auditoria de desempenho do Warley
- bundle-migrations.mjs
- purchases/service.test.ts
- dashboard-query.ts
- ai-consent.test.ts
- contracting-mode.ts
- playwright.config.ts
- 20261110000003_material_orders.sql
- compact-document-row.test.tsx
- movement-form.tsx
- document-types.ts
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

## Communities (185 total, 35 thin omitted)

### Community 0 - "overview-lists.tsx"
Cohesion: 0.09
Nodes (37): addAmendmentFormAction(), closeContractFormAction(), createContractFormAction(), linkContractProcessFormAction(), optionalNumber(), optionalText(), processReturnPath(), assignMembershipFormAction() (+29 more)

### Community 1 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 2 - "dashboard/page.tsx"
Cohesion: 0.07
Nodes (45): 5. Componentes existentes a reutilizar e mudanças propostas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, ApprovalQueue(), ApprovalQueueProps, PendingApprovalItem, DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS (+37 more)

### Community 3 - "pdf.ts"
Cohesion: 0.19
Nodes (15): ACTION_LABELS, auditDetails(), auditReportPdf(), createBase(), dateTime(), DETAIL_LABELS, drawSection(), ENTITY_LABELS (+7 more)

### Community 4 - "process-attachment-sheet.tsx"
Cohesion: 0.13
Nodes (20): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, openProcessAttachment(), ProcessAttachmentSheet() (+12 more)

### Community 5 - "home-overview.test.tsx"
Cohesion: 0.40
Nodes (4): baseAtas, baseContracts, baseDeliveries, baseStock

### Community 6 - "result.ts"
Cohesion: 0.09
Nodes (28): FixtureReady(), FixtureLayout(), react, Content(), ContractFormContent(), metadata, NewContractPage(), Loading() (+20 more)

### Community 7 - ".insert"
Cohesion: 0.07
Nodes (5): InMemoryMeetingRepository, MeetingDetails, InMemoryPurchaseRequestRepository, InMemoryTransferRepository, setup()

### Community 8 - "stock.ts"
Cohesion: 0.20
Nodes (20): Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), none, applyMovement(), availableOf(), dispatchReservedStock(), INCREASING, MovementOutcome, physicalFromLedger() (+12 more)

### Community 9 - "processes.ts"
Cohesion: 0.17
Nodes (12): AttachmentForProgress, DocumentalSnapshot, DocumentTypeCode, ATTACHMENT_PROGRESS_CRITERIA, AttachmentRow, ProcessRow, SnapshotJson, snapshotToJson() (+4 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.10
Nodes (20): contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes (+12 more)

### Community 11 - "public.receive_purchase_request"
Cohesion: 0.06
Nodes (38): public.save_contract(), public.save_purchase_request(), trg_audit_logs_immutable, trg_contract_amendments_immutable, trg_contract_amendments_no_truncate, idx_contracts_supplier_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id (+30 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.05
Nodes (110): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, calendar_appointments_scope_date_idx, check_staff_membership, council_memberships_one_director, idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_extensions_requested_by (+102 more)

### Community 13 - "alert-source.ts"
Cohesion: 0.05
Nodes (42): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract, ExtensionRequest (+34 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.08
Nodes (31): PurchaseRequest, PurchaseRequestEvent, RequestStatus, applyReceipt(), ReceiptItemResult, ReceiptItemState, ReceiptLine, ReceiptOutcome (+23 more)

### Community 16 - "ok"
Cohesion: 0.10
Nodes (9): changeRequestStatus(), PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService, guard(), Actor, ok(), Result (+1 more)

### Community 17 - "InMemoryAuditRepository"
Cohesion: 0.14
Nodes (22): InMemoryAtaRepository, setup(), InMemoryAuditRepository, AuditService, InMemoryContractRepository, FailingRepository, input, setup() (+14 more)

### Community 18 - "purchases/service.test.ts"
Cohesion: 0.11
Nodes (35): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+27 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.14
Nodes (32): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected(), uploadOne() (+24 more)

### Community 20 - "package.json"
Cohesion: 0.11
Nodes (23): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, @playwright/test@^1.65.1, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5 (+15 more)

### Community 21 - "formalizations/service.test.ts"
Cohesion: 0.12
Nodes (10): InMemoryDocumentRepository, InMemoryStorage, createProcessWithProgress(), Ctx, PDF, InMemoryCouncilRepository, InMemoryProcessRepository, InMemorySupplierRepository (+2 more)

### Community 22 - "plan-calendar.ts"
Cohesion: 0.11
Nodes (21): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialogProps, weekdays, AppointmentRow (+13 more)

### Community 23 - "fail"
Cohesion: 0.09
Nodes (19): Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters) (+11 more)

### Community 24 - "pdf/route.ts"
Cohesion: 0.40
Nodes (8): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), operationalReportPdf(), OperationalSummary

### Community 25 - "unwrap"
Cohesion: 0.09
Nodes (7): SupabaseMembershipRepository, SupabaseNotificationRepository, SupabaseRetentionRepository, SupabaseSupplierRepository, isUniqueViolation(), toIso(), unwrap()

### Community 26 - "anon"
Cohesion: 0.12
Nodes (25): public.apply_stock_mutation(), public.correct_purchase_request(), public.register_process_ata(), public.register_process_ata_for_winner(), public.set_document_exception(), public.set_process_contracting_mode(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+17 more)

### Community 27 - "entry-sources.ts"
Cohesion: 0.32
Nodes (12): buildStockEntrySources(), RECEIVABLE, StockEntryItem, assertContractAllowsReceive(), assertReceiveLinesWithinContract(), contractedQuantityByAtaItem(), ContractForReceiveGate, maxReceivableAgainstContract() (+4 more)

### Community 28 - "can"
Cohesion: 0.12
Nodes (11): 3.2. Serviços e Ações, 6. Estratégia de Testes, FormalizationService, MembershipService, authorize(), can(), PermissionAction, readableCouncilIds() (+3 more)

### Community 29 - "public.purchase_requests"
Cohesion: 0.07
Nodes (44): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_ata_commitments_council_id (+36 more)

### Community 30 - "detailed.ts"
Cohesion: 0.17
Nodes (20): pdf-lib@^1.17.1, pdf-lib, GET(), auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind (+12 more)

### Community 31 - "formalization-card.tsx"
Cohesion: 0.13
Nodes (20): auctionLabel(), formatAuctionDate(), INSTRUMENT_LABELS, CorrectionForm(), Item, FieldShell(), LoginForm(), LoginPage() (+12 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.12
Nodes (32): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+24 more)

### Community 33 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, ai@^7.0.159, @ai-sdk/groq@^4.0.74, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, mammoth@^1.13.0, next@16.4.6 (+16 more)

### Community 34 - "council-detail-page.tsx"
Cohesion: 0.10
Nodes (71): lucide-react, AdministrationPage(), Content(), LINKS, metadata, ACTION_LABEL, Content(), metadata (+63 more)

### Community 35 - "feedback-states.tsx"
Cohesion: 0.09
Nodes (20): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+12 more)

### Community 36 - "toNumber"
Cohesion: 0.12
Nodes (34): RouteFixture(), ProcessesTable(), ProcessesTableProps, contextualHref(), ContextualLink(), LIST_PATHS, RETURN_TO_KEY, ReturnLink() (+26 more)

### Community 37 - "simple-table.tsx"
Cohesion: 0.16
Nodes (19): GET(), buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias(), normalizeHeader() (+11 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (34): public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+26 more)

### Community 39 - "MaterialOrder"
Cohesion: 0.28
Nodes (13): OrderQueue(), handleApprove(), handleConfirmReject(), approveMaterialOrderAction(), cancelMaterialOrderAction(), createMaterialOrderAction(), extractCreatePayload(), extractOrderId() (+5 more)

### Community 40 - "runAction"
Cohesion: 0.15
Nodes (22): citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME, MONTH_ORDER, NATUREZA_ORDER (+14 more)

### Community 41 - "ProcessService"
Cohesion: 0.19
Nodes (5): Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.3. Repositório e Camada de Domínio, AdministrativeProcess, ProcessService, internalError()

### Community 42 - "atas.ts"
Cohesion: 0.10
Nodes (30): AuditPage(), AuditPageProps, Content(), metadata, one(), Content(), ContractPage(), metadata (+22 more)

### Community 43 - "groq.ts"
Cohesion: 0.50
Nodes (3): generateModuleInsight(), ModuleFact, ModuleInsightResult

### Community 44 - "AuditEntry"
Cohesion: 0.18
Nodes (10): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange() (+2 more)

### Community 45 - "groq.ts"
Cohesion: 0.27
Nodes (13): BRIEFING_SYSTEM_PROMPT, briefingSchema, briefingUsesOnlyKnownNumbers(), coerceBriefing(), extractJsonObjects(), OperationalBriefing, parseBriefingText(), emptySummary (+5 more)

### Community 46 - "extract-request/route.ts"
Cohesion: 0.13
Nodes (16): changeTransferStatus(), HOLDS_RESERVATION, receiveEffect(), stockEffectFor(), TRANSFER_TRANSITIONS, TransferStatus, TransferStockEffect, TransferRepository (+8 more)

### Community 47 - "documents/service.ts"
Cohesion: 0.16
Nodes (15): mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText(), RequestDocumentKind (+7 more)

### Community 48 - "policy.ts"
Cohesion: 0.11
Nodes (28): zod, input, submit(), meetingReviewAction(), markNotificationReadFormAction(), saveProcessContractingMode(), saveProcessEstimatedValue(), documentExceptionAction() (+20 more)

### Community 49 - "decimal.ts"
Cohesion: 0.31
Nodes (7): calculateContractAtaValue(), calculateStockSummary(), PERCENT_SCALE, percentage(), QUANTITY_SCALE, roundPercent(), roundTo()

### Community 50 - "can"
Cohesion: 0.31
Nodes (7): NavigationFixture(), AppShell(), AppShellProps, getServerSidebarSnapshot(), getSidebarSnapshot(), subscribeSidebar(), PageReveal()

### Community 51 - "orders/actions.ts"
Cohesion: 0.16
Nodes (12): InventoryRepository, keyOf(), StockKey, StockMutation, StockRow, StockState, MovementRecord, BalanceRow (+4 more)

### Community 52 - "@playwright/test"
Cohesion: 0.26
Nodes (6): AuthLayout(), NotFound(), AuthStage(), PILLARS, BrandMark(), BrandMarkProps

### Community 53 - "simple-table.tsx"
Cohesion: 0.09
Nodes (47): StatusDistribution(), DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview(), RequestsOverview(), Row(), RowLink (+39 more)

### Community 54 - "notifications/service.ts"
Cohesion: 0.19
Nodes (15): NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption, ataStepFormAction(), createAtaFormAction() (+7 more)

### Community 55 - "request-template.ts"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

### Community 56 - "log"
Cohesion: 0.13
Nodes (15): GET, GET, provisionCouncilAccess(), schema, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createSupabaseJobRunRepository() (+7 more)

### Community 57 - "RetentionRepository"
Cohesion: 0.14
Nodes (18): draftSchema, GET(), maxDuration, getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio(), saveAudio() (+10 more)

### Community 58 - "createSessionClient"
Cohesion: 0.10
Nodes (21): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências, Fluxos atuais e ideais (+13 more)

### Community 59 - "formalizations/actions.ts"
Cohesion: 0.44
Nodes (7): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, assertInstrumentsLinked(), homologateFormalizationAction(), parseMoney(), rejectFormalizationAction(), submitFormalizationFormAction(), mockRunAction

### Community 60 - "sidebar-nav.tsx"
Cohesion: 0.38
Nodes (10): NavGroup, NavItem, CollapsedGroup(), ExpandedGroup(), ExpandedHome(), isItemActive(), matchesPath(), resolveInitialOpen() (+2 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "MembershipRepository"
Cohesion: 0.13
Nodes (8): CouncilRepository, MembershipRepository, InMemoryMembershipRepository, Council, MembershipRecord, StaffCategory, CouncilRow, MembershipRow

### Community 63 - "document-types.ts"
Cohesion: 0.15
Nodes (15): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ADDITIONAL_DOCUMENT_TYPE_CODES (+7 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "meetings/service.ts"
Cohesion: 0.14
Nodes (15): changeMeetingStatus(), MEETING_TRANSITIONS, MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting, meetingDetailsSchema (+7 more)

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
Cohesion: 0.07
Nodes (24): @supabase/supabase-js@^2.118.0, @supabase/supabase-js, MeetingStatus, toAta(), ContractRow, SupabaseContractRepository, toContract(), toPayload() (+16 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "MaterialOrder"
Cohesion: 0.14
Nodes (7): MaterialOrderDialogProps, MaterialOrderFormProps, MaterialOrderRepository, InMemoryMaterialOrderRepository, MaterialOrder, SupabaseMaterialOrderRepository, toOrder()

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "process-view.tsx"
Cohesion: 0.16
Nodes (18): PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown(), selectTab(), ProcessViewProps, TabDefinition (+10 more)

### Community 75 - "new-contract-form.tsx"
Cohesion: 0.19
Nodes (15): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), matchPdfItems(), ContractAtaOption (+7 more)

### Community 76 - "container.ts"
Cohesion: 0.10
Nodes (17): Contratos de serviço, FormalizationRepository, CouncilService, MeetingService, ReportService, RetentionService, SupplierRepository, createSupplierSchema (+9 more)

### Community 77 - "ActionForm"
Cohesion: 0.09
Nodes (52): Option, RetentionForms(), MembershipForms(), Option, ProvisionCouncilForm(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm() (+44 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "identity/service.ts"
Cohesion: 0.19
Nodes (15): ProfileSummary, STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, assignMembershipSchema, councilFields, createCouncilSchema, MembershipDirectory, removeMembershipSchema (+7 more)

### Community 81 - "pg_temp.act_as"
Cohesion: 0.48
Nodes (5): formatWhatsapp(), onlyDigits(), parseWhatsapp(), whatsappHref(), WhatsappParse

### Community 83 - "analysis.ts"
Cohesion: 0.10
Nodes (22): POST(), GET(), POST(), GET(), Home(), RedirectHome(), ExtractedAta, ExtractedAtaItem (+14 more)

### Community 84 - "private.business_error"
Cohesion: 0.33
Nodes (5): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

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
Cohesion: 0.14
Nodes (13): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, UC-01: Registro do Valor Estimado e Bloqueio de Estoque (+5 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.13
Nodes (14): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+6 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "time.ts"
Cohesion: 0.12
Nodes (30): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+22 more)

### Community 92 - "@base-ui/react"
Cohesion: 0.22
Nodes (8): @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, @base-ui/react, class-variance-authority, cn, Badge(), badgeVariants

### Community 93 - "process-view.tsx"
Cohesion: 0.09
Nodes (41): react-dom, AtaBalancePanel(), AtaBalanceRow, buildAtaBalanceRows(), AtaPage(), Content(), metadata, INSTRUMENT_LABELS (+33 more)

### Community 94 - "file-validation.ts"
Cohesion: 0.39
Nodes (3): SupabaseCouncilRepository, toCouncil(), toRow()

### Community 95 - "plan-calendar.ts"
Cohesion: 0.15
Nodes (16): MonthDialog(), CalendarKind, calendarMarks(), CalendarSource, countsByMonth(), exactCalendarDate(), MONTH_FROM_LABEL, MONTH_TOKEN (+8 more)

### Community 96 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 97 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 98 - "orders/schemas.ts"
Cohesion: 0.14
Nodes (16): MaterialOrderFilter, ApproveMaterialOrderInput, approveMaterialOrderSchema, CancelMaterialOrderInput, cancelMaterialOrderSchema, CreateMaterialOrderInput, createMaterialOrderItemSchema, createMaterialOrderSchema (+8 more)

### Community 99 - "repositories.ts"
Cohesion: 0.15
Nodes (5): SupabaseDocumentRepository, SupabaseStorage, toAttachment(), createSupabaseRepositories(), systemRuntime

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "material-order-dialog.tsx"
Cohesion: 0.22
Nodes (12): 6. Valores, estados e mensagens: salvaguardas, Reutilização em painéis por perfil, CouncilWorkspace(), CouncilWorkspaceProps, ActionHub(), ActionItem, buildCouncilActions(), AvailableStockItem (+4 more)

### Community 112 - "fail"
Cohesion: 0.08
Nodes (34): AtaBalance, CommitmentEvent, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation, validateAllocations(), validateCommitment() (+26 more)

### Community 113 - "inventory/service.ts"
Cohesion: 0.16
Nodes (13): classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel, stockLevelLabel, MovementType, createMaterialSchema, registerMovementSchema (+5 more)

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

### Community 118 - "formalization-queue.tsx"
Cohesion: 0.18
Nodes (10): FormalizationQueueProps, INSTRUMENT_LABELS, PendingFormalizationItem, OrderQueueProps, PendingOrderItem, confirmationSucceeded(), ConfirmDialog(), handleConfirm() (+2 more)

### Community 120 - "InMemoryMembershipRepository"
Cohesion: 0.11
Nodes (5): nextConfig, next, metadata, NewCouncilPage(), CouncilPickerProps

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.13
Nodes (14): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação, Estoque e materiais (+6 more)

### Community 123 - "process-actions.tsx"
Cohesion: 0.27
Nodes (8): ArchiveProcessAction(), ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, PROCESS_TRANSITIONS, ProcessStatus

### Community 124 - "Input"
Cohesion: 0.16
Nodes (21): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary() (+13 more)

### Community 125 - "flow-guide.tsx"
Cohesion: 0.15
Nodes (8): PROCESS_FLOW_STEPS, REQUEST_FLOW_STEPS, REQUEST_LIFECYCLE, REQUEST_RAIL_ALIAS, FlowGuide(), FlowStep, LifecycleStep, NextStepProps

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 128 - "authenticated-shell.tsx"
Cohesion: 0.22
Nodes (8): AuthenticatedShell(), AppLayout(), AccessContext, filterNavigation(), NAV_GROUPS, NAV_ITEMS, isRequestOnly(), route

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 131 - "order.ts"
Cohesion: 0.20
Nodes (10): StockBalance, approveOrder, cancelOrder, changeOrderStatus, CreateMaterialOrderDomainInput, createOrder, CreateOrderItemDomainInput, MATERIAL_ORDER_TRANSITIONS (+2 more)

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 134 - "[...path]/page.tsx"
Cohesion: 0.20
Nodes (9): columns, Kind, kinds, processRows, rows, titles, ProcessTableRow, SimpleColumn (+1 more)

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
Cohesion: 0.07
Nodes (29): buildHoldRows(), contractedMaterialsByProcess(), HoldItemInput, HoldRow, StockSectionProps, AtaView, AuditRecorder, ContractRepository (+21 more)

### Community 152 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build)

### Community 153 - "file-upload.tsx"
Cohesion: 0.33
Nodes (8): validateFileMeta(), FileUpload(), handleFile(), handleFiles(), onDrop(), FileUploadProps, ItemStatus, UploadItem

### Community 154 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

### Community 155 - "briefing-card.tsx"
Cohesion: 0.46
Nodes (5): BriefingCard(), BriefingFallback(), BriefingFacts, BriefingInsight, generateBriefing()

### Community 157 - "MaterialOrderForm"
Cohesion: 0.33
Nodes (3): MaterialOrderForm(), handleSubmit(), resetForm()

### Community 159 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 160 - "validate-corrections.mjs"
Cohesion: 0.33
Nodes (4): request(), data, db, revision()

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.15
Nodes (11): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+3 more)

### Community 162 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

### Community 163 - "purchases/service.test.ts"
Cohesion: 0.53
Nodes (5): approver(), ataItem(), manager(), stockOf(), submitted()

### Community 164 - "dashboard-query.ts"
Cohesion: 0.40
Nodes (5): DASHBOARD_FOCUS, first(), focusSchema, parseDashboardQuery(), uuid

### Community 166 - "ai-consent.test.ts"
Cohesion: 0.50
Nodes (4): audioPath(), claimed(), manager, mocks

### Community 170 - "contracting-mode.ts"
Cohesion: 0.60
Nodes (3): isProcessContractingMode(), needsAta(), PROCESS_CONTRACTING_MODES

### Community 171 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 174 - "compact-document-row.test.tsx"
Cohesion: 0.50
Nodes (3): CompactDocumentRowProps, PENDING_ROW_PROPS, VALID_ROW_PROPS

### Community 175 - "movement-form.tsx"
Cohesion: 0.15
Nodes (18): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+10 more)

### Community 180 - "document-types.ts"
Cohesion: 0.05
Nodes (54): Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), LinkedProcessCardProps, sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload() (+46 more)

### Community 197 - "identity/actions.ts"
Cohesion: 0.13
Nodes (14): GET, credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction() (+6 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 968 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `dashboard/page.tsx`, `order.ts`, `process-attachment-sheet.tsx`, `result.ts`, `stock.ts`, `processes.ts`, `alert-source.ts`, `purchases/service.ts`, `purchases/service.test.ts`, `documentation-tab.tsx`, `formalizations/service.test.ts`, `plan-calendar.ts`, `service-support.ts`, `fail`, `unwrap`, `entry-sources.ts`, `can`, `detailed.ts`, `council-detail-page.tsx`, `ai-consent.test.ts`, `ProcessService`, `atas.ts`, `groq.ts`, `groq.ts`, `extract-request/route.ts`, `policy.ts`, `orders/actions.ts`, `document-types.ts`, `simple-table.tsx`, `log`, `RetentionRepository`, `createSessionClient`, `formalizations/actions.ts`, `MembershipRepository`, `meetings/service.ts`, `identity/actions.ts`, `db.ts`, `container.ts`, `ActionForm`, `identity/service.ts`, `process-view.tsx`, `file-validation.ts`, `fail`, `inventory/service.ts`, `Input`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `overview-lists.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09413067552602436 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `purchases/service.test.ts` to `authenticated-shell.tsx`, `dashboard/page.tsx`, `pdf.ts`, `process-attachment-sheet.tsx`, `home-overview.test.tsx`, `result.ts`, `stock.ts`, `ProcessFormalization`, `alert-source.ts`, `purchases/service.ts`, `InMemoryAuditRepository`, `documentation-tab.tsx`, `package.json`, `formalizations/service.test.ts`, `service-support.ts`, `plan-calendar.ts`, `fail`, `pdf/route.ts`, `entry-sources.ts`, `briefing-card.tsx`, `can`, `detailed.ts`, `purchases/service.test.ts`, `toNumber`, `simple-table.tsx`, `ai-consent.test.ts`, `MaterialOrder`, `runAction`, `atas.ts`, `groq.ts`, `contracting-mode.ts`, `groq.ts`, `compact-document-row.test.tsx`, `movement-form.tsx`, `documents/service.ts`, `decimal.ts`, `actions.movement-lines.test.ts`, `extract-request/route.ts`, `document-types.ts`, `simple-table.tsx`, `notifications/service.ts`, `request-template.ts`, `log`, `RetentionRepository`, `createSessionClient`, `formalizations/actions.ts`, `document-types.ts`, `callback-server.mjs`, `process-view.tsx`, `new-contract-form.tsx`, `pg_temp.act_as`, `analysis.ts`, `time.ts`, `process-view.tsx`, `plan-calendar.ts`, `cnpj.ts`, `material-order-dialog.tsx`, `fail`, `formalization-queue.tsx`, `process-actions.tsx`, `Input`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07259528130671507 - nodes in this community are weakly interconnected._
- **Why does `next` connect `InMemoryMembershipRepository` to `authenticated-shell.tsx`, `overview-lists.tsx`, `dashboard/page.tsx`, `process-attachment-sheet.tsx`, `result.ts`, `documentation-tab.tsx`, `package.json`, `plan-calendar.ts`, `formalization-card.tsx`, `dependencies`, `council-detail-page.tsx`, `toNumber`, `MaterialOrder`, `atas.ts`, `groq.ts`, `movement-form.tsx`, `policy.ts`, `@playwright/test`, `simple-table.tsx`, `notifications/service.ts`, `request-template.ts`, `log`, `RetentionRepository`, `createSessionClient`, `formalizations/actions.ts`, `sidebar-nav.tsx`, `toast-store.ts`, `identity/actions.ts`, `callback-server.mjs`, `process-view.tsx`, `ActionForm`, `analysis.ts`, `time.ts`, `process-view.tsx`, `material-order-dialog.tsx`, `formalization-queue.tsx`, `process-actions.tsx`, `flow-guide.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `process-attachment-sheet.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13368983957219252 - nodes in this community are weakly interconnected._