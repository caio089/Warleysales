# Plano de Implementação: Vínculo Solicitação-Processo e Painel Rápido de Anexagem

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar a criação de solicitações de compra com a abertura automática de processos administrativos (com opção no formulário) e disponibilizar um painel lateral (*Sheet*) com 1 clique na listagem de processos para anexar os 7 documentos obrigatórios com atualização de progresso em tempo real.

**Architecture:** Evolução do modelo relacional com coluna `process_id` em `purchase_requests`, cálculo automático do próximo número de processo anual (`NNN/AAAA`) no conselho, orquestração no serviço de compras com auditoria e componente `ProcessAttachmentSheet` na rota `/processos` com suporte a deep-link (`?abrir=<id>`).

**Tech Stack:** Next.js 16 (App Router / Server Actions), React 19, Supabase (Postgres & Storage), Base UI / Tailwind CSS, Vitest, TypeScript.

## Global Constraints

- Preservar integridade de auditoria e controle de acesso via `guard(..., "request.create" / "process.create")`.
- Respeitar validação rígida de arquivos (PDF e DOCX, magic bytes, máximo 25 MB, hash SHA-256).
- Não quebrar a suíte de testes de domínio existente (261 testes passando).
- Mudanças no banco acompanham migration SQL numerada e atualização equivalente nos repositórios em memória.

---

### Task 1: Migração SQL e Suporte a `process_id` nos Repositórios

**Files:**
- Create: `supabase/migrations/20261110000001_purchase_request_process_id.sql`
- Modify: `src/modules/purchases/domain/purchase-request.ts`
- Modify: `src/server/memory/purchase-request-repository.ts`
- Modify: `src/server/supabase/adapters/purchases.ts`
- Test: `src/modules/purchases/service.test.ts`

**Interfaces:**
- Consumes: Tipos de domínio existentes em `purchase-request.ts`.
- Produces: Propriedade `processId: string | null` no tipo `PurchaseRequest` e persistência nos adaptadores de banco e memória.

- [ ] **Step 1: Criar arquivo de migração SQL**

Criar `supabase/migrations/20261110000001_purchase_request_process_id.sql`:
```sql
-- Migration: adiciona process_id em purchase_requests para vínculo com processos administrativos
alter table public.purchase_requests
  add column if not exists process_id uuid references public.administrative_processes (id) on delete set null;

create index if not exists idx_purchase_requests_process_id on public.purchase_requests (process_id);
```

- [ ] **Step 2: Atualizar tipos de domínio em `src/modules/purchases/domain/purchase-request.ts`**

Adicionar `processId?: string | null` em `PurchaseRequest` e nos tipos de inserção:
```typescript
export interface PurchaseRequest {
  id: string;
  councilId: string;
  title: string;
  status: RequestStatus;
  processId?: string | null;
  items: PurchaseRequestItem[];
  events: PurchaseRequestEvent[];
  receiptKeys: string[];
  createdBy: string;
  createdAt: string;
}
```

- [ ] **Step 3: Atualizar repositório em memória `src/server/memory/purchase-request-repository.ts`**

Garantir que `processId: entity.processId ?? null` seja preservado no `insert` e retornado no `findById`.

- [ ] **Step 4: Atualizar adaptador Supabase `src/server/supabase/adapters/purchases.ts`**

Mapear a coluna `process_id` para `processId` nas leituras e gravações do Supabase:
```typescript
process_id: entity.processId ?? null,
```
e na leitura:
```typescript
processId: row.process_id ?? null,
```

- [ ] **Step 5: Executar teste de persistência da solicitação**

Run: `npm run test src/modules/purchases/service.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261110000001_purchase_request_process_id.sql src/modules/purchases/domain/purchase-request.ts src/server/memory/purchase-request-repository.ts src/server/supabase/adapters/purchases.ts
git commit -m "feat(banco): adicionar coluna process_id em purchase_requests"
```

---

### Task 2: Geração Automática do Próximo Número de Processo (`nextSequence`)

**Files:**
- Modify: `src/modules/processes/service.ts`
- Modify: `src/server/memory/process-repository.ts`
- Modify: `src/server/supabase/adapters/processes.ts`
- Test: `src/modules/processes/service.test.ts`

