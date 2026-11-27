# Graph Report - Warleysales  (2026-11-26)

## Corpus Check
- 601 files · ~276,860 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3663 nodes · 12630 edges · 192 communities (147 shown, 45 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 457 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b1d3e492`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [...path]/page.tsx
- public.forbid_mutation
- simple-table.tsx
- SupabaseFormalizationRepository
- identity/actions.ts
- vitest
- dependencies
- lucide-react
- inventory/service.ts
- identity/service.ts
- ProcessFormalization
- time.ts
- public.profiles
- notifications.ts
- Tarefas
- calendario/page.tsx
- dashboard/page.tsx
- public.create_contract_with_ata
- simple-table.tsx
- documentation-tab.tsx
- parseCurrencyInput
- ok
- public.purchase_requests
- result.ts
- MaterialOrder
- unwrap
- public.correct_purchase_request
- purchases/service.ts
- Auditoria de desempenho do Warley
- memory-repositories.ts
- loadScreen
- 20261102000002_domain_tables.sql
- 20261116000001_notification_emails.sql
- Button
- estoque/page.tsx
- groq.ts
- callback-app/app/page.tsx
- 20261102000006_fk_indexes.sql
- service-support.ts
- db.ts
- container.ts
- public.receive_purchase_request
- cleanup-eligibility.ts
- toFortalezaDate
- contracts/service.ts
- .insert
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
- progress.ts
- components.json
- formalizations/service.test.ts
- private.business_error
- RetentionRepository
- package.json
- policy.ts
- compilerOptions
- toast-store.ts
- material-order-dialog.tsx
- compilerOptions
- callback-server.mjs
- public.stock_movements
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- runAction
- authenticated-shell.tsx
- Actor
- ActionForm
- formalization-card.tsx
- seed-demo.mjs
- documents/service.ts
- pg_temp.act_as
- PDFReport
- analysis.ts
- react
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- process-history.ts
- public.receive_purchase_request_for_contract
- callRpc
- process-actions.tsx
- getSession
- Input
- cnpj.ts
- 20261110000003_material_orders.sql
- toFortalezaDate
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- policy.ts
- fail
- orders/actions.ts
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- page-header.tsx
- Proposta funcional — página inicial Warley Gestão Operacional
- 20261126020200_process_assignment_contract_closure.sql
- Execução local, deploy e backups
- media-actions.ts
- inventory.ts
- fields.tsx
- home-overview.tsx
- Validação realmente executada
- formalization-queue.tsx
- Global Constraints
- Checklist de execução
- Execução dos blocos 1 e 2
- correction-action.ts
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
- new-ata-form.tsx
- isUniqueViolation
- documentation-tab.tsx
- public.contracts
- formalizations/actions.ts
- private.validate_meeting_details
- Global Constraints
- atas/actions.ts
- Global Constraints
- InMemoryMembershipRepository
- file-upload.tsx
- Arquitetura (estado atual da implementação)
- Global Constraints
- inventory/actions.ts
- public.spec.ts
- bundle-migrations.mjs
- validate-corrections.mjs
- contracting-mode.ts
- playwright.config.ts
- 002_validacao_sem_pgtap.sql
- 00_supabase_stub.sql
- production-readonly-audit.mjs

## God Nodes (most connected - your core abstractions)
1. `ok()` - 295 edges
2. `fail()` - 227 edges
3. `Result` - 202 edges
4. `Actor` - 131 edges
5. `next` - 117 edges
6. `vitest` - 110 edges
7. `react` - 96 edges
8. `runAction()` - 84 edges
9. `unwrap()` - 79 edges
10. `ActionForm()` - 78 edges

## Surprising Connections (you probably didn't know these)
- `Task 3: Orquestração na Criação de Solicitação (`createProcess`)` --references--> `ProcessService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-solicitacao-processo-anexagem.md → src/modules/processes/service.ts
- `Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley` --references--> `MaterialOrderService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda2-pedidos-justificativas-auditoria.md → src/modules/orders/service.ts
- `Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação` --references--> `InventoryService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/inventory/service.ts
- `Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado)` --references--> `InventoryService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/inventory/service.ts
- `Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`)` --references--> `BriefingFacts`  [INFERRED]
  docs/superpowers/plans/2026-11-11-redesign-visao-geral-e-meu-painel.md → src/modules/insights/briefing.ts

## Import Cycles
- None detected.

## Communities (192 total, 45 thin omitted)

### Community 0 - "[...path]/page.tsx"
Cohesion: 0.11
Nodes (21): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessHeader() (+13 more)

### Community 1 - "public.forbid_mutation"
Cohesion: 0.10
Nodes (30): idx_ata_allocations_council_id, idx_ata_commitments_council_id, idx_ata_extensions_requested_by, idx_ata_items_material_id, idx_price_registration_atas_process_id, idx_price_registration_atas_supplier_id, idx_stock_movements_actor_id, idx_stock_movements_material_id (+22 more)

### Community 2 - "simple-table.tsx"
Cohesion: 0.12
Nodes (31): ApprovalQueueProps, DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview(), RequestsOverview(), Row(), RowLink (+23 more)

### Community 4 - "identity/actions.ts"
Cohesion: 0.18
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

### Community 5 - "vitest"
Cohesion: 0.11
Nodes (39): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+31 more)

