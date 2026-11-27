# Graph Report - Warleysales  (2026-11-27)

## Corpus Check
- 618 files · ~285,625 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 3731 nodes · 12885 edges · 196 communities (147 shown, 49 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 461 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d822d757`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- purchases/service.ts
- transfers.ts
- lucide-react
- pdf.ts
- identity/actions.ts
- vitest
- purchases/service.test.ts
- new-ata-form.tsx
- ok
- MaterialOrder
- ProcessFormalization
- contracts/actions.ts
- apply_all.sql
- notifications/service.ts
- Tarefas
- public.forbid_mutation
- react
- public.create_contract_with_ata
- simple-table.tsx
- documentation-tab.tsx
- package.json
- plan-calendar.ts
- purchases/service.test.ts
- new-contract-form.tsx
- can
- unwrap
- public.correct_purchase_request
- PurchaseRequest
- Auditoria de desempenho do Warley
- meetings/service.ts
- ref_node_fs
- next
- 20261102000002_domain_tables.sql
- 20261116000001_notification_emails.sql
- processes/schemas.ts
- inventory/actions.ts
- public.purchase_requests
- Button
- 20261102000006_fk_indexes.sql
- Global Constraints
- container.ts
- container.ts
- public.purchase_requests
- Proposta funcional — página inicial Warley Gestão Operacional
- toFortalezaDate
- processes.ts
- private.business_error
- material-order-dialog.tsx
- public.profiles
- AuditEntry
- movement-form.tsx
- process-view.tsx
- @playwright/test
- atas/extract-pdf/route.ts
- db.ts
- request-template.ts
- handler.ts
- public.stock_movements
- createSessionClient
- reunioes/page.tsx
- button.tsx
- components.json
- identity/service.ts
- process-history.ts
- RetentionRepository
- filters.tsx
- public.receive_purchase_request_for_contract
- compilerOptions
- toast-store.ts
- groq.ts
- compilerOptions
- callback-server.mjs
- audit-trail-tab.tsx
- Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"
- runAction
- relatorios/page.tsx
- fail
- ActionForm
- 20261102000001_identity.sql
- seed-demo.mjs
- documents/service.ts
- pg_temp.act_as
- PDFReport
- analysis.ts
- link-process-form.tsx
- scripts
- Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem
- public.record_meeting_evidence
- 2. Requisitos e Casos de Uso
- Arquitetura proposta
- Proposta de experiência simplificada
- process-actions.tsx
- agenda-board.tsx
- public.councils
- atas.ts
- getSession
- ai-consent.test.ts
- cnpj.ts
- Global Constraints
- 20261110000003_material_orders.sql
- concorrencia.sh
- bundle-migrations.sh script
- vercel.json
- Fase 1 — Descoberta e Arquitetura (fonte da verdade)
- direct-upload.test.ts
- atas.ts
- order-queue.tsx
- Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria
- Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos
- Global Constraints
- Plano de testes e validação UX
- formalizations/service.test.ts
- fail
- policy.test.ts
- Execução local, deploy e backups
- media-actions.ts
- repositories.ts
- formalization-card.tsx
- briefing.ts
- Validação realmente executada
- atas-de-reuniao-operacao.md
- Global Constraints
- Checklist de execução
- Execução dos blocos 1 e 2
- formalizations/actions.ts
- Pendências e limitações conhecidas
- processes.test.ts
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
- InMemoryAuditRepository
- check-supabase.mjs
- Arquitetura (estado atual da implementação)
- documents/service.ts
- provision-action.ts
- briefing-card.tsx
- playwright.config.ts
- private.validate_meeting_details
- council-picker.tsx
- purchases/actions.ts
- file-upload.tsx
- auth-stage.tsx
- 20261126020200_process_assignment_contract_closure.sql
- auth.users
- public.spec.ts
- bundle-migrations.mjs
- validate-corrections.mjs
- compact-document-row.test.tsx
- 002_validacao_sem_pgtap.sql
- 003_fluxos_atomicos.sql
- next.config.ts
- Global Constraints
- cleanup-eligibility.ts
- alertas/route.ts

## God Nodes (most connected - your core abstractions)
1. `ok()` - 300 edges
2. `fail()` - 232 edges
3. `Result` - 206 edges
4. `Actor` - 134 edges
5. `next` - 121 edges
6. `vitest` - 112 edges
7. `react` - 96 edges
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

## Communities (196 total, 49 thin omitted)

### Community 0 - "purchases/service.ts"
Cohesion: 0.07
Nodes (45): buildStockEntrySources(), RECEIVABLE, StockEntryItem, StockSectionProps, LinkedProcessCardProps, Props, AtaView, StockLevelView (+37 more)

### Community 1 - "transfers.ts"
Cohesion: 0.17
Nodes (11): TransferStatus, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferEvent, TransferItem, SupabaseTransferRepository (+3 more)

### Community 2 - "lucide-react"
Cohesion: 0.07
Nodes (56): weekdays, ApprovalQueueProps, DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview(), RequestsOverview(), Row() (+48 more)

### Community 3 - "pdf.ts"
Cohesion: 0.17
Nodes (21): branding(), download(), GET(), demoCouncilIds(), hasOperationalData(), savingsForExport(), ACTION_LABELS, auditDetails() (+13 more)

### Community 4 - "identity/actions.ts"
Cohesion: 0.33
Nodes (10): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+2 more)

### Community 5 - "vitest"
Cohesion: 0.12
Nodes (27): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, input (+19 more)

### Community 6 - "purchases/service.test.ts"
Cohesion: 0.24
Nodes (9): InMemoryProcessRepository, requestInReview(), approver(), ataItem(), manager(), stockOf(), submitted(), MemoryTable (+1 more)

### Community 7 - "new-ata-form.tsx"
Cohesion: 0.14
Nodes (18): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), matchPdfItems(), NewAtaForm(), Option (+10 more)

### Community 8 - "ok"
Cohesion: 0.06
Nodes (63): Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado), Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`), Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais, none, classifyStockLevel(), CRITICAL_RATIO, reconciliationDifference(), StockLevel (+55 more)

