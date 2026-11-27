# Graph Report - warleysales-atas-push  (2026-11-27)

## Corpus Check
- 619 files · ~291,528 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 3709 nodes · 13110 edges · 179 communities (144 shown, 35 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 463 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1475b74a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- runAction
- Global Constraints
- lucide-react
- db.ts
- process-attachment-sheet.tsx
- simple-table.tsx
- result.ts
- InMemoryPurchaseRequestRepository
- inventory/service.ts
- MembershipRepository
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
- lucide-react
- Result
- AdministrativeProcess
- unwrap
- anon
- entry-sources.ts
- guard.ts
- documentation-tab.tsx
- toFortalezaDate
- FormField
- public.profiles
- Attachment
- suppliers/schemas.ts
- public.ata_items
- simple-table.tsx
- request-template.ts
- 20261102000006_fk_indexes.sql
- orders/actions.ts
- flow-guide.tsx
- process-view.tsx
- relatorios/page.tsx
- plan-calendar.ts
- AuditEntry
- groq.ts
- transfers/schemas.ts
- processes.ts
- Button
- contracts/actions.ts
- hold-rows.ts
- inventory.ts
- policy.ts
- notifications.ts
- documents/schemas.ts
- analysis.ts
- createSessionClient
- media-actions.ts
- Fluxos atuais e ideais
- callRpc
- navigation.ts
- components.json
- identity.ts
- processes.ts
- RetentionRepository
- meetings/service.ts
- Arquitetura (estado atual da implementação)
- compilerOptions
- toast-store.ts
- db.ts
- compilerOptions
- callback-server.mjs
- new-contract-form.tsx
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- file-upload.tsx
- Input
- ok
- ActionForm
- 20261102000001_identity.sql
- import-pca-crcpi-2027.mjs
- Council
- whatsapp.ts
- PDFReport
- atas/extract-pdf/route.ts
- processes.test.ts
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- time.ts
- formalization-queue.tsx
- formatCurrency
- @supabase/supabase-js
- ai-consent.test.ts
- check-supabase.mjs
- cnpj.ts
- order.ts
- repositories.ts
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- cleanup-eligibility.ts
- atas/service.ts
- next
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- orders/actions.ts
- Proposta funcional — página inicial Warley Gestão Operacional
- next
- Execução local, deploy e backups
- processes/service.ts
- process-actions.tsx
- react-dom
- InMemoryCouncilRepository
- Validação realmente executada
- atas-de-reuniao-operacao.md
- react
- Checklist de execução
- Execução dos blocos 1 e 2
- processes.test.ts
- Pendências e limitações conhecidas
- transfers/service.ts
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
- Contract
- service-support.ts
- identity/actions.ts
- documents/service.ts
- Global Constraints
- InventoryRepository
- SupabaseProcessRepository
- feedback-states.tsx
- Global Constraints
- Auditoria de desempenho do Warley
- reports/service.ts
- SupabaseDocumentRepository
- ProfileSummary
- cleanup-eligibility.ts
- dashboard-query.ts
- module-insight.ts
- 20261110000003_material_orders.sql
- movement-form.tsx
- container.ts

## God Nodes (most connected - your core abstractions)
1. `ok()` - 302 edges
2. `fail()` - 232 edges
3. `Result` - 206 edges
4. `Actor` - 134 edges
5. `next` - 123 edges
6. `vitest` - 115 edges
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
- `Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`)` --references--> `BriefingFacts`  [INFERRED]
  docs/superpowers/plans/2026-11-11-redesign-visao-geral-e-meu-painel.md → src/modules/insights/briefing.ts

## Import Cycles
- None detected.

## Communities (179 total, 35 thin omitted)

### Community 0 - "runAction"
Cohesion: 0.09
Nodes (49): zod, input, saveAppointment(), assertInstrumentsLinked(), parseMoney(), submitFormalizationFormAction(), provisionCouncilAccess(), schema (+41 more)

### Community 1 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem, Task 1: Migração SQL e Suporte a `process_id` nos Repositórios, Task 3: Orquestração na Criação de Solicitação (`createProcess`), Task 4: Formulário de Nova Solicitação e Server Action, Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`, Task 7: Verificação Geral e Execução da Migração no Supabase

### Community 2 - "lucide-react"
Cohesion: 0.07
Nodes (46): 5. Componentes existentes a reutilizar e mudanças propostas, Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, lucide-react, weekdays, PendingApprovalItem, CouncilWorkspace(), DashboardFilters(), DashboardFiltersProps (+38 more)