**Interfaces:**
- Consumes: `councilId: string`, `year: number`.
- Produces: Método `nextSequence(councilId: string, year: number): Promise<number>` no `ProcessRepository` e método público `getNextNumber(councilId: string, year: number): Promise<string>` em `ProcessService`.

- [ ] **Step 1: Escrever teste de unidade para cálculo do próximo sequencial**

Adicionar em `src/modules/processes/service.test.ts`:
```typescript
it("calcula o próximo número sequencial para o conselho no ano vigente", async () => {
  const next1 = await ctx.processes.getNextNumber(COUNCIL_A, 2026);
  expect(next1).toBe("001/2026");

  await ctx.processes.create(managerOf(COUNCIL_A), { councilId: COUNCIL_A, number: "001/2026", title: "Processo 1" });
  const next2 = await ctx.processes.getNextNumber(COUNCIL_A, 2026);
  expect(next2).toBe("002/2026");
});
```

- [ ] **Step 2: Rodar teste para verificar falha**

Run: `npx vitest run src/modules/processes/service.test.ts -t "calcula o próximo número sequencial"`  
Expected: FAIL com `getNextNumber is not a function`.

- [ ] **Step 3: Implementar `nextSequence` no repositório em memória e Supabase**

Em `src/server/memory/process-repository.ts`:
```typescript
async nextSequence(councilId: string, year: number): Promise<number> {
  const matches = this.items.filter((p) => p.councilId === councilId && p.year === year);
  if (matches.length === 0) return 1;
  const max = Math.max(...matches.map((p) => p.sequence));
  return max + 1;
}
```

Em `src/server/supabase/adapters/processes.ts`:
```typescript
async nextSequence(councilId: string, year: number): Promise<number> {
  const { data, error } = await this.client
    .from("administrative_processes")
    .select("sequence")
    .eq("council_id", councilId)
    .eq("year", year)
    .order("sequence", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return 1;
  return Number(data.sequence) + 1;
}
```

- [ ] **Step 4: Expor `getNextNumber` em `ProcessService`**

Em `src/modules/processes/service.ts`:
```typescript
async getNextNumber(councilId: string, year?: number): Promise<string> {
  const targetYear = year ?? new Date().getFullYear();
  const seq = await this.processes.nextSequence(councilId, targetYear);
  return formatProcessNumber(seq, targetYear);
}
```

- [ ] **Step 5: Rodar testes para verificar sucesso**

Run: `npx vitest run src/modules/processes/service.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/processes/service.ts src/server/memory/process-repository.ts src/server/supabase/adapters/processes.ts src/modules/processes/service.test.ts
git commit -m "feat(processos): implementar sequenciamento automatico nextSequence"
```

---

### Task 3: Orquestração na Criação de Solicitação (`createProcess`)

**Files:**
- Modify: `src/modules/purchases/domain/purchases.ts` (schema do input de criação)
- Modify: `src/modules/purchases/service.ts`
- Modify: `src/server/container.ts`
- Test: `src/modules/purchases/service.test.ts`

**Interfaces:**
- Consumes: Campo `createProcess?: boolean` em `createRequestSchema`.
- Produces: Solicitação criada com `processId` apontando para o novo processo administrativo quando `createProcess === true`.

- [ ] **Step 1: Escrever teste comutativo em `purchases/service.test.ts`**

```typescript
it("cria processo administrativo correspondente quando createProcess é verdadeiro", async () => {
  const r = await ctx.service.create(operatorOf(COUNCIL_A), {
    councilId: COUNCIL_A,
    title: "Aquisição de computadores",
    createProcess: true,
    items: [{ materialId: MATERIAL, quantity: 2 }],
  });
  expect(r.ok).toBe(true);
  if (!r.ok) return;
  expect(r.data.processId).toBeDefined();
  expect(typeof r.data.processId).toBe("string");

  const proc = await ctx.processes.get(operatorOf(COUNCIL_A), r.data.processId!);
  expect(proc.ok).toBe(true);
  if (!proc.ok) return;
  expect(proc.data.process.number).toBe("001/2026");
  expect(proc.data.process.title).toBe("Aquisição de computadores");
});
```

- [ ] **Step 2: Rodar teste para verificar falha**

