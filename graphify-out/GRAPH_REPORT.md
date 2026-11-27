# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 643 files · ~379,058 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3757 nodes · 13190 edges · 168 communities (135 shown, 33 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 464 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `33a7c86d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- runAction
- purchases/actions.ts
- time.ts
- InMemoryNotificationRepository
- process-attachment-sheet.tsx
- data-table.tsx
- loadScreen
- purchases/service.test.ts
- Input
- identity/service.ts
- formalizations/service.test.ts
- public.receive_purchase_request
- apply_all.sql
- documents/schemas.ts
- Tarefas
- purchases/service.ts
- fail
- InMemoryAuditRepository
- purchases/service.test.ts
- documentation-tab.tsx
- package.json
- lucide-react
- request-facets.ts
- navigation.ts
- app-shell.tsx
- unwrap
- anon
- container.ts
- Button
- public.purchase_requests
- detailed.ts
- .insert
- 20261102000002_domain_tables.sql
- pdf.ts
- pdf.ts
- feedback-states.tsx
- plan-calendar.ts
- simple-table.tsx
- 20261102000006_fk_indexes.sql
- simple-table.tsx
- flow-guide.tsx
- solicitacoes/[id]/page.tsx
- result.ts
- repositories.ts
- AuditEntry
- groq.ts
- auth-stage.tsx
- dependencies
- processes/schemas.ts
- audit-trail-tab.tsx
- audit/service.ts
- MaterialOrder
- public.spec.ts
- notifications/service.ts
- atas/extract-pdf/route.ts
- cnpj.ts
- log
- RetentionRepository
- createSessionClient
- db.ts
- can
- components.json
- new-contract-form.tsx
- ProcessFormalization
- RetentionRepository
- SupabasePurchaseRequestRepository
- extract-request/route.ts
- compilerOptions
- toast-store.ts
- db.ts
- compilerOptions
- callback-server.mjs
- home-overview.tsx
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- next
- policy.ts
- process-view.tsx
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- atas/service.ts
- PageHeader
- PDFReport
- toIso
- private.business_error
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- agenda-board.tsx
- @playwright/test
- [...path]/page.tsx
- membership-forms.tsx
- meetings.ts
- completion.ts
- process-history.ts
- inventory/service.ts
- pdf/route.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- overview-lists.tsx
- processes/service.ts
- reunioes/page.tsx
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- react
- processes.test.ts
- contratos/[id]/page.tsx
- Execução local, deploy e backups
- ref_node_fs
- InMemoryMaterialOrderRepository
- SupabaseFormalizationRepository
- validate-corrections.mjs
- Validação realmente executada
- atas-de-reuniao-operacao.md
- FailingRepository
- Checklist de execução
- Execução dos blocos 1 e 2
- next
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
- ok
- repositories.ts
- Auditoria de desempenho do Warley
- 20261110000003_material_orders.sql
- movement-form.tsx
- processes/service.ts

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
- `6. Valores, estados e mensagens: salvaguardas` --references--> `buildCouncilActions()`  [INFERRED]
  docs/proposta-redesign-funcional-inicio.md → src/app/(app)/meu-conselho/action-hub.tsx
- `Reutilização em painéis por perfil` --references--> `buildCouncilActions()`  [INFERRED]
  docs/ux-improvement-plan/03-arquitetura-proposta.md → src/app/(app)/meu-conselho/action-hub.tsx
- `Task 4: Ajustar Alinhamento do Formulário em `FormalizationCard` e Criar Aba 2 (`ContractingTab`)` --references--> `FormalizationCard()`  [INFERRED]
  docs/superpowers/plans/2026-11-11-process-page-redesign.md → src/app/(app)/processos/[id]/formalization-card.tsx
- `Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters)` --references--> `AuditFilter`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda2-pedidos-justificativas-auditoria.md → src/modules/audit/schemas.ts

## Import Cycles
- None detected.

## Communities (168 total, 33 thin omitted)

### Community 0 - "runAction"
Cohesion: 0.06
Nodes (62): Task 4: Formulário de Nova Solicitação e Server Action, zod, Option, ataStepFormAction(), createAtaFormAction(), linkAtaProcessFormAction(), optionalId(), processReturnPath() (+54 more)

