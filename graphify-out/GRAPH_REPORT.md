# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 640 files · ~377,318 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3742 nodes · 13147 edges · 175 communities (136 shown, 39 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 464 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bb22aec4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- can
- purchases/actions.ts
- dashboard/page.tsx
- InMemoryNotificationRepository
- process-attachment-sheet.tsx
- processes-table.tsx
- result.ts
- purchases/service.test.ts
- inventory/service.ts
- identity/service.ts
- ProcessFormalization
- public.receive_purchase_request
- apply_all.sql
- @playwright/test
- Tarefas
- purchases/service.ts
- fail
- InMemoryAuditRepository
- purchases/service.test.ts
- documentation-tab.tsx
- package.json
- MembershipRepository
- request-facets.ts
- ok
- app-shell.tsx
- unwrap
- anon
- formalization-card.tsx
- reunioes/page.tsx
- public.purchase_requests
- detailed.ts
- Button
- 20261102000002_domain_tables.sql
- pdf.ts
- pdf.ts
- feedback-states.tsx
- plan-calendar.ts
- simple-table.tsx
- 20261102000006_fk_indexes.sql
- simple-table.tsx
- flow-guide.tsx
- Result
- policy.ts
- repositories.ts
- AuditEntry
- groq.ts
- MembershipRecord
- solicitacoes/[id]/page.tsx
- formalizations/actions.ts
- atas/service.ts
- inventory/repository.ts
- MaterialOrder
- public.spec.ts
- notifications/service.ts
- atas/extract-pdf/route.ts
- suppliers/service.ts
- log
- RetentionRepository
- createSessionClient
- Contract
- identity/actions.ts
- components.json
- toFortalezaDate
- new-ata-form.tsx
- RetentionRepository
- meetings/service.ts
- public.receive_purchase_request_for_contract
- compilerOptions
- toast-store.ts
- db.ts
- compilerOptions
- callback-server.mjs
- Proposta funcional — página inicial Warley Gestão Operacional
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- next
- material-order-dialog.tsx
- process-view.tsx
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- contracts/service.ts
- PageHeader
- PDFReport
- notifications/service.ts
- private.business_error
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- time.ts
- @playwright/test
- calendario/page.tsx
- reports/service.ts
- validity.ts
- check-supabase.mjs
- process-history.ts
- order.ts
- formalization.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- stage2-auth-validate.mjs
- processes/service.ts
- analysis.ts
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- react
- transfers/service.ts
- orders/schemas.ts
- Execução local, deploy e backups
- ref_node_fs
- ProcessStatus
- documentation-tab.tsx
- feedback-states.tsx
- Validação realmente executada
- atas-de-reuniao-operacao.md
- reunioes/page.tsx
- Checklist de execução
- Execução dos blocos 1 e 2
- processes.test.ts
- Pendências e limitações conhecidas
- SupabaseDocumentRepository
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
- atas/service.ts
- Global Constraints
- SupabaseProcessRepository
- file-upload.tsx
- SupabaseStorage
- validate-corrections.mjs
- bundle-migrations.mjs
- playwright.config.ts
- Auditoria de desempenho do Warley
- 20261110000003_material_orders.sql
- movement-form.tsx
- service-support.ts

## God Nodes (most connected - your core abstractions)
1. `ok()` - 300 edges
2. `fail()` - 234 edges
3. `Result` - 206 edges
4. `Actor` - 134 edges
5. `next` - 123 edges
6. `vitest` - 119 edges
7. `react` - 98 edges
8. `runAction()` - 86 edges
9. `can()` - 82 edges
10. `unwrap()` - 80 edges

## Surprising Connections (you probably didn't know these)
- `Task 4: Ajustar Alinhamento do Formulário em `FormalizationCard` e Criar Aba 2 (`ContractingTab`)` --references--> `FormalizationCard()`  [INFERRED]
  docs/superpowers/plans/2026-11-11-process-page-redesign.md → src/app/(app)/processos/[id]/formalization-card.tsx
- `Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters)` --references--> `AuditFilter`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda2-pedidos-justificativas-auditoria.md → src/modules/audit/schemas.ts
- `Escopo e confiança` --references--> `assertInstrumentsLinked()`  [INFERRED]
  docs/ux-improvement-plan/01-diagnostico-validado.md → src/modules/formalizations/actions.ts
