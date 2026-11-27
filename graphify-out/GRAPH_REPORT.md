# Graph Report - warleysales-atas-push  (2026-11-27)

## Corpus Check
- 623 files · ~291,904 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 3711 nodes · 13110 edges · 157 communities (118 shown, 39 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 463 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5febf329`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- runAction
- Global Constraints
- lucide-react
- createMemoryRepositories
- process-attachment-sheet.tsx
- simple-table.tsx
- result.ts
- InMemoryPurchaseRequestRepository
- inventory/service.ts
- Council
- ProcessFormalization
- public.purchase_requests
- apply_all.sql
- processes.test.ts
- Tarefas
- purchases/service.ts
- Result
- InventoryService
- vitest
- documentation-tab.tsx
- package.json
- identity/service.test.ts
- lucide-react
- ok
- parseInput
- unwrap
- anon
- purchases/service.test.ts
- @base-ui/react
- documentation-tab.tsx
- toFortalezaDate
- formalization-card.tsx
- public.profiles
- Attachment
- reports/service.ts
- public.ata_items
- identity/actions.ts
- request-template.ts
- 20261102000006_fk_indexes.sql
- Global Constraints
- solicitacoes/[id]/page.tsx
- process-view.tsx
- relatorios/page.tsx
- getSession
- AuditEntry
- groq.ts
- identity/service.ts
- processes.ts
- formalizations/actions.ts
- notification-destination.ts
- compact-document-row.test.tsx
- 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%)
- @playwright/test
- alert-source.ts
- contracts/actions.ts
- council-picker.tsx
- createSessionClient
- media-actions.ts
- createSessionClient
- provision-action.test.ts
- navigation.ts
- components.json
- next.config.ts
- new-ata-form.tsx
- RetentionRepository
- meetings/service.ts
- Arquitetura (estado atual da implementação)
- compilerOptions
- toast-store.ts
- db.ts
- compilerOptions
- callback-server.mjs
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- process-view.tsx
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- whatsapp.ts
- PDFReport
- processes.test.ts
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- agenda-board.tsx
- .list
- check-supabase.mjs
- cnpj.ts
- MaterialOrder
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- cnpj.ts
- callback-app/app/layout.tsx
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- orders/actions.ts
- Execução local, deploy e backups
- contracting-mode.ts
- process-actions.tsx
- react-dom
- Validação realmente executada
- atas-de-reuniao-operacao.md
- Checklist de execução
- Execução dos blocos 1 e 2
- progress.ts
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
- fail
- file-upload.tsx
- Auditoria de desempenho do Warley
- cleanup-eligibility.ts
- 20261110000003_material_orders.sql
- movement-form.tsx
- result.ts

## God Nodes (most connected - your core abstractions)
1. `ok()` - 300 edges
2. `fail()` - 234 edges
3. `Result` - 206 edges
4. `Actor` - 134 edges
5. `next` - 123 edges
6. `vitest` - 118 edges
7. `react` - 98 edges
8. `runAction()` - 86 edges
9. `can()` - 82 edges
10. `unwrap()` - 80 edges

## Surprising Connections (you probably didn't know these)
- `Task 4: Formulário de Nova Solicitação e Server Action` --references--> `createRequestFormAction()`  [INFERRED]
  docs/superpowers/plans/2026-11-10-solicitacao-processo-anexagem.md → src/modules/purchases/actions.ts
- `3.2 Recebimento de Materiais com Saldo Pendente` --references--> `receiveFormAction()`  [INFERRED]
  docs/superpowers/specs/2026-11-10-onda2-pedidos-justificativas-auditoria-design.md → src/modules/purchases/actions.ts
- `Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral` --references--> `filterNavigation()`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda3-documentos-adicionais-navegacao-reunioes.md → src/shared/lib/authz/navigation.ts
- `Task 3: Orquestração na Criação de Solicitação (`createProcess`)` --references--> `ProcessService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-solicitacao-processo-anexagem.md → src/modules/processes/service.ts
- `Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação` --references--> `InventoryService`  [INFERRED]
  docs/superpowers/plans/2026-11-10-onda1-estoque-formalizacao-economia.md → src/modules/inventory/service.ts

## Import Cycles
- None detected.

## Communities (157 total, 39 thin omitted)

### Community 0 - "runAction"
Cohesion: 0.08
Nodes (44): @supabase/ssr, zod, MembershipForms(), Option, ProvisionCouncilForm(), MarkReadForm(), parseLocalInstant(), input (+36 more)

### Community 1 - "Global Constraints"
Cohesion: 0.18
Nodes (8): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 2 - "lucide-react"
Cohesion: 0.04
Nodes (98): 5. Componentes existentes a reutilizar e mudanças propostas, 6. Valores, estados e mensagens: salvaguardas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, Reutilização em painéis por perfil, lucide-react, ApprovalQueue(), ApprovalQueueProps, PendingApprovalItem (+90 more)

### Community 3 - "createMemoryRepositories"
Cohesion: 0.11
Nodes (4): InMemoryStorage, InMemoryNotificationRepository, InMemorySupplierRepository, createMemoryRepositories()

### Community 4 - "process-attachment-sheet.tsx"
Cohesion: 0.13
Nodes (21): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, openProcessAttachment(), ProcessAttachmentSheet() (+13 more)

### Community 5 - "simple-table.tsx"
Cohesion: 0.09
Nodes (42): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessesTable() (+34 more)

### Community 6 - "result.ts"
Cohesion: 0.07
Nodes (100): next, react, AuditPage(), AuditPageProps, Content(), metadata, one(), AdministrationPage() (+92 more)

### Community 7 - "InMemoryPurchaseRequestRepository"
Cohesion: 0.06
Nodes (7): InMemoryContractRepository, FailingRepository, InMemoryMeetingRepository, MeetingDetails, InMemoryPurchaseRequestRepository, InMemoryTransferRepository, setup()

### Community 8 - "inventory/service.ts"
Cohesion: 0.06
Nodes (49): none, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel, stockLevelLabel, applyMovement(), availableOf() (+41 more)

### Community 9 - "Council"
Cohesion: 0.25
Nodes (3): Council, ProfileSummary, MembershipService

### Community 10 - "ProcessFormalization"
Cohesion: 0.10
Nodes (21): contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes (+13 more)

### Community 11 - "public.purchase_requests"
Cohesion: 0.06
Nodes (38): public.save_contract(), public.save_purchase_request(), trg_audit_logs_immutable, trg_contract_amendments_immutable, trg_contract_amendments_no_truncate, idx_contracts_supplier_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id (+30 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.05
Nodes (110): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, calendar_appointments_scope_date_idx, check_staff_membership, council_memberships_one_director, idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_extensions_requested_by (+102 more)

### Community 13 - "processes.test.ts"
Cohesion: 0.24
Nodes (11): Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), buildSnapshot(), CompletionEvent, CompletionState, CompletionTransition, effectiveProgressPercent(), reevaluateCompletion(), allSeven() (+3 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.09
Nodes (35): buildStockEntrySources(), RECEIVABLE, StockEntryItem, Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, ReceiptItemResult (+27 more)

### Community 16 - "Result"
Cohesion: 0.07
Nodes (14): 3.3. Repositório e Camada de Domínio, Attachment, MeetingRepository, Meeting, MeetingService, refreshCompletion(), formatProcessNumber(), parseProcessNumber() (+6 more)

### Community 17 - "InventoryService"
Cohesion: 0.13
Nodes (34): Contratos de serviço, Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, InMemoryAtaRepository, AtaService, activeAta(), manager(), setup() (+26 more)

### Community 18 - "vitest"
Cohesion: 0.11
Nodes (31): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, input (+23 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.14
Nodes (32): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+24 more)

### Community 20 - "package.json"
Cohesion: 0.12
Nodes (22): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5, @types/react@^19 (+14 more)

### Community 21 - "identity/service.test.ts"
Cohesion: 0.16
Nodes (5): InMemoryCouncilRepository, InMemoryMembershipRepository, CouncilService, base, setup()

### Community 22 - "lucide-react"
Cohesion: 0.06
Nodes (39): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialog(), MonthDialogProps, weekdays (+31 more)

### Community 23 - "ok"
Cohesion: 0.08
Nodes (18): requestExtension(), FormalizationService, saveProcessContractingMode(), saveProcessEstimatedValue(), documentExceptionAction(), saveProcessValidityStartDate(), correctRequestAction(), Transfer (+10 more)

### Community 24 - "parseInput"
Cohesion: 0.14
Nodes (13): AuthLayout(), LoginPage(), metadata, metadata, RecoveryPage(), metadata, PasswordPage(), NotFound() (+5 more)

### Community 25 - "unwrap"
Cohesion: 0.04
Nodes (24): AttachmentForProgress, SupabaseAtaRepository, SupabaseCouncilRepository, toCouncil(), toRow(), SupabaseInventoryRepository, SupabaseNotificationRepository, toNotification() (+16 more)

### Community 26 - "anon"
Cohesion: 0.12
Nodes (25): public.apply_stock_mutation(), public.correct_purchase_request(), public.register_process_ata(), public.register_process_ata_for_winner(), public.set_document_exception(), public.set_process_contracting_mode(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+17 more)

### Community 27 - "purchases/service.test.ts"
Cohesion: 0.13
Nodes (15): InMemoryDocumentRepository, createProcessWithProgress(), Ctx, PDF, InMemoryInventoryRepository, DOCUMENT_TYPE_CODES, isValidAttachment(), InMemoryProcessRepository (+7 more)

### Community 28 - "@base-ui/react"
Cohesion: 0.22
Nodes (8): @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, @base-ui/react, class-variance-authority, cn, Badge(), badgeVariants

### Community 29 - "documentation-tab.tsx"
Cohesion: 0.07
Nodes (44): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_ata_commitments_council_id (+36 more)

### Community 30 - "toFortalezaDate"
Cohesion: 0.16
Nodes (18): pdf-lib@^1.17.1, pdf-lib, auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, DetailedReport (+10 more)

### Community 31 - "formalization-card.tsx"
Cohesion: 0.10
Nodes (30): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), AmendmentForm(), auctionLabel(), FormalizationCard() (+22 more)

### Community 32 - "public.profiles"
Cohesion: 0.12
Nodes (32): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+24 more)