### Community 3 - "db.ts"
Cohesion: 0.16
Nodes (23): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+15 more)

### Community 4 - "process-attachment-sheet.tsx"
Cohesion: 0.10
Nodes (25): ComponentShowcase(), fixtureOrder, props, rows, NavigationFixture(), MeetingDialog(), MeetingDialogProps, NotFound() (+17 more)

### Community 5 - "simple-table.tsx"
Cohesion: 0.08
Nodes (53): ApprovalQueue(), ApprovalQueueProps, CouncilWorkspaceProps, AvailableStockItem, MaterialOrderDialog(), OrderItemRow, MaterialOrdersSection(), MaterialOrdersSectionProps (+45 more)

### Community 6 - "result.ts"
Cohesion: 0.08
Nodes (94): AuditPage(), AuditPageProps, Content(), metadata, one(), AdministrationPage(), Content(), LINKS (+86 more)

### Community 7 - "InMemoryPurchaseRequestRepository"
Cohesion: 0.07
Nodes (3): InMemoryMeetingRepository, isValidAttachment(), InMemoryPurchaseRequestRepository

### Community 8 - "inventory/service.ts"
Cohesion: 0.15
Nodes (32): none, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel, stockLevelLabel, applyMovement(), availableOf() (+24 more)

### Community 9 - "MembershipRepository"
Cohesion: 0.10
Nodes (5): MembershipRepository, InMemoryMembershipRepository, MembershipRecord, StaffCategory, SupabaseMembershipRepository

### Community 10 - "ProcessFormalization"
Cohesion: 0.10
Nodes (23): calculateSavings(), contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType (+15 more)

### Community 11 - "public.purchase_requests"
Cohesion: 0.06
Nodes (38): public.save_contract(), public.save_purchase_request(), trg_audit_logs_immutable, trg_contract_amendments_immutable, trg_contract_amendments_no_truncate, idx_contracts_supplier_id, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id (+30 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.05
Nodes (110): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, calendar_appointments_scope_date_idx, check_staff_membership, council_memberships_one_director, idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_extensions_requested_by (+102 more)

### Community 13 - "notifications/service.ts"
Cohesion: 0.26
Nodes (6): digestMessage(), dispatchNotificationEmails(), EmailDispatchSummary, EmailMessage, EmailSender, groupByRecipient()

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (32): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+24 more)

### Community 15 - "purchases/service.ts"
Cohesion: 0.14
Nodes (17): Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, applyReceipt(), ReceiptItemResult, ReceiptItemState, ReceiptLine (+9 more)

### Community 16 - "fail"
Cohesion: 0.11
Nodes (6): AtaRepository, PriceRegistrationAta, Meeting, guard(), Actor, parseInput()

### Community 17 - "InMemoryAuditRepository"
Cohesion: 0.13
Nodes (28): InMemoryAtaRepository, AtaService, setup(), InMemoryAuditRepository, AuditService, InMemoryContractRepository, ContractService, FailingRepository (+20 more)

### Community 18 - "vitest"
Cohesion: 0.10
Nodes (35): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+27 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.09
Nodes (48): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+40 more)

### Community 20 - "package.json"
Cohesion: 0.12
Nodes (22): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5, @types/react@^19 (+14 more)

### Community 21 - "purchases/service.test.ts"
Cohesion: 0.12
Nodes (12): InMemoryStorage, createProcessWithProgress(), Ctx, PDF, DOCUMENT_TYPE_CODES, approver(), ataItem(), manager() (+4 more)

### Community 22 - "lucide-react"
Cohesion: 0.06
Nodes (46): CalendarReportPanelProps, MonthDialog(), MonthDialogProps, citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes() (+38 more)

### Community 23 - "Result"
Cohesion: 0.06
Nodes (16): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build (+8 more)

### Community 24 - "AdministrativeProcess"
Cohesion: 0.10
Nodes (5): 3.3. Repositório e Camada de Domínio, Attachment, refreshCompletion(), AdministrativeProcess, internalError()

### Community 25 - "unwrap"
Cohesion: 0.10
Nodes (9): SupabaseNotificationRepository, toNotification(), SupabaseMaterialOrderRepository, toOrder(), SupabaseRetentionRepository, toDateOrNull(), toIso(), unwrap() (+1 more)