- `UX-16 — Baseline de testes e tipagem` --references--> `assertInstrumentsLinked()`  [INFERRED]
  docs/ux-improvement-plan/04-roadmap-implementacao.md → src/modules/formalizations/actions.ts
- `7. Plano incremental` --references--> `buildBriefingFacts()`  [INFERRED]
  docs/proposta-redesign-funcional-inicio.md → src/modules/insights/briefing.ts

## Import Cycles
- None detected.

## Communities (175 total, 39 thin omitted)

### Community 0 - "can"
Cohesion: 0.08
Nodes (51): zod, Option, parseLocalInstant(), input, saveAppointment(), assignMembershipFormAction(), createCouncilFormAction(), removeMembershipFormAction() (+43 more)

### Community 1 - "purchases/actions.ts"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 2 - "dashboard/page.tsx"
Cohesion: 0.09
Nodes (37): Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor(), BigStat(), ChartCard(), HomeOverview() (+29 more)

### Community 4 - "process-attachment-sheet.tsx"
Cohesion: 0.16
Nodes (15): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, Sheet(), SheetClose() (+7 more)

### Community 5 - "processes-table.tsx"
Cohesion: 0.11
Nodes (35): RouteFixture(), ProcessesTable(), ProcessTableRow, contextualHref(), ContextualLink(), LIST_PATHS, RETURN_TO_KEY, ReturnLink() (+27 more)

### Community 6 - "result.ts"
Cohesion: 0.08
Nodes (89): AuditPage(), AuditPageProps, Content(), metadata, one(), AdministrationPage(), Content(), LINKS (+81 more)

### Community 7 - "purchases/service.test.ts"
Cohesion: 0.09
Nodes (3): InMemoryContractRepository, FailingRepository, InMemoryMeetingRepository

### Community 8 - "inventory/service.ts"
Cohesion: 0.13
Nodes (35): CommitmentEventType, CommitRequest, computeAtaBalance(), validateAllocations(), validateCommitment(), none, classifyStockLevel(), CRITICAL_RATIO (+27 more)

### Community 9 - "identity/service.ts"
Cohesion: 0.09
Nodes (15): CouncilRepository, MembershipRepository, Council, ProfileSummary, assignMembershipSchema, councilFields, createCouncilSchema, MembershipDirectory (+7 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.16
Nodes (9): FormalizationStatus, ProcessFormalization, FormalizationFilter, FormalizationRepository, InMemoryFormalizationRepository, FormalizationRow, fromRow(), SupabaseFormalizationRepository (+1 more)

### Community 11 - "public.receive_purchase_request"
Cohesion: 0.06
Nodes (38): public.save_contract(), public.save_purchase_request(), trg_audit_logs_immutable, trg_contract_amendments_immutable, trg_contract_amendments_no_truncate, idx_contracts_supplier_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id (+30 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.05
Nodes (110): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, calendar_appointments_scope_date_idx, check_staff_membership, council_memberships_one_director, idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_extensions_requested_by (+102 more)

### Community 13 - "@playwright/test"
Cohesion: 0.15
Nodes (17): refreshCompletion(), CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), buildSnapshot(), CompletionEvent, CompletionState (+9 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.10
Nodes (35): buildStockEntrySources(), RECEIVABLE, StockEntryItem, PurchaseRequest, PurchaseRequestEvent, RequestStatus, applyReceipt(), ReceiptItemResult (+27 more)

### Community 16 - "fail"
Cohesion: 0.12
Nodes (7): 3.3. Repositório e Camada de Domínio, MeetingService, AdministrativeProcess, guard(), fail(), internalError(), parseInput()

### Community 17 - "InMemoryAuditRepository"
Cohesion: 0.14
Nodes (30): Contratos de serviço, Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, AtaService, setup(), AuditService, ContractService, setup() (+22 more)

### Community 18 - "purchases/service.test.ts"
Cohesion: 0.09
Nodes (37): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+29 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.08
Nodes (51): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+43 more)

### Community 20 - "package.json"
Cohesion: 0.11
Nodes (23): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, @playwright/test@^1.65.1, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5 (+15 more)

### Community 22 - "request-facets.ts"
Cohesion: 0.06
Nodes (42): MonthDialogProps, Fact(), PlanDossierCard(), citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes() (+34 more)

### Community 23 - "ok"
Cohesion: 0.07
Nodes (16): 6. Estratégia de Testes, FormalizationService, SavingsSummary, InventoryRepository, Material, MaterialOrderService, context(), Actor (+8 more)

### Community 24 - "app-shell.tsx"
Cohesion: 0.12
Nodes (18): NavigationFixture(), AuthenticatedShell(), AppLayout(), AuthLayout(), NotFound(), filterNavigation(), NAV_ITEMS, isRequestOnly() (+10 more)

### Community 25 - "unwrap"
Cohesion: 0.13
Nodes (6): SupabaseNotificationRepository, toNotification(), SupabaseRetentionRepository, toIso(), unwrap(), SupabaseJobRunRepository

### Community 26 - "anon"
Cohesion: 0.12
Nodes (25): public.apply_stock_mutation(), public.correct_purchase_request(), public.register_process_ata(), public.register_process_ata_for_winner(), public.set_document_exception(), public.set_process_contracting_mode(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+17 more)

### Community 27 - "formalization-card.tsx"
Cohesion: 0.08
Nodes (25): InMemoryAtaRepository, declared(), newProcess(), PDF, setup(), sha(), InMemoryDocumentRepository, InMemoryStorage (+17 more)

### Community 28 - "reunioes/page.tsx"
Cohesion: 0.25
Nodes (6): class-variance-authority@^0.7.1, cn@^0.5.2, class-variance-authority, cn, Badge(), badgeVariants

### Community 29 - "public.purchase_requests"
Cohesion: 0.07
Nodes (44): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_ata_commitments_council_id (+36 more)

### Community 30 - "detailed.ts"
Cohesion: 0.17
Nodes (17): pdf-lib, auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, DetailedReport, first() (+9 more)

### Community 31 - "Button"
Cohesion: 0.10
Nodes (31): @base-ui/react, react-dom, auctionLabel(), FormalizationCard(), FormalizationCardProps, FormalizationSupplier, formatAuctionDate(), INSTRUMENT_LABELS (+23 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.12
Nodes (32): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+24 more)

### Community 33 - "pdf.ts"
Cohesion: 0.11
Nodes (19): dependencies, @base-ui/react@^1.9.0, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, next@16.4.6, pdf-lib@^1.17.1, react@19.3.0 (+11 more)

### Community 34 - "pdf.ts"
Cohesion: 0.17
Nodes (21): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+13 more)