### Community 9 - "MaterialOrder"
Cohesion: 0.08
Nodes (22): MaterialOrderDialogProps, MaterialOrderFormProps, MaterialOrderFilter, MaterialOrderRepository, InMemoryMaterialOrderRepository, ApproveMaterialOrderInput, approveMaterialOrderSchema, CancelMaterialOrderInput (+14 more)

### Community 10 - "ProcessFormalization"
Cohesion: 0.10
Nodes (18): contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema, HomologateFormalizationInput, homologateFormalizationSchema, InstrumentType, instrumentTypes (+10 more)

### Community 11 - "contracts/actions.ts"
Cohesion: 0.19
Nodes (16): AmendmentForm(), CloseContractForm(), Content(), ContractPage(), metadata, addAmendmentFormAction(), closeContractFormAction(), createContractFormAction() (+8 more)

### Community 12 - "apply_all.sql"
Cohesion: 0.07
Nodes (51): administrative_processes_responsible_id_idx, calendar_appointments_scope_date_idx, council_memberships_one_director, idx_administrative_processes_created_by, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_audit_logs_actor_id (+43 more)

### Community 13 - "notifications/service.ts"
Cohesion: 0.06
Nodes (31): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract, RepositoryAlertSource (+23 more)

### Community 14 - "Tarefas"
Cohesion: 0.06
Nodes (31): Ordem e checkpoints, Regras, Roadmap de implementação, Tarefas, UX-01 — Verificar isolamento E2E existente, UX-02 — Tornar compra/recebimento íntegros, UX-03 — Verificar policy e guards por serviço, UX-04 — Corrigir ajuste e linhas de solicitação (+23 more)

### Community 15 - "public.forbid_mutation"
Cohesion: 0.09
Nodes (31): idx_ata_allocations_council_id, idx_ata_commitments_council_id, idx_ata_extensions_requested_by, idx_ata_items_material_id, idx_price_registration_atas_process_id, idx_price_registration_atas_supplier_id, idx_stock_movements_actor_id, idx_stock_movements_material_id (+23 more)

### Community 16 - "react"
Cohesion: 0.06
Nodes (50): Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas, FixtureReady(), FixtureLayout(), @base-ui/react, react, react-dom, ApprovalQueue(), PendingApprovalItem (+42 more)

### Community 17 - "public.create_contract_with_ata"
Cohesion: 0.09
Nodes (19): public.save_ata(), public.save_contract(), trg_ata_extensions_immutable, trg_contract_amendments_immutable, trg_ata_extensions_no_truncate, idx_ata_allocations_council_id, idx_ata_extensions_requested_by, idx_contracts_supplier_id (+11 more)

### Community 18 - "simple-table.tsx"
Cohesion: 0.08
Nodes (43): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessesTable() (+35 more)

