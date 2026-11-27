# Graph Report - warleysales-atas-push  (2026-11-27)

## Corpus Check
- 628 files · ~293,693 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 3729 nodes · 13159 edges · 158 communities (128 shown, 30 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 463 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `12ebad28`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- runAction
- Global Constraints
- lucide-react
- Button
- process-attachment-sheet.tsx
- simple-table.tsx
- result.ts
- InMemoryPurchaseRequestRepository
- runAction
- pdf.ts
- ProcessFormalization
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
- material-order-dialog.tsx
- solicitacoes/page.tsx
- inventory.ts
- plan-calendar.ts
- unwrap
- anon
- transfers/schemas.ts
- formatCurrency
- documentation-tab.tsx
- Proposta funcional — página inicial Warley Gestão Operacional
- atas/service.ts
- public.profiles
- detailed-pdf.ts
- detailed.ts
- public.create_contract_with_ata
- server/session.ts
- request-template.ts
- 20261102000006_fk_indexes.sql
- simple-table.tsx
- meetings/service.ts
- entry-sources.ts
- react
- getSession
- analysis.ts
- groq.ts
- auth-stage.tsx
- processes/schemas.ts
- Input
- contratos/[id]/page.tsx
- balance.ts
- briefing-card.tsx
- @playwright/test
- notifications/service.ts
- atas/extract-pdf/route.ts
- suppliers/service.ts
- createSessionClient
- media-actions.ts
- createSessionClient
- SupabaseContractRepository
- identity/service.ts
- components.json
- new-ata-form.tsx
- formalizations/actions.ts
- RetentionRepository
- adapters/purchases.ts
- process-actions.tsx
- compilerOptions
- toast-store.ts
- atas.ts
- compilerOptions
- callback-server.mjs
- file-validation.ts
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- Arquitetura (estado atual da implementação)
- processos/page.tsx
- process-view.tsx
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- contracts/service.ts
- lucide-react
- PDFReport
- atas/actions.ts
- processes.test.ts
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- time.ts
- orders/schemas.ts
- contracts/actions.ts
- Global Constraints
- contracts/extract-pdf/route.ts
- MaterialOrderForm
- cnpj.ts
- MaterialOrder
- SupabaseStorage
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- Global Constraints
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- order-queue.tsx
- Execução local, deploy e backups
- cleanup-eligibility.ts
- Validação realmente executada
- atas-de-reuniao-operacao.md
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
- container.ts

## God Nodes (most connected - your core abstractions)
1. `ok()` - 300 edges
2. `fail()` - 234 edges
3. `Result` - 206 edges
4. `Actor` - 135 edges
5. `next` - 124 edges
6. `vitest` - 120 edges
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
- `Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor` --references--> `homologateFormalizationAction()`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/formalizations/actions.ts

## Import Cycles
- None detected.

## Communities (158 total, 30 thin omitted)

### Community 0 - "runAction"
Cohesion: 0.13
Nodes (29): zod, input, saveAppointment(), submit(), meetingReviewAction(), saveProcessContractingMode(), saveProcessEstimatedValue(), documentExceptionAction() (+21 more)

### Community 1 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 2 - "lucide-react"
Cohesion: 0.06
Nodes (49): Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, lucide-react, ApprovalQueueProps, PendingApprovalItem, DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor() (+41 more)

### Community 3 - "Button"
Cohesion: 0.07
Nodes (32): @base-ui/react, cn, react-dom, MembershipForms(), Option, ProvisionCouncilForm(), FormalizationQueue(), handleQuickHomologate() (+24 more)

### Community 4 - "process-attachment-sheet.tsx"
Cohesion: 0.12
Nodes (22): ComponentShowcase(), fixtureOrder, props, rows, NavigationFixture(), MeetingDialog(), MeetingDialogProps, Sheet() (+14 more)

### Community 5 - "simple-table.tsx"
Cohesion: 0.08
Nodes (47): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessHeader() (+39 more)

### Community 6 - "result.ts"
Cohesion: 0.07
Nodes (94): AuditPage(), AuditPageProps, Content(), metadata, one(), AdministrationPage(), Content(), LINKS (+86 more)

### Community 7 - "InMemoryPurchaseRequestRepository"
Cohesion: 0.05
Nodes (15): InMemoryContractRepository, FailingRepository, InMemoryStorage, createProcessWithProgress(), Ctx, PDF, InMemoryCouncilRepository, MeetingRepository (+7 more)

### Community 8 - "runAction"
Cohesion: 0.11
Nodes (32): Option, assignMembershipFormAction(), createCouncilFormAction(), removeMembershipFormAction(), setStaffCategoryFormAction(), updateCouncilFormAction(), createMaterialFormAction(), done() (+24 more)

### Community 9 - "pdf.ts"
Cohesion: 0.15
Nodes (24): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+16 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.10
Nodes (21): contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes (+13 more)

### Community 11 - "public.purchase_requests"
Cohesion: 0.06
Nodes (38): public.save_contract(), public.save_purchase_request(), trg_audit_logs_immutable, trg_contract_amendments_immutable, trg_contract_amendments_no_truncate, idx_contracts_supplier_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id (+30 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.05
Nodes (110): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, calendar_appointments_scope_date_idx, check_staff_membership, council_memberships_one_director, idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_extensions_requested_by (+102 more)

### Community 13 - "Attachment"
Cohesion: 0.09
Nodes (33): Attachment, attachmentIdSchema, PreparedUpload, prepareUploadSchema, uploadDocumentSchema, buildSnapshot(), CompletionEvent, CompletionState (+25 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.08
Nodes (31): Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, applyReceipt(), ReceiptItemResult, ReceiptItemState, ReceiptLine (+23 more)

### Community 16 - "ok"
Cohesion: 0.08
Nodes (12): 3.3. Repositório e Camada de Domínio, PriceRegistrationAta, Contract, refreshCompletion(), AdministrativeProcess, Supplier, guard(), Actor (+4 more)

### Community 17 - "ProcessService"
Cohesion: 0.13
Nodes (38): Contratos de serviço, Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), 3.2. Serviços e Ações, InMemoryAtaRepository, AtaService, setup(), InMemoryAuditRepository, AuditService (+30 more)

### Community 18 - "vitest"
Cohesion: 0.08
Nodes (45): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+37 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.09
Nodes (50): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+42 more)

### Community 20 - "package.json"
Cohesion: 0.05
Nodes (52): eslintConfig, dependencies, ai@^7.0.159, @ai-sdk/groq@^4.0.74, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, gsap@^3.15.0 (+44 more)

### Community 21 - "material-order-dialog.tsx"
Cohesion: 0.17
Nodes (16): 5. Componentes existentes a reutilizar e mudanças propostas, 6. Valores, estados e mensagens: salvaguardas, Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Reutilização em painéis por perfil, CouncilWorkspace(), CouncilWorkspaceProps, ActionHub(), buildCouncilActions() (+8 more)

### Community 22 - "solicitacoes/page.tsx"
Cohesion: 0.13
Nodes (23): Fact(), PlanDossierCard(), citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME (+15 more)

### Community 23 - "inventory.ts"
Cohesion: 0.11
Nodes (18): MovementType, StockBalance, InventoryRepository, keyOf(), StockKey, StockMutation, StockRow, StockState (+10 more)

### Community 24 - "plan-calendar.ts"
Cohesion: 0.10
Nodes (24): CalendarReportPanelProps, MonthDialog(), MonthDialogProps, weekdays, CalendarCouncilSummary, CalendarMonthSummary, CalendarReport, CalendarKind (+16 more)

### Community 25 - "unwrap"
Cohesion: 0.09
Nodes (8): SupabaseMembershipRepository, SupabaseNotificationRepository, toNotification(), SupabaseDocumentRepository, toAttachment(), SupabaseRetentionRepository, toIso(), unwrap()

### Community 26 - "anon"
Cohesion: 0.12
Nodes (25): public.apply_stock_mutation(), public.correct_purchase_request(), public.register_process_ata(), public.register_process_ata_for_winner(), public.set_document_exception(), public.set_process_contracting_mode(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+17 more)

### Community 27 - "transfers/schemas.ts"
Cohesion: 0.15
Nodes (13): TransferStatus, InMemoryTransferRepository, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferEvent, TransferItem (+5 more)

### Community 28 - "formatCurrency"
Cohesion: 0.20
Nodes (19): AtaBalancePanel(), AtaBalanceRow, auctionLabel(), FormalizationCard(), FormalizationCardProps, formatAuctionDate(), INSTRUMENT_LABELS, SavingsPanel() (+11 more)

### Community 29 - "documentation-tab.tsx"
Cohesion: 0.07
Nodes (44): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_ata_commitments_council_id (+36 more)

### Community 30 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.14
Nodes (13): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 8. Critérios de validação, Decisões para aprovação, Estoque e materiais, Ordem e redundância observadas (+5 more)

### Community 31 - "atas/service.ts"
Cohesion: 0.16
Nodes (15): contractedMaterialsByProcess(), HoldItemInput, HoldRow, CouncilAllocation, AtaValidityStatus, ataValidityStatus(), currentEndDate(), ataIdSchema (+7 more)

### Community 32 - "public.profiles"
Cohesion: 0.12
Nodes (32): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+24 more)