### Community 35 - "feedback-states.tsx"
Cohesion: 0.09
Nodes (20): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+12 more)

### Community 36 - "plan-calendar.ts"
Cohesion: 0.13
Nodes (14): GET, credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction() (+6 more)

### Community 37 - "simple-table.tsx"
Cohesion: 0.15
Nodes (20): GET(), ExtractedPurchaseRequest, buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias() (+12 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (34): public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+26 more)

### Community 39 - "simple-table.tsx"
Cohesion: 0.06
Nodes (60): columns, Kind, kinds, processRows, rows, titles, DICTS, MeetingsOverview() (+52 more)

### Community 40 - "flow-guide.tsx"
Cohesion: 0.15
Nodes (8): PROCESS_FLOW_STEPS, REQUEST_FLOW_STEPS, REQUEST_LIFECYCLE, REQUEST_RAIL_ALIAS, FlowGuide(), FlowStep, LifecycleStep, NextStepProps

### Community 41 - "Result"
Cohesion: 0.09
Nodes (14): Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), changeRequestStatus(), AtomicDecision, AtomicReceipt, LinkedRequestNotes, PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService (+6 more)

### Community 42 - "policy.ts"
Cohesion: 0.12
Nodes (24): ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), ENTITY_LABELS, extractJustificationOrDetails(), formatActionLabel(), formatEntityLabel(), matchesPeriod() (+16 more)

### Community 43 - "repositories.ts"
Cohesion: 0.18
Nodes (14): GET(), GET(), GET(), Home(), RedirectHome(), detailedReportPdf(), getServices(), getSession() (+6 more)

### Community 44 - "AuditEntry"
Cohesion: 0.17
Nodes (12): AuditTrailTabProps, AuditRepository, InMemoryAuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry (+4 more)

### Community 45 - "groq.ts"
Cohesion: 0.08
Nodes (35): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build), BriefingCard() (+27 more)

### Community 46 - "MembershipRecord"
Cohesion: 0.19
Nodes (3): MembershipRecord, StaffCategory, SupabaseMembershipRepository

### Community 47 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.16
Nodes (15): mammoth@^1.13.0, mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText() (+7 more)