### Community 33 - "Attachment"
Cohesion: 0.10
Nodes (20): dependencies, ai@^7.0.159, @ai-sdk/groq@^4.0.74, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, next@16.4.6, react@19.3.0 (+12 more)

### Community 34 - "reports/service.ts"
Cohesion: 0.05
Nodes (60): branding(), download(), GET(), ATA_INITIAL_YEARS, ATA_LEGAL_BASIS, ATA_MAX_EXTENSIONS, AtaExtension, AtaValidityStatus (+52 more)

### Community 35 - "public.ata_items"
Cohesion: 0.09
Nodes (20): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+12 more)

### Community 36 - "identity/actions.ts"
Cohesion: 0.16
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

### Community 37 - "request-template.ts"
Cohesion: 0.11
Nodes (24): GET(), extractedItemSchema, ExtractedPurchaseRequest, extractedSchema, REQUEST_EXTRACTION_SYSTEM_PROMPT, valid, buildRequestExcelTemplate(), buildRequestWordTemplate() (+16 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (34): public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+26 more)

### Community 39 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

### Community 40 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.07
Nodes (38): Content(), metadata, RequestPage(), Fact(), PlanDossierCard(), citedInstruments(), expiryFromText(), guardNatureza() (+30 more)

### Community 41 - "process-view.tsx"
Cohesion: 0.15
Nodes (6): changeRequestStatus(), AtomicDecision, PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService, Actor