### Community 33 - "detailed-pdf.ts"
Cohesion: 0.15
Nodes (14): pdf-lib@^1.17.1, pdf-lib, files, migrationsDir, outFile, root, DetailedReport, clean() (+6 more)

### Community 34 - "detailed.ts"
Cohesion: 0.15
Nodes (23): GET(), kinds, ReportCentral(), auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind (+15 more)

### Community 35 - "public.create_contract_with_ata"
Cohesion: 0.09
Nodes (20): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+12 more)

### Community 36 - "server/session.ts"
Cohesion: 0.33
Nodes (10): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+2 more)

### Community 37 - "request-template.ts"
Cohesion: 0.09
Nodes (33): xlsx, POST(), GET(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText(), RequestDocumentKind (+25 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (34): public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+26 more)

### Community 39 - "simple-table.tsx"
Cohesion: 0.09
Nodes (47): DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview(), RequestsOverview(), Row(), RowLink, statusOf() (+39 more)

### Community 40 - "meetings/service.ts"
Cohesion: 0.11
Nodes (21): changeMeetingStatus(), MEETING_TRANSITIONS, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting, meetingDetailsSchema, MeetingMinutes (+13 more)

### Community 41 - "entry-sources.ts"
Cohesion: 0.35
Nodes (11): buildStockEntrySources(), RECEIVABLE, StockEntryItem, assertContractAllowsReceive(), assertReceiveLinesWithinContract(), contractedQuantityByAtaItem(), ContractForReceiveGate, maxReceivableAgainstContract() (+3 more)

### Community 42 - "react"
Cohesion: 0.12
Nodes (21): FixtureReady(), FixtureLayout(), react, buildAtaBalanceRows(), AtaPage(), Content(), metadata, Content() (+13 more)

### Community 43 - "getSession"
Cohesion: 0.24
Nodes (12): GET(), GET(), AuthenticatedShell(), AppLayout(), Home(), RedirectHome(), getServices(), getSession() (+4 more)

### Community 44 - "analysis.ts"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

### Community 45 - "groq.ts"
Cohesion: 0.17
Nodes (18): 7. Plano incremental, BRIEFING_SYSTEM_PROMPT, briefingSchema, briefingUsesOnlyKnownNumbers(), buildBriefingFacts(), coerceBriefing(), extractJsonObjects(), OperationalBriefing (+10 more)

### Community 46 - "auth-stage.tsx"
Cohesion: 0.26
Nodes (6): AuthLayout(), NotFound(), AuthStage(), PILLARS, BrandMark(), BrandMarkProps

### Community 47 - "processes/schemas.ts"
Cohesion: 0.16
Nodes (13): DocumentationTabProps, isProcessContractingMode(), needsAta(), PROCESS_CONTRACTING_MODES, ProcessContractingMode, PriceResearchLine, changeProcessStatusSchema, classifyProcessSchema (+5 more)

### Community 48 - "Input"
Cohesion: 0.12
Nodes (25): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary() (+17 more)

### Community 49 - "contratos/[id]/page.tsx"
Cohesion: 0.14
Nodes (16): Content(), ContractPage(), metadata, ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), ENTITY_LABELS, extractJustificationOrDetails() (+8 more)