### Community 48 - "formalizations/actions.ts"
Cohesion: 0.16
Nodes (16): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão) (+8 more)

### Community 49 - "atas/service.ts"
Cohesion: 0.36
Nodes (7): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract

### Community 50 - "inventory/repository.ts"
Cohesion: 0.11
Nodes (17): MovementType, StockBalance, keyOf(), StockKey, StockMutation, StockRow, StockState, createMaterialSchema (+9 more)

### Community 51 - "MaterialOrder"
Cohesion: 0.14
Nodes (8): MaterialOrderFilter, MaterialOrderRepository, MaterialOrder, MaterialOrderStatus, OrderItemRow, OrderRow, SupabaseMaterialOrderRepository, toOrder()

### Community 52 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 53 - "notifications/service.ts"
Cohesion: 0.15
Nodes (12): AlertEntityType, AlertMilestone, digestMessage(), dispatchNotificationEmails(), EmailDispatchSummary, EmailMessage, EmailSender, groupByRecipient() (+4 more)

### Community 54 - "atas/extract-pdf/route.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 55 - "suppliers/service.ts"
Cohesion: 0.17
Nodes (6): SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema, isUniqueViolation()

### Community 56 - "log"
Cohesion: 0.16
Nodes (12): GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createSupabaseJobRunRepository(), JobOutcome, JobRunRepository (+4 more)

### Community 57 - "RetentionRepository"
Cohesion: 0.14
Nodes (19): draftSchema, GET(), maxDuration, MeetingFile(), getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio() (+11 more)

### Community 58 - "createSessionClient"
Cohesion: 0.10
Nodes (20): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências, Fluxos atuais e ideais (+12 more)

### Community 59 - "Contract"
Cohesion: 0.16
Nodes (7): @supabase/supabase-js, ContractRepository, Contract, ContractRow, SupabaseContractRepository, toContract(), toPayload()