### Community 26 - "anon"
Cohesion: 0.12
Nodes (25): public.apply_stock_mutation(), public.correct_purchase_request(), public.register_process_ata(), public.register_process_ata_for_winner(), public.set_document_exception(), public.set_process_contracting_mode(), public.set_process_estimated_value(), public.set_process_validity_start_date() (+17 more)

### Community 27 - "entry-sources.ts"
Cohesion: 0.17
Nodes (21): buildStockEntrySources(), RECEIVABLE, StockEntryItem, assertContractAllowsReceive(), assertReceiveLinesWithinContract(), contractedQuantityByAtaItem(), ContractForReceiveGate, maxReceivableAgainstContract() (+13 more)

### Community 28 - "guard.ts"
Cohesion: 0.22
Nodes (6): 6. Estratégia de Testes, authorize(), PermissionAction, admin, Role, roleMatrix

### Community 29 - "documentation-tab.tsx"
Cohesion: 0.07
Nodes (44): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contract_receipt_line_integrity, contract_receipt_lines_contract_idx, contracts_ata_id_idx, idx_ata_commitments_council_id (+36 more)

### Community 30 - "toFortalezaDate"
Cohesion: 0.23
Nodes (14): auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, first(), kinds, parseDetailedFilter() (+6 more)

### Community 31 - "FormField"
Cohesion: 0.14
Nodes (16): AuthLayout(), FieldShell(), LoginForm(), LoginPage(), metadata, metadata, RecoveryPage(), RecoveryForm() (+8 more)

### Community 32 - "public.profiles"
Cohesion: 0.12
Nodes (32): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+24 more)

### Community 33 - "Attachment"
Cohesion: 0.08
Nodes (23): dependencies, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, next@16.4.6 (+15 more)

### Community 34 - "suppliers/schemas.ts"
Cohesion: 0.38
Nodes (7): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits(), createSupplierSchema, supplierFields, updateSupplierSchema

### Community 35 - "public.ata_items"
Cohesion: 0.09
Nodes (20): public.create_contract_with_ata(), public.append_commitment_event(), public.save_ata(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate, trg_ata_extensions_no_truncate (+12 more)

### Community 36 - "simple-table.tsx"
Cohesion: 0.09
Nodes (43): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessesTable() (+35 more)

### Community 37 - "request-template.ts"
Cohesion: 0.15
Nodes (20): GET(), ExtractedPurchaseRequest, buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias() (+12 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.05
Nodes (34): public.apply_stock_mutation(), public.save_transfer(), trg_stock_movements_immutable, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+26 more)

### Community 39 - "orders/actions.ts"
Cohesion: 0.36
Nodes (7): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract

### Community 40 - "flow-guide.tsx"
Cohesion: 0.15
Nodes (8): PROCESS_FLOW_STEPS, REQUEST_FLOW_STEPS, REQUEST_LIFECYCLE, REQUEST_RAIL_ALIAS, FlowGuide(), FlowStep, LifecycleStep, NextStepProps

### Community 41 - "process-view.tsx"
Cohesion: 0.16
Nodes (5): changeRequestStatus(), AtomicDecision, PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService

### Community 42 - "relatorios/page.tsx"
Cohesion: 0.14
Nodes (20): ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), AuditTrailTabProps, ENTITY_LABELS, extractJustificationOrDetails(), formatActionLabel(), formatEntityLabel() (+12 more)

### Community 43 - "plan-calendar.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 44 - "AuditEntry"
Cohesion: 0.20
Nodes (9): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange() (+1 more)

### Community 45 - "groq.ts"
Cohesion: 0.18
Nodes (19): BriefingCard(), BriefingFallback(), BRIEFING_SYSTEM_PROMPT, BriefingFacts, briefingSchema, briefingUsesOnlyKnownNumbers(), buildBriefingFacts(), coerceBriefing() (+11 more)

### Community 46 - "transfers/schemas.ts"
Cohesion: 0.27
Nodes (9): ALERT_MILESTONES, AlertCandidate, dedupKey(), DueAlert, reachedMilestone(), selectDueAlerts(), AlertRunSummary, markReadSchema (+1 more)

### Community 47 - "processes.ts"
Cohesion: 0.16
Nodes (15): mammoth@^1.13.0, mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText() (+7 more)

