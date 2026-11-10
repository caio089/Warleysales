# Plano de Implementação: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o fluxo central do Warley com provisionamento de estoque bloqueado desde a solicitação, formulário de formalização da contratação (ao atingir 100% dos documentos), fila de homologação e veredito final exclusivo de Warley para liberação do saldo para uso, cálculo em tempo real e consolidação da economia gerada, além de ajustes imediatos de usabilidade.

**Architecture:** Nova migração relacional criando a tabela `process_formalizations` e adicionando colunas `blocked` em `stock_balances` e `estimated_value` em `purchase_requests`. Novo serviço `FormalizationService` orquestrando o ciclo de vida, transição atômica de saldo bloqueado para disponível no veredito de Warley, cards de indicadores de economia e estoque, e componentes de UI dedicados.

**Tech Stack:** Next.js 16 (App Router / Server Actions), React 19, Supabase (Postgres & Storage), Tailwind CSS / Base UI, Vitest, TypeScript.

## Global Constraints

- A liberação do saldo para "Pronto para uso" exige estritamente o veredito de Warley (`actor.isCentralAdmin`).
- Exigir rigorosamente 100% dos 7 documentos obrigatórios do processo antes de habilitar o envio da formalização.
- Toda transição de estado grava auditoria detalhada em `audit_logs`.
- Preservar os 267 testes passando sem regressões.

---

### Task 1: Migração SQL e Entidades de Domínio (Formalizações e Estoque Bloqueado)

**Files:**
- Create: `supabase/migrations/20261110000002_formalizations_and_blocked_stock.sql`
- Create: `src/modules/formalizations/domain/formalization.ts`
- Modify: `src/modules/inventory/domain/stock.ts`
- Modify: `src/server/memory/inventory-repository.ts` (ou adapters de estoque)
- Modify: `src/server/supabase/adapters/inventory.ts`
- Test: `src/modules/inventory/domain/inventory.test.ts`

**Interfaces:**
- Consumes: Tipos de saldo existentes em `stock.ts`.
- Produces: Tipo `StockBalance` com propriedade `blocked: number`, e tipos de domínio `ProcessFormalization` em `formalization.ts`.

- [ ] **Step 1: Criar arquivo de migração SQL**

Criar `supabase/migrations/20261110000002_formalizations_and_blocked_stock.sql`:
```sql
-- Migration 0002 Onda 1: formalizações, estoque bloqueado e valor estimado
alter table public.purchase_requests
  add column if not exists estimated_value numeric(15,2) check (estimated_value is null or estimated_value >= 0);

alter table public.stock_balances
  add column if not exists blocked numeric(15,3) not null default 0 check (blocked >= 0);

create table if not exists public.process_formalizations (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.administrative_processes (id) on delete cascade,
  request_id uuid references public.purchase_requests (id) on delete set null,
  council_id uuid not null references public.councils (id),
  supplier_id uuid not null references public.suppliers (id),
  instrument_type text not null check (instrument_type in ('ata', 'contrato', 'empenho')),
  instrument_number text not null check (length(trim(instrument_number)) > 0),
  estimated_value numeric(15,2) not null check (estimated_value >= 0),
  contracted_value numeric(15,2) not null check (contracted_value >= 0),
  savings_value numeric(15,2) not null,
  savings_percent numeric(5,2) not null,
  status text not null default 'aguardando_homologacao'
    check (status in ('aguardando_homologacao', 'homologado', 'rejeitada')),
  homologated_by uuid references public.profiles (id),
  homologated_at timestamptz,
  homologation_note text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (process_id)
);

create index if not exists idx_process_formalizations_council on public.process_formalizations (council_id);
create index if not exists idx_process_formalizations_status on public.process_formalizations (status);
```

- [ ] **Step 2: Criar tipos de domínio em `src/modules/formalizations/domain/formalization.ts`**

Definir interfaces, cálculo de economia e schemas de validação Zod para formalizações:
```typescript
export type InstrumentType = "ata" | "contrato" | "empenho";
export type FormalizationStatus = "aguardando_homologacao" | "homologado" | "rejeitada";

export interface ProcessFormalization {
  id: string;
  processId: string;
  requestId: string | null;
  councilId: string;
  supplierId: string;
  instrumentType: InstrumentType;
  instrumentNumber: string;
  estimatedValue: number;
  contractedValue: number;
  savingsValue: number;
  savingsPercent: number;
  status: FormalizationStatus;
  homologatedBy: string | null;
  homologatedAt: Date | null;
  homologationNote: string | null;
  createdBy: string;
  createdAt: Date;
}

export function calculateSavings(estimated: number, contracted: number): { savingsValue: number; savingsPercent: number } {
  const savingsValue = Math.round((estimated - contracted) * 100) / 100;
  const savingsPercent = estimated > 0 ? Math.round(((savingsValue / estimated) * 100) * 100) / 100 : 0;
  return { savingsValue, savingsPercent };
}
```