### Community 6 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, next@16.4.6 (+13 more)

### Community 7 - "lucide-react"
Cohesion: 0.16
Nodes (38): lucide-react, AtasPage(), Content(), metadata, CouncilContent(), Content(), ContractsPage(), metadata (+30 more)

### Community 8 - "inventory/service.ts"
Cohesion: 0.08
Nodes (52): Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), none, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel, stockLevelLabel, applyMovement() (+44 more)

### Community 9 - "identity/service.ts"
Cohesion: 0.11
Nodes (18): CouncilRepository, MembershipRepository, Council, MembershipRecord, ProfileSummary, assignMembershipSchema, councilFields, createCouncilSchema (+10 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.06
Nodes (46): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações (+38 more)

### Community 11 - "time.ts"
Cohesion: 0.10
Nodes (40): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+32 more)

### Community 12 - "public.profiles"
Cohesion: 0.07
Nodes (52): administrative_processes_responsible_id_idx, calendar_appointments_scope_date_idx, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id, idx_councils_organization_type (+44 more)

### Community 13 - "notifications.ts"
Cohesion: 0.06
Nodes (27): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract, ALERT_MILESTONES (+19 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (33): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+25 more)

### Community 15 - "calendario/page.tsx"
Cohesion: 0.10
Nodes (24): CalendarReportPanelProps, MonthDialog(), MonthDialogProps, weekdays, CalendarCouncilSummary, CalendarMonthSummary, CalendarReport, CalendarKind (+16 more)

### Community 16 - "dashboard/page.tsx"
Cohesion: 0.10
Nodes (31): 5. Componentes existentes a reutilizar e mudanças propostas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, ApprovalQueue(), PendingApprovalItem, DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor() (+23 more)

### Community 17 - "public.create_contract_with_ata"
Cohesion: 0.07
Nodes (29): public.append_commitment_event(), public.save_ata(), public.save_contract(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, trg_contract_amendments_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate (+21 more)

### Community 18 - "simple-table.tsx"
Cohesion: 0.15
Nodes (27): ProcessesTable(), ProcessesTableProps, DataTable(), DataTableColumn, DataTableProps, Cell, collator, compareValues() (+19 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.14
Nodes (30): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+22 more)

### Community 20 - "parseCurrencyInput"
Cohesion: 0.29
Nodes (11): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), formatCurrencyDraft(), normalizeCurrencyDecimal(), parseCurrencyInput() (+3 more)

### Community 21 - "ok"
Cohesion: 0.07
Nodes (19): Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, 6. Estratégia de Testes, FormalizationService, SavingsSummary, InventoryService, MaterialOrderRepository, MaterialOrderService, ReportService (+11 more)

### Community 22 - "public.purchase_requests"
Cohesion: 0.12
Nodes (20): contract_receipt_line_integrity, contract_receipt_lines_contract_idx, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, private.check_contract_ata_process(), private.check_contract_receipt_line() (+12 more)

### Community 23 - "result.ts"
Cohesion: 0.21
Nodes (9): AuditPage(), AuditPageProps, Content(), metadata, one(), Lookups, context(), ScreenContext (+1 more)

### Community 24 - "MaterialOrder"
Cohesion: 0.16
Nodes (5): MaterialOrderDialogProps, MaterialOrderFormProps, InMemoryMaterialOrderRepository, MaterialOrder, SupabaseMaterialOrderRepository