### Community 19 - "documentation-tab.tsx"
Cohesion: 0.14
Nodes (33): Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo, Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`, 4.3. Componente `ProcessAttachmentSheet` em `/processos`, ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected() (+25 more)

### Community 20 - "package.json"
Cohesion: 0.05
Nodes (47): eslintConfig, dependencies, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0 (+39 more)

### Community 21 - "plan-calendar.ts"
Cohesion: 0.06
Nodes (45): MonthDialog(), MonthDialogProps, citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME (+37 more)

### Community 22 - "purchases/service.test.ts"
Cohesion: 0.05
Nodes (11): InMemoryContractRepository, FailingRepository, InMemoryDocumentRepository, InMemoryCouncilRepository, InMemoryMeetingRepository, MeetingDetails, InMemoryPurchaseRequestRepository, InMemorySupplierRepository (+3 more)

### Community 23 - "new-contract-form.tsx"
Cohesion: 0.18
Nodes (19): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), ContractAtaOption, NewContractForm() (+11 more)

### Community 24 - "can"
Cohesion: 0.17
Nodes (22): zod, input, saveAppointment(), saveProcessContractingMode(), saveProcessEstimatedValue(), documentExceptionAction(), lineSchema, saveProcessPriceResearch() (+14 more)

### Community 25 - "unwrap"
Cohesion: 0.09
Nodes (6): SupabaseMembershipRepository, SupabaseNotificationRepository, SupabaseDocumentRepository, toAttachment(), SupabaseRetentionRepository, unwrap()

### Community 26 - "public.correct_purchase_request"
Cohesion: 0.13
Nodes (10): trg_audit_logs_immutable, idx_administrative_processes_created_by, idx_audit_logs_actor_id, public.correct_purchase_request(), public.set_document_exception(), public.v_process_progress, public.set_process_estimated_value(), public.set_process_validity_start_date() (+2 more)

### Community 27 - "PurchaseRequest"
Cohesion: 0.16
Nodes (7): Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%), 3.3. Repositório e Camada de Domínio, changeRequestStatus(), PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService, Actor

### Community 28 - "Auditoria de desempenho do Warley"
Cohesion: 0.18
Nodes (10): Arquitetura e caminho dos dados, Auditoria de desempenho do Warley, Diagnóstico executivo, Frontend, API e banco, Gargalos priorizados, IA, Implementação posterior à auditoria, Matriz de regressão (+2 more)

### Community 29 - "meetings/service.ts"
Cohesion: 0.10
Nodes (22): changeMeetingStatus(), MEETING_TRANSITIONS, MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting, meetingDetailsSchema (+14 more)

### Community 31 - "next"
Cohesion: 0.07
Nodes (106): lucide-react, next, AuditPage(), AuditPageProps, Content(), metadata, one(), AdministrationPage() (+98 more)

### Community 32 - "20261102000002_domain_tables.sql"
Cohesion: 0.15
Nodes (29): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+21 more)

### Community 34 - "processes/schemas.ts"
Cohesion: 0.11
Nodes (20): FormalizationCardProps, buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), ContractingTabProps, DocumentationTabProps, BASE_PROPS, isProcessContractingMode() (+12 more)

### Community 35 - "inventory/actions.ts"
Cohesion: 0.57
Nodes (6): createMaterialFormAction(), done(), readMovementLines(), registerMovementFormAction(), setMinimumFormAction(), toNumber()

### Community 36 - "public.purchase_requests"
Cohesion: 0.13
Nodes (15): public.append_commitment_event(), public.save_purchase_request(), trg_ata_commitments_immutable, idx_ata_commitments_council_id, public.approve_purchase_request(), public.cancel_purchase_request(), idx_purchase_requests_process_id, public.save_purchase_request() (+7 more)

### Community 37 - "Button"
Cohesion: 0.13
Nodes (20): ComponentShowcase(), fixtureOrder, props, rows, MeetingDialog(), MeetingDialogProps, openProcessAttachment(), ProcessAttachmentSheet() (+12 more)

### Community 38 - "20261102000006_fk_indexes.sql"
Cohesion: 0.06
Nodes (25): public.save_meeting(), public.save_transfer(), idx_ata_items_material_id, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_councils_responsible_user_id, idx_document_cleanup_runs_process_id (+17 more)

### Community 39 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria, Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley, Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters), Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros, Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 40 - "container.ts"
Cohesion: 0.10
Nodes (25): AtaExtension, ExtensionRequest, original, addAmendment(), AmendmentInput, ContractAmendment, ContractTerms, currentTerms() (+17 more)

### Community 41 - "container.ts"
Cohesion: 0.05
Nodes (35): Contratos de serviço, Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`), Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`), 3.2. Serviços e Ações, AuditRecorder, DocumentRepository, StoragePort, isVisibleAttachment() (+27 more)

### Community 42 - "public.purchase_requests"
Cohesion: 0.13
Nodes (19): contract_receipt_line_integrity, contract_receipt_lines_contract_idx, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, private.check_contract_receipt_line(), private.next_request_event_position() (+11 more)

### Community 43 - "Proposta funcional — página inicial Warley Gestão Operacional"
Cohesion: 0.13
Nodes (14): 1. Diagnóstico da página atual, 2. Hierarquia proposta, 3. Wireframe detalhado, 4. Fluxos de acesso rápido, 7. Plano incremental, 8. Critérios de validação, Decisões para aprovação, Estoque e materiais (+6 more)

### Community 44 - "toFortalezaDate"
Cohesion: 0.18
Nodes (19): pdf-lib, GET(), auditEvents(), buildDetailedReport(), date(), DetailedFilter, DetailedKind, DetailedReport (+11 more)

### Community 45 - "processes.ts"
Cohesion: 0.11
Nodes (17): @supabase/supabase-js, MeetingStatus, MeetingRow, SupabaseMeetingRepository, toMeeting(), toPayload(), toNotification(), snapshotToJson() (+9 more)

### Community 46 - "private.business_error"
Cohesion: 0.21
Nodes (13): idx_stock_balances_material_id, idx_stock_transfer_events_actor_id, idx_stock_transfer_items_material_id, idx_stock_transfers_destination_council_id, idx_stock_transfers_origin_council_id, private.business_error(), private.next_transfer_event_position(), public.advance_transfer() (+5 more)

### Community 47 - "material-order-dialog.tsx"
Cohesion: 0.15
Nodes (15): 6. Valores, estados e mensagens: salvaguardas, Reutilização em painéis por perfil, CouncilWorkspace(), CouncilWorkspaceProps, ActionHub(), ActionItem, buildCouncilActions(), AvailableStockItem (+7 more)

### Community 48 - "public.profiles"
Cohesion: 0.20
Nodes (24): administrative_processes_responsible_membership, check_staff_membership, idx_profiles_staff_category, private.check_process_responsible_membership(), private.check_staff_membership(), private.has_council_access(), private.has_council_role(), private.has_request_access() (+16 more)

### Community 49 - "AuditEntry"
Cohesion: 0.18
Nodes (10): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange() (+2 more)

### Community 50 - "movement-form.tsx"
Cohesion: 0.16
Nodes (18): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+10 more)

### Community 51 - "process-view.tsx"
Cohesion: 0.10
Nodes (31): buildHoldRows(), HoldItemInput, HoldRow, FormalizationSupplier, PROCESS_TAB_IDS, processTabFromSearch(), ProcessTabId, ProcessView() (+23 more)

### Community 53 - "atas/extract-pdf/route.ts"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 54 - "db.ts"
Cohesion: 0.10
Nodes (17): AtomicDecision, ContractRow, SupabaseContractRepository, toContract(), toPayload(), LinkedRequestNotesRow, SupabasePurchaseRequestRepository, toPayload() (+9 more)

### Community 55 - "request-template.ts"
Cohesion: 0.09
Nodes (35): mammoth@^1.13.0, mammoth, xlsx, POST(), GET(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText() (+27 more)

### Community 56 - "handler.ts"
Cohesion: 0.15
Nodes (12): GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createSupabaseJobRunRepository(), JobOutcome, JobRunRepository (+4 more)

### Community 57 - "public.stock_movements"
Cohesion: 0.13
Nodes (13): public.apply_stock_mutation(), trg_stock_movements_immutable, trg_ata_commitments_no_truncate, trg_audit_logs_no_truncate, trg_contract_amendments_no_truncate, trg_stock_movements_no_truncate, idx_stock_balances_material_id, idx_stock_movements_actor_id (+5 more)

### Community 58 - "createSessionClient"
Cohesion: 0.12
Nodes (15): Conclusões classificadas e prioridade revisada, Diagnóstico validado de UX, Fase 0 — capacidade e resultados finais, Limites e cobertura, Sistema e limites, Escopo e leitura das evidências, Fluxos atuais e ideais, Fluxos por módulo e rota (+7 more)

### Community 59 - "reunioes/page.tsx"
Cohesion: 0.18
Nodes (17): MeetingFile(), getUrl(), MeetingMinutesEditor(), MeetingEvidenceForm(), AttachmentRow, calendarHref(), Content(), detailHref() (+9 more)

### Community 60 - "button.tsx"
Cohesion: 0.19
Nodes (14): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, AppointmentRow, CalendarioPage(), Content() (+6 more)

### Community 61 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "identity/service.ts"
Cohesion: 0.05
Nodes (42): formatWhatsapp(), onlyDigits(), parseWhatsapp(), WhatsappParse, CouncilRepository, MembershipRepository, InMemoryMembershipRepository, Council (+34 more)

### Community 63 - "process-history.ts"
Cohesion: 0.36
Nodes (7): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso()

### Community 64 - "RetentionRepository"
Cohesion: 0.17
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "filters.tsx"
Cohesion: 0.21
Nodes (11): 5. Componentes existentes a reutilizar e mudanças propostas, DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor(), DASHBOARD_FOCUS, DashboardFocus, first() (+3 more)

### Community 66 - "public.receive_purchase_request_for_contract"
Cohesion: 0.18
Nodes (4): public.contract_receipt_lines, public.receive_purchase_request_for_contract(), contract_receipt_line_integrity, private.check_contract_receipt_line()

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "toast-store.ts"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "groq.ts"
Cohesion: 0.32
Nodes (9): briefingUsesOnlyKnownNumbers(), collectModelText(), generateModuleBriefing(), generateOperationalBriefing(), isGroqConfigured(), timedGeneration(), generateModuleInsight(), ModuleFact (+1 more)

### Community 70 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "callback-server.mjs"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "audit-trail-tab.tsx"
Cohesion: 0.26
Nodes (9): ACTION_LABELS, AuditTrailFilters, AuditTrailTab(), AuditTrailTabProps, ENTITY_LABELS, extractJustificationOrDetails(), formatActionLabel(), formatEntityLabel() (+1 more)

### Community 73 - "Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel""
Cohesion: 0.11
Nodes (17): 1. Contexto e Problema, 2. Objetivos e Não-Objetivos, 3.1. Topo & Briefing Executivo de IA, 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres), 3.3. Grid Balanceado em 2 Colunas (50 / 50), 3.4. Rodapé Limpo, 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`), 4.1. Topo & Barra de Atalhos Rápidos (+9 more)