### Community 50 - "balance.ts"
Cohesion: 0.22
Nodes (7): AtaBalance, CommitmentEventType, CommitRequest, computeAtaBalance(), validateAllocations(), validateCommitment(), requestExtension()

### Community 51 - "briefing-card.tsx"
Cohesion: 0.46
Nodes (5): BriefingCard(), BriefingFallback(), BriefingFacts, BriefingInsight, generateBriefing()

### Community 52 - "@playwright/test"
Cohesion: 0.08
Nodes (17): evidence, routes, sanitizeText(), sanitizeUrl(), destinations, @playwright/test@^1.65.1, envFiles, envNames (+9 more)

### Community 53 - "notifications/service.ts"
Cohesion: 0.06
Nodes (30): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract, ALERT_MILESTONES (+22 more)

### Community 54 - "atas/extract-pdf/route.ts"
Cohesion: 0.27
Nodes (7): POST(), ExtractedAta, ExtractedAtaItem, extractedItemSchema, extractedSchema, parseExtractedAta(), valid

### Community 55 - "suppliers/service.ts"
Cohesion: 0.23
Nodes (9): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits(), InMemorySupplierRepository, SupplierRepository, createSupplierSchema, supplierFields (+1 more)

### Community 56 - "createSessionClient"
Cohesion: 0.09
Nodes (19): GET, GET, GET, provisionCouncilAccess(), schema, { createUser }, ActionContext, isCronAuthorized() (+11 more)