### Community 42 - "relatorios/page.tsx"
Cohesion: 0.15
Nodes (20): ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), AuditTrailTabProps, ENTITY_LABELS, extractJustificationOrDetails(), formatActionLabel(), formatEntityLabel() (+12 more)

### Community 43 - "getSession"
Cohesion: 0.10
Nodes (29): ai, @ai-sdk/groq, unpdf, POST(), GET(), POST(), POST(), GET() (+21 more)

### Community 44 - "AuditEntry"
Cohesion: 0.25
Nodes (9): AuditRepository, AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange(), SupabaseAuditRepository (+1 more)

### Community 45 - "groq.ts"
Cohesion: 0.05
Nodes (49): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação, Estoque e materiais (+41 more)

### Community 46 - "identity/service.ts"
Cohesion: 0.08
Nodes (22): MembershipRepository, MembershipRecord, STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, StaffCategory, assignMembershipSchema, councilFields, createCouncilSchema (+14 more)

### Community 47 - "processes.ts"
Cohesion: 0.24
Nodes (9): mammoth@^1.13.0, mammoth, xlsx, detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText(), RequestDocumentKind (+1 more)

### Community 48 - "formalizations/actions.ts"
Cohesion: 0.17
Nodes (21): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, handleQuickHomologate(), ataStepFormAction(), createAtaFormAction(), linkAtaProcessFormAction(), optionalId(), processReturnPath(), readProcessItems() (+13 more)

### Community 49 - "notification-destination.ts"
Cohesion: 0.36
Nodes (7): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract

### Community 50 - "compact-document-row.test.tsx"
Cohesion: 0.50
Nodes (3): CompactDocumentRowProps, PENDING_ROW_PROPS, VALID_ROW_PROPS

