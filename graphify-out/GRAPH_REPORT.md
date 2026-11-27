# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 626 files · ~289,169 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3774 nodes · 13016 edges · 176 communities (130 shown, 46 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 463 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `19dc3a52`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Actor
- InventoryService
- solicitacoes/[id]/page.tsx
- formalization.ts
- callback-app/app/page.tsx
- vitest
- adapters/purchases.ts
- InMemoryAtaRepository
- inventory/service.ts
- formalizations/actions.ts
- ProcessFormalization
- identity/service.ts
- apply_all.sql
- notifications/service.ts
- Tarefas
- purchases/service.ts
- lucide-react
- public.create_contract_with_ata
- formalizations/service.test.ts
- documentation-tab.tsx
- package.json
- request-facets.ts
- plan-calendar.ts
- meetings/service.ts
- process-view.tsx
- unwrap
- public.correct_purchase_request
- utils.ts
- entry-sources.ts
- public.purchase_requests
- detailed.ts
- result.ts
- 20261102000002_domain_tables.sql
- 20261116000001_notification_emails.sql
- councils-page.tsx
- reports/service.ts
- alertas/page.tsx
- reunioes/page.tsx
- 20261102000006_fk_indexes.sql
- MaterialOrder
- runAction
- identity/service.test.ts
- file-validation.ts
- groq.ts
- toFortalezaDate
- InMemoryInventoryRepository
- InMemoryNotificationRepository
- policy.ts
- public.profiles
- 20261126020200_process_assignment_contract_closure.sql
- Global Constraints
- purchases/service.test.ts
- @playwright/test
- data-table-logic.ts
- home-overview.test.tsx
- request-template.ts
- handler.ts
- createSessionClient
- Attachment
- components.json
- ok
- process-history.ts
- RetentionRepository
- transfer.ts
- public.receive_purchase_request_for_contract
- compilerOptions
- toast-store.ts
- atas.ts
- compilerOptions
- callback-server.mjs
- meetings.ts
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- formatCurrency
- next
- fail
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- pg_temp.act_as
- PDFReport
- analysis.ts
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- time.ts
- toFortalezaDate
- Button
- Arquitetura (estado atual da implementação)
- public.spec.ts
- cnpj.ts
- repositories.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- atas/service.ts
- formalization-queue.tsx
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- ok
- Execução local, deploy e backups
- media-actions.ts
- db.ts
- Input
- bundle-migrations.mjs
- Validação realmente executada
- atas-de-reuniao-operacao.md
- Checklist de execução
- Execução dos blocos 1 e 2
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
- container.ts
- check-supabase.mjs
- 002_validacao_sem_pgtap.sql
- 003_fluxos_atomicos.sql
- diffInDays
- Auditoria de desempenho do Warley
- private.validate_meeting_details
- public.council_memberships
- ref_node_fs
- movement-form.tsx
- react
- processes.ts
- cleanup-eligibility.ts
- decimal.ts
- validate-corrections.mjs
- playwright.config.ts
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
- `Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação` --references--> `InventoryService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/inventory/service.ts
- `Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado)` --references--> `InventoryService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/inventory/service.ts
- `Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters)` --references--> `AuditFilter`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda2-pedidos-justificativas-auditoria.md → src/modules/audit/schemas.ts
- `Frontend, API e banco` --references--> `selectAll()`  [INFERRED]
  docs/auditoria-performance.md → src/server/supabase/db.ts

## Import Cycles
- None detected.

## Communities (176 total, 46 thin omitted)

### Community 0 - "Actor"
Cohesion: 0.17
Nodes (7): Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), 3.3. Repositório e Camada de Domínio, changeRequestStatus(), PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService, Actor

### Community 1 - "InventoryService"
Cohesion: 0.19
Nodes (28): Contratos de serviço, InMemoryAtaRepository, AtaService, setup(), InMemoryAuditRepository, AuditService, ContractService, setup() (+20 more)