### Community 1 - "purchases/actions.ts"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 2 - "time.ts"
Cohesion: 0.10
Nodes (33): Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, ApprovalQueue(), DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor(), OrderQueue(), OrderQueueProps (+25 more)

### Community 3 - "InMemoryNotificationRepository"
Cohesion: 0.08
Nodes (30): @base-ui/react, cn, react-dom, MonthDialogProps, weekdays, FormalizationQueue(), FormalizationQueueProps, INSTRUMENT_LABELS (+22 more)

### Community 4 - "process-attachment-sheet.tsx"
Cohesion: 0.10
Nodes (25): ComponentShowcase(), fixtureOrder, props, rows, NavigationFixture(), MeetingDialog(), MeetingDialogProps, NotFound() (+17 more)

### Community 5 - "data-table.tsx"
Cohesion: 0.15
Nodes (24): DataTable(), DataTableProps, Cell, collator, compareValues(), filterAndSortTableRows(), FilterDefinition, nextSort() (+16 more)

### Community 6 - "loadScreen"
Cohesion: 0.16
Nodes (40): Content(), Content(), AtasPage(), Content(), metadata, CouncilContent(), Content(), ContractsPage() (+32 more)

### Community 7 - "purchases/service.test.ts"
Cohesion: 0.09
Nodes (19): InMemoryAtaRepository, InMemoryContractRepository, InMemoryDocumentRepository, setup(), InMemoryInventoryRepository, setup(), isValidAttachment(), InMemoryProcessRepository (+11 more)

### Community 8 - "Input"
Cohesion: 0.16
Nodes (19): AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), ProductField(), ProductFieldProps, exactProduct(), filterProducts() (+11 more)

### Community 9 - "identity/service.ts"
Cohesion: 0.22
Nodes (15): ACTION_LABELS, auditDetails(), auditReportPdf(), createBase(), dateTime(), DETAIL_LABELS, drawSection(), ENTITY_LABELS (+7 more)

### Community 10 - "formalizations/service.test.ts"
Cohesion: 0.17
Nodes (7): FormalizationStatus, FormalizationFilter, InMemoryFormalizationRepository, createProcessWithProgress(), Ctx, PDF, DOCUMENT_TYPE_CODES