### Community 74 - "runAction"
Cohesion: 0.13
Nodes (25): assignMembershipFormAction(), createCouncilFormAction(), removeMembershipFormAction(), setStaffCategoryFormAction(), updateCouncilFormAction(), addActionItemFormAction(), fortalezaLocalToIso(), meetingEvidenceFormAction() (+17 more)

### Community 75 - "relatorios/page.tsx"
Cohesion: 0.13
Nodes (23): INSTRUMENT_LABELS, SavingsHistoryDialog(), SavingsHistoryDialogProps, SavingsHistoryItem, SavingsSummaryProps, ProcessHeader(), ProcessHeaderProps, BASE_PROPS (+15 more)

### Community 76 - "fail"
Cohesion: 0.13
Nodes (7): Attachment, DocumentService, MembershipService, AdministrativeProcess, RetentionService, guard(), parseInput()

### Community 77 - "ActionForm"
Cohesion: 0.11
Nodes (36): Option, RetentionForms(), MembershipForms(), Option, ProvisionCouncilForm(), StaffCategoryForm(), MarkReadForm(), EditCouncilForm() (+28 more)

### Community 78 - "20261102000001_identity.sql"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 79 - "seed-demo.mjs"
Cohesion: 0.26
Nodes (8): assertOk(), demoId(), ensureStock(), env, main(), sb, upsertCouncil(), upsertMaterial()