### Community 48 - "Button"
Cohesion: 0.13
Nodes (25): MeetingDetailsEditor(), MeetingFile(), getUrl(), MeetingMinutesEditor(), MeetingStatusEditor(), MeetingTaskEditor(), Option, AUDIO_TYPES (+17 more)

### Community 49 - "contracts/actions.ts"
Cohesion: 0.19
Nodes (16): AtaExtension, ExtensionRequest, original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms, currentTerms() (+8 more)

### Community 50 - "hold-rows.ts"
Cohesion: 0.47
Nodes (4): contractedMaterialsByProcess(), HoldItemInput, HoldRow, AtaView

### Community 51 - "inventory.ts"
Cohesion: 0.12
Nodes (20): MovementType, StockBalance, keyOf(), StockKey, StockMutation, StockRow, StockState, createMaterialSchema (+12 more)

### Community 52 - "policy.ts"
Cohesion: 0.13
Nodes (19): buildAtaBalanceRows(), AtaPage(), Content(), metadata, CloseContractForm(), Content(), ContractPage(), metadata (+11 more)

### Community 53 - "notifications.ts"
Cohesion: 0.19
Nodes (7): AlertEntityType, AlertMilestone, AlertSource, NotificationRepository, AppNotification, ExpiringItem, NotificationRow

### Community 54 - "documents/schemas.ts"
Cohesion: 0.17
Nodes (16): NewAtaForm(), Option, ProcessOption, RequestMaterial, suggestAtaNumber(), SupplierOption, ataStepFormAction(), createAtaFormAction() (+8 more)

### Community 55 - "analysis.ts"
Cohesion: 0.32
Nodes (9): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+1 more)

### Community 56 - "createSessionClient"
Cohesion: 0.13
Nodes (14): GET, GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createResendSender(), createSupabaseJobRunRepository() (+6 more)

### Community 57 - "media-actions.ts"
Cohesion: 0.16
Nodes (17): draftSchema, GET(), maxDuration, saveAudio(), audioPath(), claimed(), manager, mocks (+9 more)

### Community 58 - "Fluxos atuais e ideais"
Cohesion: 0.08
Nodes (21): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Escopo e confiança, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, UX-17 — Recovery, callback e falha de provedor, @supabase/ssr@^0.12.7 (+13 more)

### Community 59 - "callRpc"
Cohesion: 0.13
Nodes (8): toPayload(), SupabaseContractRepository, toContract(), toPayload(), SupabaseMeetingRepository, toMeeting(), toPayload(), callRpc()