Run: `npx vitest run src/modules/purchases/service.test.ts -t "cria processo administrativo correspondente"`  
Expected: FAIL (processId is undefined).

- [ ] **Step 3: Implementar orquestração em `purchases/service.ts`**

1. Injetar `ProcessService` em `PurchaseService`:
```typescript
constructor(
  private readonly repository: PurchaseRequestRepository,
  private readonly atas: AtaService,
  private readonly inventory: InventoryService,
  private readonly processes: ProcessService,
  private readonly audit: AuditRecorder,
  private readonly runtime: RuntimeDeps,
)
```
2. Em `create`:
```typescript
let processId: string | null = null;
if (d.createProcess) {
  const currentYear = new Date(now).getFullYear();
  const processNumber = await this.processes.getNextNumber(d.councilId, currentYear);
  const createdProc = await this.processes.create(actor, {
    councilId: d.councilId,
    number: processNumber,
    title: d.title,
  });
  if (createdProc.ok) {
    processId = createdProc.data.id;
  }
}
```
3. Passar `processId` no `repository.insert(...)`.

- [ ] **Step 4: Atualizar container de injeção em `src/server/container.ts`**

Passar `processes` para a inicialização de `purchases`.

- [ ] **Step 5: Rodar testes da suíte de compras e container**

Run: `npx vitest run src/modules/purchases/ src/server/container.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/purchases/domain/purchases.ts src/modules/purchases/service.ts src/server/container.ts src/modules/purchases/service.test.ts
git commit -m "feat(compras): orquestrar criacao automatica de processo ao criar solicitacao"
```

---

### Task 4: Formulário de Nova Solicitação e Server Action

**Files:**
- Modify: `src/modules/purchases/actions.ts`
- Modify: `src/app/(app)/solicitacoes/nova/new-request-form.tsx`

**Interfaces:**
- Consumes: Checkbox `createProcess` do formulário.
- Produces: `FormData` contendo `createProcess: "on"` e repasse para `services.purchases.create`.

- [ ] **Step 1: Atualizar Server Action `createRequestFormAction`**

Em `src/modules/purchases/actions.ts`:
```typescript
const createProcess = formData.get("createProcess") === "on" || formData.get("createProcess") === "true";
const result = await runAction(
  ({ services, actor }) =>
    services.purchases.create(actor, {
      councilId: formData.get("councilId"),
      title: formData.get("title"),
      createProcess,
      items: readItems(formData),
    }),
  "Solicitação criada como rascunho.",
);
```

- [ ] **Step 2: Adicionar Checkbox em `new-request-form.tsx`**

Adicionar componente com estilização acessível do Design System:
```tsx
<label className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3.5 transition-colors hover:bg-muted/30 cursor-pointer">
  <input
    type="checkbox"
    name="createProcess"
    defaultChecked
    value="on"
    className="mt-0.5 size-4 rounded border-input text-primary focus:ring-ring"
  />
  <div className="space-y-0.5 text-sm">
    <span className="font-medium text-foreground">Gerar processo administrativo correspondente</span>
    <p className="text-xs text-muted-foreground">
      Abre automaticamente o processo para inserção dos 7 documentos obrigatórios (DFD, ETP, MR, TR, PP, PJ e ED).
    </p>
  </div>
</label>
```

- [ ] **Step 3: Verificar tipagem e build**

Run: `npm run typecheck`  
Expected: PASS sem erros de tipo.

- [ ] **Step 4: Commit**

```bash
git add src/modules/purchases/actions.ts src/app/(app)/solicitacoes/nova/new-request-form.tsx
git commit -m "feat(solicitacoes): incluir opcao de gerar processo no formulario"
```

---

### Task 5: Card de Destaque do Processo Vinculado em `/solicitacoes/[id]`

**Files:**
- Modify: `src/app/(app)/solicitacoes/[id]/page.tsx`

**Interfaces:**
- Consumes: `request.processId`.
- Produces: Card de destaque com número do processo, badges de status, progresso e botão com link direto para `/processos?abrir=<processId>`.

- [ ] **Step 1: Carregar visão do processo vinculado na página**

Em `src/app/(app)/solicitacoes/[id]/page.tsx`:
Quando `request.processId` estiver presente, consultar `services.processes.get(actor, request.processId)`.