### Community 25 - "unwrap"
Cohesion: 0.11
Nodes (8): toRow(), SupabaseMembershipRepository, SupabaseNotificationRepository, toNotification(), SupabaseRetentionRepository, DatabaseError, toIso(), unwrap()

### Community 26 - "public.correct_purchase_request"
Cohesion: 0.11
Nodes (12): trg_audit_logs_immutable, idx_administrative_processes_created_by, idx_audit_logs_actor_id, private.business_error(), private.next_request_event_position(), public.correct_purchase_request(), public.set_document_exception(), public.set_process_estimated_value() (+4 more)

### Community 27 - "purchases/service.ts"
Cohesion: 0.08
Nodes (30): PurchaseRequest, PurchaseRequestEvent, RequestStatus, ReceiptItemResult, ReceiptItemState, ReceiptLine, ReceiptOutcome, PurchaseRequestStatus (+22 more)

### Community 28 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 29 - "memory-repositories.ts"
Cohesion: 0.08
Nodes (22): InMemoryAtaRepository, InMemoryContractRepository, FailingRepository, InMemoryDocumentRepository, setup(), InMemoryCouncilRepository, InMemoryInventoryRepository, isValidAttachment() (+14 more)

### Community 31 - "loadScreen"
Cohesion: 0.09
Nodes (39): AdministrationPage(), Content(), LINKS, metadata, ACTION_LABEL, Content(), metadata, RetentionPage() (+31 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.15
Nodes (29): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+21 more)

### Community 34 - "Button"
Cohesion: 0.17
Nodes (21): MeetingDetailsEditor(), MeetingFile(), MeetingMinutesEditor(), MeetingStatusEditor(), MeetingTaskEditor(), Option, MeetingEvidenceForm(), AttachmentRow (+13 more)

### Community 35 - "estoque/page.tsx"
Cohesion: 0.16
Nodes (18): StockEntrySource, buildHoldRows(), HoldItemInput, HoldRow, EntryFromProcessForm(), isLedgerType(), LedgerType, Line (+10 more)

### Community 36 - "groq.ts"
Cohesion: 0.14
Nodes (23): BriefingCard(), BriefingFallback(), BRIEFING_SYSTEM_PROMPT, BriefingFacts, briefingSchema, briefingUsesOnlyKnownNumbers(), buildBriefingFacts(), coerceBriefing() (+15 more)

### Community 37 - "callback-app/app/page.tsx"
Cohesion: 0.13
Nodes (20): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, openProcessAttachment(), ProcessAttachmentSheet() (+12 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.07
Nodes (20): public.save_meeting(), public.save_transfer(), idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_councils_responsible_user_id, idx_document_cleanup_runs_process_id, idx_meeting_action_items_meeting_id (+12 more)

### Community 39 - "service-support.ts"
Cohesion: 0.06
Nodes (46): zod, changeMeetingStatus(), MEETING_TRANSITIONS, ActionItem, actionItemSchema, changeMeetingStatusSchema, meetingDetailsSchema, MeetingMinutes (+38 more)

### Community 40 - "db.ts"
Cohesion: 0.11
Nodes (27): @supabase/supabase-js, AtaStatus, MeetingStatus, AtaRow, CommitmentRow, toAta(), toCommitment(), ContractRow (+19 more)

### Community 41 - "container.ts"
Cohesion: 0.05
Nodes (42): Contratos de serviço, Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.2. Serviços e Ações, 6. Estratégia de Testes, AuditRecorder, ContractService (+34 more)

### Community 42 - "public.receive_purchase_request"
Cohesion: 0.14
Nodes (15): public.save_purchase_request(), idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, public.cancel_purchase_request(), idx_purchase_requests_process_id, public.save_purchase_request() (+7 more)

### Community 43 - "cleanup-eligibility.ts"
Cohesion: 0.40
Nodes (5): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), addDaysToInstant()

### Community 44 - "toFortalezaDate"
Cohesion: 0.16
Nodes (20): pdf-lib@^1.17.1, pdf-lib, auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, DetailedReport (+12 more)

### Community 45 - "contracts/service.ts"
Cohesion: 0.12
Nodes (24): ExtensionRequest, original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms, currentTerms(), elapsedPercent() (+16 more)

### Community 46 - ".insert"
Cohesion: 0.09
Nodes (4): InMemoryMeetingRepository, MeetingDetails, InMemoryTransferRepository, setup()