### Community 80 - "documents/service.ts"
Cohesion: 0.24
Nodes (11): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES (+3 more)

### Community 83 - "analysis.ts"
Cohesion: 0.26
Nodes (11): generateReportAnalysis(), analysisSchema, auditSources(), fallbackReportAnalysis(), operationalSources(), parseReportAnalysis(), ReportAnalysis, ReportSource (+3 more)

### Community 84 - "link-process-form.tsx"
Cohesion: 0.44
Nodes (8): ataStepFormAction(), createAtaFormAction(), linkAtaProcessFormAction(), optionalId(), processReturnPath(), readProcessItems(), setAllocationsFormAction(), toNumber()

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem"
Cohesion: 0.12
Nodes (15): 1. Visão Geral e Contexto, 2. Requisitos e Casos de Uso, 3.1. Banco de Dados (PostgreSQL / Supabase), 3.2. Sequenciamento de Processos (`nextProcessNumber`), 3. Arquitetura e Modelo de Dados, 4.1. Formulário em `/solicitacoes/nova`, 4.2. Card em `/solicitacoes/[id]`, 4. Design de Interface (UI/UX) (+7 more)

### Community 87 - "public.record_meeting_evidence"
Cohesion: 0.13
Nodes (15): public.append_commitment_event(), private.business_error(), private.next_request_event_position(), idx_profiles_staff_category, keep_meeting_task_completion, private.keep_meeting_task_completion(), public.meeting_attendance, public.meeting_task_completions (+7 more)

