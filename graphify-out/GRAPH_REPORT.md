# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 609 files · ~287,822 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3674 nodes · 12916 edges · 159 communities (130 shown, 29 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 461 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1a04b788`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Actor
- transfers.ts
- simple-table.tsx
- pdf.ts
- identity/actions.ts
- vitest
- dependencies
- formalization-card.tsx
- stock.ts
- identity/service.ts
- ProcessFormalization
- solicitacoes/[id]/page.tsx
- apply_all.sql
- notifications/service.ts
- Tarefas
- Screen
- time.ts
- public.receive_purchase_request
- processes-table.tsx
- compact-document-row.tsx
- package.json
- ok
- .insert
- new-contract-form.tsx
- runAction
- unwrap
- ModuleInsightFallback
- purchases/service.ts
- Auditoria de desempenho do Warley
- purchases/service.test.ts
- navigation.ts
- result.ts
- public.profiles
- PageHeader
- price-research-form.tsx
- Proposta funcional — página inicial Warley Gestão Operacional
- SupabasePurchaseRequestRepository
- callback-app/app/page.tsx
- 20261102000006_fk_indexes.sql
- identity.ts
- new-ata-form.tsx
- PurchaseRequestStatus
- Attachment
- db.ts
- repositories.ts
- SupabasePurchaseRequestRepository
- orders/service.test.ts
- cleanup-eligibility.ts
- public.profiles
- audit/service.ts
- callback-app/app/layout.tsx
- processes.ts
- PurchaseRequestStatus
- contracts/extract-pdf/route.ts
- db.ts
- request-template.ts
- log
- InMemoryMembershipRepository
- server/session.ts
- InMemoryMembershipRepository
- next
- components.json
- container.ts
- result.ts
- RetentionRepository
- public.meeting_action_items
- document-types.ts
- compilerOptions
- toast-store.ts
- LoadingState
- compilerOptions
- callback-server.mjs
- inventory.ts
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- Fluxos atuais e ideais
- loadScreen
- fail
- ActionForm
- formalizations/actions.ts
- import-pca-crcpi-2027.mjs
- documents/service.ts
- pg_temp.act_as
- PDFReport
- processes/service.ts
- badge.tsx
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- process-history.ts
- process-view.tsx
- time.ts
- purchases/service.ts
- membership-forms.tsx
- cnpj.ts
- toFortalezaDate
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- atas.ts
- formatCurrency
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- suppliers/service.ts
- can
- Execução local, deploy e backups
- media-actions.ts
- toDate
- formalization-card.tsx
- Validação realmente executada
- process-attachment-sheet.tsx
- Global Constraints
- Checklist de execução
- Execução dos blocos 1 e 2
- council-picker.tsx
- Pendências e limitações conhecidas
- Relatório de alterações recentes
- Plano de testes
- Graphify neste repositório
- E2E
- SupabaseMeetingRepository
- Avisos de vencimento por e-mail
- README.md
- Documento de Design Técnico: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões
- AGENTS.md
- Relatórios em PDF
- 12-orgaos-e-empresas.md
- 02-permissoes.md
- 09-reunioes-audio.md
- 10-cadastro-contrato-pdf.md
- InMemoryAuditRepository
- check-supabase.mjs
- analysis.ts
- processes.ts
- navigation.ts
- react
- Global Constraints

## God Nodes (most connected - your core abstractions)
1. `ok()` - 300 edges
2. `fail()` - 232 edges
3. `Result` - 206 edges
4. `Actor` - 134 edges
5. `next` - 121 edges
6. `vitest` - 112 edges
7. `react` - 97 edges
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
- `Escopo e confiança` --references--> `assertInstrumentsLinked()`  [INFERRED]
  docs/ux-improvement-plan/01-diagnostico-validado.md → src/modules/formalizations/actions.ts

## Import Cycles
- None detected.

## Communities (159 total, 29 thin omitted)

### Community 0 - "Actor"
Cohesion: 0.17
Nodes (7): Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), 3.3. Repositório e Camada de Domínio, changeRequestStatus(), PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService, Actor

### Community 1 - "transfers.ts"
Cohesion: 0.18
Nodes (10): TransferStatus, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferEvent, TransferItem, SupabaseTransferRepository (+2 more)