- [ ] **Step 2: Renderizar o Card Institucional de Destaque**

Exibir bloco destacado:
- Título: *"Processo Administrativo Vinculado"*
- Número: `view.process.number` (ex.: `001/2026`)
- Badges: Situação (`Em andamento`) e Documentação (`0/7 documentos anexados`)
- Barra de Progresso
- Botão Primário: `<Link href={/processos?abrir=${proc.id}} className={buttonVariants({ size: "sm" })}>Anexar documentos do processo →</Link>`

- [ ] **Step 3: Testar renderização e typecheck**

Run: `npm run typecheck`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/solicitacoes/[id]/page.tsx
git commit -m "feat(solicitacoes): exibir card de processo vinculado com atalho de anexagem"
```

---

### Task 6: Painel Lateral (*Sheet*) de Anexagem Rápida em `/processos`

**Files:**
- Create: `src/app/(app)/processos/process-attachment-sheet.tsx`
- Modify: `src/modules/documents/actions.ts` (ação para carregar anexos do processo)
- Modify: `src/app/(app)/processos/page.tsx`

**Interfaces:**
- Consumes: Parâmetro `?abrir=<processId>` ou clique em linha/botão da tabela.
- Produces: Gaveta lateral deslizante à direita com os 7 documentos obrigatórios, upload direto com conferência SHA-256 e barra de progresso reativa.

- [ ] **Step 1: Criar ação de consulta de documentos em `src/modules/documents/actions.ts`**

```typescript
export async function loadProcessDocumentsAction(processId: string): Promise<Result<{
  process: AdministrativeProcess;
  documents: Attachment[];
  validTypes: string[];
}>> {
  // Retorna os documentos ativos vinculados ao processo para renderizar os cards e status
}
```

- [ ] **Step 2: Construir o componente `ProcessAttachmentSheet`**

Criar `src/app/(app)/processos/process-attachment-sheet.tsx`:
- Usar `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`.
- Ler `searchParams.get("abrir")` para abrir automaticamente quando direcionado pela solicitação.
- Renderizar cabeçalho com número do processo, título e barra de progresso `ProgressBar`.
- Renderizar a esteira com os 7 tipos documentais (`DOCUMENT_TYPES`), exibindo status verde para anexados e botão de `FileUpload` para pendentes.
- Conectar o upload a `prepareDocumentUploadAction` e `confirmDocumentUploadAction`.
- Ao concluir o upload: atualizar os anexos do processo no estado local e emitir `router.refresh()` para sincronizar a tabela ao fundo.

- [ ] **Step 3: Integrar botão de ação na listagem de `/processos/page.tsx`**

Na tabela de processos, incluir coluna de ação rápida com botão de clipe *"Anexar"* e vincular à abertura do `ProcessAttachmentSheet`.

- [ ] **Step 4: Testar typecheck e testes de interface**

Run: `npm run typecheck && npm run test`  
Expected: PASS sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/modules/documents/actions.ts src/app/(app)/processos/process-attachment-sheet.tsx src/app/(app)/processos/page.tsx
git commit -m "feat(processos): implementar painel lateral Sheet de anexagem rapida com 1 clique"
```

---

### Task 7: Verificação Geral e Execução da Migração no Supabase

**Files:**
- Execute: Migração SQL no projeto Supabase configurado em `.env.local`
- Test: Suíte completa de testes (`npm run test`)
- Verify: Verificação de ponta a ponta (`npm run db:check`)

- [ ] **Step 1: Aplicar a migração `purchase_request_process_id.sql` no banco Supabase**

Executar a adição de coluna via service_role / client Postgres.

- [ ] **Step 2: Rodar `npm run db:check`**

Run: `npm run db:check`  
Expected: PASS (Tudo certo).

- [ ] **Step 3: Rodar suíte completa de testes**

Run: `npm run test`  
Expected: PASS (todos os testes passando).

- [ ] **Step 4: Rodar typecheck**

Run: `npm run typecheck`  
Expected: PASS (0 erros de TypeScript).

- [ ] **Step 5: Commit final de verificação**

```bash
git add -A
git commit -m "chore: validar integracao ponta a ponta de solicitacoes e processos"
```