### Community 11 - "public.receive_purchase_request"
Cohesion: 0.06
Nodes (38): public.save_contract(), public.save_purchase_request(), trg_audit_logs_immutable, trg_contract_amendments_immutable, trg_contract_amendments_no_truncate, idx_contracts_supplier_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id (+30 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.05
Nodes (110): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, calendar_appointments_scope_date_idx, check_staff_membership, council_memberships_one_director, idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_extensions_requested_by (+102 more)

### Community 13 - "documents/schemas.ts"
Cohesion: 0.17
Nodes (13): attachmentIdSchema, prepareUploadSchema, uploadDocumentSchema, ADDITIONAL_DOCUMENT_TYPE_CODES, ADDITIONAL_DOCUMENT_TYPES, AdditionalDocumentTypeCode, ALL_DOCUMENT_TYPE_CODES, AllDocumentTypeCode (+5 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.08
Nodes (33): Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, applyReceipt(), ReceiptItemResult, ReceiptItemState (+25 more)

### Community 16 - "fail"
Cohesion: 0.11
Nodes (8): PriceRegistrationAta, Attachment, DocumentService, AdministrativeProcess, RetentionService, guard(), fail(), parseInput()

### Community 17 - "InMemoryAuditRepository"
Cohesion: 0.07
Nodes (20): activeAta(), manager(), setup(), InMemoryAuditRepository, AuditService, setup(), declared(), newProcess() (+12 more)

### Community 18 - "purchases/service.test.ts"
Cohesion: 0.10
Nodes (33): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, input (+25 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.11
Nodes (41): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+33 more)

### Community 20 - "package.json"
Cohesion: 0.11
Nodes (23): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, @playwright/test@^1.65.1, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5 (+15 more)

### Community 21 - "lucide-react"
Cohesion: 0.11
Nodes (24): 5. Componentes existentes a reutilizar e mudanças propostas, lucide-react, CouncilWorkspace(), CouncilWorkspaceProps, ActionHub(), ActionItem, buildCouncilActions(), AvailableStockItem (+16 more)

### Community 22 - "request-facets.ts"
Cohesion: 0.12
Nodes (28): deadlinePriority(), Content(), metadata, ProcessesPage(), ProcessAttachmentSheet(), metadata, citedInstruments(), expiryFromText() (+20 more)

### Community 23 - "navigation.ts"
Cohesion: 0.15
Nodes (20): AuthenticatedShell(), AppLayout(), AccessContext, ALL_ROLES, filterNavigation(), NAV_GROUPS, NAV_ITEMS, NavGroup (+12 more)

### Community 24 - "app-shell.tsx"
Cohesion: 0.08
Nodes (31): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialog(), AppointmentRow, CalendarioPage() (+23 more)

### Community 25 - "unwrap"
Cohesion: 0.09
Nodes (9): StaffCategory, CouncilRow, SupabaseCouncilRepository, SupabaseMembershipRepository, toCouncil(), toRow(), SupabaseMaterialOrderRepository, SupabaseRetentionRepository (+1 more)

### Community 26 - "anon"
Cohesion: 0.12
Nodes (25): public.apply_stock_mutation(), public.correct_purchase_request(), public.register_process_ata(), public.register_process_ata_for_winner(), public.set_document_exception(), public.set_process_contracting_mode(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+17 more)

### Community 27 - "container.ts"
Cohesion: 0.09
Nodes (17): Contratos de serviço, ContractService, CouncilService, RepositoryAlertSource, NotificationService, ReportService, SupplierRepository, createSupplierSchema (+9 more)

### Community 28 - "Button"
Cohesion: 0.06
Nodes (50): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, AtaBalanceRow, NewContractForm(), handleQuickHomologate(), auctionLabel(), FormalizationCard(), FormalizationCardProps, FormalizationSupplier (+42 more)

### Community 29 - "public.purchase_requests"
Cohesion: 0.07
Nodes (44): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_ata_commitments_council_id (+36 more)

### Community 30 - "detailed.ts"
Cohesion: 0.12
Nodes (15): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação (+7 more)

### Community 31 - ".insert"
Cohesion: 0.10
Nodes (4): InMemoryMeetingRepository, setup(), InMemoryTransferRepository, setup()

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.12
Nodes (32): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+24 more)

### Community 33 - "pdf.ts"
Cohesion: 0.16
Nodes (13): pdf-lib, files, migrationsDir, outFile, root, DetailedReport, clean(), detailedReportPdf() (+5 more)

### Community 34 - "pdf.ts"
Cohesion: 0.15
Nodes (21): GET(), auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, first(), kinds (+13 more)

### Community 35 - "feedback-states.tsx"
Cohesion: 0.09
Nodes (20): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+12 more)

### Community 36 - "plan-calendar.ts"
Cohesion: 0.18
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

### Community 37 - "simple-table.tsx"
Cohesion: 0.15
Nodes (20): GET(), ExtractedPurchaseRequest, buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias() (+12 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (34): public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+26 more)

### Community 39 - "simple-table.tsx"
Cohesion: 0.10
Nodes (38): ApprovalQueueProps, PendingApprovalItem, ApprovalsTab(), ApprovalsTabProps, ProcessAttachmentSheetProps, ProcessesTable(), ProcessesTableProps, ProcessTableRow (+30 more)

### Community 40 - "flow-guide.tsx"
Cohesion: 0.07
Nodes (37): changeMeetingStatus(), MEETING_TRANSITIONS, MeetingStatus, MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting (+29 more)

### Community 41 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.10
Nodes (29): buildStockEntrySources(), RECEIVABLE, StockEntryItem, LinkedProcessCardProps, Content(), metadata, RequestPage(), Fact() (+21 more)

### Community 42 - "result.ts"
Cohesion: 0.10
Nodes (30): AuditPage(), AuditPageProps, Content(), metadata, one(), AtaBalancePanel(), buildAtaBalanceRows(), AtaPage() (+22 more)

### Community 43 - "repositories.ts"
Cohesion: 0.23
Nodes (12): GET(), GET(), Home(), RedirectHome(), config, proxy(), getServices(), getSession() (+4 more)

### Community 44 - "AuditEntry"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

### Community 45 - "groq.ts"
Cohesion: 0.18
Nodes (17): BRIEFING_SYSTEM_PROMPT, briefingSchema, briefingUsesOnlyKnownNumbers(), buildBriefingFacts(), coerceBriefing(), extractJsonObjects(), OperationalBriefing, parseBriefingText() (+9 more)