### Community 60 - "navigation.ts"
Cohesion: 0.19
Nodes (16): AccessContext, ALL_ROLES, NAV_GROUPS, NAV_ITEMS, NavGroup, NavItem, STAFF_ROLES, CollapsedGroup() (+8 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "identity.ts"
Cohesion: 0.18
Nodes (9): CouncilRepository, Council, MembershipDirectory, CouncilRow, MembershipRow, SupabaseCouncilRepository, toCouncil(), toRow() (+1 more)

### Community 63 - "processes.ts"
Cohesion: 0.14
Nodes (17): AttachmentForProgress, DocumentalSnapshot, ADDITIONAL_DOCUMENT_TYPE_CODES, ADDITIONAL_DOCUMENT_TYPES, AdditionalDocumentTypeCode, ALL_DOCUMENT_TYPE_CODES, ALL_DOCUMENT_TYPES, AllDocumentTypeCode (+9 more)

### Community 64 - "RetentionRepository"
Cohesion: 0.19
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "meetings/service.ts"
Cohesion: 0.16
Nodes (11): MeetingStatus, MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, MeetingDetails, meetingDetailsSchema, MeetingMinutes (+3 more)

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
Cohesion: 0.12
Nodes (16): Frontend, API e banco, CommitmentEvent, AtaStatus, AtaRow, CommitmentRow, toAta(), toCommitment(), BUSINESS_CODES (+8 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "new-contract-form.tsx"
Cohesion: 0.16
Nodes (14): matchPdfItems(), ContractAtaOption, NewContractForm(), Option, ProcessOption, SupplierOption, addAmendmentFormAction(), closeContractFormAction() (+6 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "file-upload.tsx"
Cohesion: 0.12
Nodes (23): ArchiveProcessAction(), PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView(), handleTabKeyDown(), selectTab(), ProcessViewProps (+15 more)

### Community 75 - "Input"
Cohesion: 0.21
Nodes (14): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), CorrectionForm(), Item, Input() (+6 more)

### Community 76 - "ok"
Cohesion: 0.11
Nodes (9): reopenRejected(), SupplierRepository, Supplier, context(), SupabaseSupplierRepository, isUniqueViolation(), rpcOutcomeToResult(), fail() (+1 more)

### Community 77 - "ActionForm"
Cohesion: 0.09
Nodes (42): Option, RetentionForms(), MembershipForms(), Option, ProvisionCouncilForm(), StaffCategoryForm(), MarkReadForm(), EditCouncilForm() (+34 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "import-pca-crcpi-2027.mjs"
Cohesion: 0.12
Nodes (26): assertOk(), buildNote(), cleanText(), contractingForm(), groupLabel(), loadEnv(), main(), moneyBr() (+18 more)

### Community 80 - "Council"
Cohesion: 0.24
Nodes (9): STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, assignMembershipSchema, councilFields, createCouncilSchema, removeMembershipSchema, updateCouncilSchema, COUNCIL_ROLE_LABELS (+1 more)

### Community 81 - "whatsapp.ts"
Cohesion: 0.53
Nodes (4): formatWhatsapp(), onlyDigits(), parseWhatsapp(), WhatsappParse

### Community 83 - "atas/extract-pdf/route.ts"
Cohesion: 0.17
Nodes (18): pdf-lib, GET(), GET(), GET(), AuthenticatedShell(), AppLayout(), Home(), RedirectHome() (+10 more)

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
Cohesion: 0.12
Nodes (15): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+7 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "time.ts"
Cohesion: 0.09
Nodes (47): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), AgendaBoard(), dateLabel() (+39 more)

### Community 92 - "formalization-queue.tsx"
Cohesion: 0.15
Nodes (14): Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, @base-ui/react, FormalizationQueue(), handleQuickHomologate(), FormalizationQueueProps, INSTRUMENT_LABELS, PendingFormalizationItem, homologateFormalizationAction() (+6 more)

### Community 93 - "formatCurrency"
Cohesion: 0.10
Nodes (32): AtaBalancePanel(), AtaBalanceRow, INSTRUMENT_LABELS, SavingsHistoryDialog(), SavingsHistoryDialogProps, SavingsHistoryItem, SavingsSummaryProps, auctionLabel() (+24 more)

### Community 94 - "@supabase/supabase-js"
Cohesion: 0.18
Nodes (15): @supabase/supabase-js@^2.118.0, @supabase/supabase-js, changeMeetingStatus(), MEETING_TRANSITIONS, changeTransferStatus(), HOLDS_RESERVATION, receiveEffect(), stockEffectFor() (+7 more)

### Community 95 - "ai-consent.test.ts"
Cohesion: 0.27
Nodes (3): SupabasePurchaseRequestRepository, toPayload(), toRequest()

### Community 96 - "check-supabase.mjs"
Cohesion: 0.07
Nodes (21): evidence, routes, sanitizeText(), sanitizeUrl(), destinations, @playwright/test@^1.65.1, envFiles, envNames (+13 more)

### Community 97 - "cnpj.ts"
Cohesion: 0.36
Nodes (7): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso()

### Community 98 - "order.ts"
Cohesion: 0.10
Nodes (30): Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), approveMaterialOrder(), approveOrder, cancelMaterialOrder(), cancelOrder, changeMaterialOrderStatus(), changeOrderStatus, createMaterialOrder() (+22 more)

### Community 99 - "repositories.ts"
Cohesion: 0.12
Nodes (6): SupabaseAtaRepository, SupabaseAuditRepository, SupabaseStorage, SupabaseTransferRepository, toTransfer(), createSupabaseRepositories()

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 112 - "atas/service.ts"
Cohesion: 0.15
Nodes (23): AtaBalance, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation, validateAllocations(), validateCommitment(), ATA_INITIAL_YEARS (+15 more)

### Community 113 - "next"
Cohesion: 0.11
Nodes (5): nextConfig, next, metadata, NewCouncilPage(), CouncilPickerProps

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
Cohesion: 0.16
Nodes (16): OrderQueue(), handleApprove(), handleConfirmReject(), MaterialOrderForm(), handleSubmit(), resetForm(), approveMaterialOrderAction(), cancelMaterialOrderAction() (+8 more)

### Community 119 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.12
Nodes (15): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 6. Valores, estados e mensagens: salvaguardas, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação (+7 more)

### Community 120 - "next"
Cohesion: 0.33
Nodes (5): Escopo e leitura das evidências, Fluxos atuais e ideais, Fluxos por módulo e rota, Limites, prioridade e aceitação global, Perfis e regras transversais

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "processes/service.ts"
Cohesion: 0.20
Nodes (12): LinkedProcessCardProps, formatProcessNumber(), parseProcessNumber(), DocumentalProgress, changeProcessStatusSchema, classifyProcessSchema, CreateProcessInput, createProcessSchema (+4 more)

### Community 123 - "process-actions.tsx"
Cohesion: 0.28
Nodes (9): ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, changeProcessStatus(), PROCESS_TRANSITIONS, ProcessStatus (+1 more)

### Community 124 - "react-dom"
Cohesion: 0.17
Nodes (14): react-dom, baseAtas, baseContracts, baseDeliveries, baseStock, buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary() (+6 more)

### Community 126 - "Validação realmente executada"
Cohesion: 0.29
Nodes (6): 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado, 2. Postgres 16 local (descartável) com stub do Supabase, 3. Aplicação, 4. Limitações resolvidas nesta rodada, Bugs encontrados pelos testes e corrigidos, Validação realmente executada

### Community 128 - "react"
Cohesion: 0.25
Nodes (6): FixtureReady(), FixtureLayout(), react, RetryButton(), refresh, startTransition

### Community 129 - "Checklist de execução"
Cohesion: 0.29
Nodes (6): Checklist de execução, Checklist UX-27 — hierarquia do dashboard por perfil, Portões, Preparação executada, Regressão e critérios transversais, Verificações por rota

### Community 130 - "Execução dos blocos 1 e 2"
Cohesion: 0.29
Nodes (6): Decisões adicionais dos blocos 1 e 2, Decisões pendentes do bloco 3, Estado por ID, Execução dos blocos 1 e 2, Restrições e resultados de navegador, Verificações após correções

### Community 131 - "processes.test.ts"
Cohesion: 0.28
Nodes (9): buildSnapshot(), CompletionEvent, CompletionState, CompletionTransition, effectiveProgressPercent(), reevaluateCompletion(), allSeven(), attach() (+1 more)

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 134 - "transfers/service.ts"
Cohesion: 0.27
Nodes (4): InMemoryTransferRepository, TransferRepository, Transfer, setup()

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

### Community 151 - "service-support.ts"
Cohesion: 0.19
Nodes (10): advanceTransferSchema, requestTransferSchema, TransferEvent, TransferItem, ContractRow, dateOnlySchema, IdGenerator, idSchema (+2 more)

### Community 152 - "identity/actions.ts"
Cohesion: 0.33
Nodes (10): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+2 more)