### Community 2 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.15
Nodes (12): Content(), metadata, RequestPage(), PROCESS_FLOW_STEPS, REQUEST_FLOW_STEPS, REQUEST_LIFECYCLE, REQUEST_RAIL_ALIAS, requestRailKey() (+4 more)

### Community 3 - "formalization.ts"
Cohesion: 0.05
Nodes (54): branding(), download(), GET(), AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult (+46 more)

### Community 4 - "callback-app/app/page.tsx"
Cohesion: 0.05
Nodes (50): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build, ComponentShowcase(), fixtureOrder (+42 more)

### Community 5 - "vitest"
Cohesion: 0.09
Nodes (37): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+29 more)

### Community 6 - "adapters/purchases.ts"
Cohesion: 0.10
Nodes (14): Contract, AtomicDecision, AtomicReceipt, ContractRow, SupabaseContractRepository, toContract(), toPayload(), LinkedRequestNotesRow (+6 more)

### Community 7 - "InMemoryAtaRepository"
Cohesion: 0.08
Nodes (5): InMemoryContractRepository, FailingRepository, InMemoryMeetingRepository, InMemoryTransferRepository, setup()

### Community 8 - "inventory/service.ts"
Cohesion: 0.13
Nodes (34): none, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel, stockLevelLabel, applyMovement(), availableOf() (+26 more)