### Community 2 - "simple-table.tsx"
Cohesion: 0.10
Nodes (37): weekdays, ApprovalQueueProps, DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview(), RequestsOverview(), Row() (+29 more)

### Community 3 - "pdf.ts"
Cohesion: 0.16
Nodes (22): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+14 more)

### Community 4 - "identity/actions.ts"
Cohesion: 0.33
Nodes (10): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+2 more)

### Community 5 - "vitest"
Cohesion: 0.11
Nodes (32): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, createProcessWithProgress() (+24 more)

### Community 6 - "dependencies"
Cohesion: 0.26
Nodes (8): requestInReview(), approver(), ataItem(), manager(), stockOf(), submitted(), MemoryTable, specialDeleter()

### Community 7 - "formalization-card.tsx"
Cohesion: 0.12
Nodes (28): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), AmendmentForm(), auctionLabel(), FormalizationCard() (+20 more)

### Community 8 - "stock.ts"
Cohesion: 0.04
Nodes (74): Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, 6. Estratégia de Testes, none, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel (+66 more)

### Community 9 - "identity/service.ts"
Cohesion: 0.08
Nodes (19): MaterialOrderDialogProps, MaterialOrderFormProps, MaterialOrderFilter, ApproveMaterialOrderInput, approveMaterialOrderSchema, CancelMaterialOrderInput, cancelMaterialOrderSchema, CreateMaterialOrderInput (+11 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.09
Nodes (19): contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes (+11 more)

### Community 11 - "solicitacoes/[id]/page.tsx"
Cohesion: 0.08
Nodes (40): Content(), metadata, RequestPage(), Content(), metadata, RequestsPage(), citedInstruments(), expiryFromText() (+32 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.04
Nodes (114): administrative_processes_responsible_id_idx, calendar_appointments_scope_date_idx, contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx (+106 more)

### Community 13 - "notifications/service.ts"
Cohesion: 0.07
Nodes (27): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract, ALERT_MILESTONES (+19 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "Screen"
Cohesion: 0.15
Nodes (19): AtaPage(), Content(), metadata, Content(), ContractFormContent(), metadata, NewContractPage(), GlobalError() (+11 more)

### Community 16 - "time.ts"
Cohesion: 0.09
Nodes (30): @base-ui/react, cn, react-dom, FormalizationQueue(), FormalizationQueueProps, INSTRUMENT_LABELS, PendingFormalizationItem, OrderQueue() (+22 more)

### Community 17 - "public.receive_purchase_request"
Cohesion: 0.05
Nodes (46): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), public.save_purchase_request(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, trg_ata_extensions_no_truncate, idx_ata_allocations_council_id (+38 more)

### Community 18 - "processes-table.tsx"
Cohesion: 0.08
Nodes (44): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessesTable() (+36 more)

### Community 19 - "compact-document-row.tsx"
Cohesion: 0.09
Nodes (47): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+39 more)

### Community 20 - "package.json"
Cohesion: 0.10
Nodes (21): dependencies, @base-ui/react@^1.9.0, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, mammoth@^1.13.0, next@16.4.6 (+13 more)

### Community 21 - "ok"
Cohesion: 0.08
Nodes (33): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialog(), MonthDialogProps, AppointmentRow (+25 more)

### Community 22 - ".insert"
Cohesion: 0.08
Nodes (16): InMemoryAtaRepository, declared(), newProcess(), PDF, setup(), sha(), InMemoryDocumentRepository, InMemoryStorage (+8 more)

### Community 23 - "new-contract-form.tsx"
Cohesion: 0.07
Nodes (44): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), matchPdfItems(), NewAtaForm() (+36 more)

### Community 24 - "runAction"
Cohesion: 0.07
Nodes (55): zod, Option, Panel, input, addAmendmentFormAction(), closeContractFormAction(), createContractFormAction(), linkContractProcessFormAction() (+47 more)

### Community 25 - "unwrap"
Cohesion: 0.07
Nodes (14): SupabaseMembershipRepository, SupabaseNotificationRepository, toNotification(), snapshotToJson(), SupabaseProcessRepository, toProcess(), toProcessChanges(), SupabaseRetentionRepository (+6 more)

### Community 26 - "ModuleInsightFallback"
Cohesion: 0.18
Nodes (19): AuditPage(), AuditPageProps, Content(), metadata, one(), MarkReadForm(), AlertsPage(), Content() (+11 more)

### Community 27 - "purchases/service.ts"
Cohesion: 0.15
Nodes (16): BigStat(), ChartCard(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, baseAtas, baseContracts (+8 more)

### Community 28 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 29 - "purchases/service.test.ts"
Cohesion: 0.16
Nodes (11): MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting, meetingDetailsSchema, MeetingMinutes, minutesSchema (+3 more)

### Community 30 - "navigation.ts"
Cohesion: 0.12
Nodes (22): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5, @types/react@^19 (+14 more)

### Community 31 - "result.ts"
Cohesion: 0.12
Nodes (21): AtasPage(), Content(), metadata, buildHoldRows(), HoldItemInput, HoldRow, metadata, metadata (+13 more)

### Community 32 - "public.profiles"
Cohesion: 0.09
Nodes (39): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+31 more)

### Community 33 - "PageHeader"
Cohesion: 0.18
Nodes (15): metadata, NewCouncilPage(), StockPage(), metadata, ProfilePage(), Content(), metadata, ProcessesPage() (+7 more)

### Community 34 - "price-research-form.tsx"
Cohesion: 0.36
Nodes (7): buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, PriceResearchItemInput, PriceResearchLine, sumPriceResearchLines()

### Community 35 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.12
Nodes (15): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação (+7 more)

### Community 36 - "SupabasePurchaseRequestRepository"
Cohesion: 0.20
Nodes (5): AtomicDecision, AtomicReceipt, SupabasePurchaseRequestRepository, toPayload(), toRequest()

### Community 37 - "callback-app/app/page.tsx"
Cohesion: 0.10
Nodes (25): ComponentShowcase(), fixtureOrder, props, rows, NavigationFixture(), MeetingDialog(), MeetingDialogProps, NotFound() (+17 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (43): public.apply_stock_mutation(), public.save_contract(), public.save_meeting(), public.save_transfer(), trg_contract_amendments_immutable, trg_stock_movements_immutable, trg_ata_commitments_no_truncate, trg_audit_logs_no_truncate (+35 more)

### Community 39 - "identity.ts"
Cohesion: 0.21
Nodes (6): StaffCategory, CouncilRow, MembershipRow, SupabaseCouncilRepository, toCouncil(), toRow()

### Community 40 - "new-ata-form.tsx"
Cohesion: 0.12
Nodes (22): AtaExtension, ExtensionRequest, calculateContractAtaValue(), original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms (+14 more)

### Community 41 - "PurchaseRequestStatus"
Cohesion: 0.25
Nodes (9): Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, ReceiptOutcome, PurchaseRequestStatus, PurchaseRequestItem, RequestEvent (+1 more)

### Community 42 - "Attachment"
Cohesion: 0.38
Nodes (8): Attachment, attachmentIdSchema, prepareUploadSchema, uploadDocumentSchema, DocumentLinkStatus, ProcessAttachment, RetentionState, UploadStatus

### Community 43 - "db.ts"
Cohesion: 0.08
Nodes (35): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build) (+27 more)

### Community 44 - "repositories.ts"
Cohesion: 0.15
Nodes (23): pdf-lib, GET(), GET(), GET(), auditEvents(), buildDetailedReport(), date(), DetailedFilter (+15 more)

### Community 45 - "SupabasePurchaseRequestRepository"
Cohesion: 0.16
Nodes (15): mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText(), RequestDocumentKind (+7 more)

### Community 46 - "orders/service.test.ts"
Cohesion: 0.28
Nodes (4): InMemoryMaterialOrderRepository, Ctx, getStockLevel(), setup()

### Community 47 - "cleanup-eligibility.ts"
Cohesion: 0.12
Nodes (22): 5. Componentes existentes a reutilizar e mudanças propostas, lucide-react, CouncilWorkspace(), CouncilWorkspaceProps, ActionHub(), ActionItem, buildCouncilActions(), AvailableStockItem (+14 more)

### Community 48 - "public.profiles"
Cohesion: 0.10
Nodes (43): administrative_processes_responsible_membership, check_staff_membership, private.check_process_responsible_membership(), private.check_staff_membership(), private.has_council_access(), private.has_council_role(), private.has_request_access(), private.validate_meeting_details() (+35 more)

### Community 49 - "audit/service.ts"
Cohesion: 0.12
Nodes (17): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build, AuditTrailTabProps, AuditRepository (+9 more)

### Community 50 - "callback-app/app/layout.tsx"
Cohesion: 0.13
Nodes (23): StockEntrySource, isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine(), UI_MODES (+15 more)

### Community 51 - "processes.ts"
Cohesion: 0.13
Nodes (22): PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown(), selectTab(), ProcessViewProps, TabDefinition (+14 more)

### Community 52 - "PurchaseRequestStatus"
Cohesion: 0.09
Nodes (14): evidence, routes, sanitizeText(), sanitizeUrl(), destinations, @playwright/test@^1.65.1, envFiles, envNames (+6 more)

### Community 53 - "contracts/extract-pdf/route.ts"
Cohesion: 0.10
Nodes (22): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+14 more)

