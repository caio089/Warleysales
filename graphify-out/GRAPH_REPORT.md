# Graph Report - warleysales-atas-push  (2026-11-27)

## Corpus Check
- 618 files · ~290,620 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 3707 nodes · 13100 edges · 156 communities (122 shown, 34 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 463 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b636e84a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- runAction
- purchases/actions.ts
- lucide-react
- pdf.ts
- Button
- home-overview.tsx
- result.ts
- MeetingRepository
- inventory/service.ts
- toDate
- ProcessFormalization
- public.purchase_requests
- apply_all.sql
- notifications/service.ts
- Tarefas
- purchases/service.ts
- fail
- InMemoryAuditRepository
- vitest
- documentation-tab.tsx
- package.json
- purchases/service.test.ts
- calendario/page.tsx
- MaterialOrder
- getSession
- unwrap
- anon
- solicitacoes/[id]/page.tsx
- ok
- public.purchase_requests
- toFortalezaDate
- policy.ts
- public.profiles
- direct-upload.test.ts
- Screen
- public.ata_items
- simple-table.tsx
- request-template.ts
- 20261102000006_fk_indexes.sql
- orders/actions.ts
- solicitacoes/page.tsx
- InMemoryMembershipRepository
- toFortalezaDate
- module-insight.ts
- AuditEntry
- groq.ts
- transfers/schemas.ts
- extract-request/route.ts
- action-runner.ts
- contracts/actions.ts
- app-shell.tsx
- inventory.ts
- auth-stage.tsx
- process-view.tsx
- atas/actions.ts
- analysis.ts
- log
- media-actions.ts
- Fluxos atuais e ideais
- formalizations/actions.ts
- navigation.ts
- components.json
- identity/service.ts
- process-history.ts
- RetentionRepository
- transfer.ts
- Arquitetura (estado atual da implementação)
- compilerOptions
- toast-store.ts
- db.ts
- compilerOptions
- callback-server.mjs
- retention-forms.tsx
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- inventory/actions.ts
- callback-app/app/layout.tsx
- suppliers/service.ts
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- ProfileSummary
- whatsapp.ts
- PDFReport
- atas/extract-pdf/route.ts
- Global Constraints
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- time.ts
- badge.tsx
- formatCurrency
- SupabaseCouncilRepository
- @playwright/test
- cnpj.ts
- repositories.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- atas/service.ts
- feedback-states.tsx
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- next
- Execução local, deploy e backups
- Button
- Validação realmente executada
- atas-de-reuniao-operacao.md
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
- Auditoria de desempenho do Warley
- 20261110000003_material_orders.sql
- movement-form.tsx
- processes/service.ts
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
- `Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`)` --references--> `ActionHub()`  [INFERRED]
  docs/superpowers/plans/2026-11-11-redesign-visao-geral-e-meu-painel.md → src/app/(app)/meu-conselho/action-hub.tsx

## Import Cycles
- None detected.

## Communities (156 total, 34 thin omitted)

### Community 0 - "runAction"
Cohesion: 0.14
Nodes (22): manualDeleteFormAction(), assignMembershipFormAction(), createCouncilFormAction(), removeMembershipFormAction(), setStaffCategoryFormAction(), updateCouncilFormAction(), addActionItemFormAction(), fortalezaLocalToIso() (+14 more)

### Community 1 - "purchases/actions.ts"
Cohesion: 0.14
Nodes (14): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase, createRequestFormAction() (+6 more)

### Community 2 - "lucide-react"
Cohesion: 0.09
Nodes (41): 5. Componentes existentes a reutilizar e mudanças propostas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, lucide-react, ApprovalQueue(), PendingApprovalItem, CouncilWorkspace(), CouncilWorkspaceProps, DashboardFilters() (+33 more)

### Community 3 - "pdf.ts"
Cohesion: 0.22
Nodes (15): ACTION_LABELS, auditDetails(), auditReportPdf(), createBase(), dateTime(), DETAIL_LABELS, drawSection(), ENTITY_LABELS (+7 more)

### Community 4 - "Button"
Cohesion: 0.08
Nodes (33): ComponentShowcase(), fixtureOrder, props, rows, @base-ui/react, cn, react-dom, weekdays (+25 more)

### Community 5 - "home-overview.tsx"
Cohesion: 0.15
Nodes (16): BigStat(), ChartCard(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, baseAtas, baseContracts (+8 more)

### Community 6 - "result.ts"
Cohesion: 0.10
Nodes (38): ACTION_LABEL, Content(), metadata, RetentionPage(), AtasPage(), metadata, CouncilContent(), CouncilPage() (+30 more)

### Community 7 - "MeetingRepository"
Cohesion: 0.11
Nodes (4): MeetingRepository, InMemoryMeetingRepository, MeetingDetails, setup()

### Community 8 - "inventory/service.ts"
Cohesion: 0.07
Nodes (42): Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), StockSectionProps, none, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel, stockLevelLabel (+34 more)

### Community 9 - "toDate"
Cohesion: 0.11
Nodes (13): MeetingStatus, MeetingRow, SupabaseMeetingRepository, toMeeting(), toPayload(), toNotification(), snapshotToJson(), SupabaseProcessRepository (+5 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.10
Nodes (21): contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes (+13 more)

### Community 11 - "public.purchase_requests"
Cohesion: 0.06
Nodes (38): public.save_contract(), public.save_purchase_request(), trg_audit_logs_immutable, trg_contract_amendments_immutable, trg_contract_amendments_no_truncate, idx_contracts_supplier_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id (+30 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.05
Nodes (110): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, calendar_appointments_scope_date_idx, check_staff_membership, council_memberships_one_director, idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_extensions_requested_by (+102 more)

### Community 13 - "notifications/service.ts"
Cohesion: 0.06
Nodes (30): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract, ALERT_MILESTONES (+22 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (33): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+25 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.07
Nodes (31): Props, SavingsSummary, PurchaseRequest, PurchaseRequestEvent, RequestStatus, ReceiptItemResult, ReceiptItemState, ReceiptLine (+23 more)

### Community 16 - "fail"
Cohesion: 0.10
Nodes (12): 3.3. Repositório e Camada de Domínio, validateUpload(), Meeting, MeetingService, refreshCompletion(), AdministrativeProcess, guard(), Actor (+4 more)

### Community 17 - "InMemoryAuditRepository"
Cohesion: 0.14
Nodes (26): Contratos de serviço, AtaService, setup(), AuditRecorder, AuditService, ContractService, setup(), setup() (+18 more)

### Community 18 - "vitest"
Cohesion: 0.08
Nodes (40): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+32 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.08
Nodes (50): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+42 more)

### Community 20 - "package.json"
Cohesion: 0.06
Nodes (42): eslintConfig, dependencies, @base-ui/react@^1.9.0, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, next@16.4.6 (+34 more)

### Community 21 - "purchases/service.test.ts"
Cohesion: 0.08
Nodes (23): InMemoryAtaRepository, InMemoryContractRepository, InMemoryDocumentRepository, createProcessWithProgress(), Ctx, PDF, setup(), InMemoryCouncilRepository (+15 more)

### Community 22 - "calendario/page.tsx"
Cohesion: 0.08
Nodes (33): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialog(), MonthDialogProps, AppointmentRow (+25 more)

### Community 23 - "MaterialOrder"
Cohesion: 0.06
Nodes (44): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros (+36 more)

### Community 24 - "getSession"
Cohesion: 0.23
Nodes (13): GET(), branding(), download(), GET(), GET(), Home(), RedirectHome(), demoCouncilIds() (+5 more)

### Community 25 - "unwrap"
Cohesion: 0.08
Nodes (10): SupabaseMembershipRepository, SupabaseNotificationRepository, SupabaseMaterialOrderRepository, toOrder(), SupabaseDocumentRepository, toAttachment(), SupabaseRetentionRepository, toIso() (+2 more)

### Community 26 - "anon"
Cohesion: 0.12
Nodes (25): public.apply_stock_mutation(), public.correct_purchase_request(), public.register_process_ata(), public.register_process_ata_for_winner(), public.set_document_exception(), public.set_process_contracting_mode(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+17 more)

### Community 27 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.09
Nodes (32): buildStockEntrySources(), RECEIVABLE, StockEntryItem, buildHoldRows(), contractedMaterialsByProcess(), HoldItemInput, HoldRow, LinkedProcessCardProps (+24 more)

### Community 28 - "ok"
Cohesion: 0.08
Nodes (19): saveAppointment(), FormalizationService, meetingReviewAction(), saveProcessContractingMode(), parseProcessNumber(), saveProcessEstimatedValue(), documentExceptionAction(), saveProcessValidityStartDate() (+11 more)

### Community 29 - "public.purchase_requests"
Cohesion: 0.07
Nodes (44): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_ata_commitments_council_id (+36 more)

### Community 30 - "toFortalezaDate"
Cohesion: 0.17
Nodes (20): pdf-lib@^1.17.1, pdf-lib, GET(), auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind (+12 more)

### Community 31 - "policy.ts"
Cohesion: 0.19
Nodes (16): kinds, ReportCentral(), AuditContent(), metadata, one(), OperationalContent(), ReportsPage(), ReportsPageProps (+8 more)

### Community 32 - "public.profiles"
Cohesion: 0.12
Nodes (32): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+24 more)

### Community 33 - "direct-upload.test.ts"
Cohesion: 0.10
Nodes (13): declared(), newProcess(), PDF, sha(), sanitizeFileName(), SIGNATURES, startsWith(), pdf (+5 more)

### Community 34 - "Screen"
Cohesion: 0.13
Nodes (46): Content(), metadata, UsersPage(), Content(), CouncilsContent(), CouncilsPage(), metadata, Content() (+38 more)

### Community 35 - "public.ata_items"
Cohesion: 0.09
Nodes (20): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+12 more)

### Community 36 - "simple-table.tsx"
Cohesion: 0.07
Nodes (50): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessesTable() (+42 more)

### Community 37 - "request-template.ts"
Cohesion: 0.15
Nodes (20): GET(), ExtractedPurchaseRequest, buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias() (+12 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (34): public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+26 more)

### Community 39 - "orders/actions.ts"
Cohesion: 0.16
Nodes (15): handleApprove(), handleConfirmReject(), MaterialOrderForm(), handleSubmit(), resetForm(), approveMaterialOrderAction(), cancelMaterialOrderAction(), createMaterialOrderAction() (+7 more)

### Community 40 - "solicitacoes/page.tsx"
Cohesion: 0.16
Nodes (23): metadata, citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME, MONTH_ORDER (+15 more)

### Community 42 - "toFortalezaDate"
Cohesion: 0.14
Nodes (18): AuditPage(), AuditPageProps, Content(), metadata, one(), Content(), ContractPage(), metadata (+10 more)

### Community 43 - "module-insight.ts"
Cohesion: 0.50
Nodes (3): generateModuleInsight(), ModuleFact, ModuleInsightResult

### Community 44 - "AuditEntry"
Cohesion: 0.18
Nodes (11): AuditRepository, InMemoryAuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow (+3 more)

### Community 45 - "groq.ts"
Cohesion: 0.06
Nodes (47): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação (+39 more)

### Community 46 - "transfers/schemas.ts"
Cohesion: 0.22
Nodes (10): TransferStatus, InMemoryTransferRepository, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferEvent, TransferItem (+2 more)

### Community 47 - "extract-request/route.ts"
Cohesion: 0.16
Nodes (15): mammoth@^1.13.0, mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText() (+7 more)

### Community 48 - "action-runner.ts"
Cohesion: 0.33
Nodes (5): zod, input, ActionFormProps, ActionState, IDLE_STATE

### Community 49 - "contracts/actions.ts"
Cohesion: 0.28
Nodes (10): addAmendmentFormAction(), closeContractFormAction(), createContractFormAction(), linkContractProcessFormAction(), optionalNumber(), optionalText(), processReturnPath(), calculateContractAtaValue() (+2 more)

### Community 50 - "app-shell.tsx"
Cohesion: 0.21
Nodes (11): NavigationFixture(), AuthenticatedShell(), AppLayout(), AccessContext, isRequestOnly(), AppShell(), AppShellProps, getServerSidebarSnapshot() (+3 more)

### Community 51 - "inventory.ts"
Cohesion: 0.12
Nodes (20): MovementType, StockBalance, keyOf(), StockKey, StockMutation, StockRow, StockState, createMaterialSchema (+12 more)

### Community 52 - "auth-stage.tsx"
Cohesion: 0.14
Nodes (13): AuthLayout(), LoginPage(), metadata, metadata, RecoveryPage(), metadata, PasswordPage(), NotFound() (+5 more)

### Community 53 - "process-view.tsx"
Cohesion: 0.06
Nodes (59): DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview(), RequestsOverview(), Row(), RowLink, statusOf() (+51 more)

### Community 54 - "atas/actions.ts"
Cohesion: 0.42
Nodes (9): ataStepFormAction(), createAtaFormAction(), linkAtaProcessFormAction(), optionalId(), processReturnPath(), readProcessItems(), setAllocationsFormAction(), toMoney() (+1 more)

### Community 55 - "analysis.ts"
Cohesion: 0.26
Nodes (11): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+3 more)

### Community 56 - "log"
Cohesion: 0.06
Nodes (37): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, @supabase/supabase-js, GET (+29 more)

### Community 57 - "media-actions.ts"
Cohesion: 0.19
Nodes (14): draftSchema, GET(), maxDuration, AUDIO_TYPES, saveAudio(), MeetingOption, work(), confirmMeetingAudioAction() (+6 more)

### Community 58 - "Fluxos atuais e ideais"
Cohesion: 0.33
Nodes (5): Escopo e leitura das evidências, Fluxos atuais e ideais, Fluxos por módulo e rota, Limites, prioridade e aceitação global, Perfis e regras transversais

### Community 59 - "formalizations/actions.ts"
Cohesion: 0.16
Nodes (16): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão) (+8 more)

### Community 60 - "navigation.ts"
Cohesion: 0.16
Nodes (19): Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, ALL_ROLES, COUNCIL_ROLES, filterNavigation(), isStaffRole(), NAV_GROUPS, NAV_ITEMS, NavGroup (+11 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "identity/service.ts"
Cohesion: 0.13
Nodes (18): CouncilRepository, MembershipRepository, Council, MembershipRecord, STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, StaffCategory, assignMembershipSchema (+10 more)

### Community 63 - "process-history.ts"
Cohesion: 0.36
Nodes (7): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso()

### Community 64 - "RetentionRepository"
Cohesion: 0.13
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "transfer.ts"
Cohesion: 0.25
Nodes (11): changeMeetingStatus(), MEETING_TRANSITIONS, changeTransferStatus(), HOLDS_RESERVATION, receiveEffect(), stockEffectFor(), TRANSFER_TRANSITIONS, TransferStockEffect (+3 more)

### Community 66 - "Arquitetura (estado atual da implementação)"
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
Nodes (19): Frontend, API e banco, AtomicReceipt, ContractRow, SupabaseContractRepository, toContract(), toPayload(), LinkedRequestNotesRow, RequestRow (+11 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "retention-forms.tsx"
Cohesion: 0.57
Nodes (5): Option, authorizeDisposalFormAction(), done(), placeHoldFormAction(), releaseHoldFormAction()

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "inventory/actions.ts"
Cohesion: 0.57
Nodes (6): createMaterialFormAction(), done(), readMovementLines(), registerMovementFormAction(), setMinimumFormAction(), toNumber()

### Community 76 - "suppliers/service.ts"
Cohesion: 0.12
Nodes (16): ActionItem, actionItemSchema, changeMeetingStatusSchema, meetingDetailsSchema, MeetingMinutes, minutesSchema, scheduleMeetingSchema, SupplierRepository (+8 more)

### Community 77 - "ActionForm"
Cohesion: 0.07
Nodes (67): react, RetentionForms(), MembershipForms(), Option, ProvisionCouncilForm(), StaffCategoryForm(), MarkReadForm(), EditCouncilForm() (+59 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 81 - "whatsapp.ts"
Cohesion: 0.48
Nodes (5): formatWhatsapp(), onlyDigits(), parseWhatsapp(), whatsappHref(), WhatsappParse

### Community 83 - "atas/extract-pdf/route.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 84 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

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
Cohesion: 0.12
Nodes (15): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+7 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "time.ts"
Cohesion: 0.10
Nodes (40): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), AgendaBoard(), dateLabel() (+32 more)

### Community 92 - "badge.tsx"
Cohesion: 0.50
Nodes (4): class-variance-authority@^0.7.1, class-variance-authority, Badge(), badgeVariants

### Community 93 - "formatCurrency"
Cohesion: 0.10
Nodes (40): AtaBalancePanel(), AtaBalanceRow, buildAtaBalanceRows(), AtaPage(), Content(), metadata, ApprovalQueueProps, INSTRUMENT_LABELS (+32 more)

### Community 96 - "@playwright/test"
Cohesion: 0.06
Nodes (22): evidence, routes, sanitizeText(), sanitizeUrl(), destinations, @playwright/test@^1.65.1, envFiles, envNames (+14 more)

### Community 97 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 99 - "repositories.ts"
Cohesion: 0.10
Nodes (8): SupabaseAtaRepository, toAta(), toCommitment(), SupabaseStorage, SupabaseSupplierRepository, SupabaseTransferRepository, toTransfer(), createSupabaseRepositories()

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 112 - "atas/service.ts"
Cohesion: 0.08
Nodes (29): AtaBalance, CommitmentEvent, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation, validateAllocations(), validateCommitment() (+21 more)

### Community 113 - "feedback-states.tsx"
Cohesion: 0.18
Nodes (14): AlertsPage(), Content(), metadata, GlobalError(), ScreenResult, DataSourceUnavailableState(), EmptyState(), ErrorState() (+6 more)

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

### Community 120 - "next"
Cohesion: 0.09
Nodes (11): nextConfig, next, AdministrationPage(), Content(), LINKS, metadata, metadata, NewCouncilPage() (+3 more)

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 124 - "Button"
Cohesion: 0.11
Nodes (28): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), matchPdfItems(), NewAtaForm(), Option (+20 more)

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
Cohesion: 0.13
Nodes (20): AtaExtension, ExtensionRequest, original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms, currentTerms() (+12 more)

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.20
Nodes (9): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão, Medições e limites (+1 more)

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.15
Nodes (18): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+10 more)

### Community 180 - "processes/service.ts"
Cohesion: 0.06
Nodes (58): Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), AttachmentForProgress, DocumentRepository, StoragePort, Attachment, attachmentIdSchema, isVisibleAttachment(), PreparedUpload (+50 more)

### Community 197 - "identity/actions.ts"
Cohesion: 0.33
Nodes (10): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+2 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 951 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `purchases/actions.ts`, `lucide-react`, `result.ts`, `inventory/service.ts`, `notifications/service.ts`, `purchases/service.ts`, `fail`, `vitest`, `documentation-tab.tsx`, `purchases/service.test.ts`, `calendario/page.tsx`, `contracts/service.ts`, `MaterialOrder`, `solicitacoes/[id]/page.tsx`, `toFortalezaDate`, `policy.ts`, `direct-upload.test.ts`, `Screen`, `solicitacoes/page.tsx`, `toFortalezaDate`, `module-insight.ts`, `AuditEntry`, `groq.ts`, `transfers/schemas.ts`, `action-runner.ts`, `inventory.ts`, `processes/service.ts`, `log`, `media-actions.ts`, `formalizations/actions.ts`, `identity/service.ts`, `transfer.ts`, `db.ts`, `suppliers/service.ts`, `ActionForm`, `formatCurrency`, `atas/service.ts`, `next`, `Button`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `runAction` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `lucide-react`, `pdf.ts`, `Button`, `home-overview.tsx`, `result.ts`, `inventory/service.ts`, `ProcessFormalization`, `notifications/service.ts`, `purchases/service.ts`, `InMemoryAuditRepository`, `documentation-tab.tsx`, `package.json`, `purchases/service.test.ts`, `calendario/page.tsx`, `contracts/service.ts`, `MaterialOrder`, `getSession`, `solicitacoes/[id]/page.tsx`, `ok`, `toFortalezaDate`, `direct-upload.test.ts`, `simple-table.tsx`, `request-template.ts`, `orders/actions.ts`, `solicitacoes/page.tsx`, `toFortalezaDate`, `module-insight.ts`, `groq.ts`, `movement-form.tsx`, `extract-request/route.ts`, `contracts/actions.ts`, `processes/service.ts`, `process-view.tsx`, `analysis.ts`, `log`, `media-actions.ts`, `formalizations/actions.ts`, `navigation.ts`, `process-history.ts`, `transfer.ts`, `callback-server.mjs`, `whatsapp.ts`, `atas/extract-pdf/route.ts`, `time.ts`, `formatCurrency`, `@playwright/test`, `cnpj.ts`, `atas/service.ts`, `feedback-states.tsx`, `Button`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `purchases/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1437908496732026 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `runAction`, `purchases/actions.ts`, `lucide-react`, `Button`, `home-overview.tsx`, `result.ts`, `documentation-tab.tsx`, `package.json`, `calendario/page.tsx`, `getSession`, `solicitacoes/[id]/page.tsx`, `policy.ts`, `Screen`, `simple-table.tsx`, `orders/actions.ts`, `solicitacoes/page.tsx`, `toFortalezaDate`, `groq.ts`, `movement-form.tsx`, `action-runner.ts`, `contracts/actions.ts`, `app-shell.tsx`, `auth-stage.tsx`, `process-view.tsx`, `atas/actions.ts`, `analysis.ts`, `log`, `media-actions.ts`, `formalizations/actions.ts`, `navigation.ts`, `toast-store.ts`, `identity/actions.ts`, `callback-server.mjs`, `retention-forms.tsx`, `inventory/actions.ts`, `callback-app/app/layout.tsx`, `ActionForm`, `time.ts`, `formatCurrency`, `feedback-states.tsx`, `Button`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.08521870286576169 - nodes in this community are weakly interconnected._