### Community 60 - "identity/actions.ts"
Cohesion: 0.12
Nodes (22): STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, MembershipRow, AccessContext, ALL_ROLES, COUNCIL_ROLE_LABELS, COUNCIL_ROLES, CouncilRole (+14 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "toFortalezaDate"
Cohesion: 0.18
Nodes (16): AtaBalancePanel(), buildAtaBalanceRows(), AtaPage(), Content(), metadata, Content(), ContractFormContent(), metadata (+8 more)

### Community 63 - "new-ata-form.tsx"
Cohesion: 0.13
Nodes (20): AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), matchPdfItems(), NewAtaForm(), Option, ProcessOption (+12 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.13
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "meetings/service.ts"
Cohesion: 0.12
Nodes (17): MeetingStatus, MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting, MeetingDetails, meetingDetailsSchema (+9 more)

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
Cohesion: 0.10
Nodes (22): TransferStatus, advanceTransferSchema, requestTransferSchema, TransferEvent, TransferItem, toAta(), BalanceRow, MaterialRow (+14 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.10
Nodes (20): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 5. Componentes existentes a reutilizar e mudanças propostas, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação (+12 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "next"
Cohesion: 0.05
Nodes (36): FixtureReady(), FixtureLayout(), nextConfig, lucide-react, next, react, MonthDialog(), weekdays (+28 more)

### Community 75 - "material-order-dialog.tsx"
Cohesion: 0.16
Nodes (14): CouncilWorkspace(), CouncilWorkspaceProps, AvailableStockItem, MaterialOrderDialog(), MaterialOrderDialogProps, MaterialOrderForm(), handleSubmit(), resetForm() (+6 more)

### Community 76 - "process-view.tsx"
Cohesion: 0.15
Nodes (17): AtaBalanceRow, PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessViewProps, TabDefinition, BASE_PROPS, ApprovalsTabRequest (+9 more)

### Community 77 - "ActionForm"
Cohesion: 0.07
Nodes (62): RetentionForms(), MembershipForms(), Option, ProvisionCouncilForm(), StaffCategoryForm(), MarkReadForm(), EditCouncilForm(), NewCouncilForm() (+54 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "contracts/service.ts"
Cohesion: 0.29
Nodes (12): original, addAmendment(), ContractTerms, currentTerms(), elapsedPercent(), remainingDays(), addAmendmentSchema, closeContractSchema (+4 more)

### Community 81 - "PageHeader"
Cohesion: 0.48
Nodes (5): formatWhatsapp(), onlyDigits(), parseWhatsapp(), whatsappHref(), WhatsappParse

### Community 83 - "notifications/service.ts"
Cohesion: 0.21
Nodes (9): ALERT_MILESTONES, AlertCandidate, dedupKey(), DueAlert, reachedMilestone(), selectDueAlerts(), AlertSource, AlertRunSummary (+1 more)

### Community 84 - "private.business_error"
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

### Community 91 - "time.ts"
Cohesion: 0.07
Nodes (52): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), AgendaBoard(), dateLabel() (+44 more)

### Community 93 - "calendario/page.tsx"
Cohesion: 0.21
Nodes (12): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, AppointmentRow, CalendarioPage(), Content() (+4 more)

### Community 94 - "reports/service.ts"
Cohesion: 0.19
Nodes (12): contractedMaterialsByProcess(), HoldItemInput, HoldRow, StockSectionProps, AtaView, ContractView, StockLevelView, DashboardAttention (+4 more)

### Community 95 - "validity.ts"
Cohesion: 0.19
Nodes (11): ATA_INITIAL_YEARS, ATA_LEGAL_BASIS, ATA_MAX_EXTENSIONS, AtaExtension, AtaValidityStatus, currentEndDate(), ExtensionRequest, requestExtension() (+3 more)

### Community 96 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 97 - "process-history.ts"
Cohesion: 0.31
Nodes (8): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ALL_DOCUMENT_TYPES

### Community 98 - "order.ts"
Cohesion: 0.12
Nodes (26): Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), changeMeetingStatus(), MEETING_TRANSITIONS, approveMaterialOrder(), approveOrder, cancelMaterialOrder(), cancelOrder, changeMaterialOrderStatus() (+18 more)

### Community 99 - "formalization.ts"
Cohesion: 0.18
Nodes (12): contractedItemSchema, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes, instrumentTypeSchema (+4 more)

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "stage2-auth-validate.mjs"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 112 - "processes/service.ts"
Cohesion: 0.26
Nodes (9): formatProcessNumber(), parseProcessNumber(), changeProcessStatusSchema, classifyProcessSchema, CreateProcessInput, createProcessSchema, publicSessionDateSchema, RegisterClosingInput (+1 more)

### Community 113 - "analysis.ts"
Cohesion: 0.28
Nodes (10): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+2 more)

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
Cohesion: 0.28
Nodes (13): OrderQueue(), handleApprove(), handleConfirmReject(), approveMaterialOrderAction(), cancelMaterialOrderAction(), createMaterialOrderAction(), extractCreatePayload(), extractOrderId() (+5 more)

### Community 119 - "transfers/service.ts"
Cohesion: 0.27
Nodes (4): InMemoryTransferRepository, TransferRepository, Transfer, setup()

### Community 120 - "orders/schemas.ts"
Cohesion: 0.17
Nodes (11): ApproveMaterialOrderInput, approveMaterialOrderSchema, CancelMaterialOrderInput, cancelMaterialOrderSchema, CreateMaterialOrderInput, createMaterialOrderItemSchema, createMaterialOrderSchema, materialOrderStatuses (+3 more)

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 123 - "ProcessStatus"
Cohesion: 0.21
Nodes (11): ArchiveProcessAction(), ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, changeProcessStatusFormAction(), changeProcessStatus() (+3 more)

### Community 124 - "documentation-tab.tsx"
Cohesion: 0.22
Nodes (15): CurrencyFixture(), buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, PriceResearchItemInput, PriceResearchLine, priceResearchLineTotal() (+7 more)

### Community 125 - "feedback-states.tsx"
Cohesion: 0.31
Nodes (7): Loading(), GlobalError(), DataSourceUnavailableState(), ErrorState(), ForbiddenState(), StateShell(), StateShellProps

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 128 - "reunioes/page.tsx"
Cohesion: 0.24
Nodes (9): AttachmentRow, calendarHref(), detailHref(), MeetingCard(), MeetingsPage(), meetingStatus(), metadata, Option (+1 more)

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 131 - "processes.test.ts"
Cohesion: 0.16
Nodes (22): AttachmentForProgress, Attachment, DocumentalSnapshot, ADDITIONAL_DOCUMENT_TYPE_CODES, ADDITIONAL_DOCUMENT_TYPES, AdditionalDocumentTypeCode, ALL_DOCUMENT_TYPE_CODES, AllDocumentTypeCode (+14 more)

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

### Community 150 - "atas/service.ts"
Cohesion: 0.08
Nodes (20): AtaBalance, CommitmentEvent, CouncilAllocation, ataValidityStatus(), AtaRepository, ataIdSchema, AtaItem, AtaStatus (+12 more)

### Community 151 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 153 - "file-upload.tsx"
Cohesion: 0.18
Nodes (14): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), attachmentIdSchema, isVisibleAttachment() (+6 more)