### Community 54 - "db.ts"
Cohesion: 0.08
Nodes (29): @supabase/supabase-js, MeetingStatus, toAta(), ContractRow, SupabaseContractRepository, toContract(), toPayload(), FormalizationRow (+21 more)

### Community 55 - "request-template.ts"
Cohesion: 0.16
Nodes (19): GET(), buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias(), normalizeHeader() (+11 more)

### Community 56 - "log"
Cohesion: 0.13
Nodes (15): GET, GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createResendSender(), createSupabaseJobRunRepository() (+7 more)

### Community 58 - "server/session.ts"
Cohesion: 0.09
Nodes (22): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, UX-17 — Recovery, callback e falha de provedor, @supabase/ssr (+14 more)

### Community 59 - "InMemoryMembershipRepository"
Cohesion: 0.09
Nodes (5): InMemoryMeetingRepository, MeetingDetails, setup(), InMemoryTransferRepository, setup()

### Community 60 - "next"
Cohesion: 0.12
Nodes (3): nextConfig, next, CouncilPickerProps

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "container.ts"
Cohesion: 0.05
Nodes (33): Contratos de serviço, AtaRepository, AtaService, ContractRepository, ContractService, StoragePort, CouncilRepository, MembershipRepository (+25 more)

### Community 63 - "result.ts"
Cohesion: 0.31
Nodes (8): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ALL_DOCUMENT_TYPES

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "public.meeting_action_items"
Cohesion: 0.29
Nodes (8): idx_meeting_action_items_meeting_id, idx_meeting_action_items_responsible_id, keep_meeting_task_completion, meeting_minutes_task_key, private.keep_meeting_task_completion(), public.meeting_action_items, public.meeting_task_completions, public.save_meeting()

