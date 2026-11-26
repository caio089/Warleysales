# Graph Report - Warleysales  (2026-11-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3064 nodes · 11572 edges · 110 communities (97 shown, 13 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 334 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102

## God Nodes (most connected - your core abstractions)
1. `ok()` - 288 edges
2. `fail()` - 210 edges
3. `Result` - 201 edges
4. `Actor` - 122 edges
5. `next` - 114 edges
6. `vitest` - 105 edges
7. `react` - 95 edges
8. `runAction()` - 80 edges
9. `unwrap()` - 77 edges
10. `lucide-react` - 73 edges

## Surprising Connections (you probably didn't know these)
- `ComponentShowcase()` --calls--> `ProcessView()`  [EXTRACTED]
  e2e/callback-app/app/page.tsx → src/app/(app)/processos/[id]/process-view.tsx
- `RouteFixture()` --calls--> `SimpleTable()`  [EXTRACTED]
  e2e/callback-app/app/[...path]/page.tsx → src/shared/ui/simple-table.tsx
- `ComponentShowcase()` --calls--> `DataTable()`  [EXTRACTED]
  e2e/callback-app/app/page.tsx → src/shared/ui/data-table.tsx
- `ComponentShowcase()` --calls--> `FileUpload()`  [EXTRACTED]
  e2e/callback-app/app/page.tsx → src/shared/ui/file-upload.tsx
- `ComponentShowcase()` --calls--> `MaterialOrdersSection()`  [EXTRACTED]
  e2e/callback-app/app/page.tsx → src/app/(app)/meu-conselho/material-orders-section.tsx

## Import Cycles
- None detected.

## Communities (110 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (13): AtaRepository, PriceRegistrationAta, AtaService, Council, parseProcessNumber(), toRow(), isUniqueViolation(), guard() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (94): idx_administrative_processes_created_by, idx_ata_allocations_council_id, idx_ata_commitments_council_id, idx_ata_extensions_requested_by, idx_ata_items_material_id, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by (+86 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (38): AuditRecorder, DocumentRepository, StoragePort, Attachment, isVisibleAttachment(), DocumentService, FormalizationService, SavingsSummary (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (54): pdf-lib, branding(), download(), GET(), contractedItemSchema, FormalizationStatus, formalizationStatuses, formalizationStatusSchema (+46 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (45): Option, RetentionForms(), MembershipForms(), Option, ProvisionCouncilForm(), MarkReadForm(), EditCouncilForm(), NewCouncilForm() (+37 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (39): vitest, loadLookupsMock, loadScreenMock, loadScreenMock, loadLookupsMock, loadScreenMock, { loadScreenMock, loadLookupsMock }, activeAta() (+31 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (37): AtaBalance, CommitmentEvent, CouncilAllocation, ATA_INITIAL_YEARS, ATA_LEGAL_BASIS, AtaExtension, AtaValidityStatus, ataValidityStatus() (+29 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (48): lucide-react, AlertsPage(), Content(), metadata, AtasPage(), Content(), metadata, CouncilContent() (+40 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (43): CommitmentEventType, CommitRequest, computeAtaBalance(), validateAllocations(), validateCommitment(), none, classifyStockLevel(), CRITICAL_RATIO (+35 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (32): CouncilRepository, MembershipRepository, InMemoryMembershipRepository, MembershipRecord, ProfileSummary, assignMembershipSchema, councilFields, createCouncilSchema (+24 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (44): react-dom, auctionLabel(), FormalizationCard(), FormalizationCardProps, FormalizationSupplier, formatAuctionDate(), INSTRUMENT_LABELS, BASE_FORMALIZATION (+36 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (38): buildStockEntrySources(), RECEIVABLE, StockEntryItem, Props, PurchaseRequest, PurchaseRequestEvent, RequestStatus, ReceiptItemResult (+30 more)

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (8): InMemoryAtaRepository, InMemoryContractRepository, InMemoryMeetingRepository, isValidAttachment(), InMemoryPurchaseRequestRepository, InMemoryTransferRepository, createMemoryRepositories(), MemoryTable

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (23): ALERT_MILESTONES, AlertCandidate, AlertEntityType, AlertMilestone, dedupKey(), DueAlert, reachedMilestone(), selectDueAlerts() (+15 more)

