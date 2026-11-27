# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 623 files · ~287,398 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3762 nodes · 12967 edges · 191 communities (147 shown, 44 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 461 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `13a7cab0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Actor
- new-contract-form.tsx
- flow-guide.tsx
- pdf.ts
- navigation.ts
- vitest
- adapters/purchases.ts
- formalizations/service.test.ts
- inventory/service.ts
- purchases/service.ts
- formalization-card.tsx
- can
- apply_all.sql
- notifications/service.ts
- Tarefas
- formatCurrency
- lucide-react
- public.create_contract_with_ata
- simple-table.tsx
- documentation-tab.tsx
- package.json
- request-facets.ts
- .all
- new-contract-form.tsx
- runAction
- db.ts
- public.correct_purchase_request
- utils.ts
- contracts.ts
- processes/service.ts
- package.json
- next
- 20261102000002_domain_tables.sql
- 20261116000001_notification_emails.sql
- documentation-tab.tsx
- material-order-dialog.tsx
- public.purchase_requests
- Button
- 20261102000006_fk_indexes.sql
- MaterialOrder
- AuditService
- getSession
- unwrap
- groq.ts
- toFortalezaDate
- extract-request/route.ts
- private.business_error
- Proposta funcional — página inicial Warley Gestão Operacional
- public.profiles
- AuditEntry
- movement-form.tsx
- formalization-card.tsx
- @playwright/test
- data-table-logic.ts
- transfers.ts
- request-template.ts
- handler.ts
- retention/service.ts
- createSessionClient
- atas.ts
- councils-page.tsx
- components.json
- Result
- process-history.ts
- RetentionRepository
- state-machine.ts
- public.receive_purchase_request_for_contract
- compilerOptions
- toast-store.ts
- documents/service.ts
- compilerOptions
- callback-server.mjs
- auth-stage.tsx
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- processos/page.tsx
- next
- fail
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- plan-calendar.ts
- pg_temp.act_as
- PDFReport
- analysis.ts
- MaterialOrder
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- calendario/page.tsx
- agenda-board.tsx
- process-view.tsx
- service-support.ts
- Arquitetura (estado atual da implementação)
- public.spec.ts
- cnpj.ts
- membership-forms.tsx
- StoragePort
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- orders/schemas.ts
- atas/service.ts
- order-queue.tsx
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- policy.ts
- ok
- formalizations/service.ts
- Execução local, deploy e backups
- media-actions.ts
- repositories.ts
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
- documents/service.ts
- check-supabase.mjs
- 002_validacao_sem_pgtap.sql
- processes.ts
- 003_fluxos_atomicos.sql
- container.ts
- Auditoria de desempenho do Warley
- private.validate_meeting_details
- processes/service.ts
- ref_node_fs
- identity/service.test.ts
- formalizations/actions.ts
- file-upload.tsx
- Global Constraints
- SupabaseProcessRepository
- purchases/service.test.ts
- public.council_memberships
- Global Constraints
- identity.ts
- validate-corrections.mjs
- playwright.config.ts
- Global Constraints
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

## Communities (191 total, 44 thin omitted)

### Community 0 - "Actor"
Cohesion: 0.17
Nodes (6): Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), changeRequestStatus(), PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService, Actor

### Community 1 - "new-contract-form.tsx"
Cohesion: 0.14
Nodes (24): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), CloseContractForm(), ContractAtaOption (+16 more)

### Community 2 - "flow-guide.tsx"
Cohesion: 0.15
Nodes (8): PROCESS_FLOW_STEPS, REQUEST_FLOW_STEPS, REQUEST_LIFECYCLE, REQUEST_RAIL_ALIAS, FlowGuide(), FlowStep, LifecycleStep, NextStepProps

### Community 3 - "pdf.ts"
Cohesion: 0.16
Nodes (22): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+14 more)