### Community 88 - "2. Requisitos e Casos de Uso"
Cohesion: 0.14
Nodes (13): 1. Visão Geral e Objetivos, 2. Requisitos e Casos de Uso, 3.1. Migração PostgreSQL / Supabase, 3. Modelo de Dados e Arquitetura, 4. Segurança, Permissões e Auditoria, 5. Estratégia de Testes, Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, UC-01: Registro do Valor Estimado e Bloqueio de Estoque (+5 more)

### Community 89 - "Arquitetura proposta"
Cohesion: 0.13
Nodes (14): Arquitetura proposta, Ações e integridade, Consultas, atualização e performance, Estados explícitos, Estrutura lógica existente a preservar, Formulários e acessibilidade, Indicadores e domínios, Integrações e segurança operacional (+6 more)

### Community 90 - "Proposta de experiência simplificada"
Cohesion: 0.14
Nodes (13): Decisões pendentes e salvaguardas, Diagnóstico, Exemplos de tela, Fluxos atuais versus proposta, Início proposto, Menu proposto, Nomes recomendados, Objetivo e limites (+5 more)

### Community 91 - "process-actions.tsx"
Cohesion: 0.32
Nodes (8): ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, PROCESS_TRANSITIONS, ProcessStatus, ProcessRow

### Community 92 - "agenda-board.tsx"
Cohesion: 0.14
Nodes (28): AgendaBoard(), dateLabel(), FormState, hours, monthLabel(), MonthPlan, Option, Person (+20 more)

### Community 93 - "public.councils"
Cohesion: 0.13
Nodes (17): contract_ata_items_ata_item_id_idx, contract_ata_items_contract_id_idx, contract_ata_process_insert, contract_ata_process_update, contracts_ata_id_idx, idx_contracts_process_id, idx_contracts_supplier_id, idx_councils_organization_type (+9 more)

### Community 94 - "atas.ts"
Cohesion: 0.17
Nodes (9): CommitmentEvent, AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toAta(), toCommitment(), toPayload() (+1 more)

### Community 95 - "getSession"
Cohesion: 0.10
Nodes (23): @supabase/ssr@^0.12.7, @supabase/ssr, GET(), GET(), AuthenticatedShell(), AppLayout(), Home(), RedirectHome() (+15 more)

### Community 96 - "ai-consent.test.ts"
Cohesion: 0.25
Nodes (9): draftSchema, GET(), maxDuration, audioPath(), claimed(), mocks, submit(), work() (+1 more)

### Community 97 - "cnpj.ts"
Cohesion: 0.38
Nodes (7): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits(), createSupplierSchema, supplierFields, updateSupplierSchema

### Community 98 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan, Task 1: Refatoração do componente compartilhado `KpiCard`, Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`), Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`), Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`), Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas, Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build)

### Community 99 - "20261110000003_material_orders.sql"
Cohesion: 0.36
Nodes (8): idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status, public.material_order_items, public.material_orders

### Community 100 - "concorrencia.sh"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

### Community 110 - "Fase 1 — Descoberta e Arquitetura (fonte da verdade)"
Cohesion: 0.17
Nodes (11): 10. Riscos, 1. Regras confirmadas (imutáveis sem decisão do usuário), 2. Decisões pendentes (bloqueios reais), 3. Hipóteses técnicas (documentadas), 4. Mapa de arquitetura, 5. Modelo relacional (núcleo, refinado), 6. Matriz de permissões (resumo), 7. Máquinas de estado (+3 more)

### Community 111 - "direct-upload.test.ts"
Cohesion: 0.20
Nodes (5): declared(), newProcess(), PDF, sha(), InMemoryStorage

### Community 112 - "atas.ts"
Cohesion: 0.10
Nodes (21): AtaBalance, CommitmentEventType, CommitRequest, computeAtaBalance(), CouncilAllocation, validateAllocations(), validateCommitment(), AtaValidityStatus (+13 more)

### Community 113 - "order-queue.tsx"
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

### Community 118 - "formalizations/service.test.ts"
Cohesion: 0.22
Nodes (4): InMemoryFormalizationRepository, createProcessWithProgress(), Ctx, PDF

### Community 119 - "fail"
Cohesion: 0.13
Nodes (9): 6. Estratégia de Testes, Material, AtomicReceipt, SupplierRepository, Supplier, SupplierService, authorize(), fail() (+1 more)

### Community 120 - "policy.test.ts"
Cohesion: 0.40
Nodes (3): admin, Role, roleMatrix