- [ ] **Step 3: Atualizar `StockBalance` em `src/modules/inventory/domain/stock.ts`**

Adicionar `blocked: number` e garantir cálculo consistente em `availableOf`:
```typescript
export interface StockBalance {
  physical: number;
  reserved: number;
  blocked: number;
}
```

- [ ] **Step 4: Atualizar adaptadores de estoque (memória e Supabase)**

Garantir que `blocked` seja persistido e retornado em `stock_balances`.

- [ ] **Step 5: Rodar testes de estoque**

Run: `npm run test src/modules/inventory/`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261110000002_formalizations_and_blocked_stock.sql src/modules/formalizations/domain/formalization.ts src/modules/inventory/domain/stock.ts src/server/
git commit -m "feat(dominio): criar modelo de formalizacao e campo blocked em stock_balances"
```

---

### Task 2: Provisionamento Automático de Estoque Bloqueado pela Solicitação

**Files:**
- Modify: `src/modules/purchases/domain/purchases.ts`
- Modify: `src/modules/purchases/service.ts`
- Modify: `src/modules/inventory/service.ts`
- Test: `src/modules/purchases/service.test.ts`

**Interfaces:**
- Consumes: Itens da solicitação (`materialId`, `quantity`) e `estimatedValue?: number`.
- Produces: Quantidade incrementada no saldo `blocked` do conselho/órgão para cada item ao criar a solicitação.

- [ ] **Step 1: Escrever teste em `purchases/service.test.ts`**

Testar que ao criar a solicitação, o estoque é provisionado com status bloqueado para o órgão:
```typescript
it("provisiona estoque bloqueado ao criar solicitacao com itens", async () => {
  const r = await ctx.service.create(operatorOf(COUNCIL_A), {
    councilId: COUNCIL_A,
    title: "Aquisição de mesas",
    estimatedValue: 5000,
    items: [{ materialId: MATERIAL, quantity: 10 }],
  });
  expect(r.ok).toBe(true);

  const levels = await ctx.inventory.listLevels(operatorOf(COUNCIL_A), COUNCIL_A);
  const item = levels.data?.find((l) => l.materialId === MATERIAL);
  expect(item?.blocked).toBe(10);
  expect(item?.available).toBe(0); // Disponível ainda é 0
});
```

- [ ] **Step 2: Rodar teste para verificar falha**

Run: `npx vitest run src/modules/purchases/service.test.ts -t "provisiona estoque bloqueado"`  
Expected: FAIL

- [ ] **Step 3: Implementar `provisionBlocked` em `InventoryService`**

Em `src/modules/inventory/service.ts`, adicionar método atômico para provisionar estoque bloqueado:
```typescript
async provisionBlocked(actor: Actor, councilId: string, items: { materialId: string; quantity: number }[]): Promise<Result<void>>
```

- [ ] **Step 4: Chamar `provisionBlocked` em `PurchaseService.create`**

Atualizar `src/modules/purchases/service.ts` para persistir `estimatedValue` e acionar `this.inventory.provisionBlocked`.

- [ ] **Step 5: Rodar testes**

Run: `npx vitest run src/modules/purchases/service.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/purchases/ src/modules/inventory/
git commit -m "feat(estoque): provisionar saldo bloqueado na criacao da solicitacao"
```

---

### Task 3: Serviço de Formalização e Veredito de Warley (`FormalizationService`)

**Files:**
- Create: `src/modules/formalizations/service.ts`
- Create: `src/modules/formalizations/repository.ts`
- Create: `src/server/memory/formalization-repository.ts`
- Create: `src/server/supabase/adapters/formalizations.ts`
- Modify: `src/server/container.ts`
- Create: `src/modules/formalizations/service.test.ts`

**Interfaces:**
- Consumes: `ProcessService`, `InventoryService`, `AuditRecorder`.
- Produces: Métodos `submit(actor, input)`, `homologate(actor, input)`, `reject(actor, input)`, `getByProcess(actor, processId)`, `getSavingsSummary(actor, councilId?)`, `listPending(actor)`.

- [ ] **Step 1: Escrever teste de unidade para o fluxo completo com chancela de Warley**

Criar `src/modules/formalizations/service.test.ts`:
```typescript
it("exige 100% dos documentos para submeter e exige Warley para homologar e liberar estoque", async () => {
  // 1. Processo com < 100% -> submit falha
  // 2. Processo com 100% -> submit gera status aguardando_homologacao
  // 3. Operador tenta homologar -> FORBIDDEN
  // 4. Warley (isCentralAdmin) homologa -> status homologado, blocked -> physical no estoque
});
```

- [ ] **Step 2: Rodar teste para verificar falha**

Run: `npx vitest run src/modules/formalizations/service.test.ts`  
Expected: FAIL (serviço não implementado).

- [ ] **Step 3: Implementar `FormalizationService` e repositórios**

Implementar regras:
1. `submit`: Verifica se o processo possui 100% dos documentos (`documentalComplete` ou todos os 7 tipos válidos). Grava a formalização com economia calculada e status `aguardando_homologacao`.
2. `homologate`: Valida `guard(this.audit, actor, "formalization.homologate")` onde apenas `actor.isCentralAdmin` é permitido.
3. Ao homologar: Chama `this.inventory.releaseBlockedStock(councilId, items)` que debita `blocked` e credita `physical`.
4. Grava auditoria estruturada.

- [ ] **Step 4: Registrar `formalizations` no container em `src/server/container.ts`**

- [ ] **Step 5: Rodar testes da nova suíte**

Run: `npx vitest run src/modules/formalizations/service.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/formalizations/ src/server/
git commit -m "feat(formalizacao): implementar FormalizationService e regra de homologacao do Warley"
```

---

### Task 4: Card de Formalização no Processo e Cálculo de Economia em Tempo Real

**Files:**
- Create: `src/modules/formalizations/actions.ts`
- Create: `src/app/(app)/processos/[id]/formalization-card.tsx`
- Modify: `src/app/(app)/processos/[id]/page.tsx`

**Interfaces:**
- Consumes: `processId`, status documental, formalização existente (se houver), permissões do ator (`isWarley`).
- Produces: Card reativo exibindo aviso de espera (<100%), formulário com cálculo de economia em tempo real (aos 100%) e botões de homologação para Warley.

- [ ] **Step 1: Criar Server Actions em `src/modules/formalizations/actions.ts`**

Exportar:
- `submitFormalizationFormAction`
- `homologateFormalizationAction`
- `rejectFormalizationAction`

- [ ] **Step 2: Criar componente `FormalizationCard` em `src/app/(app)/processos/[id]/formalization-card.tsx`**

Implementar:
- Card com visual institucional do design system.
- Prévia de economia calculada dinamicamente: `R$ (Valor Estimado - Valor Contratado)` e porcentagem com badge verde de destaque.
- Quando `status === "aguardando_homologacao"`, exibir badge amarelo *"Aguardando Homologação do Warley"*.
- Se `isWarley === true`, renderizar botões de decisão: *"Homologar e Liberar Estoque"* (com diálogo de confirmação) e *"Recusar"*.
- Quando `status === "homologado"`, exibir resumo consolidado com fornecedor, instrumento e economia obtida.

- [ ] **Step 3: Integrar `FormalizationCard` em `src/app/(app)/processos/[id]/page.tsx`**

Carregar dados da formalização em `loadScreen` e renderizar o card entre o progresso documental e a lista de documentos.

- [ ] **Step 4: Executar typecheck e testes**

Run: `npm run typecheck && npm run test`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/formalizations/actions.ts src/app/(app)/processos/[id]/formalization-card.tsx src/app/(app)/processos/[id]/page.tsx
git commit -m "feat(processos): adicionar card de formalizacao com calculo de economia e veredito do Warley"
```