### Community 46 - "auth-stage.tsx"
Cohesion: 0.18
Nodes (10): AuthLayout(), LoginPage(), metadata, metadata, RecoveryPage(), metadata, PasswordPage(), AuthHeading() (+2 more)

### Community 47 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, next@16.4.6 (+15 more)

### Community 48 - "processes/schemas.ts"
Cohesion: 0.13
Nodes (26): CurrencyFixture(), buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, saveProcessEstimatedValue(), lineSchema, saveProcessPriceResearch() (+18 more)

### Community 49 - "audit-trail-tab.tsx"
Cohesion: 0.26
Nodes (9): ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), AuditTrailTabProps, ENTITY_LABELS, extractJustificationOrDetails(), formatActionLabel(), formatEntityLabel() (+1 more)

### Community 50 - "audit/service.ts"
Cohesion: 0.23
Nodes (10): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange() (+2 more)

### Community 51 - "MaterialOrder"
Cohesion: 0.39
Nodes (6): BriefingCard(), BriefingFallback(), BriefingFacts, BriefingInsight, generateBriefing(), OperationalSummary

### Community 52 - "public.spec.ts"
Cohesion: 0.05
Nodes (18): evidence, routes, sanitizeText(), sanitizeUrl(), destinations, envFiles, envNames, isolatedEnv (+10 more)

### Community 53 - "notifications/service.ts"
Cohesion: 0.07
Nodes (29): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract, ALERT_MILESTONES (+21 more)

### Community 54 - "atas/extract-pdf/route.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 55 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 56 - "log"
Cohesion: 0.11
Nodes (14): GET, GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createResendSender(), createSupabaseJobRunRepository() (+6 more)

### Community 57 - "RetentionRepository"
Cohesion: 0.14
Nodes (20): draftSchema, GET(), maxDuration, MeetingFile(), getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio() (+12 more)

### Community 58 - "createSessionClient"
Cohesion: 0.10
Nodes (21): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências, Fluxos atuais e ideais (+13 more)

### Community 59 - "db.ts"
Cohesion: 0.13
Nodes (20): @supabase/supabase-js, toAta(), ContractRow, SupabaseContractRepository, toContract(), FormalizationRow, toMovement(), toOrder() (+12 more)

### Community 60 - "can"
Cohesion: 0.10
Nodes (19): 6. Estratégia de Testes, CouncilRepository, MembershipRepository, MembershipRecord, ProfileSummary, assignMembershipSchema, councilFields, createCouncilSchema (+11 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "new-contract-form.tsx"
Cohesion: 0.12
Nodes (22): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), matchPdfItems(), NewAtaForm() (+14 more)

### Community 63 - "ProcessFormalization"
Cohesion: 0.21
Nodes (6): Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), ProcessFormalization, FormalizationRepository, FormalizationService, SavingsSummary, readableCouncilIds()

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "SupabasePurchaseRequestRepository"
Cohesion: 0.22
Nodes (3): AtomicDecision, SupabasePurchaseRequestRepository, toPayload()