### Community 121 - "Execução local, deploy e backups"
Cohesion: 0.25
Nodes (7): Aplicar o banco (migrations 0001–0007 + seed + bucket), Backups, Deploy (Vercel + Supabase), Execução local, deploy e backups, Local sem Docker (validação do SQL), Primeiro acesso (cadastro somente por convite, P7), Projeto Supabase e variáveis (estado real)

### Community 122 - "media-actions.ts"
Cohesion: 0.20
Nodes (13): AUDIO_TYPES, MeetingMediaPanel(), openSavedAudio(), saveAudio(), MeetingOption, confirmMeetingAudioAction(), managedMeeting(), meetingAudioUrlAction() (+5 more)

### Community 123 - "repositories.ts"
Cohesion: 0.10
Nodes (10): BalanceRow, MaterialRow, MovementRow, SupabaseInventoryRepository, toMovement(), SupabaseStorage, SupabaseSupplierRepository, MAX_CAS_ATTEMPTS (+2 more)

### Community 124 - "formalization-card.tsx"
Cohesion: 0.12
Nodes (26): auctionLabel(), FormalizationCard(), formatAuctionDate(), INSTRUMENT_LABELS, BASE_FORMALIZATION, MOCK_SUPPLIERS, CorrectionForm(), Item (+18 more)

### Community 125 - "briefing.ts"
Cohesion: 0.29
Nodes (8): BRIEFING_SYSTEM_PROMPT, briefingSchema, buildBriefingFacts(), coerceBriefing(), extractJsonObjects(), OperationalBriefing, parseBriefingText(), emptySummary

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

### Community 131 - "formalizations/actions.ts"
Cohesion: 0.15
Nodes (17): Global Constraints, Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade, Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação, Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real, Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor, Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado), Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão), Task 8: Consolidação, Validação Geral e Empacotamento de Migrações (+9 more)

### Community 133 - "Pendências e limitações conhecidas"
Cohesion: 0.33
Nodes (5): Decisões do usuário ainda abertas, Limitações de projeto, O que depende do usuário, Pendências e limitações conhecidas, Validação (ver `07-validacao-executada.md`)

### Community 134 - "processes.test.ts"
Cohesion: 0.17
Nodes (16): refreshCompletion(), buildSnapshot(), CompletionEvent, CompletionState, CompletionTransition, DocumentalSnapshot, effectiveProgressPercent(), reevaluateCompletion() (+8 more)

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

### Community 150 - "InMemoryAuditRepository"
Cohesion: 0.12
Nodes (22): InMemoryAtaRepository, activeAta(), manager(), setup(), InMemoryAuditRepository, AuditService, setup(), setup() (+14 more)

### Community 151 - "check-supabase.mjs"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 152 - "Arquitetura (estado atual da implementação)"
Cohesion: 0.29
Nodes (6): Arquitetura (estado atual da implementação), Banco: privilégios e schema `private`, Concorrência e atomicidade, Jobs (Vercel Cron), Sessão e autenticação, Visão geral

### Community 153 - "documents/service.ts"
Cohesion: 0.13
Nodes (19): AttachmentForProgress, attachmentIdSchema, PreparedUpload, prepareUploadSchema, uploadDocumentSchema, ADDITIONAL_DOCUMENT_TYPE_CODES, ADDITIONAL_DOCUMENT_TYPES, AdditionalDocumentTypeCode (+11 more)

### Community 154 - "provision-action.ts"
Cohesion: 0.32
Nodes (5): provisionCouncilAccess(), schema, { createUser }, ActionContext, isStaffRole()

### Community 155 - "briefing-card.tsx"
Cohesion: 0.46
Nodes (5): BriefingCard(), BriefingFallback(), BriefingFacts, BriefingInsight, generateBriefing()

### Community 161 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): envFiles, envNames, isolatedEnv

### Community 162 - "private.validate_meeting_details"
Cohesion: 0.21
Nodes (9): calendar_appointments_scope_date_idx, public.calendar_appointments, private.validate_meeting_details(), validate_meeting_details, check_staff_membership, council_memberships_one_director, private.check_staff_membership(), private.has_council_access() (+1 more)

### Community 174 - "purchases/actions.ts"
Cohesion: 0.36
Nodes (6): createRequestFormAction(), readItems(), receiveFormAction(), requestStepFormAction(), Step, parseQuantityInput()

### Community 175 - "file-upload.tsx"
Cohesion: 0.32
Nodes (7): FileUpload(), handleFile(), handleFiles(), onDrop(), FileUploadProps, ItemStatus, UploadItem