### Community 9 - "formalizations/actions.ts"
Cohesion: 0.16
Nodes (16): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão) (+8 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.16
Nodes (7): FormalizationStatus, ProcessFormalization, FormalizationFilter, FormalizationRow, fromRow(), SupabaseFormalizationRepository, toRow()

### Community 11 - "identity/service.ts"
Cohesion: 0.18
Nodes (5): CouncilRepository, MembershipRepository, Council, ProfileSummary, MembershipService

### Community 12 - "apply_all.sql"
Cohesion: 0.04
Nodes (106): administrative_processes_responsible_id_idx, calendar_appointments_scope_date_idx, contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contracts_ata_id_idx, council_memberships_one_director (+98 more)

### Community 13 - "notifications/service.ts"
Cohesion: 0.09
Nodes (14): RepositoryAlertSource, AlertEntityType, AlertMilestone, digestMessage(), dispatchNotificationEmails(), EmailDispatchSummary, EmailMessage, EmailSender (+6 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.09
Nodes (30): Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, applyReceipt(), ReceiptItemResult, ReceiptItemState, ReceiptLine (+22 more)

### Community 16 - "lucide-react"
Cohesion: 0.07
Nodes (49): 5. Componentes existentes a reutilizar e mudanças propostas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, @base-ui/react, lucide-react, CouncilWorkspace(), DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS (+41 more)

### Community 17 - "public.create_contract_with_ata"
Cohesion: 0.06
Nodes (32): public.append_commitment_event(), public.save_ata(), public.save_contract(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, trg_contract_amendments_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate (+24 more)

### Community 18 - "formalizations/service.test.ts"
Cohesion: 0.10
Nodes (11): InMemoryStorage, InMemoryFormalizationRepository, createProcessWithProgress(), Ctx, PDF, DOCUMENT_TYPE_CODES, isValidAttachment(), InMemoryProcessRepository (+3 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.08
Nodes (54): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+46 more)

### Community 20 - "package.json"
Cohesion: 0.05
Nodes (47): eslintConfig, dependencies, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0 (+39 more)

### Community 21 - "request-facets.ts"
Cohesion: 0.15
Nodes (22): citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME, MONTH_ORDER, NATUREZA_ORDER (+14 more)

### Community 22 - "plan-calendar.ts"
Cohesion: 0.11
Nodes (21): MonthDialog(), MonthDialogProps, CalendarCouncilSummary, CalendarMonthSummary, CalendarKind, CalendarMark, calendarMarks(), CalendarSource (+13 more)

### Community 23 - "meetings/service.ts"
Cohesion: 0.13
Nodes (17): changeMeetingStatus(), MEETING_TRANSITIONS, MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting, MeetingDetails (+9 more)

### Community 24 - "process-view.tsx"
Cohesion: 0.14
Nodes (20): AtaBalanceRow, PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown(), selectTab(), ProcessViewProps (+12 more)

### Community 25 - "unwrap"
Cohesion: 0.07
Nodes (13): MembershipRecord, MembershipDirectory, MembershipRow, SupabaseMembershipRepository, SupabaseNotificationRepository, SupabaseMaterialOrderRepository, SupabaseRetentionRepository, DatabaseError (+5 more)

### Community 26 - "public.correct_purchase_request"
Cohesion: 0.08
Nodes (23): public.save_purchase_request(), trg_audit_logs_immutable, idx_administrative_processes_created_by, idx_audit_logs_actor_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by (+15 more)

### Community 27 - "utils.ts"
Cohesion: 0.22
Nodes (12): BigStat(), ChartCard(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, BarStatItem, BarStatList() (+4 more)

### Community 28 - "entry-sources.ts"
Cohesion: 0.27
Nodes (13): buildStockEntrySources(), RECEIVABLE, StockEntryItem, LinkedProcessCardProps, ProcessView, assertContractAllowsReceive(), assertReceiveLinesWithinContract(), contractedQuantityByAtaItem() (+5 more)

### Community 29 - "public.purchase_requests"
Cohesion: 0.10
Nodes (21): contract_receipt_line_integrity, contract_receipt_lines_contract_idx, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, private.check_contract_ata_process(), private.check_contract_receipt_line() (+13 more)

### Community 30 - "detailed.ts"
Cohesion: 0.23
Nodes (14): auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, first(), kinds, parseDetailedFilter() (+6 more)

### Community 31 - "result.ts"
Cohesion: 0.07
Nodes (99): AuditPage(), AuditPageProps, Content(), metadata, one(), AdministrationPage(), Content(), LINKS (+91 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.11
Nodes (37): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+29 more)

### Community 34 - "councils-page.tsx"
Cohesion: 0.32
Nodes (8): CouncilsContent(), CouncilsPage(), metadata, formatWhatsapp(), onlyDigits(), parseWhatsapp(), whatsappHref(), WhatsappParse

### Community 35 - "reports/service.ts"
Cohesion: 0.25
Nodes (10): CouncilWorkspaceProps, StockSectionProps, AtaView, ContractView, StockLevelView, DashboardAttention, DashboardDeadline, DashboardSnapshot (+2 more)

### Community 36 - "alertas/page.tsx"
Cohesion: 0.25
Nodes (12): MarkReadForm(), Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract (+4 more)

### Community 37 - "reunioes/page.tsx"
Cohesion: 0.07
Nodes (54): weekdays, ApprovalQueue(), ApprovalQueueProps, PendingApprovalItem, DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview() (+46 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.06
Nodes (28): public.apply_stock_mutation(), public.save_meeting(), public.save_transfer(), trg_stock_movements_immutable, idx_ata_commitments_council_id, idx_ata_items_material_id, idx_attachments_council_id, idx_attachments_type_code (+20 more)

### Community 39 - "MaterialOrder"
Cohesion: 0.06
Nodes (42): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build (+34 more)

### Community 40 - "runAction"
Cohesion: 0.06
Nodes (62): zod, Option, MembershipForms(), Option, ProvisionCouncilForm(), addAmendmentFormAction(), closeContractFormAction(), createContractFormAction() (+54 more)

### Community 41 - "identity/service.test.ts"
Cohesion: 0.14
Nodes (6): InMemoryCouncilRepository, InMemoryMembershipRepository, StaffCategory, CouncilService, base, setup()

### Community 42 - "file-validation.ts"
Cohesion: 0.22
Nodes (10): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES (+2 more)

### Community 43 - "groq.ts"
Cohesion: 0.06
Nodes (47): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação (+39 more)

### Community 44 - "toFortalezaDate"
Cohesion: 0.17
Nodes (17): pdf-lib@^1.17.1, pdf-lib, GET(), GET(), GET(), Home(), RedirectHome(), DetailedReport (+9 more)

### Community 45 - "InMemoryInventoryRepository"
Cohesion: 0.23
Nodes (8): StockBalance, InMemoryInventoryRepository, keyOf(), StockKey, StockMutation, StockRow, StockState, MovementRecord

### Community 47 - "policy.ts"
Cohesion: 0.11
Nodes (25): ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), AuditTrailTabProps, ENTITY_LABELS, extractJustificationOrDetails(), formatActionLabel(), formatEntityLabel() (+17 more)

### Community 48 - "public.profiles"
Cohesion: 0.12
Nodes (36): administrative_processes_responsible_membership, check_staff_membership, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, private.check_process_responsible_membership(), private.check_staff_membership(), private.has_council_access() (+28 more)

### Community 49 - "20261126020200_process_assignment_contract_closure.sql"
Cohesion: 0.38
Nodes (4): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, contract_receipt_lines_contract_idx, private.check_process_responsible_membership()

### Community 50 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 51 - "purchases/service.test.ts"
Cohesion: 0.53
Nodes (5): approver(), ataItem(), manager(), stockOf(), submitted()

### Community 53 - "data-table-logic.ts"
Cohesion: 0.06
Nodes (49): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessTableRow (+41 more)

### Community 54 - "home-overview.test.tsx"
Cohesion: 0.40
Nodes (4): baseAtas, baseContracts, baseDeliveries, baseStock

### Community 55 - "request-template.ts"
Cohesion: 0.09
Nodes (34): mammoth, xlsx, POST(), GET(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText() (+26 more)

### Community 56 - "handler.ts"
Cohesion: 0.11
Nodes (16): GET, GET, draftSchema, GET(), maxDuration, GET, work(), isCronAuthorized() (+8 more)

### Community 58 - "createSessionClient"
Cohesion: 0.09
Nodes (21): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências, Fluxos atuais e ideais (+13 more)

### Community 59 - "Attachment"
Cohesion: 0.11
Nodes (27): Attachment, attachmentIdSchema, prepareUploadSchema, uploadDocumentSchema, CompletionEvent, CompletionState, CompletionTransition, DocumentalSnapshot (+19 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "ok"
Cohesion: 0.07
Nodes (10): Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), FormalizationService, Material, InventoryService, context(), authorize(), can(), readableCouncilIds() (+2 more)

### Community 63 - "process-history.ts"
Cohesion: 0.31
Nodes (8): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ALL_DOCUMENT_TYPES

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "transfer.ts"
Cohesion: 0.17
Nodes (14): changeTransferStatus(), HOLDS_RESERVATION, receiveEffect(), stockEffectFor(), TRANSFER_TRANSITIONS, TransferStatus, TransferStockEffect, TransferRepository (+6 more)

### Community 66 - "public.receive_purchase_request_for_contract"
Cohesion: 0.18
Nodes (4): public.contract_receipt_lines, public.receive_purchase_request_for_contract(), contract_receipt_line_integrity, private.check_contract_receipt_line()

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "atas.ts"
Cohesion: 0.17
Nodes (9): CommitmentEvent, AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toAta(), toCommitment(), toPayload() (+1 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "meetings.ts"
Cohesion: 0.24
Nodes (5): MeetingStatus, MeetingRow, SupabaseMeetingRepository, toMeeting(), toPayload()

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "formatCurrency"
Cohesion: 0.10
Nodes (29): AtaBalancePanel(), buildAtaBalanceRows(), AtaPage(), Content(), metadata, CloseContractForm(), Content(), ContractPage() (+21 more)

### Community 75 - "next"
Cohesion: 0.07
Nodes (17): nextConfig, next, CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, AppointmentRow (+9 more)

### Community 76 - "fail"
Cohesion: 0.11
Nodes (7): PriceRegistrationAta, MeetingService, AdministrativeProcess, RetentionService, guard(), fail(), parseInput()

### Community 77 - "ActionForm"
Cohesion: 0.10
Nodes (42): RetentionForms(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), AmendmentForm(), NewMaterialForm(), MinimumForm(), Option (+34 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.33
Nodes (13): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+5 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 83 - "analysis.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem"
Cohesion: 0.12
Nodes (15): 1. Visão Geral e Contexto, 2. Requisitos e Casos de Uso, 3.1. Banco de Dados (PostgreSQL / Supabase), 3.2. Sequenciamento de Processos (`nextProcessNumber`), 3. Arquitetura e Modelo de Dados, 4.1. Formulário em `/solicitacoes/nova`, 4.2. Card em `/solicitacoes/[id]`, 4. Design de Interface (UI/UX) (+7 more)

### Community 87 - "public.record_meeting_evidence"
Cohesion: 0.21
Nodes (10): idx_profiles_staff_category, keep_meeting_task_completion, private.keep_meeting_task_completion(), public.meeting_attendance, public.meeting_task_completions, public.record_meeting_evidence(), keep_approved_meeting_minutes, meeting_ai_queue (+2 more)

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
Cohesion: 0.13
Nodes (30): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+22 more)

### Community 92 - "toFortalezaDate"
Cohesion: 0.33
Nodes (12): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), calendarHref(), computeInitialEndDate() (+4 more)

### Community 93 - "Button"
Cohesion: 0.07
Nodes (46): react-dom, matchPdfItems(), NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption (+38 more)

### Community 95 - "Arquitetura (estado atual da implementação)"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 96 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 97 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 99 - "repositories.ts"
Cohesion: 0.09
Nodes (12): CouncilRow, SupabaseCouncilRepository, toCouncil(), toRow(), SupabaseDocumentRepository, SupabaseStorage, toAttachment(), SupabaseSupplierRepository (+4 more)

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 112 - "atas/service.ts"
Cohesion: 0.14
Nodes (23): AtaBalance, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation, validateAllocations(), validateCommitment(), ATA_INITIAL_YEARS (+15 more)

### Community 113 - "formalization-queue.tsx"
Cohesion: 0.16
Nodes (15): handleApprove(), handleConfirmReject(), MaterialOrderForm(), handleSubmit(), resetForm(), approveMaterialOrderAction(), cancelMaterialOrderAction(), createMaterialOrderAction() (+7 more)

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

### Community 119 - "ok"
Cohesion: 0.16
Nodes (7): InMemorySupplierRepository, SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema, SupplierService

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "media-actions.ts"
Cohesion: 0.20
Nodes (13): MeetingFile(), getUrl(), MeetingMediaPanel(), openSavedAudio(), saveAudio(), confirmMeetingAudioAction(), managedMeeting(), meetingAudioUrlAction() (+5 more)

### Community 123 - "db.ts"
Cohesion: 0.11
Nodes (17): @supabase/supabase-js, BalanceRow, MaterialRow, SupabaseInventoryRepository, toMovement(), toNotification(), OrderItemRow, OrderRow (+9 more)

### Community 124 - "Input"
Cohesion: 0.08
Nodes (35): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary() (+27 more)

### Community 125 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

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

### Community 150 - "container.ts"
Cohesion: 0.06
Nodes (44): Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), AtaRepository, AuditRecorder, ContractRepository, addAmendmentSchema, closeContractSchema, ContractAtaItem, createContractSchema (+36 more)

### Community 151 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 152 - "002_validacao_sem_pgtap.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 154 - "003_fluxos_atomicos.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 155 - "diffInDays"
Cohesion: 0.19
Nodes (16): original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms, currentTerms(), elapsedPercent(), remainingDays() (+8 more)

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 162 - "private.validate_meeting_details"
Cohesion: 0.28
Nodes (4): calendar_appointments_scope_date_idx, public.calendar_appointments, private.validate_meeting_details(), validate_meeting_details

### Community 173 - "public.council_memberships"
Cohesion: 0.50
Nodes (5): check_staff_membership, council_memberships_one_director, private.check_staff_membership(), private.has_council_access(), private.has_request_access()

### Community 175 - "movement-form.tsx"
Cohesion: 0.10
Nodes (28): 3.1 Encerramento de Processo com Documentação Parcial, 3.2 Recebimento de Materiais com Saldo Pendente, 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%), StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line (+20 more)

### Community 178 - "react"
Cohesion: 0.31
Nodes (6): FixtureReady(), FixtureLayout(), react, AuthenticatedShell(), AppLayout(), isRequestOnly()

### Community 180 - "processes.ts"
Cohesion: 0.28
Nodes (6): AttachmentForProgress, snapshotToJson(), SupabaseProcessRepository, toProcess(), toProcessChanges(), toIsoOrNull()

### Community 182 - "cleanup-eligibility.ts"
Cohesion: 0.40
Nodes (5): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), addDaysToInstant()

### Community 184 - "decimal.ts"
Cohesion: 0.36
Nodes (6): calculateContractAtaValue(), PERCENT_SCALE, percentage(), QUANTITY_SCALE, roundPercent(), roundTo()

### Community 186 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 197 - "ref_server_only"
Cohesion: 0.16
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 999 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **46 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `Actor`, `solicitacoes/[id]/page.tsx`, `vitest`, `adapters/purchases.ts`, `inventory/service.ts`, `formalizations/actions.ts`, `identity/service.ts`, `purchases/service.ts`, `lucide-react`, `formalizations/service.test.ts`, `documentation-tab.tsx`, `container.ts`, `meetings/service.ts`, `diffInDays`, `entry-sources.ts`, `detailed.ts`, `result.ts`, `reports/service.ts`, `reunioes/page.tsx`, `MaterialOrder`, `runAction`, `identity/service.test.ts`, `file-validation.ts`, `groq.ts`, `InMemoryInventoryRepository`, `policy.ts`, `processes.ts`, `transfer.ts`, `atas.ts`, `ref_server_only`, `formatCurrency`, `next`, `fail`, `time.ts`, `repositories.ts`, `atas/service.ts`, `ok`, `media-actions.ts`, `db.ts`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `formalization.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `solicitacoes/[id]/page.tsx`, `callback-app/app/page.tsx`, `formalizations/actions.ts`, `lucide-react`, `documentation-tab.tsx`, `package.json`, `process-view.tsx`, `utils.ts`, `result.ts`, `councils-page.tsx`, `alertas/page.tsx`, `reunioes/page.tsx`, `runAction`, `groq.ts`, `toFortalezaDate`, `movement-form.tsx`, `policy.ts`, `react`, `data-table-logic.ts`, `handler.ts`, `createSessionClient`, `toast-store.ts`, `ref_server_only`, `callback-server.mjs`, `formatCurrency`, `ActionForm`, `time.ts`, `Button`, `formalization-queue.tsx`, `media-actions.ts`, `Input`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `callback-app/app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05438184663536776 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `InventoryService`, `formalization.ts`, `callback-app/app/page.tsx`, `inventory/service.ts`, `formalizations/actions.ts`, `notifications/service.ts`, `purchases/service.ts`, `lucide-react`, `formalizations/service.test.ts`, `documentation-tab.tsx`, `package.json`, `request-facets.ts`, `plan-calendar.ts`, `process-view.tsx`, `diffInDays`, `entry-sources.ts`, `utils.ts`, `detailed.ts`, `result.ts`, `councils-page.tsx`, `alertas/page.tsx`, `reunioes/page.tsx`, `MaterialOrder`, `runAction`, `identity/service.test.ts`, `file-validation.ts`, `groq.ts`, `toFortalezaDate`, `movement-form.tsx`, `policy.ts`, `purchases/service.test.ts`, `data-table-logic.ts`, `home-overview.test.tsx`, `request-template.ts`, `decimal.ts`, `handler.ts`, `createSessionClient`, `Attachment`, `ok`, `process-history.ts`, `transfer.ts`, `callback-server.mjs`, `formatCurrency`, `ActionForm`, `analysis.ts`, `time.ts`, `toFortalezaDate`, `Button`, `cnpj.ts`, `atas/service.ts`, `formalization-queue.tsx`, `media-actions.ts`, `Input`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.09176587301587301 - nodes in this community are weakly interconnected._