### Community 51 - "3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%)"
Cohesion: 0.67
Nodes (3): 3.1 Encerramento de Processo com Documentação Parcial, 3.2 Recebimento de Materiais com Saldo Pendente, 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%)

### Community 52 - "@playwright/test"
Cohesion: 0.09
Nodes (14): evidence, routes, sanitizeText(), sanitizeUrl(), destinations, @playwright/test@^1.65.1, envFiles, envNames (+6 more)

### Community 53 - "alert-source.ts"
Cohesion: 0.09
Nodes (17): currentEndDate(), RepositoryAlertSource, AlertEntityType, AlertMilestone, digestMessage(), dispatchNotificationEmails(), EmailDispatchSummary, EmailMessage (+9 more)

### Community 54 - "contracts/actions.ts"
Cohesion: 0.16
Nodes (19): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), CloseContractForm(), computeInitialEndDate() (+11 more)

### Community 56 - "createSessionClient"
Cohesion: 0.12
Nodes (14): GET, GET, GET, isCronAuthorized(), createCronHandler(), createResendSender(), createSupabaseJobRunRepository(), SupabaseJobRunRepository (+6 more)

### Community 57 - "media-actions.ts"
Cohesion: 0.11
Nodes (23): draftSchema, GET(), maxDuration, getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio(), saveAudio() (+15 more)

### Community 58 - "createSessionClient"
Cohesion: 0.11
Nodes (16): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências, Fluxos atuais e ideais (+8 more)