### Community 4 - "navigation.ts"
Cohesion: 0.12
Nodes (26): NavigationFixture(), AuthenticatedShell(), AccessContext, ALL_ROLES, filterNavigation(), NAV_GROUPS, NAV_ITEMS, NavGroup (+18 more)

### Community 5 - "vitest"
Cohesion: 0.10
Nodes (35): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, declared() (+27 more)

### Community 6 - "adapters/purchases.ts"
Cohesion: 0.13
Nodes (11): AtomicDecision, SupabaseMeetingRepository, toMeeting(), toPayload(), LinkedRequestNotesRow, RequestRow, SupabasePurchaseRequestRepository, toPayload() (+3 more)

### Community 7 - "formalizations/service.test.ts"
Cohesion: 0.11
Nodes (20): InMemoryContractRepository, setup(), InMemoryDocumentRepository, InMemoryStorage, createProcessWithProgress(), Ctx, PDF, setup() (+12 more)

### Community 8 - "inventory/service.ts"
Cohesion: 0.05
Nodes (73): Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), buildStockEntrySources(), RECEIVABLE, StockEntryItem, StockSectionProps, AtaView, none, classifyStockLevel() (+65 more)

### Community 9 - "purchases/service.ts"
Cohesion: 0.11
Nodes (25): PurchaseRequest, PurchaseRequestEvent, RequestStatus, applyReceipt(), ReceiptItemResult, ReceiptItemState, ReceiptLine, ReceiptOutcome (+17 more)

### Community 10 - "formalization-card.tsx"
Cohesion: 0.10
Nodes (20): contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes (+12 more)