### Community 57 - "media-actions.ts"
Cohesion: 0.14
Nodes (18): draftSchema, GET(), maxDuration, getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio(), saveAudio() (+10 more)

### Community 58 - "createSessionClient"
Cohesion: 0.07
Nodes (26): Sessão e autenticação, Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências (+18 more)

### Community 59 - "SupabaseContractRepository"
Cohesion: 0.18
Nodes (7): ContractRow, SupabaseContractRepository, toContract(), toPayload(), DatabaseError, RpcOutcome, rpcOutcomeToResult()

### Community 60 - "identity/service.ts"
Cohesion: 0.05
Nodes (39): CouncilRepository, MembershipRepository, InMemoryMembershipRepository, Council, MembershipRecord, ProfileSummary, STAFF_CATEGORIES, STAFF_CATEGORY_LABELS (+31 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "new-ata-form.tsx"
Cohesion: 0.26
Nodes (7): matchPdfItems(), NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption

### Community 63 - "formalizations/actions.ts"
Cohesion: 0.30
Nodes (11): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, assertInstrumentsLinked(), homologateFormalizationAction(), parseMoney(), rejectFormalizationAction(), submitFormalizationFormAction(), mockRunAction, formatCurrencyDraft() (+3 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.15
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "adapters/purchases.ts"
Cohesion: 0.13
Nodes (9): AtomicDecision, SupabaseMeetingRepository, toMeeting(), toPayload(), LinkedRequestNotesRow, SupabasePurchaseRequestRepository, toPayload(), toRequest() (+1 more)

### Community 66 - "process-actions.tsx"
Cohesion: 0.25
Nodes (9): ArchiveProcessAction(), ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, PROCESS_TRANSITIONS, ProcessStatus (+1 more)

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "atas.ts"
Cohesion: 0.16
Nodes (9): CommitmentEvent, AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toCommitment(), toPayload(), DbResponse (+1 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "file-validation.ts"
Cohesion: 0.21
Nodes (11): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES (+3 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "Arquitetura (estado atual da implementação)"
Cohesion: 0.33
Nodes (5): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Visão geral

### Community 75 - "processos/page.tsx"
Cohesion: 0.31
Nodes (7): ApprovalQueue(), deadlinePriority(), Content(), metadata, ProcessesPage(), planExpiryFromNotes(), processDisplayStatus()

### Community 76 - "process-view.tsx"
Cohesion: 0.14
Nodes (18): FormalizationSupplier, PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessViewProps, TabDefinition, BASE_PROPS, ApprovalsTabRequest (+10 more)

### Community 77 - "ActionForm"
Cohesion: 0.11
Nodes (39): RetentionForms(), StaffCategoryForm(), MarkReadForm(), EditCouncilForm(), NewCouncilForm(), AmendmentForm(), CloseContractForm(), NewMaterialForm() (+31 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "contracts/service.ts"
Cohesion: 0.15
Nodes (18): original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms, currentTerms(), elapsedPercent(), remainingDays() (+10 more)

### Community 81 - "lucide-react"
Cohesion: 0.12
Nodes (23): CouncilsContent(), CouncilsPage(), metadata, CouncilContent(), CouncilPage(), metadata, metadata, ProfilePage() (+15 more)

### Community 83 - "atas/actions.ts"
Cohesion: 0.40
Nodes (9): ataStepFormAction(), createAtaFormAction(), linkAtaProcessFormAction(), optionalId(), processReturnPath(), readProcessItems(), setAllocationsFormAction(), toMoney() (+1 more)

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
Cohesion: 0.14
Nodes (13): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, UC-01: Registro do Valor Estimado e Bloqueio de Estoque (+5 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.13
Nodes (14): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+6 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "time.ts"
Cohesion: 0.07
Nodes (58): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), AgendaBoard(), dateLabel() (+50 more)

### Community 92 - "orders/schemas.ts"
Cohesion: 0.17
Nodes (11): ApproveMaterialOrderInput, approveMaterialOrderSchema, CancelMaterialOrderInput, cancelMaterialOrderSchema, CreateMaterialOrderInput, createMaterialOrderItemSchema, createMaterialOrderSchema, materialOrderStatuses (+3 more)

### Community 93 - "contracts/actions.ts"
Cohesion: 0.35
Nodes (8): addAmendmentFormAction(), closeContractFormAction(), createContractFormAction(), linkContractProcessFormAction(), optionalNumber(), optionalText(), processReturnPath(), calculateContractAtaValue()

### Community 94 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

### Community 95 - "contracts/extract-pdf/route.ts"
Cohesion: 0.31
Nodes (6): POST(), ExtractedContract, extractedItemSchema, extractedSchema, parseExtractedContract(), valid

### Community 96 - "MaterialOrderForm"
Cohesion: 0.33
Nodes (3): MaterialOrderForm(), handleSubmit(), resetForm()

### Community 97 - "cnpj.ts"
Cohesion: 0.36
Nodes (7): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso()

### Community 98 - "MaterialOrder"
Cohesion: 0.05
Nodes (62): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros (+54 more)

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 112 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build)

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

### Community 118 - "order-queue.tsx"
Cohesion: 0.28
Nodes (13): OrderQueue(), handleApprove(), handleConfirmReject(), approveMaterialOrderAction(), cancelMaterialOrderAction(), createMaterialOrderAction(), extractCreatePayload(), extractOrderId() (+5 more)

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "cleanup-eligibility.ts"
Cohesion: 0.40
Nodes (5): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), addDaysToInstant()

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
Cohesion: 0.07
Nodes (10): nextConfig, next, CouncilPickerProps, PROCESS_FLOW_STEPS, REQUEST_FLOW_STEPS, REQUEST_LIFECYCLE, REQUEST_RAIL_ALIAS, FlowStep (+2 more)

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 134 - "processes.ts"
Cohesion: 0.12
Nodes (16): @supabase/supabase-js, AttachmentForProgress, MeetingStatus, MeetingRow, snapshotToJson(), SupabaseProcessRepository, toProcess(), toProcessChanges() (+8 more)

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
Cohesion: 0.10
Nodes (9): 6. Estratégia de Testes, parseProcessNumber(), authorize(), PermissionAction, readableCouncilIds(), admin, Role, roleMatrix (+1 more)

### Community 154 - "repositories.ts"
Cohesion: 0.10
Nodes (14): toAta(), SupabaseAuditRepository, toEntry(), SupabaseInventoryRepository, toMovement(), OrderItemRow, OrderRow, SupabaseMaterialOrderRepository (+6 more)

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.15
Nodes (18): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+10 more)

### Community 180 - "container.ts"
Cohesion: 0.07
Nodes (29): Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), AuditTrailTabProps, AtaRepository, AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult (+21 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 954 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `runAction`, `lucide-react`, `result.ts`, `InMemoryPurchaseRequestRepository`, `processes.ts`, `purchases/service.ts`, `ok`, `ProcessService`, `vitest`, `documentation-tab.tsx`, `inventory.ts`, `transfers/schemas.ts`, `atas/service.ts`, `detailed.ts`, `simple-table.tsx`, `meetings/service.ts`, `entry-sources.ts`, `react`, `groq.ts`, `contratos/[id]/page.tsx`, `balance.ts`, `container.ts`, `notifications/service.ts`, `suppliers/service.ts`, `createSessionClient`, `media-actions.ts`, `createSessionClient`, `SupabaseContractRepository`, `identity/service.ts`, `formalizations/actions.ts`, `adapters/purchases.ts`, `atas.ts`, `file-validation.ts`, `processos/page.tsx`, `contracts/service.ts`, `lucide-react`, `time.ts`, `MaterialOrder`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `runAction` be split into smaller, more focused modules?**
  _Cohesion score 0.12727272727272726 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `lucide-react`, `Button`, `process-attachment-sheet.tsx`, `simple-table.tsx`, `result.ts`, `InMemoryPurchaseRequestRepository`, `pdf.ts`, `ProcessFormalization`, `Attachment`, `purchases/service.ts`, `ProcessService`, `documentation-tab.tsx`, `package.json`, `material-order-dialog.tsx`, `solicitacoes/page.tsx`, `ok`, `plan-calendar.ts`, `atas/service.ts`, `detailed-pdf.ts`, `detailed.ts`, `request-template.ts`, `simple-table.tsx`, `meetings/service.ts`, `entry-sources.ts`, `react`, `analysis.ts`, `groq.ts`, `movement-form.tsx`, `Input`, `contratos/[id]/page.tsx`, `balance.ts`, `briefing-card.tsx`, `processes/schemas.ts`, `notifications/service.ts`, `atas/extract-pdf/route.ts`, `suppliers/service.ts`, `createSessionClient`, `media-actions.ts`, `createSessionClient`, `SupabaseContractRepository`, `identity/service.ts`, `new-ata-form.tsx`, `formalizations/actions.ts`, `process-actions.tsx`, `callback-server.mjs`, `file-validation.ts`, `processos/page.tsx`, `process-view.tsx`, `contracts/service.ts`, `lucide-react`, `time.ts`, `contracts/actions.ts`, `contracts/extract-pdf/route.ts`, `cnpj.ts`, `MaterialOrder`, `order-queue.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.06394230769230769 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `runAction`, `lucide-react`, `Button`, `process-attachment-sheet.tsx`, `simple-table.tsx`, `result.ts`, `runAction`, `documentation-tab.tsx`, `package.json`, `material-order-dialog.tsx`, `plan-calendar.ts`, `formatCurrency`, `detailed.ts`, `server/session.ts`, `simple-table.tsx`, `react`, `getSession`, `analysis.ts`, `groq.ts`, `auth-stage.tsx`, `movement-form.tsx`, `Input`, `contratos/[id]/page.tsx`, `createSessionClient`, `media-actions.ts`, `createSessionClient`, `identity/service.ts`, `formalizations/actions.ts`, `process-actions.tsx`, `toast-store.ts`, `callback-server.mjs`, `processos/page.tsx`, `process-view.tsx`, `ActionForm`, `lucide-react`, `atas/actions.ts`, `time.ts`, `contracts/actions.ts`, `order-queue.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.07137254901960784 - nodes in this community are weakly interconnected._