### Community 60 - "navigation.ts"
Cohesion: 0.13
Nodes (20): NavigationFixture(), NAV_GROUPS, NAV_ITEMS, NavGroup, NavItem, AppShell(), AppShellProps, getServerSidebarSnapshot() (+12 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 63 - "new-ata-form.tsx"
Cohesion: 0.15
Nodes (12): matchPdfItems(), NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption, ExtractedAta (+4 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.19
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "meetings/service.ts"
Cohesion: 0.10
Nodes (27): changeMeetingStatus(), MEETING_TRANSITIONS, ActionItem, actionItemSchema, changeMeetingStatusSchema, meetingDetailsSchema, MeetingMinutes, minutesSchema (+19 more)

### Community 66 - "Arquitetura (estado atual da implementação)"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.15
Nodes (16): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+8 more)

### Community 69 - "db.ts"
Cohesion: 0.07
Nodes (39): @supabase/supabase-js, AtaStatus, MeetingStatus, AtaRow, CommitmentRow, toAta(), toCommitment(), toPayload() (+31 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "process-view.tsx"
Cohesion: 0.04
Nodes (79): react-dom, AtaBalancePanel(), AtaBalanceRow, buildAtaBalanceRows(), AtaPage(), Content(), metadata, Content() (+71 more)

### Community 77 - "ActionForm"
Cohesion: 0.10
Nodes (44): RetentionForms(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), NewMaterialForm(), MinimumForm(), Option, NewSupplierForm() (+36 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 81 - "whatsapp.ts"
Cohesion: 0.53
Nodes (4): formatWhatsapp(), onlyDigits(), parseWhatsapp(), WhatsappParse

### Community 84 - "processes.test.ts"
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
Cohesion: 0.13
Nodes (14): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3.2. Serviços e Ações, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade (+6 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.13
Nodes (14): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+6 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "agenda-board.tsx"
Cohesion: 0.14
Nodes (25): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+17 more)

### Community 96 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 97 - "cnpj.ts"
Cohesion: 0.31
Nodes (8): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ALL_DOCUMENT_TYPES

### Community 98 - "MaterialOrder"
Cohesion: 0.06
Nodes (41): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build (+33 more)

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

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

### Community 118 - "orders/actions.ts"
Cohesion: 0.14
Nodes (18): OrderQueue(), handleApprove(), handleConfirmReject(), OrderQueueProps, PendingOrderItem, MaterialOrderForm(), handleSubmit(), resetForm() (+10 more)

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "contracting-mode.ts"
Cohesion: 0.33
Nodes (5): FormalizationCardProps, ContractingTabProps, isProcessContractingMode(), PROCESS_CONTRACTING_MODES, ProcessContractingMode

### Community 123 - "process-actions.tsx"
Cohesion: 0.13
Nodes (19): Option, ArchiveProcessAction(), ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, changeProcessStatusFormAction() (+11 more)

### Community 124 - "react-dom"
Cohesion: 0.35
Nodes (9): buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, saveProcessPriceResearch(), PriceResearchItemInput, PriceResearchLine, priceResearchLineTotal() (+1 more)

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 131 - "progress.ts"
Cohesion: 0.14
Nodes (15): DocumentalSnapshot, ADDITIONAL_DOCUMENT_TYPE_CODES, ADDITIONAL_DOCUMENT_TYPES, AdditionalDocumentTypeCode, ALL_DOCUMENT_TYPE_CODES, AllDocumentTypeCode, DocumentTypeCode, REQUIRED_DOCUMENT_COUNT (+7 more)

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

### Community 150 - "fail"
Cohesion: 0.09
Nodes (10): AtaBalance, CommitmentEvent, CommitmentEventType, CommitRequest, computeAtaBalance(), validateAllocations(), validateCommitment(), ataValidityStatus() (+2 more)

### Community 153 - "file-upload.tsx"
Cohesion: 0.14
Nodes (18): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES (+10 more)

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 166 - "cleanup-eligibility.ts"
Cohesion: 0.40
Nodes (5): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), addDaysToInstant()

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.12
Nodes (24): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+16 more)

### Community 180 - "result.ts"
Cohesion: 0.05
Nodes (59): CouncilAllocation, AtaRepository, ataIdSchema, AtaItem, createAtaSchema, linkAtaProcessSchema, setAllocationsSchema, AtaItemView (+51 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 950 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `runAction`, `lucide-react`, `process-attachment-sheet.tsx`, `result.ts`, `inventory/service.ts`, `Council`, `purchases/service.ts`, `Result`, `vitest`, `documentation-tab.tsx`, `identity/service.test.ts`, `lucide-react`, `fail`, `file-upload.tsx`, `unwrap`, `purchases/service.test.ts`, `toFortalezaDate`, `reports/service.ts`, `identity/actions.ts`, `solicitacoes/[id]/page.tsx`, `process-view.tsx`, `relatorios/page.tsx`, `AuditEntry`, `groq.ts`, `identity/service.ts`, `formalizations/actions.ts`, `result.ts`, `alert-source.ts`, `media-actions.ts`, `meetings/service.ts`, `db.ts`, `process-view.tsx`, `ActionForm`, `MaterialOrder`, `react-dom`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `runAction` be split into smaller, more focused modules?**
  _Cohesion score 0.07726075504828797 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `lucide-react`, `process-attachment-sheet.tsx`, `simple-table.tsx`, `inventory/service.ts`, `ProcessFormalization`, `processes.test.ts`, `purchases/service.ts`, `InventoryService`, `documentation-tab.tsx`, `package.json`, `identity/service.test.ts`, `fail`, `lucide-react`, `ok`, `file-upload.tsx`, `purchases/service.test.ts`, `toFortalezaDate`, `formalization-card.tsx`, `reports/service.ts`, `request-template.ts`, `solicitacoes/[id]/page.tsx`, `relatorios/page.tsx`, `getSession`, `groq.ts`, `movement-form.tsx`, `formalizations/actions.ts`, `notification-destination.ts`, `compact-document-row.test.tsx`, `processes.ts`, `alert-source.ts`, `contracts/actions.ts`, `createSessionClient`, `media-actions.ts`, `createSessionClient`, `provision-action.test.ts`, `navigation.ts`, `new-ata-form.tsx`, `meetings/service.ts`, `db.ts`, `callback-server.mjs`, `process-view.tsx`, `whatsapp.ts`, `agenda-board.tsx`, `cnpj.ts`, `MaterialOrder`, `cnpj.ts`, `orders/actions.ts`, `contracting-mode.ts`, `process-actions.tsx`, `react-dom`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.04109251968503937 - nodes in this community are weakly interconnected._
- **Why does `fail()` connect `ok` to `runAction`, `process-attachment-sheet.tsx`, `result.ts`, `inventory/service.ts`, `Council`, `purchases/service.ts`, `Result`, `vitest`, `documentation-tab.tsx`, `identity/service.test.ts`, `lucide-react`, `fail`, `file-upload.tsx`, `unwrap`, `purchases/service.test.ts`, `toFortalezaDate`, `reports/service.ts`, `identity/actions.ts`, `process-view.tsx`, `relatorios/page.tsx`, `AuditEntry`, `groq.ts`, `identity/service.ts`, `formalizations/actions.ts`, `result.ts`, `alert-source.ts`, `media-actions.ts`, `meetings/service.ts`, `db.ts`, `ActionForm`, `MaterialOrder`, `process-actions.tsx`, `react-dom`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `createMemoryRepositories` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._