### Community 14 - "Community 14"
Cohesion: 0.09
Nodes (38): ACTION_LABEL, Content(), metadata, RetentionPage(), AtaPage(), Content(), metadata, Content() (+30 more)

### Community 15 - "Community 15"
Cohesion: 0.08
Nodes (41): CalendarOrgFilter(), CalendarOrgFilterProps, hrefFor(), CalendarReportPanel(), CalendarReportPanelProps, MonthDialog(), MonthDialogProps, weekdays (+33 more)

### Community 16 - "Community 16"
Cohesion: 0.08
Nodes (42): ApprovalQueue(), ApprovalQueueProps, PendingApprovalItem, DashboardFilters(), DashboardFiltersProps, FOCUS_OPTIONS, hrefFor(), OrderQueue() (+34 more)

### Community 17 - "Community 17"
Cohesion: 0.07
Nodes (32): public.append_commitment_event(), public.save_ata(), public.save_contract(), trg_ata_commitments_immutable, trg_ata_extensions_immutable, trg_contract_amendments_immutable, public.append_commitment_event(), trg_ata_commitments_no_truncate (+24 more)

### Community 18 - "Community 18"
Cohesion: 0.09
Nodes (42): columns, Kind, kinds, processRows, RouteFixture(), rows, titles, ProcessesTable() (+34 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (36): ArchiveDocumentButton(), CompactDocumentFile, CompactDocumentRow(), handleDownload(), handleFileSelected(), uploadOne(), CompactDocumentRowProps, PENDING_ROW_PROPS (+28 more)

### Community 20 - "Community 20"
Cohesion: 0.10
Nodes (38): addAmendmentFormAction(), createContractFormAction(), linkContractProcessFormAction(), optionalNumber(), optionalText(), processReturnPath(), createContractSchema, manualDeleteFormAction() (+30 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (36): DICTS, MeetingsOverview(), PanelShell(), ProcessesOverview(), RequestsOverview(), Row(), RowLink, statusOf() (+28 more)

### Community 22 - "Community 22"
Cohesion: 0.07
Nodes (24): public.apply_stock_mutation(), public.save_purchase_request(), trg_stock_movements_immutable, idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, idx_stock_balances_material_id (+16 more)

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (20): MaterialOrderFilter, MaterialOrderRepository, InMemoryMaterialOrderRepository, ApproveMaterialOrderInput, approveMaterialOrderSchema, CancelMaterialOrderInput, cancelMaterialOrderSchema, CreateMaterialOrderInput (+12 more)

### Community 24 - "Community 24"
Cohesion: 0.11
Nodes (21): changeMeetingStatus(), MEETING_TRANSITIONS, MeetingRepository, ActionItem, actionItemSchema, changeMeetingStatusSchema, Meeting, MeetingMinutes (+13 more)

### Community 25 - "Community 25"
Cohesion: 0.10
Nodes (8): SupabaseMembershipRepository, SupabaseNotificationRepository, SupabaseDocumentRepository, toAttachment(), SupabaseRetentionRepository, toIso(), unwrap(), SupabaseJobRunRepository

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (13): public.append_commitment_event(), trg_audit_logs_immutable, idx_administrative_processes_created_by, idx_audit_logs_actor_id, private.business_error(), private.next_request_event_position(), public.correct_purchase_request(), public.set_document_exception() (+5 more)

### Community 27 - "Community 27"
Cohesion: 0.17
Nodes (5): changeRequestStatus(), PurchaseRequestRepository, PurchaseRequest, PurchaseRequestService, Actor

### Community 28 - "Community 28"
Cohesion: 0.11
Nodes (17): GET(), AuthenticatedShell(), AppLayout(), Home(), RedirectHome(), getServices(), getSession(), SessionState (+9 more)

### Community 29 - "Community 29"
Cohesion: 0.17
Nodes (24): setup(), InMemoryAuditRepository, AuditService, ContractService, setup(), setup(), InMemoryDocumentRepository, setup() (+16 more)

### Community 30 - "Community 30"
Cohesion: 0.10
Nodes (20): @supabase/ssr@^0.12.7, @supabase/ssr, @supabase/supabase-js, zod, GET, ALLOWED_NEXT, GET(), createClient (+12 more)

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (25): AdministrationPage(), Content(), LINKS, metadata, Content(), metadata, UsersPage(), AuditContent() (+17 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (29): public.administrative_processes, public.ata_allocations, public.ata_commitments, public.ata_extensions, public.ata_items, public.attachments, public.contract_amendments, public.contracts (+21 more)

### Community 33 - "Community 33"
Cohesion: 0.09
Nodes (20): on_auth_user_created, public.handle_new_user(), idx_material_order_items_material, idx_material_order_items_order, idx_material_orders_council, idx_material_orders_created_at, idx_material_orders_requested_by, idx_material_orders_status (+12 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (22): AtaValidityField(), applyStart(), onBrChange(), firstDayOfMonth(), QuickDateButton(), validStartDateFromInput(), matchPdfItems(), NewAtaForm() (+14 more)

### Community 35 - "Community 35"
Cohesion: 0.10
Nodes (22): buildHoldRows(), HoldItemInput, HoldRow, INSTRUMENT_LABELS, SavingsHistoryDialog(), SavingsHistoryDialogProps, SavingsHistoryItem, SavingsSummaryProps (+14 more)

### Community 36 - "Community 36"
Cohesion: 0.14
Nodes (22): BriefingCard(), BriefingFallback(), BRIEFING_SYSTEM_PROMPT, BriefingFacts, briefingSchema, briefingUsesOnlyKnownNumbers(), buildBriefingFacts(), coerceBriefing() (+14 more)

### Community 37 - "Community 37"
Cohesion: 0.16
Nodes (20): ComponentShowcase(), NavigationFixture(), MeetingDialog(), MeetingDialogProps, NewMeetingForm(), Sheet(), SheetClose(), SheetContent() (+12 more)

### Community 38 - "Community 38"
Cohesion: 0.09
Nodes (19): public.save_meeting(), public.save_transfer(), idx_ata_items_material_id, idx_attachments_council_id, idx_attachments_type_code, idx_attachments_uploaded_by, idx_councils_responsible_user_id, idx_document_cleanup_runs_process_id (+11 more)

### Community 39 - "Community 39"
Cohesion: 0.14
Nodes (14): approveMaterialOrder(), approveOrder, cancelMaterialOrder(), cancelOrder, changeMaterialOrderStatus(), changeOrderStatus, CreateMaterialOrderDomainInput, createOrder (+6 more)

### Community 40 - "Community 40"
Cohesion: 0.17
Nodes (18): CurrencyFixture(), AtaMaterialLine, AtaMaterialsValues(), buildDrafts(), parseMoney(), assertInstrumentsLinked(), homologateFormalizationAction(), parseMoney() (+10 more)

### Community 41 - "Community 41"
Cohesion: 0.16
Nodes (18): buildInitialDrafts(), PriceResearchForm(), PriceResearchSummary(), DocumentationTabProps, isActiveDoc(), isArchivedDoc(), MANDATORY_DOCUMENT_CODES, MANDATORY_DOCUMENTS (+10 more)

### Community 42 - "Community 42"
Cohesion: 0.13
Nodes (18): makeDraft(), AUDIO_TYPES, BrowserRecognition, MeetingMediaPanel(), openSavedAudio(), saveAudio(), MeetingOption, RecognitionResultEvent (+10 more)

### Community 43 - "Community 43"
Cohesion: 0.17
Nodes (7): InMemorySupplierRepository, SupplierRepository, createSupplierSchema, Supplier, supplierFields, updateSupplierSchema, SupplierService

### Community 44 - "Community 44"
Cohesion: 0.17
Nodes (17): ProductField(), ProductFieldProps, exactProduct(), filterProducts(), normalizeProductQuery(), ProductOption, options, FieldShell() (+9 more)

### Community 45 - "Community 45"
Cohesion: 0.16
Nodes (23): metadata, citedInstruments(), expiryFromText(), guardNatureza(), identifyPlanDate(), joinedNotes(), MONTH_NAME, MONTH_ORDER (+15 more)

### Community 46 - "Community 46"
Cohesion: 0.15
Nodes (13): Props, TransferStatus, AtomicTransferStep, TransferRepository, advanceTransferSchema, requestTransferSchema, Transfer, TransferEvent (+5 more)

### Community 47 - "Community 47"
Cohesion: 0.11
Nodes (16): AtaStatus, AtaRow, CommitmentRow, SupabaseAtaRepository, toAta(), toCommitment(), toPayload(), BUSINESS_CODES (+8 more)

### Community 48 - "Community 48"
Cohesion: 0.18
Nodes (10): AuditRepository, parseDateRange(), AuditEntry, AuditFilter, AuditResult, NewAuditEntry, AuditRow, parseDateRange() (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.14
Nodes (15): MovementType, StockBalance, keyOf(), StockKey, StockMutation, StockRow, StockState, MovementRecord (+7 more)

### Community 50 - "Community 50"
Cohesion: 0.12
Nodes (13): MeetingStatus, SupabaseContractRepository, toContract(), toPayload(), toMovement(), MeetingRow, SupabaseMeetingRepository, toMeeting() (+5 more)

### Community 51 - "Community 51"
Cohesion: 0.11
Nodes (14): FixtureReady(), FixtureLayout(), nextConfig, next, react, AuditPage(), AuditPageProps, Content() (+6 more)

### Community 52 - "Community 52"
Cohesion: 0.09
Nodes (14): evidence, routes, sanitizeText(), sanitizeUrl(), destinations, @playwright/test@^1.65.1, envFiles, envNames (+6 more)

### Community 53 - "Community 53"
Cohesion: 0.11
Nodes (19): ai@^7.0.159, @ai-sdk/groq@^4.0.74, unpdf@^1.6.2, ai, @ai-sdk/groq, unpdf, POST(), POST() (+11 more)

### Community 54 - "Community 54"
Cohesion: 0.12
Nodes (22): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.6, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^22.20.5, @types/react@^19 (+14 more)

### Community 55 - "Community 55"
Cohesion: 0.17
Nodes (19): GET(), buildRequestExcelTemplate(), buildRequestWordTemplate(), escapeXml(), htmlTablesToMatrices(), ITEM_ALIASES, matchAlias(), normalizeHeader() (+11 more)

### Community 56 - "Community 56"
Cohesion: 0.16
Nodes (12): GET, GET, isCronAuthorized(), createCronHandler(), CronHandlerOptions, createSupabaseJobRunRepository(), JobOutcome, JobRunRepository (+4 more)

### Community 57 - "Community 57"
Cohesion: 0.14
Nodes (18): Content(), metadata, RequestPage(), Fact(), PlanDossierCard(), PlanDossier, formatDateOnly(), PROCESS_FLOW_STEPS (+10 more)

### Community 58 - "Community 58"
Cohesion: 0.16
Nodes (16): idx_purchase_request_events_actor_id, idx_purchase_request_items_ata_item_id, idx_purchase_request_items_material_id, idx_purchase_requests_created_by, private.business_error(), private.next_request_event_position(), public.advance_transfer(), public.approve_purchase_request() (+8 more)

### Community 59 - "Community 59"
Cohesion: 0.12
Nodes (12): fixtureOrder, props, rows, FormalizationQueue(), handleQuickHomologate(), FormalizationQueueProps, INSTRUMENT_LABELS, PendingFormalizationItem (+4 more)

### Community 60 - "Community 60"
Cohesion: 0.14
Nodes (19): AttachmentForProgress, attachmentIdSchema, PreparedUpload, prepareUploadSchema, uploadDocumentSchema, DocumentalSnapshot, ADDITIONAL_DOCUMENT_TYPE_CODES, ADDITIONAL_DOCUMENT_TYPES (+11 more)

### Community 61 - "Community 61"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 62 - "Community 62"
Cohesion: 0.12
Nodes (13): class-variance-authority@^0.7.1, @base-ui/react, class-variance-authority, cn, MaterialOrderDialog(), MaterialOrderDialogProps, MaterialOrderForm(), handleSubmit() (+5 more)

### Community 63 - "Community 63"
Cohesion: 0.15
Nodes (16): mammoth@^1.13.0, mammoth, xlsx, POST(), detectRequestDocument(), extractRequestDocumentText(), extractSpreadsheetText(), extractWordText() (+8 more)

### Community 64 - "Community 64"
Cohesion: 0.19
Nodes (6): InMemoryRetentionRepository, RetentionRepository, CleanupRun, RetentionAuthorization, RetentionHold, HoldRow

### Community 65 - "Community 65"
Cohesion: 0.11
Nodes (19): dependencies, @base-ui/react@^1.9.0, cn@^0.5.2, gsap@^3.15.0, @gsap/react@^2.1.2, lucide-react@^1.66.0, next@16.4.6, pdf-lib@^1.17.1 (+11 more)

### Community 66 - "Community 66"
Cohesion: 0.16
Nodes (12): credentialsSchema, emailSchema, homeForCurrentUser(), newPasswordSchema, requestPasswordRecoveryAction(), signInAction(), signOutAction(), updatePasswordAction() (+4 more)

### Community 67 - "Community 67"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 68 - "Community 68"
Cohesion: 0.16
Nodes (15): geistMono, jakarta, metadata, RootLayout(), dismissToast(), emit(), EMPTY, listeners (+7 more)

### Community 69 - "Community 69"
Cohesion: 0.16
Nodes (14): sanitizeFileName(), SIGNATURES, startsWith(), pdf, ValidatedFile, validateUpload(), ALLOWED_EXTENSIONS_LABEL, ALLOWED_FILE_TYPES (+6 more)

### Community 70 - "Community 70"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 71 - "Community 71"
Cohesion: 0.12
Nodes (10): nextConfig, repoRoot, app, auth, authState, build, handle, require (+2 more)

### Community 72 - "Community 72"
Cohesion: 0.21
Nodes (11): BigStat(), HomeOverview(), HomeOverviewProps, PROCESS_BAR, PROCESS_LABEL, BarStatItem, BarStatList(), describeArc() (+3 more)

### Community 73 - "Community 73"
Cohesion: 0.19
Nodes (10): StockSectionProps, AtaView, ContractView, StockLevelView, DashboardAttention, DashboardDeadline, DashboardSnapshot, ReportService (+2 more)

### Community 74 - "Community 74"
Cohesion: 0.21
Nodes (12): ProcessActions(), ProcessActionsProps, GovernanceTab(), GovernanceTabProps, BASE_PROPS, changeProcessStatusFormAction(), createProcessFormAction(), registerClosingFormAction (+4 more)

### Community 75 - "Community 75"
Cohesion: 0.18
Nodes (9): AuthLayout(), metadata, PasswordPage(), PasswordForm(), NotFound(), AuthStage(), PILLARS, BrandMark() (+1 more)

### Community 76 - "Community 76"
Cohesion: 0.19
Nodes (6): CLEANUP_WAIT_DAYS, CleanupDecision, CleanupInput, evaluateCleanupEligibility(), RetentionService, addDaysToInstant()

### Community 77 - "Community 77"
Cohesion: 0.25
Nodes (10): CouncilPage(), metadata, CouncilsContent(), CouncilsPage(), metadata, formatWhatsapp(), onlyDigits(), parseWhatsapp() (+2 more)

### Community 78 - "Community 78"
Cohesion: 0.23
Nodes (11): refreshCompletion(), buildSnapshot(), CompletionEvent, CompletionState, CompletionTransition, effectiveProgressPercent(), reevaluateCompletion(), allSeven() (+3 more)

### Community 79 - "Community 79"
Cohesion: 0.26
Nodes (8): assertOk(), demoId(), ensureStock(), env, main(), sb, upsertCouncil(), upsertMaterial()

### Community 80 - "Community 80"
Cohesion: 0.29
Nodes (9): CouncilWorkspace(), CouncilWorkspaceProps, ActionHub(), ActionItem, buildCouncilActions(), AvailableStockItem, MaterialOrdersSection(), MaterialOrdersSectionProps (+1 more)

### Community 81 - "Community 81"
Cohesion: 0.36
Nodes (12): on_auth_user_created, private.has_council_access(), private.has_council_role(), private.is_central_admin(), public.audit_logs, public.council_memberships, public.councils, public.handle_new_user() (+4 more)

### Community 83 - "Community 83"
Cohesion: 0.24
Nodes (11): StockEntrySource, EntryFromProcessForm(), isLedgerType(), LedgerType, Line, MovementForm(), MovementFormProps, newLine() (+3 more)

### Community 84 - "Community 84"
Cohesion: 0.35
Nodes (10): approveMaterialOrderAction(), cancelMaterialOrderAction(), createMaterialOrderAction(), extractCreatePayload(), extractOrderId(), extractRejectPayload(), rejectMaterialOrderAction(), revalidateOrderPaths() (+2 more)

### Community 85 - "Community 85"
Cohesion: 0.18
Nodes (11): scripts, build, db:bundle, db:check, db:seed-demo, dev, e2e, lint (+3 more)

### Community 86 - "Community 86"
Cohesion: 0.22
Nodes (9): Content(), ContractPage(), metadata, ANY_MEMBER, MANAGER, MANAGER_OPERATOR, ROLES_BY_ACTION, RoleSet (+1 more)

### Community 87 - "Community 87"
Cohesion: 0.20
Nodes (5): declared(), newProcess(), PDF, sha(), InMemoryStorage

### Community 89 - "Community 89"
Cohesion: 0.27
Nodes (8): createRequestFormAction(), readItems(), receiveFormAction(), requestStepFormAction(), Step, correctRequestAction(), schema, parseQuantityInput()

### Community 90 - "Community 90"
Cohesion: 0.29
Nodes (5): snapshotToJson(), SupabaseProcessRepository, toProcess(), toProcessChanges(), toIsoOrNull()

### Community 91 - "Community 91"
Cohesion: 0.31
Nodes (8): buildProcessHistory(), DOCUMENT_LABEL, documentPlacementDates(), documentTypeLabel(), ProcessHistoryInput, REQUEST_EVENT_TITLE, toIso(), ALL_DOCUMENT_TYPES

### Community 92 - "Community 92"
Cohesion: 0.27
Nodes (3): SupabasePurchaseRequestRepository, toPayload(), toRequest()

### Community 93 - "Community 93"
Cohesion: 0.22
Nodes (7): admin, anon, bucket, env, opts, results, TABLES

### Community 94 - "Community 94"
Cohesion: 0.36
Nodes (7): Lookup, notificationDestination(), NotificationReference, notificationResourceKey(), resolveNotificationDestinations(), ata, contract

### Community 95 - "Community 95"
Cohesion: 0.44
Nodes (8): ataStepFormAction(), createAtaFormAction(), linkAtaProcessFormAction(), optionalId(), processReturnPath(), readProcessItems(), setAllocationsFormAction(), toNumber()

### Community 96 - "Community 96"
Cohesion: 0.53
Nodes (5): approver(), ataItem(), manager(), stockOf(), submitted()

### Community 97 - "Community 97"
Cohesion: 0.73
Nodes (4): checkDigit(), formatCnpj(), isValidCnpj(), onlyDigits()

### Community 100 - "Community 100"
Cohesion: 0.60
Nodes (4): PATH, reserve_client(), send_entry(), concorrencia.sh script

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 671 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ok()` connect `Community 0` to `Community 2`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 19`, `Community 20`, `Community 24`, `Community 27`, `Community 30`, `Community 31`, `Community 36`, `Community 39`, `Community 40`, `Community 42`, `Community 43`, `Community 45`, `Community 46`, `Community 47`, `Community 48`, `Community 49`, `Community 51`, `Community 57`, `Community 60`, `Community 66`, `Community 69`, `Community 73`, `Community 76`, `Community 77`, `Community 86`, `Community 88`, `Community 89`, `Community 90`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08397766323024054 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Community 5` to `Community 0`, `Community 2`, `Community 3`, `Community 6`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 21`, `Community 24`, `Community 29`, `Community 30`, `Community 31`, `Community 34`, `Community 35`, `Community 36`, `Community 37`, `Community 39`, `Community 40`, `Community 41`, `Community 42`, `Community 44`, `Community 45`, `Community 53`, `Community 54`, `Community 55`, `Community 56`, `Community 59`, `Community 62`, `Community 63`, `Community 69`, `Community 71`, `Community 72`, `Community 74`, `Community 77`, `Community 78`, `Community 80`, `Community 84`, `Community 87`, `Community 91`, `Community 94`, `Community 96`, `Community 97`, `Community 98`, `Community 99`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.054871220604703244 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Community 51` to `Community 4`, `Community 7`, `Community 9`, `Community 10`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 28`, `Community 30`, `Community 31`, `Community 35`, `Community 36`, `Community 40`, `Community 41`, `Community 42`, `Community 44`, `Community 45`, `Community 54`, `Community 56`, `Community 57`, `Community 59`, `Community 62`, `Community 65`, `Community 66`, `Community 68`, `Community 71`, `Community 72`, `Community 74`, `Community 75`, `Community 77`, `Community 80`, `Community 83`, `Community 84`, `Community 86`, `Community 89`, `Community 95`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.061748195669607056 - nodes in this community are weakly interconnected._