### Community 153 - "documents/service.ts"
Cohesion: 0.20
Nodes (15): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), attachmentIdSchema, isVisibleAttachment() (+7 more)

### Community 154 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

### Community 157 - "SupabaseProcessRepository"
Cohesion: 0.29
Nodes (5): snapshotToJson(), SupabaseProcessRepository, toProcess(), toProcessChanges(), toIsoOrNull()

### Community 159 - "feedback-states.tsx"
Cohesion: 0.31
Nodes (7): Loading(), GlobalError(), DataSourceUnavailableState(), ErrorState(), ForbiddenState(), StateShell(), StateShellProps

### Community 160 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build)

### Community 161 - "Auditoria de desempenho do Warley"
Cohesion: 0.20
Nodes (9): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão, Medições e limites (+1 more)

### Community 162 - "reports/service.ts"
Cohesion: 0.31
Nodes (8): StockSectionProps, ContractView, StockLevelView, DashboardAttention, DashboardDeadline, DashboardSnapshot, ScopedData, SummaryFilter

### Community 166 - "cleanup-eligibility.ts"
Cohesion: 0.40
Nodes (5): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), addDaysToInstant()

### Community 170 - "dashboard-query.ts"
Cohesion: 0.40
Nodes (5): DASHBOARD_FOCUS, first(), focusSchema, parseDashboardQuery(), uuid

### Community 171 - "module-insight.ts"
Cohesion: 0.50
Nodes (3): generateModuleInsight(), ModuleFact, ModuleInsightResult