### Community 48 - "public.profiles"
Cohesion: 0.22
Nodes (21): administrative_processes_responsible_membership, idx_process_formalizations_council, idx_process_formalizations_status, private.check_process_responsible_membership(), private.has_council_access(), private.has_council_role(), public.administrative_processes, public.apply_stock_mutation() (+13 more)

### Community 49 - "AuditEntry"
Cohesion: 0.18
Nodes (10): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange() (+2 more)

### Community 50 - "next"
Cohesion: 0.11
Nodes (8): nextConfig, next, metadata, NewCouncilPage(), CouncilPickerProps, metadata, ProcessContent(), ProcessPage()

### Community 51 - "process-view.tsx"
Cohesion: 0.17
Nodes (17): PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown(), selectTab(), ProcessViewProps, TabDefinition (+9 more)

### Community 53 - "atas/extract-pdf/route.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 54 - "extract-request/route.ts"
Cohesion: 0.16
Nodes (15): mammoth@^1.13.0, mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText() (+7 more)

### Community 55 - "request-template.ts"
Cohesion: 0.15
Nodes (20): GET(), ExtractedPurchaseRequest, buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias() (+12 more)

### Community 56 - "handler.ts"
Cohesion: 0.11
Nodes (15): GET, GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createResendSender(), createSupabaseJobRunRepository() (+7 more)

### Community 57 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.07
Nodes (52): buildStockEntrySources(), RECEIVABLE, StockEntryItem, Content(), metadata, RequestPage(), metadata, Fact() (+44 more)

### Community 58 - "createSessionClient"
Cohesion: 0.12
Nodes (15): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências, Fluxos atuais e ideais (+7 more)

### Community 59 - "20261102000001_identity.sql"
Cohesion: 0.33
Nodes (13): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+5 more)