---

### Task 5: Fila de Veredito de Warley no Dashboard e Destaque de Economia no Portal do Gestor

**Files:**
- Create: `src/app/(app)/dashboard/formalization-queue.tsx`
- Create: `src/app/(app)/meu-conselho/savings-history-dialog.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`
- Modify: `src/app/(app)/meu-conselho/page.tsx`

**Interfaces:**
- Consumes: `services.formalizations.listPending(actor)` e `services.formalizations.getSavingsSummary(actor, councilId)`.
- Produces: Fila de homologação rápida no `/dashboard` de Warley e card de economia acumulada com histórico em `/meu-conselho`.

- [ ] **Step 1: Criar componente `FormalizationQueue` no Dashboard**

Exibir no topo do `/dashboard` quando o usuário for Administrador Central e houver processos pendentes:
- Órgão solicitante, processo, objeto, valor estimado, valor contratado, economia apurada.
- Botão direto de homologação rápida via `homologateFormalizationAction`.

- [ ] **Step 2: Criar card de Economia Gerada e diálogo de histórico em `/meu-conselho`**

Exibir KPI institucional:
- `Valor Total Economizado` (R$)
- `Percentual Médio de Redução` (%)
- Botão *"Ver Histórico de Contratações"* que abre tabela com cada processo homologado.

- [ ] **Step 3: Integrar nos componentes das páginas**