### Community 11 - "can"
Cohesion: 0.11
Nodes (14): CouncilRepository, MembershipRepository, Council, MembershipRecord, ProfileSummary, assignMembershipSchema, councilFields, CouncilService (+6 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.04
Nodes (98): administrative_processes_responsible_id_idx, calendar_appointments_scope_date_idx, contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx (+90 more)

### Community 13 - "notifications/service.ts"
Cohesion: 0.07
Nodes (29): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract, ALERT_MILESTONES (+21 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (33): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+25 more)

### Community 15 - "formatCurrency"
Cohesion: 0.12
Nodes (26): AtaBalancePanel(), buildAtaBalanceRows(), AtaPage(), Content(), metadata, Content(), ContractPage(), metadata (+18 more)

### Community 16 - "lucide-react"
Cohesion: 0.09
Nodes (35): 5. Componentes existentes a reutilizar e mudanças propostas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, lucide-react, react-dom, BriefingCard(), BriefingFallback(), CouncilWorkspace(), DashboardFilters() (+27 more)

### Community 17 - "public.create_contract_with_ata"
Cohesion: 0.07
Nodes (31): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), public.save_contract(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, trg_contract_amendments_immutable, public.append_commitment_event() (+23 more)

### Community 18 - "simple-table.tsx"
Cohesion: 0.06
Nodes (70): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ApprovalQueueProps (+62 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.14
Nodes (30): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+22 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, next@16.4.6 (+18 more)

### Community 21 - "request-facets.ts"
Cohesion: 0.13
Nodes (23): Fact(), PlanDossierCard(), citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME (+15 more)

### Community 22 - ".all"
Cohesion: 0.07
Nodes (5): InMemoryMeetingRepository, MeetingDetails, setup(), InMemoryTransferRepository, setup()

### Community 23 - "new-contract-form.tsx"
Cohesion: 0.17
Nodes (15): matchPdfItems(), NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption, ataStepFormAction() (+7 more)

### Community 24 - "runAction"
Cohesion: 0.08
Nodes (47): zod, draftSchema, GET(), maxDuration, Option, MarkReadForm(), manualDeleteFormAction(), assignMembershipFormAction() (+39 more)

### Community 25 - "db.ts"
Cohesion: 0.14
Nodes (10): SupabaseNotificationRepository, toNotification(), BUSINESS_CODES, BusinessCode, DatabaseError, DbErrorShape, isUniqueViolation(), toDateOrNull() (+2 more)

### Community 26 - "public.correct_purchase_request"
Cohesion: 0.12
Nodes (15): trg_audit_logs_immutable, idx_administrative_processes_created_by, idx_audit_logs_actor_id, private.business_error(), public.correct_purchase_request(), public.set_document_exception(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+7 more)

### Community 27 - "utils.ts"
Cohesion: 0.15
Nodes (16): BigStat(), ChartCard(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, baseAtas, baseContracts (+8 more)

### Community 28 - "contracts.ts"
Cohesion: 0.18
Nodes (7): Contract, ContractRow, SupabaseContractRepository, toContract(), toPayload(), RpcOutcome, rpcOutcomeToResult()

### Community 29 - "processes/service.ts"
Cohesion: 0.15
Nodes (7): Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.3. Repositório e Camada de Domínio, formatProcessNumber(), parseProcessNumber(), AdministrativeProcess, ProcessService, RetentionService

### Community 30 - "package.json"
Cohesion: 0.11
Nodes (23): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, @playwright/test@^1.65.1, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5 (+15 more)

### Community 31 - "next"
Cohesion: 0.07
Nodes (93): react, AuditPage(), AuditPageProps, Content(), metadata, one(), AdministrationPage(), Content() (+85 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.10
Nodes (38): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+30 more)

### Community 34 - "documentation-tab.tsx"
Cohesion: 0.22
Nodes (12): buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, isActiveDoc(), isArchivedDoc(), MANDATORY_DOCUMENT_CODES, MANDATORY_DOCUMENTS (+4 more)

### Community 35 - "material-order-dialog.tsx"
Cohesion: 0.16
Nodes (12): CouncilWorkspaceProps, AvailableStockItem, MaterialOrderDialog(), MaterialOrderDialogProps, MaterialOrderForm(), handleSubmit(), resetForm(), MaterialOrderFormProps (+4 more)

### Community 36 - "public.purchase_requests"
Cohesion: 0.10
Nodes (20): public.cancel_purchase_request(), public.save_purchase_request(), idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, private.next_request_event_position(), public.cancel_purchase_request() (+12 more)

### Community 37 - "Button"
Cohesion: 0.13
Nodes (21): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, openProcessAttachment(), ProcessAttachmentSheet() (+13 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.06
Nodes (27): public.receive_purchase_request(), public.apply_stock_mutation(), public.save_meeting(), public.save_transfer(), trg_stock_movements_immutable, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by (+19 more)

### Community 39 - "MaterialOrder"
Cohesion: 0.19
Nodes (16): Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), approveMaterialOrder(), approveOrder, cancelMaterialOrder(), cancelOrder, changeMaterialOrderStatus(), changeOrderStatus, createMaterialOrder() (+8 more)

### Community 40 - "AuditService"
Cohesion: 0.09
Nodes (10): InMemoryAtaRepository, activeAta(), manager(), setup(), AuditService, FailingRepository, input, setup() (+2 more)

### Community 41 - "getSession"
Cohesion: 0.17
Nodes (18): pdf-lib, GET(), GET(), GET(), Home(), RedirectHome(), DetailedReport, clean() (+10 more)

### Community 42 - "unwrap"
Cohesion: 0.12
Nodes (5): SupabaseMembershipRepository, SupabaseDocumentRepository, toAttachment(), SupabaseRetentionRepository, unwrap()

### Community 43 - "groq.ts"
Cohesion: 0.10
Nodes (27): Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), BRIEFING_SYSTEM_PROMPT, BriefingFacts, briefingSchema, briefingUsesOnlyKnownNumbers(), coerceBriefing(), extractJsonObjects(), OperationalBriefing (+19 more)

### Community 44 - "toFortalezaDate"
Cohesion: 0.23
Nodes (14): auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, first(), kinds, parseDetailedFilter() (+6 more)

### Community 45 - "extract-request/route.ts"
Cohesion: 0.15
Nodes (16): mammoth@^1.13.0, mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText() (+8 more)

### Community 46 - "private.business_error"
Cohesion: 0.13
Nodes (15): idx_stock_balances_material_id, idx_stock_transfer_events_actor_id, idx_stock_transfer_items_material_id, idx_stock_transfers_destination_council_id, idx_stock_transfers_origin_council_id, private.business_error(), private.check_contract_ata_process(), private.next_transfer_event_position() (+7 more)

### Community 47 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.12
Nodes (15): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação (+7 more)

### Community 48 - "public.profiles"
Cohesion: 0.14
Nodes (38): administrative_processes_responsible_membership, check_staff_membership, idx_meeting_action_items_meeting_id, idx_meeting_action_items_responsible_id, keep_meeting_task_completion, meeting_minutes_task_key, private.check_process_responsible_membership(), private.check_staff_membership() (+30 more)

### Community 49 - "AuditEntry"
Cohesion: 0.18
Nodes (12): AuditTrailTabProps, AuditRepository, InMemoryAuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry (+4 more)

### Community 50 - "movement-form.tsx"
Cohesion: 0.12
Nodes (25): 3.1 Encerramento de Processo com Documentação Parcial, 3.2 Recebimento de Materiais com Saldo Pendente, 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%), StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line (+17 more)

### Community 51 - "formalization-card.tsx"
Cohesion: 0.12
Nodes (25): auctionLabel(), FormalizationCard(), FormalizationCardProps, FormalizationSupplier, formatAuctionDate(), INSTRUMENT_LABELS, BASE_FORMALIZATION, MOCK_SUPPLIERS (+17 more)

### Community 53 - "data-table-logic.ts"
Cohesion: 0.14
Nodes (25): DataTable(), DataTableColumn, DataTableProps, Cell, collator, compareValues(), filterAndSortTableRows(), FilterDefinition (+17 more)

### Community 54 - "transfers.ts"
Cohesion: 0.18
Nodes (10): TransferStatus, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferEvent, TransferItem, SupabaseTransferRepository (+2 more)

### Community 55 - "request-template.ts"
Cohesion: 0.16
Nodes (19): GET(), buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias(), normalizeHeader() (+11 more)

### Community 56 - "handler.ts"
Cohesion: 0.14
Nodes (12): GET, GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createResendSender(), createSupabaseJobRunRepository() (+4 more)

### Community 57 - "retention/service.ts"
Cohesion: 0.12
Nodes (20): Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), buildSnapshot(), CompletionEvent, CompletionState (+12 more)