### Community 66 - "document-types.ts"
Cohesion: 0.29
Nodes (6): ADDITIONAL_DOCUMENT_TYPE_CODES, ADDITIONAL_DOCUMENT_TYPES, AdditionalDocumentTypeCode, ALL_DOCUMENT_TYPE_CODES, AllDocumentTypeCode, REQUIRED_DOCUMENT_COUNT

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "LoadingState"
Cohesion: 0.10
Nodes (37): ACTION_LABEL, Content(), metadata, RetentionPage(), Content(), metadata, UsersPage(), Content() (+29 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "inventory.ts"
Cohesion: 0.17
Nodes (14): MovementType, StockBalance, InMemoryInventoryRepository, keyOf(), StockKey, StockMutation, StockRow, StockState (+6 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "Fluxos atuais e ideais"
Cohesion: 0.33
Nodes (5): Escopo e leitura das evidências, Fluxos atuais e ideais, Fluxos por módulo e rota, Limites, prioridade e aceitação global, Perfis e regras transversais

### Community 75 - "loadScreen"
Cohesion: 0.19
Nodes (17): AdministrationPage(), Content(), LINKS, metadata, kinds, ReportCentral(), AuditContent(), metadata (+9 more)

### Community 76 - "fail"
Cohesion: 0.09
Nodes (10): PriceRegistrationAta, DocumentService, refreshCompletion(), AdministrativeProcess, RetentionService, guard(), fail(), Result (+2 more)

### Community 77 - "ActionForm"
Cohesion: 0.08
Nodes (54): RetentionForms(), MembershipForms(), ProvisionCouncilForm(), StaffCategoryForm(), EditCouncilForm(), NewCouncilForm(), CloseContractForm(), NewMaterialForm() (+46 more)

### Community 78 - "formalizations/actions.ts"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "documents/service.ts"
Cohesion: 0.22
Nodes (10): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES (+2 more)

### Community 81 - "pg_temp.act_as"
Cohesion: 0.08
Nodes (18): on_auth_user_created, public.handle_new_user(), idx_administrative_processes_created_by, public.v_process_progress, notifications_pending_email_idx, public.record_notification_email_failure(), public.v_process_progress, administrative_processes_responsible_id_idx (+10 more)

### Community 83 - "processes/service.ts"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

### Community 84 - "badge.tsx"
Cohesion: 0.50
Nodes (4): class-variance-authority@^0.7.1, class-variance-authority, Badge(), badgeVariants

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem"
Cohesion: 0.13
Nodes (14): 1. Visão Geral e Contexto, 2. Requisitos e Casos de Uso, 3.1. Banco de Dados (PostgreSQL / Supabase), 3.2. Sequenciamento de Processos (`nextProcessNumber`), 3. Arquitetura e Modelo de Dados, 4.1. Formulário em `/solicitacoes/nova`, 4.2. Card em `/solicitacoes/[id]`, 4. Design de Interface (UI/UX) (+6 more)

### Community 88 - "2. Requisitos e Casos de Uso"
Cohesion: 0.14
Nodes (13): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, UC-01: Registro do Valor Estimado e Bloqueio de Estoque (+5 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.12
Nodes (15): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+7 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "process-history.ts"
Cohesion: 0.32
Nodes (8): ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, PROCESS_TRANSITIONS, ProcessStatus, ProcessRow

### Community 92 - "process-view.tsx"
Cohesion: 0.14
Nodes (27): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+19 more)

### Community 93 - "time.ts"
Cohesion: 0.12
Nodes (28): Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, ApprovalQueue(), PendingApprovalItem, DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor(), DashboardContent() (+20 more)

### Community 94 - "purchases/service.ts"
Cohesion: 0.15
Nodes (23): buildStockEntrySources(), RECEIVABLE, StockEntryItem, AtaView, assertContractAllowsReceive(), assertReceiveLinesWithinContract(), contractedQuantityByAtaItem(), ContractForReceiveGate (+15 more)

### Community 96 - "membership-forms.tsx"
Cohesion: 0.48
Nodes (5): Option, STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, COUNCIL_ROLE_LABELS, COUNCIL_ROLES

### Community 97 - "cnpj.ts"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 99 - "toFortalezaDate"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 112 - "atas.ts"
Cohesion: 0.09
Nodes (30): AtaBalance, CommitmentEvent, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation, validateAllocations(), validateCommitment() (+22 more)

### Community 113 - "formatCurrency"
Cohesion: 0.27
Nodes (12): handleApprove(), handleConfirmReject(), approveMaterialOrderAction(), cancelMaterialOrderAction(), createMaterialOrderAction(), extractCreatePayload(), extractOrderId(), extractRejectPayload() (+4 more)

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

### Community 119 - "suppliers/service.ts"
Cohesion: 0.23
Nodes (5): SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema

### Community 120 - "can"
Cohesion: 0.05
Nodes (50): Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.2. Serviços e Ações, 6. Estratégia de Testes, AuditRecorder, DocumentRepository, isVisibleAttachment(), PreparedUpload (+42 more)

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "media-actions.ts"
Cohesion: 0.14
Nodes (19): draftSchema, GET(), maxDuration, MeetingFile(), getUrl(), AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio() (+11 more)

### Community 123 - "toDate"
Cohesion: 0.11
Nodes (5): SupabaseInventoryRepository, SupabaseDocumentRepository, SupabaseStorage, toAttachment(), createSupabaseRepositories()

### Community 124 - "formalization-card.tsx"
Cohesion: 0.18
Nodes (10): AuthLayout(), LoginPage(), metadata, metadata, RecoveryPage(), metadata, PasswordPage(), AuthHeading() (+2 more)

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

### Community 131 - "council-picker.tsx"
Cohesion: 0.16
Nodes (16): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão) (+8 more)

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

### Community 139 - "SupabaseMeetingRepository"
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

### Community 150 - "InMemoryAuditRepository"
Cohesion: 0.12
Nodes (17): activeAta(), manager(), setup(), InMemoryAuditRepository, AuditService, InMemoryContractRepository, FailingRepository, input (+9 more)

### Community 151 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 152 - "analysis.ts"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 153 - "processes.ts"
Cohesion: 0.14
Nodes (17): AttachmentForProgress, CompletionEvent, CompletionState, CompletionTransition, DocumentalSnapshot, DocumentTypeCode, ATTACHMENT_PROGRESS_CRITERIA, DocumentalProgress (+9 more)

### Community 154 - "navigation.ts"
Cohesion: 0.16
Nodes (19): AuthenticatedShell(), AccessContext, ALL_ROLES, filterNavigation(), NAV_GROUPS, NAV_ITEMS, NavGroup, NavItem (+11 more)

### Community 161 - "react"
Cohesion: 0.16
Nodes (14): FixtureReady(), FixtureLayout(), react, CouncilsContent(), CouncilsPage(), metadata, CouncilContent(), CouncilPage() (+6 more)

### Community 189 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 945 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `stock.ts` to `Actor`, `council-picker.tsx`, `vitest`, `dependencies`, `solicitacoes/[id]/page.tsx`, `Screen`, `compact-document-row.tsx`, `ok`, `runAction`, `processes.ts`, `ModuleInsightFallback`, `unwrap`, `purchases/service.test.ts`, `result.ts`, `react`, `PageHeader`, `SupabasePurchaseRequestRepository`, `identity.ts`, `new-ata-form.tsx`, `db.ts`, `repositories.ts`, `db.ts`, `server/session.ts`, `container.ts`, `LoadingState`, `inventory.ts`, `loadScreen`, `fail`, `ActionForm`, `documents/service.ts`, `process-view.tsx`, `time.ts`, `purchases/service.ts`, `atas.ts`, `suppliers/service.ts`, `can`, `media-actions.ts`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `simple-table.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09728506787330317 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `simple-table.tsx`, `council-picker.tsx`, `pdf.ts`, `dependencies`, `formalization-card.tsx`, `stock.ts`, `ProcessFormalization`, `solicitacoes/[id]/page.tsx`, `notifications/service.ts`, `Screen`, `time.ts`, `processes-table.tsx`, `compact-document-row.tsx`, `ok`, `InMemoryAuditRepository`, `new-contract-form.tsx`, `.insert`, `navigation.ts`, `purchases/service.ts`, `navigation.ts`, `result.ts`, `react`, `price-research-form.tsx`, `callback-app/app/page.tsx`, `new-ata-form.tsx`, `db.ts`, `repositories.ts`, `SupabasePurchaseRequestRepository`, `orders/service.test.ts`, `cleanup-eligibility.ts`, `callback-app/app/layout.tsx`, `processes.ts`, `contracts/extract-pdf/route.ts`, `request-template.ts`, `log`, `server/session.ts`, `result.ts`, `callback-server.mjs`, `documents/service.ts`, `processes/service.ts`, `process-history.ts`, `process-view.tsx`, `time.ts`, `purchases/service.ts`, `cnpj.ts`, `atas.ts`, `formatCurrency`, `can`, `media-actions.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.10667634252539913 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `simple-table.tsx`, `council-picker.tsx`, `identity/actions.ts`, `formalization-card.tsx`, `solicitacoes/[id]/page.tsx`, `Screen`, `time.ts`, `processes-table.tsx`, `compact-document-row.tsx`, `package.json`, `ok`, `new-contract-form.tsx`, `runAction`, `navigation.ts`, `ModuleInsightFallback`, `purchases/service.ts`, `navigation.ts`, `result.ts`, `react`, `PageHeader`, `callback-app/app/page.tsx`, `db.ts`, `cleanup-eligibility.ts`, `callback-app/app/layout.tsx`, `processes.ts`, `contracts/extract-pdf/route.ts`, `log`, `server/session.ts`, `toast-store.ts`, `LoadingState`, `callback-server.mjs`, `loadScreen`, `ActionForm`, `processes/service.ts`, `process-view.tsx`, `time.ts`, `formatCurrency`, `media-actions.ts`, `formalization-card.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `formalization-card.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12311265969802555 - nodes in this community are weakly interconnected._