### Community 176 - "auth-stage.tsx"
Cohesion: 0.15
Nodes (13): NavigationFixture(), AuthLayout(), NotFound(), AppShell(), AppShellProps, getServerSidebarSnapshot(), getSidebarSnapshot(), subscribeSidebar() (+5 more)

### Community 178 - "20261126020200_process_assignment_contract_closure.sql"
Cohesion: 0.38
Nodes (4): administrative_processes_responsible_id_idx, administrative_processes_responsible_membership, contract_receipt_lines_contract_idx, private.check_process_responsible_membership()

### Community 179 - "auth.users"
Cohesion: 0.40
Nodes (3): auth.users, storage.buckets, storage.objects

### Community 180 - "public.spec.ts"
Cohesion: 0.47
Nodes (4): evidence, routes, sanitizeText(), sanitizeUrl()

### Community 181 - "bundle-migrations.mjs"
Cohesion: 0.33
Nodes (4): files, migrationsDir, outFile, root

### Community 183 - "compact-document-row.test.tsx"
Cohesion: 0.50
Nodes (3): CompactDocumentRowProps, PENDING_ROW_PROPS, VALID_ROW_PROPS

### Community 185 - "002_validacao_sem_pgtap.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 186 - "003_fluxos_atomicos.sql"
Cohesion: 0.83
Nodes (3): pg_temp.check_that(), pg_temp.expect_error(), t_results

### Community 189 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões, Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`), Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral, Task 4: Modernização de UI/UX do Módulo de Reuniões, Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

### Community 193 - "cleanup-eligibility.ts"
Cohesion: 0.40
Nodes (5): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), addDaysToInstant()

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 992 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `ok` to `purchases/service.ts`, `lucide-react`, `formalizations/actions.ts`, `vitest`, `purchases/service.test.ts`, `contracts/actions.ts`, `notifications/service.ts`, `react`, `documentation-tab.tsx`, `new-contract-form.tsx`, `can`, `provision-action.ts`, `PurchaseRequest`, `meetings/service.ts`, `next`, `Button`, `container.ts`, `container.ts`, `toFortalezaDate`, `processes.ts`, `purchases/actions.ts`, `AuditEntry`, `db.ts`, `reunioes/page.tsx`, `button.tsx`, `identity/service.ts`, `groq.ts`, `relatorios/page.tsx`, `fail`, `documents/service.ts`, `atas.ts`, `getSession`, `ai-consent.test.ts`, `atas.ts`, `fail`, `media-actions.ts`, `repositories.ts`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `purchases/service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07138535995160314 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `lucide-react`, `formalizations/actions.ts`, `identity/actions.ts`, `contracts/actions.ts`, `react`, `simple-table.tsx`, `documentation-tab.tsx`, `package.json`, `can`, `provision-action.ts`, `inventory/actions.ts`, `Button`, `council-picker.tsx`, `purchases/actions.ts`, `material-order-dialog.tsx`, `auth-stage.tsx`, `movement-form.tsx`, `process-view.tsx`, `handler.ts`, `createSessionClient`, `next.config.ts`, `button.tsx`, `usuarios/novo/page.tsx`, `atas/nova/page.tsx`, `reunioes/page.tsx`, `meu-conselho/page.tsx`, `filters.tsx`, `(app)/processos/novo/page.tsx`, `identity/service.ts`, `toast-store.ts`, `groq.ts`, `callback-server.mjs`, `audit-trail-tab.tsx`, `runAction`, `relatorios/page.tsx`, `ActionForm`, `analysis.ts`, `link-process-form.tsx`, `agenda-board.tsx`, `getSession`, `order-queue.tsx`, `media-actions.ts`, `formalization-card.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.06766917293233082 - nodes in this community are weakly interconnected._
- **Why does `fail()` connect `fail` to `purchases/service.ts`, `formalizations/actions.ts`, `identity/actions.ts`, `vitest`, `purchases/service.test.ts`, `ok`, `notifications/service.ts`, `documentation-tab.tsx`, `new-contract-form.tsx`, `can`, `provision-action.ts`, `PurchaseRequest`, `meetings/service.ts`, `next`, `Button`, `container.ts`, `container.ts`, `toFortalezaDate`, `processes.ts`, `AuditEntry`, `db.ts`, `reunioes/page.tsx`, `button.tsx`, `identity/service.ts`, `groq.ts`, `runAction`, `relatorios/page.tsx`, `fail`, `documents/service.ts`, `atas.ts`, `getSession`, `ai-consent.test.ts`, `atas.ts`, `media-actions.ts`, `repositories.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.11591836734693878 - nodes in this community are weakly interconnected._