### Community 58 - "createSessionClient"
Cohesion: 0.12
Nodes (15): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências, Fluxos atuais e ideais (+7 more)

### Community 59 - "atas.ts"
Cohesion: 0.16
Nodes (10): CommitmentEvent, AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toAta(), toCommitment(), toPayload() (+2 more)

### Community 60 - "councils-page.tsx"
Cohesion: 0.32
Nodes (8): CouncilsContent(), CouncilsPage(), metadata, formatWhatsapp(), onlyDigits(), parseWhatsapp(), whatsappHref(), WhatsappParse

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "Result"
Cohesion: 0.15
Nodes (5): Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, 6. Estratégia de Testes, InventoryService, MaterialOrderService, Result

### Community 63 - "process-history.ts"
Cohesion: 0.31
Nodes (8): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ALL_DOCUMENT_TYPES

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "state-machine.ts"
Cohesion: 0.16
Nodes (15): ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, changeMeetingStatus(), MEETING_TRANSITIONS, MeetingStatus, changeProcessStatus() (+7 more)

### Community 66 - "public.receive_purchase_request_for_contract"
Cohesion: 0.13
Nodes (8): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, contract_receipt_lines_contract_idx, private.check_process_responsible_membership(), public.contract_receipt_lines, public.receive_purchase_request_for_contract(), contract_receipt_line_integrity, private.check_contract_receipt_line()

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "documents/service.ts"
Cohesion: 0.21
Nodes (8): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES, MAX_UPLOAD_BYTES

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "auth-stage.tsx"
Cohesion: 0.14
Nodes (13): AuthLayout(), LoginPage(), metadata, metadata, RecoveryPage(), metadata, PasswordPage(), NotFound() (+5 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "processos/page.tsx"
Cohesion: 0.15
Nodes (15): ApprovalQueue(), PendingApprovalItem, metadata, ProcessContent(), ProcessPage(), processTabFromSearch(), ProcessView(), handleTabKeyDown() (+7 more)

### Community 75 - "next"
Cohesion: 0.09
Nodes (8): FixtureReady(), FixtureLayout(), nextConfig, next, CouncilPickerProps, RetryButton(), refresh, startTransition

### Community 76 - "fail"
Cohesion: 0.10
Nodes (14): PriceRegistrationAta, validateUpload(), DocumentService, MeetingRepository, Meeting, MeetingService, context(), guard() (+6 more)

### Community 77 - "ActionForm"
Cohesion: 0.10
Nodes (44): RetentionForms(), MembershipForms(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), metadata, NewCouncilPage(), AmendmentForm() (+36 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.33
Nodes (13): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+5 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "plan-calendar.ts"
Cohesion: 0.18
Nodes (14): CalendarKind, calendarMarks(), CalendarSource, countsByMonth(), exactCalendarDate(), MONTH_FROM_LABEL, MONTH_TOKEN, monthFromLabel() (+6 more)

### Community 83 - "analysis.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 84 - "MaterialOrder"
Cohesion: 0.21
Nodes (5): MaterialOrderFilter, MaterialOrderRepository, InMemoryMaterialOrderRepository, MaterialOrder, MaterialOrderStatus

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
Cohesion: 0.14
Nodes (13): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, UC-01: Registro do Valor Estimado e Bloqueio de Estoque (+5 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.12
Nodes (15): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+7 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "calendario/page.tsx"
Cohesion: 0.13
Nodes (19): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialogProps, AppointmentRow, CalendarioPage() (+11 more)

### Community 92 - "agenda-board.tsx"
Cohesion: 0.14
Nodes (27): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+19 more)

### Community 93 - "process-view.tsx"
Cohesion: 0.19
Nodes (14): AtaBalanceRow, PROCESS_TAB_IDS, ProcessTabId, ProcessViewProps, TabDefinition, ApprovalsTabRequest, LinkedAtaItem, LinkedContractItem (+6 more)

### Community 94 - "service-support.ts"
Cohesion: 0.22
Nodes (11): ActionItem, actionItemSchema, changeMeetingStatusSchema, meetingDetailsSchema, MeetingMinutes, minutesSchema, scheduleMeetingSchema, IdGenerator (+3 more)

### Community 95 - "Arquitetura (estado atual da implementação)"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 96 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 97 - "cnpj.ts"
Cohesion: 0.38
Nodes (7): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits(), createSupplierSchema, supplierFields, updateSupplierSchema

### Community 98 - "membership-forms.tsx"
Cohesion: 0.26
Nodes (9): Option, ProvisionCouncilForm(), provisionCouncilAccess(), schema, STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, COUNCIL_ROLE_LABELS, COUNCIL_ROLES (+1 more)

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "orders/schemas.ts"
Cohesion: 0.17
Nodes (11): ApproveMaterialOrderInput, approveMaterialOrderSchema, CancelMaterialOrderInput, cancelMaterialOrderSchema, CreateMaterialOrderInput, createMaterialOrderItemSchema, createMaterialOrderSchema, materialOrderStatuses (+3 more)

### Community 112 - "atas/service.ts"
Cohesion: 0.07
Nodes (45): AtaBalance, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation, validateAllocations(), validateCommitment(), ATA_INITIAL_YEARS (+37 more)

### Community 113 - "order-queue.tsx"
Cohesion: 0.31
Nodes (11): OrderQueue(), handleApprove(), handleConfirmReject(), approveMaterialOrderAction(), cancelMaterialOrderAction(), extractOrderId(), extractRejectPayload(), rejectMaterialOrderAction() (+3 more)

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

### Community 118 - "policy.ts"
Cohesion: 0.07
Nodes (38): MonthDialog(), weekdays, metadata, ProfilePage(), ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), ENTITY_LABELS (+30 more)

### Community 119 - "ok"
Cohesion: 0.25
Nodes (3): SupplierRepository, Supplier, SupplierService

### Community 120 - "formalizations/service.ts"
Cohesion: 0.13
Nodes (10): Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), 3.2. Serviços e Ações, FormalizationRepository, FormalizationService, SavingsSummary, PermissionAction, readableCouncilIds(), admin (+2 more)

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "media-actions.ts"
Cohesion: 0.18
Nodes (15): MeetingFile(), getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio(), saveAudio(), MeetingOption, confirmMeetingAudioAction() (+7 more)