### Community 66 - "extract-request/route.ts"
Cohesion: 0.16
Nodes (15): mammoth@^1.13.0, mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText() (+7 more)

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "db.ts"
Cohesion: 0.16
Nodes (9): CommitmentEvent, AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toCommitment(), toPayload(), DbResponse (+1 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "home-overview.tsx"
Cohesion: 0.16
Nodes (15): BigStat(), ChartCard(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, baseAtas, baseContracts (+7 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "next"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 75 - "policy.ts"
Cohesion: 0.19
Nodes (17): kinds, ReportCentral(), AuditContent(), metadata, one(), OperationalContent(), ReportsPage(), ReportsPageProps (+9 more)

### Community 76 - "process-view.tsx"
Cohesion: 0.12
Nodes (23): ArchiveProcessAction(), ProcessActionsProps, PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown(), selectTab() (+15 more)

### Community 77 - "ActionForm"
Cohesion: 0.10
Nodes (42): RetentionForms(), MembershipForms(), StaffCategoryForm(), MarkReadForm(), EditCouncilForm(), NewCouncilForm(), metadata, NewCouncilPage() (+34 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "atas/service.ts"
Cohesion: 0.06
Nodes (50): contractedMaterialsByProcess(), HoldItemInput, HoldRow, AtaBalance, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation (+42 more)

### Community 81 - "PageHeader"
Cohesion: 0.15
Nodes (16): AdministrationPage(), Content(), LINKS, metadata, CouncilsContent(), CouncilsPage(), metadata, CouncilPage() (+8 more)

### Community 83 - "toIso"
Cohesion: 0.15
Nodes (5): SupabaseNotificationRepository, toNotification(), isUniqueViolation(), toIso(), SupabaseJobRunRepository

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
Cohesion: 0.12
Nodes (15): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+7 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "agenda-board.tsx"
Cohesion: 0.14
Nodes (26): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+18 more)

### Community 92 - "@playwright/test"
Cohesion: 0.15
Nodes (15): MaterialOrderFilter, ApproveMaterialOrderInput, approveMaterialOrderSchema, CancelMaterialOrderInput, cancelMaterialOrderSchema, CreateMaterialOrderInput, createMaterialOrderItemSchema, createMaterialOrderSchema (+7 more)

### Community 93 - "[...path]/page.tsx"
Cohesion: 0.16
Nodes (15): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, contextualHref() (+7 more)

### Community 94 - "membership-forms.tsx"
Cohesion: 0.20
Nodes (11): Option, ProvisionCouncilForm(), provisionCouncilAccess(), schema, { createUser }, STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, ActionContext (+3 more)

### Community 95 - "meetings.ts"
Cohesion: 0.22
Nodes (6): toPayload(), SupabaseMeetingRepository, toMeeting(), toPayload(), callRpc(), toDateOrNull()

### Community 96 - "completion.ts"
Cohesion: 0.24
Nodes (10): refreshCompletion(), CompletionEvent, CompletionState, CompletionTransition, DocumentalSnapshot, reevaluateCompletion(), DocumentTypeCode, DocumentalProgress (+2 more)

### Community 97 - "process-history.ts"
Cohesion: 0.31
Nodes (8): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ALL_DOCUMENT_TYPES

### Community 98 - "inventory/service.ts"
Cohesion: 0.05
Nodes (68): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações (+60 more)

### Community 99 - "pdf/route.ts"
Cohesion: 0.44
Nodes (7): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), SavingsReportData

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "overview-lists.tsx"
Cohesion: 0.42
Nodes (8): DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview(), RequestsOverview(), Row(), RowLink, statusOf()

### Community 112 - "processes/service.ts"
Cohesion: 0.22
Nodes (8): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build)

### Community 113 - "reunioes/page.tsx"
Cohesion: 0.24
Nodes (9): AttachmentRow, calendarHref(), detailHref(), MeetingCard(), MeetingsPage(), meetingStatus(), metadata, Option (+1 more)

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
Cohesion: 0.27
Nodes (12): handleApprove(), handleConfirmReject(), approveMaterialOrderAction(), cancelMaterialOrderAction(), createMaterialOrderAction(), extractCreatePayload(), extractOrderId(), extractRejectPayload() (+4 more)

### Community 119 - "processes.test.ts"
Cohesion: 0.33
Nodes (7): Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), buildSnapshot(), effectiveProgressPercent(), allSeven(), attach(), calculateProgress(), ProcessAttachment

### Community 120 - "contratos/[id]/page.tsx"
Cohesion: 0.36
Nodes (6): CloseContractForm(), Content(), ContractPage(), metadata, contractReceiptBalance(), ContractReceiptLine

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "ref_node_fs"
Cohesion: 0.40
Nodes (5): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), addDaysToInstant()

### Community 124 - "SupabaseFormalizationRepository"
Cohesion: 0.31
Nodes (3): fromRow(), SupabaseFormalizationRepository, toRow()

### Community 125 - "validate-corrections.mjs"
Cohesion: 0.33
Nodes (4): request(), data, db, revision()

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 131 - "next"
Cohesion: 0.06
Nodes (36): FixtureReady(), FixtureLayout(), nextConfig, next, react, ACTION_LABEL, metadata, RetentionPage() (+28 more)

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 134 - "processes.ts"
Cohesion: 0.17
Nodes (8): AttachmentForProgress, snapshotToJson(), SupabaseDocumentRepository, SupabaseProcessRepository, toAttachment(), toProcess(), toProcessChanges(), toIsoOrNull()

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

### Community 150 - "ok"
Cohesion: 0.08
Nodes (20): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build (+12 more)