### Community 173 - "20261110000003_material_orders.sql"
Cohesion: 0.42
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 175 - "movement-form.tsx"
Cohesion: 0.10
Nodes (28): 3.1 Encerramento de Processo com Documentação Parcial, 3.2 Recebimento de Materiais com Saldo Pendente, 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%), StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line (+20 more)

### Community 180 - "container.ts"
Cohesion: 0.11
Nodes (28): Contratos de serviço, Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.2. Serviços e Ações, AuditRecorder, DocumentRepository, StoragePort, DocumentService (+20 more)

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 951 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `runAction`, `lucide-react`, `simple-table.tsx`, `result.ts`, `transfers/service.ts`, `inventory/service.ts`, `MembershipRepository`, `ProcessFormalization`, `purchases/service.ts`, `fail`, `InMemoryAuditRepository`, `vitest`, `documentation-tab.tsx`, `purchases/service.test.ts`, `Contract`, `Result`, `AdministrativeProcess`, `documents/service.ts`, `service-support.ts`, `InventoryRepository`, `guard.ts`, `entry-sources.ts`, `toFortalezaDate`, `SupabaseProcessRepository`, `reports/service.ts`, `process-view.tsx`, `relatorios/page.tsx`, `module-insight.ts`, `groq.ts`, `transfers/schemas.ts`, `Button`, `contracts/actions.ts`, `inventory.ts`, `policy.ts`, `container.ts`, `media-actions.ts`, `Fluxos atuais e ideais`, `identity.ts`, `processes.ts`, `meetings/service.ts`, `db.ts`, `Council`, `time.ts`, `@supabase/supabase-js`, `order.ts`, `atas/service.ts`, `processes/service.ts`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `runAction` be split into smaller, more focused modules?**
  _Cohesion score 0.08732394366197183 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `runAction`, `react`, `lucide-react`, `processes.test.ts`, `process-attachment-sheet.tsx`, `simple-table.tsx`, `db.ts`, `inventory/service.ts`, `ProcessFormalization`, `notifications/service.ts`, `purchases/service.ts`, `InMemoryAuditRepository`, `documentation-tab.tsx`, `package.json`, `purchases/service.test.ts`, `lucide-react`, `documents/service.ts`, `entry-sources.ts`, `guard.ts`, `toFortalezaDate`, `suppliers/schemas.ts`, `simple-table.tsx`, `request-template.ts`, `orders/actions.ts`, `relatorios/page.tsx`, `plan-calendar.ts`, `module-insight.ts`, `groq.ts`, `transfers/schemas.ts`, `movement-form.tsx`, `processes.ts`, `contracts/actions.ts`, `hold-rows.ts`, `documents/schemas.ts`, `analysis.ts`, `createSessionClient`, `media-actions.ts`, `Fluxos atuais e ideais`, `navigation.ts`, `callback-server.mjs`, `new-contract-form.tsx`, `file-upload.tsx`, `Input`, `ok`, `whatsapp.ts`, `atas/extract-pdf/route.ts`, `time.ts`, `formalization-queue.tsx`, `formatCurrency`, `@supabase/supabase-js`, `cnpj.ts`, `order.ts`, `atas/service.ts`, `orders/actions.ts`, `process-actions.tsx`, `react-dom`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.07219662058371736 - nodes in this community are weakly interconnected._
- **Why does `fail()` connect `ok` to `runAction`, `result.ts`, `transfers/service.ts`, `inventory/service.ts`, `MembershipRepository`, `ProcessFormalization`, `purchases/service.ts`, `fail`, `InMemoryAuditRepository`, `vitest`, `documentation-tab.tsx`, `purchases/service.test.ts`, `Contract`, `Result`, `AdministrativeProcess`, `documents/service.ts`, `identity/actions.ts`, `InventoryRepository`, `guard.ts`, `entry-sources.ts`, `toFortalezaDate`, `SupabaseProcessRepository`, `service-support.ts`, `reports/service.ts`, `process-view.tsx`, `relatorios/page.tsx`, `groq.ts`, `transfers/schemas.ts`, `Button`, `contracts/actions.ts`, `inventory.ts`, `container.ts`, `policy.ts`, `media-actions.ts`, `Fluxos atuais e ideais`, `identity.ts`, `processes.ts`, `meetings/service.ts`, `db.ts`, `Council`, `time.ts`, `@supabase/supabase-js`, `order.ts`, `atas/service.ts`, `processes/service.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `process-attachment-sheet.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09988385598141696 - nodes in this community are weakly interconnected._