### Community 123 - "repositories.ts"
Cohesion: 0.11
Nodes (10): SupabaseInventoryRepository, toMovement(), OrderItemRow, OrderRow, SupabaseMaterialOrderRepository, toOrder(), SupabaseSupplierRepository, selectAll() (+2 more)

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
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

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

### Community 150 - "documents/service.ts"
Cohesion: 0.15
Nodes (10): AuditRecorder, DocumentRepository, attachmentIdSchema, PreparedUpload, prepareUploadSchema, uploadDocumentSchema, refreshCompletion(), reevaluateCompletion() (+2 more)

### Community 151 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 152 - "002_validacao_sem_pgtap.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 153 - "processes.ts"
Cohesion: 0.18
Nodes (19): AttachmentForProgress, Attachment, DocumentalSnapshot, ADDITIONAL_DOCUMENT_TYPE_CODES, ADDITIONAL_DOCUMENT_TYPES, AdditionalDocumentTypeCode, ALL_DOCUMENT_TYPE_CODES, AllDocumentTypeCode (+11 more)

### Community 154 - "003_fluxos_atomicos.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 155 - "container.ts"
Cohesion: 0.10
Nodes (14): Contratos de serviço, AtaRepository, AtaService, ContractRepository, ContractService, RepositoryAlertSource, NotificationService, ReportService (+6 more)

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 162 - "private.validate_meeting_details"
Cohesion: 0.28
Nodes (4): calendar_appointments_scope_date_idx, public.calendar_appointments, private.validate_meeting_details(), validate_meeting_details