### Community 154 - "repositories.ts"
Cohesion: 0.10
Nodes (5): SupabaseInventoryRepository, SupabaseStorage, SupabaseSupplierRepository, SupabaseTransferRepository, createSupabaseRepositories()

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.17
Nodes (17): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+9 more)

### Community 180 - "processes/service.ts"
Cohesion: 0.06
Nodes (30): Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.2. Serviços e Ações, 3.3. Repositório e Camada de Domínio, AuditRecorder, sanitizeFileName(), SIGNATURES, startsWith(), pdf (+22 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 971 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `runAction`, `time.ts`, `next`, `loadScreen`, `purchases/service.test.ts`, `processes.ts`, `purchases/service.ts`, `fail`, `purchases/service.test.ts`, `documentation-tab.tsx`, `request-facets.ts`, `app-shell.tsx`, `unwrap`, `container.ts`, `Button`, `pdf.ts`, `flow-guide.tsx`, `solicitacoes/[id]/page.tsx`, `result.ts`, `groq.ts`, `processes/schemas.ts`, `audit/service.ts`, `processes/service.ts`, `notifications/service.ts`, `log`, `RetentionRepository`, `db.ts`, `can`, `ProcessFormalization`, `SupabasePurchaseRequestRepository`, `db.ts`, `policy.ts`, `atas/service.ts`, `PageHeader`, `toIso`, `agenda-board.tsx`, `membership-forms.tsx`, `inventory/service.ts`, `reunioes/page.tsx`, `contratos/[id]/page.tsx`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `runAction` be split into smaller, more focused modules?**
  _Cohesion score 0.06162464985994398 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `purchases/service.test.ts` to `time.ts`, `InMemoryNotificationRepository`, `process-attachment-sheet.tsx`, `data-table.tsx`, `next`, `purchases/service.test.ts`, `Input`, `identity/service.ts`, `formalizations/service.test.ts`, `purchases/service.ts`, `InMemoryAuditRepository`, `documentation-tab.tsx`, `package.json`, `lucide-react`, `request-facets.ts`, `ok`, `app-shell.tsx`, `navigation.ts`, `Button`, `pdf.ts`, `pdf.ts`, `simple-table.tsx`, `simple-table.tsx`, `flow-guide.tsx`, `solicitacoes/[id]/page.tsx`, `result.ts`, `AuditEntry`, `groq.ts`, `movement-form.tsx`, `processes/schemas.ts`, `audit-trail-tab.tsx`, `MaterialOrder`, `processes/service.ts`, `notifications/service.ts`, `atas/extract-pdf/route.ts`, `cnpj.ts`, `log`, `RetentionRepository`, `createSessionClient`, `db.ts`, `can`, `new-contract-form.tsx`, `extract-request/route.ts`, `callback-server.mjs`, `home-overview.tsx`, `process-view.tsx`, `atas/service.ts`, `PageHeader`, `agenda-board.tsx`, `[...path]/page.tsx`, `membership-forms.tsx`, `process-history.ts`, `inventory/service.ts`, `pdf/route.ts`, `overview-lists.tsx`, `react`, `processes.test.ts`, `contratos/[id]/page.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `time.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10336817653890824 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `runAction`, `time.ts`, `InMemoryNotificationRepository`, `process-attachment-sheet.tsx`, `data-table.tsx`, `loadScreen`, `Input`, `documentation-tab.tsx`, `package.json`, `lucide-react`, `request-facets.ts`, `navigation.ts`, `app-shell.tsx`, `Button`, `plan-calendar.ts`, `simple-table.tsx`, `solicitacoes/[id]/page.tsx`, `result.ts`, `repositories.ts`, `AuditEntry`, `groq.ts`, `auth-stage.tsx`, `dependencies`, `movement-form.tsx`, `audit-trail-tab.tsx`, `processes/schemas.ts`, `log`, `RetentionRepository`, `createSessionClient`, `toast-store.ts`, `callback-server.mjs`, `home-overview.tsx`, `policy.ts`, `process-view.tsx`, `ActionForm`, `PageHeader`, `agenda-board.tsx`, `[...path]/page.tsx`, `membership-forms.tsx`, `overview-lists.tsx`, `reunioes/page.tsx`, `react`, `contratos/[id]/page.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `InMemoryNotificationRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.07535460992907801 - nodes in this community are weakly interconnected._