### Community 60 - "progress.ts"
Cohesion: 0.16
Nodes (18): Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), AttachmentForProgress, refreshCompletion(), buildSnapshot(), CompletionEvent, CompletionState, CompletionTransition, DocumentalSnapshot (+10 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "formalizations/service.test.ts"
Cohesion: 0.14
Nodes (11): InMemoryStorage, createProcessWithProgress(), Ctx, PDF, DOCUMENT_TYPE_CODES, attachAll(), completedProcess(), Ctx (+3 more)

### Community 63 - "private.business_error"
Cohesion: 0.21
Nodes (13): idx_stock_balances_material_id, idx_stock_transfer_events_actor_id, idx_stock_transfer_items_material_id, idx_stock_transfers_destination_council_id, idx_stock_transfers_origin_council_id, private.business_error(), private.next_transfer_event_position(), public.advance_transfer() (+5 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "package.json"
Cohesion: 0.11
Nodes (23): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, @playwright/test@^1.65.1, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5 (+15 more)

### Community 66 - "policy.ts"
Cohesion: 0.13
Nodes (17): AtaPage(), Content(), metadata, Content(), ContractPage(), metadata, AppLayout(), Loading() (+9 more)

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "material-order-dialog.tsx"
Cohesion: 0.18
Nodes (15): 6. Valores, estados e mensagens: salvaguardas, Reutilização em painéis por perfil, CouncilWorkspace(), CouncilWorkspaceProps, ActionHub(), ActionItem, buildCouncilActions(), AvailableStockItem (+7 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "public.stock_movements"
Cohesion: 0.19
Nodes (9): public.apply_stock_mutation(), trg_stock_movements_immutable, idx_stock_balances_material_id, idx_stock_movements_actor_id, idx_stock_movements_material_id, idx_process_formalizations_council, idx_process_formalizations_status, public.apply_stock_mutation() (+1 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "runAction"
Cohesion: 0.10
Nodes (36): manualDeleteFormAction(), assignMembershipFormAction(), createCouncilFormAction(), removeMembershipFormAction(), setStaffCategoryFormAction(), updateCouncilFormAction(), provisionCouncilAccess(), schema (+28 more)

### Community 75 - "authenticated-shell.tsx"
Cohesion: 0.13
Nodes (24): NavigationFixture(), AuthenticatedShell(), AccessContext, ALL_ROLES, filterNavigation(), NAV_GROUPS, NAV_ITEMS, NavGroup (+16 more)

### Community 76 - "Actor"
Cohesion: 0.09
Nodes (11): 3.3. Repositório e Camada de Domínio, MeetingRepository, Meeting, MeetingService, changeRequestStatus(), PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService (+3 more)

### Community 77 - "ActionForm"
Cohesion: 0.11
Nodes (36): Option, RetentionForms(), MembershipForms(), Option, StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), AmendmentForm() (+28 more)

### Community 78 - "formalization-card.tsx"
Cohesion: 0.17
Nodes (16): auctionLabel(), FormalizationCard(), FormalizationCardProps, FormalizationSupplier, formatAuctionDate(), INSTRUMENT_LABELS, BASE_FORMALIZATION, MOCK_SUPPLIERS (+8 more)

### Community 79 - "seed-demo.mjs"
Cohesion: 0.26
Nodes (8): assertOk(), demoId(), ensureStock(), env, main(), sb, upsertCouncil(), upsertMaterial()

### Community 80 - "documents/service.ts"
Cohesion: 0.17
Nodes (17): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), attachmentIdSchema, PreparedUpload (+9 more)

### Community 81 - "pg_temp.act_as"
Cohesion: 0.12
Nodes (5): pg_temp.act_as(), pg_temp.act_as(), pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 83 - "analysis.ts"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

### Community 84 - "react"
Cohesion: 0.15
Nodes (13): FixtureReady(), FixtureLayout(), react, Content(), metadata, TransferPage(), Cell, DICTIONARIES (+5 more)

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem"
Cohesion: 0.13
Nodes (14): 1. Visão Geral e Contexto, 2. Requisitos e Casos de Uso, 3.1. Banco de Dados (PostgreSQL / Supabase), 3.2. Sequenciamento de Processos (`nextProcessNumber`), 3. Arquitetura e Modelo de Dados, 4.1. Formulário em `/solicitacoes/nova`, 4.2. Card em `/solicitacoes/[id]`, 4. Design de Interface (UI/UX) (+6 more)

### Community 87 - "public.record_meeting_evidence"
Cohesion: 0.30
Nodes (6): idx_profiles_staff_category, keep_meeting_task_completion, private.keep_meeting_task_completion(), public.meeting_attendance, public.meeting_task_completions, public.record_meeting_evidence()

### Community 88 - "2. Requisitos e Casos de Uso"
Cohesion: 0.14
Nodes (13): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, UC-01: Registro do Valor Estimado e Bloqueio de Estoque (+5 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.13
Nodes (14): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+6 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "process-history.ts"
Cohesion: 0.15
Nodes (15): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ADDITIONAL_DOCUMENT_TYPE_CODES (+7 more)

### Community 92 - "public.receive_purchase_request_for_contract"
Cohesion: 0.18
Nodes (4): public.contract_receipt_lines, public.receive_purchase_request_for_contract(), contract_receipt_line_integrity, private.check_contract_receipt_line()

### Community 93 - "callRpc"
Cohesion: 0.15
Nodes (7): SupabaseContractRepository, toContract(), toPayload(), SupabaseMeetingRepository, toMeeting(), toPayload(), callRpc()

### Community 94 - "process-actions.tsx"
Cohesion: 0.32
Nodes (8): ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, PROCESS_TRANSITIONS, ProcessStatus, ProcessRow

### Community 95 - "getSession"
Cohesion: 0.19
Nodes (14): @supabase/ssr, GET(), GET(), Home(), RedirectHome(), config, proxy(), getServices() (+6 more)

### Community 96 - "Input"
Cohesion: 0.23
Nodes (11): ProvisionCouncilForm(), ProductField(), ProductFieldProps, exactProduct(), filterProducts(), normalizeProductQuery(), ProductOption, options (+3 more)

### Community 97 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 98 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 99 - "toFortalezaDate"
Cohesion: 0.13
Nodes (26): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), CloseContractForm(), ContractAtaOption (+18 more)

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "policy.ts"
Cohesion: 0.11
Nodes (28): INSTRUMENT_LABELS, SavingsHistoryDialog(), SavingsHistoryDialogProps, SavingsHistoryItem, SavingsSummaryProps, ACTION_LABELS, AuditTrailFilters, AuditTrailTab() (+20 more)

### Community 112 - "fail"
Cohesion: 0.09
Nodes (27): AtaBalance, CommitmentEvent, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation, validateAllocations(), validateCommitment() (+19 more)

### Community 113 - "orders/actions.ts"
Cohesion: 0.14
Nodes (18): OrderQueue(), handleApprove(), handleConfirmReject(), OrderQueueProps, PendingOrderItem, MaterialOrderForm(), handleSubmit(), resetForm() (+10 more)

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

### Community 118 - "page-header.tsx"
Cohesion: 0.22
Nodes (12): CouncilPage(), metadata, CouncilsContent(), CouncilsPage(), metadata, formatWhatsapp(), onlyDigits(), parseWhatsapp() (+4 more)

### Community 119 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.13
Nodes (14): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação, Estoque e materiais (+6 more)

### Community 120 - "20261126020200_process_assignment_contract_closure.sql"
Cohesion: 0.38
Nodes (4): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, contract_receipt_lines_contract_idx, private.check_process_responsible_membership()

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "media-actions.ts"
Cohesion: 0.12
Nodes (19): getUrl(), makeDraft(), AUDIO_TYPES, BrowserRecognition, MeetingMediaPanel(), openSavedAudio(), saveAudio(), MeetingOption (+11 more)

### Community 123 - "inventory.ts"
Cohesion: 0.13
Nodes (15): MovementType, StockBalance, InventoryRepository, keyOf(), StockKey, StockMutation, StockRow, StockState (+7 more)

### Community 124 - "fields.tsx"
Cohesion: 0.11
Nodes (19): AuthLayout(), FieldShell(), LoginForm(), LoginPage(), metadata, metadata, RecoveryPage(), RecoveryForm() (+11 more)

### Community 125 - "home-overview.tsx"
Cohesion: 0.22
Nodes (11): BigStat(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, BarStatItem, BarStatList(), describeArc() (+3 more)

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 127 - "formalization-queue.tsx"
Cohesion: 0.20
Nodes (10): FormalizationQueue(), handleQuickHomologate(), FormalizationQueueProps, INSTRUMENT_LABELS, PendingFormalizationItem, confirmationSucceeded(), ConfirmDialog(), handleConfirm() (+2 more)

### Community 128 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 131 - "correction-action.ts"
Cohesion: 0.20
Nodes (11): 3.1 Encerramento de Processo com Documentação Parcial, 3.2 Recebimento de Materiais com Saldo Pendente, 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%), createRequestFormAction(), readItems(), receiveFormAction(), requestStepFormAction(), Step (+3 more)

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 134 - "suppliers/service.ts"
Cohesion: 0.18
Nodes (7): InMemorySupplierRepository, SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema, SupplierService

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
Cohesion: 0.11
Nodes (9): snapshotToJson(), SupabaseDocumentRepository, SupabaseProcessRepository, SupabaseStorage, toAttachment(), toProcess(), toProcessChanges(), toIsoOrNull() (+1 more)

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
Cohesion: 0.38
Nodes (4): @base-ui/react, cn, Badge(), badgeVariants

### Community 151 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 152 - "new-ata-form.tsx"
Cohesion: 0.24
Nodes (8): matchPdfItems(), NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption, CurrencyField()

### Community 153 - "isUniqueViolation"
Cohesion: 0.17
Nodes (5): SupabaseCouncilRepository, toCouncil(), toRow(), SupabaseSupplierRepository, isUniqueViolation()

### Community 154 - "documentation-tab.tsx"
Cohesion: 0.20
Nodes (14): react-dom, buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, isActiveDoc(), isArchivedDoc(), MANDATORY_DOCUMENT_CODES (+6 more)

### Community 155 - "public.contracts"
Cohesion: 0.22
Nodes (10): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contracts_ata_id_idx, idx_contracts_process_id, idx_contracts_supplier_id, public.contract_ata_items (+2 more)

### Community 161 - "formalizations/actions.ts"
Cohesion: 0.44
Nodes (7): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, assertInstrumentsLinked(), homologateFormalizationAction(), parseMoney(), rejectFormalizationAction(), submitFormalizationFormAction(), mockRunAction

### Community 162 - "private.validate_meeting_details"
Cohesion: 0.24
Nodes (4): calendar_appointments_scope_date_idx, public.calendar_appointments, private.validate_meeting_details(), validate_meeting_details

### Community 172 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build)

### Community 173 - "atas/actions.ts"
Cohesion: 0.44
Nodes (8): ataStepFormAction(), createAtaFormAction(), linkAtaProcessFormAction(), optionalId(), processReturnPath(), readProcessItems(), setAllocationsFormAction(), toNumber()

### Community 174 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 176 - "file-upload.tsx"
Cohesion: 0.28
Nodes (8): ALLOWED_EXTENSIONS_LABEL, FileUpload(), handleFile(), handleFiles(), onDrop(), FileUploadProps, ItemStatus, UploadItem

### Community 177 - "Arquitetura (estado atual da implementação)"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 178 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 179 - "inventory/actions.ts"
Cohesion: 0.57
Nodes (6): createMaterialFormAction(), done(), readMovementLines(), registerMovementFormAction(), setMinimumFormAction(), toNumber()

### Community 180 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 181 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

### Community 183 - "contracting-mode.ts"
Cohesion: 0.60
Nodes (3): isProcessContractingMode(), needsAta(), PROCESS_CONTRACTING_MODES

### Community 184 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 185 - "002_validacao_sem_pgtap.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 980 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `correction-action.ts`, `vitest`, `suppliers/service.ts`, `lucide-react`, `inventory/service.ts`, `identity/service.ts`, `time.ts`, `processes.ts`, `dashboard/page.tsx`, `documentation-tab.tsx`, `result.ts`, `isUniqueViolation`, `documentation-tab.tsx`, `purchases/service.ts`, `memory-repositories.ts`, `loadScreen`, `formalizations/actions.ts`, `Button`, `estoque/page.tsx`, `groq.ts`, `callback-app/app/page.tsx`, `service-support.ts`, `db.ts`, `container.ts`, `toFortalezaDate`, `contracts/service.ts`, `atas.ts`, `next`, `handler.ts`, `solicitacoes/[id]/page.tsx`, `policy.ts`, `runAction`, `Actor`, `documents/service.ts`, `react`, `policy.ts`, `fail`, `page-header.tsx`, `media-actions.ts`, `inventory.ts`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[...path]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11384615384615385 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `[...path]/page.tsx`, `simple-table.tsx`, `correction-action.ts`, `identity/actions.ts`, `dependencies`, `lucide-react`, `time.ts`, `calendario/page.tsx`, `dashboard/page.tsx`, `simple-table.tsx`, `documentation-tab.tsx`, `result.ts`, `documentation-tab.tsx`, `loadScreen`, `formalizations/actions.ts`, `Button`, `estoque/page.tsx`, `groq.ts`, `callback-app/app/page.tsx`, `atas/actions.ts`, `process-view.tsx`, `inventory/actions.ts`, `handler.ts`, `solicitacoes/[id]/page.tsx`, `createSessionClient`, `package.json`, `policy.ts`, `toast-store.ts`, `material-order-dialog.tsx`, `callback-server.mjs`, `runAction`, `authenticated-shell.tsx`, `ActionForm`, `formalization-card.tsx`, `react`, `getSession`, `toFortalezaDate`, `policy.ts`, `orders/actions.ts`, `page-header.tsx`, `media-actions.ts`, `fields.tsx`, `home-overview.tsx`, `formalization-queue.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `public.forbid_mutation` be split into smaller, more focused modules?**
  _Cohesion score 0.09682539682539683 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `[...path]/page.tsx`, `simple-table.tsx`, `inventory/service.ts`, `ProcessFormalization`, `time.ts`, `notifications.ts`, `calendario/page.tsx`, `dashboard/page.tsx`, `simple-table.tsx`, `documentation-tab.tsx`, `parseCurrencyInput`, `ok`, `result.ts`, `new-ata-form.tsx`, `documentation-tab.tsx`, `purchases/service.ts`, `memory-repositories.ts`, `loadScreen`, `formalizations/actions.ts`, `estoque/page.tsx`, `groq.ts`, `callback-app/app/page.tsx`, `service-support.ts`, `toFortalezaDate`, `contracts/service.ts`, `process-view.tsx`, `atas/extract-pdf/route.ts`, `extract-request/route.ts`, `contracting-mode.ts`, `request-template.ts`, `solicitacoes/[id]/page.tsx`, `createSessionClient`, `handler.ts`, `progress.ts`, `formalizations/service.test.ts`, `actions.movement-lines.test.ts`, `package.json`, `material-order-dialog.tsx`, `callback-server.mjs`, `authenticated-shell.tsx`, `formalization-card.tsx`, `documents/service.ts`, `analysis.ts`, `process-history.ts`, `process-actions.tsx`, `Input`, `cnpj.ts`, `toFortalezaDate`, `policy.ts`, `fail`, `orders/actions.ts`, `page-header.tsx`, `media-actions.ts`, `home-overview.tsx`, `formalization-queue.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `simple-table.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11738648947951273 - nodes in this community are weakly interconnected._