### Community 173 - "processes/service.ts"
Cohesion: 0.29
Nodes (8): isVisibleAttachment(), changeProcessStatusSchema, classifyProcessSchema, CreateProcessInput, createProcessSchema, publicSessionDateSchema, RegisterClosingInput, registerClosingSchema

### Community 175 - "identity/service.test.ts"
Cohesion: 0.20
Nodes (5): InMemoryCouncilRepository, base, setup(), InMemorySupplierRepository, setup()

### Community 176 - "formalizations/actions.ts"
Cohesion: 0.17
Nodes (15): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações (+7 more)

### Community 178 - "file-upload.tsx"
Cohesion: 0.33
Nodes (8): validateFileMeta(), FileUpload(), handleFile(), handleFiles(), onDrop(), FileUploadProps, ItemStatus, UploadItem

### Community 179 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build)

### Community 180 - "SupabaseProcessRepository"
Cohesion: 0.26
Nodes (5): snapshotToJson(), SupabaseProcessRepository, toProcess(), toProcessChanges(), toIsoOrNull()

### Community 181 - "purchases/service.test.ts"
Cohesion: 0.53
Nodes (5): approver(), ataItem(), manager(), stockOf(), submitted()

### Community 182 - "public.council_memberships"
Cohesion: 0.50
Nodes (5): check_staff_membership, council_memberships_one_director, private.check_staff_membership(), private.has_council_access(), private.has_request_access()