Atualizar `src/app/(app)/dashboard/page.tsx` e `src/app/(app)/meu-conselho/page.tsx`.

- [ ] **Step 4: Executar typecheck e testes**

Run: `npm run typecheck && npm run test`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/dashboard/ src/app/(app)/meu-conselho/
git commit -m "feat(painel): adicionar fila de veredito de Warley e kpi de economia gerada com historico"
```

---

### Task 6: Segmentação de Estoque (Bloqueado, Pronto para Uso, Utilizado, % Liberado)

**Files:**
- Modify: `src/app/(app)/estoque/page.tsx`
- Modify: `src/modules/inventory/service.ts`

**Interfaces:**
- Consumes: Dados agregados de estoque (`blocked`, `physical`, `reserved`).
- Produces: 4 KPIs de cabeçalho e tabela com colunas detalhando estoque bloqueado vs. estoque pronto para uso.

- [ ] **Step 1: Atualizar agregação em `InventoryService`**

Calcular totais de estoque bloqueado, pronto para uso, utilizado e percentual liberado.

- [ ] **Step 2: Adicionar os 4 Cards de Destaque em `/estoque/page.tsx`**

Cards:
1. 🔒 **Bloqueado em Formalização**
2. ✅ **Pronto para Uso (Liberado)**
3. 📦 **Utilizado / Distribuído**
4. 📊 **% do Saldo Liberado**

- [ ] **Step 3: Atualizar colunas da tabela de estoque**

Exibir colunas separadas: `Bloqueado`, `Pronto para Uso`, `Reservado` e `Total`.

- [ ] **Step 4: Executar typecheck e testes**

Run: `npm run typecheck && npm run test`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/estoque/page.tsx src/modules/inventory/
git commit -m "feat(estoque): exibir estados de estoque bloqueado e pronto para uso com indicadores"
```

---

### Task 7: Ajustes Imediatos de Usabilidade (Botão Voltar, Visibilidade de Nova Solicitação e Termo Órgão)

**Files:**
- Modify: `src/app/(app)/processos/[id]/page.tsx`
- Modify: `src/app/(app)/solicitacoes/page.tsx`
- Modify: `src/shared/lib/authz/navigation.ts`

**Interfaces:**
- Consumes: Navegação do App Shell e rotas de processos e solicitações.
- Produces: Botão de retorno padronizado, botão de nova solicitação resiliente e rótulos unificados para "Órgão".

- [ ] **Step 1: Adicionar botão "← Voltar para Processos" em `/processos/[id]/page.tsx`**

Adicionar link estilizado de navegação no cabeçalho antes do título do processo.

- [ ] **Step 2: Garantir visibilidade do botão "Nova Solicitação" em `/solicitacoes/page.tsx`**

Manter o botão sempre renderizado; se o usuário não tiver permissão para criar, renderizar desabilitado com tooltip ou diálogo explicativo.

- [ ] **Step 3: Padronizar nomenclatura para "Órgão"**

Em `src/shared/lib/authz/navigation.ts` e cabeçalhos de tela, atualizar "Empresas" / "Conselhos" para **"Órgãos"** ou **"Órgãos Parceiros"**.

- [ ] **Step 4: Executar typecheck e testes**

Run: `npm run typecheck && npm run test`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/processos/[id]/page.tsx src/app/(app)/solicitacoes/page.tsx src/shared/lib/authz/navigation.ts
git commit -m "fix(usabilidade): adicionar botao voltar, visibilidade de nova solicitacao e termo Orgao"
```

---

### Task 8: Consolidação, Validação Geral e Empacotamento de Migrações

**Files:**
- Modify: `supabase/apply_all.sql`
- Run: `npm run db:bundle`
- Run: `npm run db:check`
- Run: `npm run test`
- Run: `npm run typecheck`
- Run: `npm run build`

- [ ] **Step 1: Regenerar o bundle de migrações SQL**

Run: `npm run db:bundle`  
Expected: `supabase/apply_all.sql` consolidado com a nova migração `20261110000002_formalizations_and_blocked_stock.sql`.

- [ ] **Step 2: Executar checagem do banco**

Run: `npm run db:check`  
Expected: PASS

- [ ] **Step 3: Executar suíte completa de testes**

Run: `npm run test`  
Expected: PASS (todos os testes verdes).

- [ ] **Step 4: Executar typecheck**

Run: `npm run typecheck`  
Expected: PASS (0 erros).

- [ ] **Step 5: Executar build de produção**

Run: `npm run build`  
Expected: PASS.

- [ ] **Step 6: Commit final da Onda 1**

```bash
git add -A
git commit -m "chore(onda1): consolidar ciclo de estoque bloqueado, formalizacao, economia e usabilidade"
```