### Community 155 - "validate-corrections.mjs"
Cohesion: 0.33
Nodes (4): request(), data, db, revision()

### Community 157 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

### Community 159 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.12
Nodes (24): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+16 more)

### Community 180 - "service-support.ts"
Cohesion: 0.10
Nodes (15): Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), AuditRecorder, DocumentRepository, StoragePort, ProcessRepository, authorizationSchema, CleanupSummary, holdSchema (+7 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 967 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `reunioes/page.tsx`, `can`, `dashboard/page.tsx`, `processes.test.ts`, `result.ts`, `inventory/service.ts`, `identity/service.ts`, `purchases/service.ts`, `fail`, `InMemoryAuditRepository`, `purchases/service.test.ts`, `documentation-tab.tsx`, `MembershipRepository`, `atas/service.ts`, `file-upload.tsx`, `formalization-card.tsx`, `detailed.ts`, `plan-calendar.ts`, `simple-table.tsx`, `Result`, `policy.ts`, `AuditEntry`, `groq.ts`, `formalizations/actions.ts`, `inventory/repository.ts`, `service-support.ts`, `suppliers/service.ts`, `RetentionRepository`, `toFortalezaDate`, `meetings/service.ts`, `db.ts`, `next`, `contracts/service.ts`, `notifications/service.ts`, `calendario/page.tsx`, `reports/service.ts`, `validity.ts`, `order.ts`, `processes/service.ts`, `transfers/service.ts`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `can` be split into smaller, more focused modules?**
  _Cohesion score 0.08181126331811263 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `purchases/service.test.ts` to `dashboard/page.tsx`, `process-attachment-sheet.tsx`, `processes-table.tsx`, `result.ts`, `inventory/service.ts`, `@playwright/test`, `purchases/service.ts`, `InMemoryAuditRepository`, `documentation-tab.tsx`, `package.json`, `request-facets.ts`, `ok`, `file-upload.tsx`, `formalization-card.tsx`, `detailed.ts`, `Button`, `pdf.ts`, `simple-table.tsx`, `simple-table.tsx`, `policy.ts`, `groq.ts`, `movement-form.tsx`, `formalizations/actions.ts`, `atas/service.ts`, `solicitacoes/[id]/page.tsx`, `notifications/service.ts`, `atas/extract-pdf/route.ts`, `log`, `RetentionRepository`, `createSessionClient`, `Contract`, `identity/actions.ts`, `toFortalezaDate`, `new-ata-form.tsx`, `callback-server.mjs`, `Proposta funcional — página inicial Warley Gestão Operacional`, `next`, `material-order-dialog.tsx`, `process-view.tsx`, `contracts/service.ts`, `PageHeader`, `notifications/service.ts`, `time.ts`, `reports/service.ts`, `validity.ts`, `process-history.ts`, `order.ts`, `formalization.ts`, `stage2-auth-validate.mjs`, `analysis.ts`, `react`, `ProcessStatus`, `documentation-tab.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08953900709219859 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `reunioes/page.tsx`, `can`, `dashboard/page.tsx`, `process-attachment-sheet.tsx`, `processes-table.tsx`, `result.ts`, `documentation-tab.tsx`, `package.json`, `app-shell.tsx`, `Button`, `pdf.ts`, `plan-calendar.ts`, `simple-table.tsx`, `flow-guide.tsx`, `policy.ts`, `repositories.ts`, `groq.ts`, `movement-form.tsx`, `formalizations/actions.ts`, `log`, `RetentionRepository`, `createSessionClient`, `identity/actions.ts`, `toFortalezaDate`, `new-ata-form.tsx`, `toast-store.ts`, `callback-server.mjs`, `material-order-dialog.tsx`, `process-view.tsx`, `ActionForm`, `time.ts`, `calendario/page.tsx`, `react`, `ProcessStatus`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `processes-table.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11097560975609756 - nodes in this community are weakly interconnected._