### Community 183 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 184 - "identity.ts"
Cohesion: 0.21
Nodes (6): @supabase/supabase-js, StaffCategory, CouncilRow, SupabaseCouncilRepository, toCouncil(), toRow()

### Community 186 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 189 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 197 - "ref_server_only"
Cohesion: 0.12
Nodes (16): @supabase/ssr, credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction() (+8 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 994 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `fail` to `Actor`, `vitest`, `adapters/purchases.ts`, `formalizations/service.test.ts`, `inventory/service.ts`, `purchases/service.ts`, `can`, `notifications/service.ts`, `formatCurrency`, `lucide-react`, `simple-table.tsx`, `documentation-tab.tsx`, `documents/service.ts`, `runAction`, `processes.ts`, `db.ts`, `container.ts`, `contracts.ts`, `processes/service.ts`, `next`, `Button`, `MaterialOrder`, `groq.ts`, `toFortalezaDate`, `processes/service.ts`, `formalizations/actions.ts`, `AuditEntry`, `movement-form.tsx`, `SupabaseProcessRepository`, `identity.ts`, `retention/service.ts`, `atas.ts`, `Result`, `state-machine.ts`, `documents/service.ts`, `ref_server_only`, `processos/page.tsx`, `calendario/page.tsx`, `agenda-board.tsx`, `service-support.ts`, `membership-forms.tsx`, `atas/service.ts`, `policy.ts`, `ok`, `formalizations/service.ts`, `media-actions.ts`, `repositories.ts`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `new-contract-form.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13709677419354838 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `new-contract-form.tsx`, `analysis.ts`, `pdf.ts`, `navigation.ts`, `formalizations/service.test.ts`, `inventory/service.ts`, `purchases/service.ts`, `formalization-card.tsx`, `notifications/service.ts`, `formatCurrency`, `lucide-react`, `simple-table.tsx`, `documentation-tab.tsx`, `request-facets.ts`, `new-contract-form.tsx`, `utils.ts`, `package.json`, `next`, `documentation-tab.tsx`, `material-order-dialog.tsx`, `Button`, `MaterialOrder`, `AuditService`, `getSession`, `groq.ts`, `toFortalezaDate`, `extract-request/route.ts`, `identity/service.test.ts`, `formalizations/actions.ts`, `formalization-card.tsx`, `purchases/service.test.ts`, `data-table-logic.ts`, `request-template.ts`, `handler.ts`, `retention/service.ts`, `createSessionClient`, `councils-page.tsx`, `process-history.ts`, `state-machine.ts`, `documents/service.ts`, `callback-server.mjs`, `processos/page.tsx`, `next`, `fail`, `plan-calendar.ts`, `analysis.ts`, `calendario/page.tsx`, `agenda-board.tsx`, `cnpj.ts`, `atas/service.ts`, `order-queue.tsx`, `policy.ts`, `formalizations/service.ts`, `media-actions.ts`, `Input`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `navigation.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11746031746031746 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `new-contract-form.tsx`, `flow-guide.tsx`, `navigation.ts`, `formatCurrency`, `lucide-react`, `simple-table.tsx`, `documentation-tab.tsx`, `package.json`, `new-contract-form.tsx`, `runAction`, `utils.ts`, `package.json`, `next`, `documentation-tab.tsx`, `material-order-dialog.tsx`, `Button`, `getSession`, `groq.ts`, `formalizations/actions.ts`, `movement-form.tsx`, `formalization-card.tsx`, `handler.ts`, `createSessionClient`, `councils-page.tsx`, `toast-store.ts`, `ref_server_only`, `callback-server.mjs`, `auth-stage.tsx`, `processos/page.tsx`, `ActionForm`, `calendario/page.tsx`, `agenda-board.tsx`, `process-view.tsx`, `membership-forms.tsx`, `order-queue.tsx`, `policy.ts`, `media-actions.ts`, `Input`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.09899749373433583 - nodes in this community are weakly interconnected._