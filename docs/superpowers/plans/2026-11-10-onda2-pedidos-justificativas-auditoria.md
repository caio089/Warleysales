# Plano de Implementação: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o fluxo de Pedidos de Materiais pelos órgãos contra o saldo liberado em estoque (com reserva atômica e aprovação de Warley), a trava de justificativa obrigatória institucional para processos e entregas concluídos abaixo de 100%, e a trilha de auditoria multidimensional com filtros estruturados e abas na página de Relatórios.

**Architecture:** Sistema modular em Next.js 16 (App Router + Turbopack) e Supabase (PostgreSQL + RLS + Storage) com arquitetura orientada a serviços e repositórios intercambiáveis (Supabase / InMemory). Integridade contábil estrita de estoque (R11), RBAC institucional com veredito exclusivo de Warley para homologação de pedidos (`actor.isCentralAdmin`), e persistência auditada imutável.

**Tech Stack:** Next.js 16.4.4, React 19, TypeScript, Tailwind CSS, Lucide React, Vitest, Supabase JS Client, Zod v4.

## Global Constraints

- Nunca quebrar o isolamento multi-tenant (R14): usuários de órgãos só visualizam dados de seus respectivos órgãos; apenas `isCentralAdmin` (Warley) tem visibilidade global.
- Manter integridade contábil imutável no estoque (R11): saldo bloqueado (`blocked`) é inacessível para pedidos; pedidos reservam saldo pronto para uso (`reserved = reserved + qty`, `available = physical - reserved`); a aprovação de Warley baixa o saldo físico no ledger (`stock_movements` com tipo `"transfer_out"`).
- O veredito de aprovação/rejeição de pedidos de material é estritamente exclusivo de Warley (`actor.isCentralAdmin === true`).
- A justificativa para encerramentos abaixo de 100% é obrigatória no schema Zod, validada no servidor e registrada em `audit_logs`.
- Sempre executar `npm run typecheck` e `npm test` ao final de cada tarefa antes do review gate.
- No Windows PowerShell, caminhos com parênteses (ex.: `src/app/(app)/...`) devem ser passados sempre com aspas duplas nos comandos do Git.

---

### Task 1: Migração SQL e Modelo de Domínio de Pedidos de Materiais (`material_orders`)

**Files:**
- Create: `supabase/migrations/20261110000003_material_orders.sql`
- Create: `src/modules/orders/domain/order.ts`
- Create: `src/modules/orders/domain/order.test.ts`
- Create: `src/modules/orders/schemas.ts`
- Modify: `src/modules/inventory/domain/stock.ts`
- Modify: `src/modules/inventory/domain/inventory.test.ts`

**Interfaces:**
- Consumes: `StockBalance`, `availableOf` de `src/modules/inventory/domain/stock.ts`.
- Produces: `MaterialOrder`, `MaterialOrderItem`, funções de domínio `createMaterialOrder`, `approveMaterialOrder`, `rejectMaterialOrder`, `cancelMaterialOrder`, `reserveForOrder`, `unreserveOrder`, `dispatchReservedOrder`.

- [ ] **Step 1: Escrever testes unitários de domínio para `order.ts` e extensões de `stock.ts`**

Criar `src/modules/orders/domain/order.test.ts`:
- Criação de pedido: valida quantidade positiva, rejeita se quantidade solicitada for maior que `available` (físico - reservado).
- Transições de estado válidas:
  - `pendente` $\rightarrow$ `aprovado` (com `reviewedBy` e data).
  - `pendente` $\rightarrow$ `rejeitado` (exige `rejectionReason`).
  - `pendente` $\rightarrow$ `cancelado`.
  - Rejeita transições a partir de estados finais (`aprovado`, `rejeitado`, `cancelado`).

Adicionar em `src/modules/inventory/domain/inventory.test.ts`:
- Testes para `reserveStock(balance, qty)`: incrementa `reserved`, mantém `physical` e `blocked`, decrementa `available`.
- Testes para `unreserveStock(balance, qty)`: decrementa `reserved`, estornando para `available`.
- Testes para `dispatchReservedStock(balance, qty)`: decrementa `reserved` e decrementa `physical`.

- [ ] **Step 2: Executar testes para confirmar falha esperada**

Run: `npm test src/modules/orders/domain/order.test.ts`  
Expected: FAIL (módulo não encontrado).

- [ ] **Step 3: Implementar funções puras em `src/modules/inventory/domain/stock.ts`**

Adicionar:
- `reserveStock(balance: StockBalance, quantity: number): Result<StockBalance>`
- `unreserveStock(balance: StockBalance, quantity: number): Result<StockBalance>`
- `dispatchReservedStock(balance: StockBalance, quantity: number): Result<StockBalance>`

- [ ] **Step 4: Implementar `src/modules/orders/schemas.ts` e `src/modules/orders/domain/order.ts`**

Definir tipos:
- `MaterialOrderStatus = "pendente" | "aprovado" | "rejeitado" | "cancelado"`
- `MaterialOrderItem = { id: string; orderId: string; materialId: string; quantity: number }`
- `MaterialOrder = { id: string; number: string; councilId: string; status: MaterialOrderStatus; requestedBy: string; notes?: string | null; reviewedBy?: string | null; reviewedAt?: Date | null; rejectionReason?: string | null; items: MaterialOrderItem[]; createdAt: Date; updatedAt: Date }`
- Funções puras de transição de estado e validação.

- [ ] **Step 5: Criar migração SQL `supabase/migrations/20261110000003_material_orders.sql`**

Criar tabelas `public.material_orders` e `public.material_order_items` com FKs, constraints, índices e RLS.

- [ ] **Step 6: Executar testes de domínio e typecheck**

Run: `npm test src/modules/orders/domain/order.test.ts src/modules/inventory/domain/inventory.test.ts && npm run typecheck`  
Expected: PASS.

- [ ] **Step 7: Commit da Task 1**

```bash
git add supabase/migrations/20261110000003_material_orders.sql src/modules/orders/ src/modules/inventory/domain/
git commit -m "feat(pedidos): criar migracao sql, schemas e logica de dominio de pedidos de materiais"
```

---

### Task 2: Serviços de Domínio e Repositórios de Pedidos de Materiais

**Files:**
- Create: `src/modules/orders/repository.ts`
- Create: `src/modules/orders/repository.memory.ts`
- Create: `src/server/supabase/adapters/orders.ts`
- Create: `src/modules/orders/service.ts`
- Create: `src/modules/orders/service.test.ts`
- Modify: `src/modules/inventory/service.ts`
- Modify: `src/server/container.ts`
- Modify: `src/server/supabase/repositories.ts`
- Modify: `src/server/memory-repositories.ts`

**Interfaces:**
- Consumes: `MaterialOrderRepository`, `InventoryService`, `AuditService`, `Actor`.
- Produces: `MaterialOrderService` com métodos `create(actor, input)`, `approve(actor, orderId)`, `reject(actor, orderId, reason)`, `cancel(actor, orderId)`, `list(actor, filter)`, `get(actor, orderId)`.

- [ ] **Step 1: Escrever testes para `MaterialOrderService` em `service.test.ts`**

Cobrir:
- Criação de pedido por operador do órgão: reserva saldo no estoque com sucesso.
- Falha na criação por saldo disponível insuficiente.
- Aprovação por Warley (`actor.isCentralAdmin === true`): despacha estoque, cria movimento `"transfer_out"` no ledger, status `aprovado`.
- Rejeição de aprovação se o ator não for Warley (`FORBIDDEN`).
- Rejeição por Warley: estorna saldo reservado para disponível, status `rejeitado` com motivo.
- Cancelamento pelo solicitante: estorna reserva.
- Isolamento multi-tenant: operador de outro órgão recebe `FORBIDDEN` ao tentar listar pedidos alheios.

- [ ] **Step 2: Executar testes para confirmar falha esperada**

Run: `npm test src/modules/orders/service.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implementar métodos de reserva e despacho em `src/modules/inventory/service.ts`**

Adicionar:
- `reserveForOrder(actor, councilId, items)`
- `unreserveOrder(councilId, items)`
- `dispatchOrder(councilId, items, orderId, actorId)`

- [ ] **Step 4: Implementar repositórios (InMemory e Supabase) e `MaterialOrderService`**

- `MaterialOrderRepository` com métodos `create`, `update`, `getById`, `list`.
- `InMemoryMaterialOrderRepository` para testes.
- `SupabaseMaterialOrderRepository` com queries mapeadas.
- Registrar `orders` no container de serviços (`src/server/container.ts`).

- [ ] **Step 5: Executar testes e typecheck**

Run: `npm test src/modules/orders/service.test.ts && npm run typecheck`  
Expected: PASS.

- [ ] **Step 6: Commit da Task 2**

```bash
git add src/modules/orders/ src/server/supabase/adapters/orders.ts src/server/container.ts src/server/memory-repositories.ts src/server/supabase/repositories.ts src/modules/inventory/service.ts
git commit -m "feat(pedidos): implementar MaterialOrderService e integracao de reserva/baixa com inventory"
```

---

### Task 3: Server Actions e Interfaces de Pedidos no Portal do Órgão e Fila de Warley

**Files:**
- Create: `src/modules/orders/actions.ts`
- Create: `src/modules/orders/actions.test.ts`
- Create: `src/app/(app)/meu-conselho/material-order-dialog.tsx`
- Create: `src/app/(app)/meu-conselho/material-order-dialog.test.tsx`
- Modify: `src/app/(app)/meu-conselho/page.tsx`
- Create: `src/app/(app)/dashboard/order-queue.tsx`
- Create: `src/app/(app)/dashboard/order-queue.test.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `MaterialOrderService`, `createOrderAction`, `approveOrderAction`, `rejectOrderAction`, `cancelOrderAction`.
- Produces: Modal de criação de pedidos em `/meu-conselho`, lista de pedidos do órgão, e card na fila de expedição de Warley em `/dashboard`.

- [ ] **Step 1: Implementar Server Actions em `src/modules/orders/actions.ts` com testes em `actions.test.ts`**

- `createMaterialOrderAction(formData)`
- `approveMaterialOrderAction(orderId)`
- `rejectMaterialOrderAction(orderId, reason)`
- `cancelMaterialOrderAction(orderId)`

- [ ] **Step 2: Criar componente de diálogo de pedido `MaterialOrderDialog`**

- Botão *"Novo Pedido de Material"*.
- Exibe apenas materiais com saldo `available > 0` no órgão.
- Validação client-side impedindo digitação de quantidade acima do saldo liberado.
- Feedback de sucesso via toast e atualização de tela.

- [ ] **Step 3: Integrar seção de pedidos em `src/app/(app)/meu-conselho/page.tsx`**

- Adicionar card de métrica/atalho para pedidos.
- Listagem dos últimos pedidos com data, itens, quantidades e status visual (`Pendente`, `Aprovado`, `Rejeitado`).

- [ ] **Step 4: Criar `OrderQueue` e integrar em `src/app/(app)/dashboard/page.tsx`**

- Visível exclusivamente quando `isWarley === true`.
- Exibe pedidos com status `pendente`.
- Botões de homologação rápida: *"Aprovar & Despachar"* e *"Recusar"*.

- [ ] **Step 5: Executar testes de componentes e de ações**

Run: `npm test src/modules/orders/actions.test.ts src/app/\(app\)/meu-conselho/material-order-dialog.test.tsx src/app/\(app\)/dashboard/order-queue.test.tsx && npm run typecheck`  
Expected: PASS.

- [ ] **Step 6: Commit da Task 3**

```bash
git add src/modules/orders/actions.ts src/modules/orders/actions.test.ts "src/app/(app)/meu-conselho/" "src/app/(app)/dashboard/"
git commit -m "feat(pedidos): adicionar server actions, dialogo no portal do orgao e fila de expedicao de Warley"
```

---

### Task 4: Justificativa Obrigatória para Encerramento Incompleto (< 100%)

**Files:**
- Modify: `src/modules/processes/schemas.ts`
- Modify: `src/modules/processes/service.ts`
- Modify: `src/modules/processes/actions.ts`
- Modify: `src/app/(app)/processos/[id]/process-actions.tsx`
- Modify: `src/modules/processes/service.test.ts`
- Modify: `src/modules/purchases/schemas.ts`
- Modify: `src/modules/purchases/service.ts`
- Modify: `src/modules/purchases/actions.ts`
- Modify: `src/modules/purchases/service.test.ts`

**Interfaces:**
- Consumes: `ProcessService.registerClosing`, `PurchaseRequestService.receive`.
- Produces: Trava de integridade exigindo `justification` quando `completion !== "completa"` ou `delivered < requested` com encerramento forçado.

- [ ] **Step 1: Escrever testes unitários para exigência de justificativa em processos e compras**

- Em `processes/service.test.ts`: tentativa de registrar encerramento em processo com < 7 documentos sem justificativa retorna `VALIDATION` ("Justificativa obrigatória para processos com documentação incompleta"). Com justificativa válida ($\ge 20$ chars), registra sucesso e audita `process.close_incomplete`.
- Em `purchases/service.test.ts`: recebimento parcial com marcação de encerramento sem justificativa falha com `VALIDATION`. Com justificativa, conclui e audita `purchase.receive_incomplete`.

- [ ] **Step 2: Executar testes para confirmar falha esperada**

Run: `npm test src/modules/processes/service.test.ts src/modules/purchases/service.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Atualizar schemas e services**

- Em `processes/schemas.ts`: `registerClosingSchema` com refine/validação condicional de `justification`.
- Em `processes/service.ts`: verificar se completion é completa; se não, exigir `justification` e registrar auditoria.
- Em `purchases/service.ts`: receber com encerramento de saldo pendente exigindo `incompleteJustification`.

- [ ] **Step 4: Atualizar UI de ações em `/processos/[id]/process-actions.tsx`**

- Se `documentalComplete === false`, o diálogo de encerramento exibe banner de aviso em destaque: *"Atenção: este processo não atingiu 100% dos documentos obrigatórios"* e campo de texto obrigatório para a justificativa formal.

- [ ] **Step 5: Executar testes e typecheck**

Run: `npm test src/modules/processes/service.test.ts src/modules/purchases/service.test.ts && npm run typecheck`  
Expected: PASS.

- [ ] **Step 6: Commit da Task 4**

```bash
git add src/modules/processes/ src/modules/purchases/ "src/app/(app)/processos/[id]/process-actions.tsx"
git commit -m "feat(auditoria): exigir justificativa obrigatoria para encerramentos e entregas abaixo de 100%"
```

---

### Task 5: Trilha de Auditoria Multidimensional (Filtros Avançados no Serviço e Adapters)

**Files:**
- Modify: `src/modules/audit/schemas.ts`
- Modify: `src/modules/audit/repository.ts`
- Modify: `src/modules/audit/service.ts`
- Modify: `src/server/memory/audit-repository.ts`
- Modify: `src/server/supabase/adapters/audit.ts`
- Modify: `src/modules/audit/service.test.ts`

**Interfaces:**
- Consumes: `AuditFilter` expandido.
- Produces: `AuditService.list(actor, filter)` suportando `councilId`, `entity`, `actorId`, `action`, `result`, `startDate`, `endDate`.

- [ ] **Step 1: Escrever testes para filtros avançados em `audit/service.test.ts`**

- Teste de filtro por `councilId` (órgão).
- Teste de filtro por `entity` (módulo).
- Teste de filtro por `actorId` (usuário).
- Teste de filtro por intervalo de datas (`startDate`, `endDate`).
- Teste de filtro combinado (órgão + módulo + período + resultado).
- Teste de segurança multi-tenant: usuário não-admin filtrando conselho alheio recebe `FORBIDDEN`.

- [ ] **Step 2: Executar testes para confirmar falha esperada**

Run: `npm test src/modules/audit/service.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Expandir `AuditFilter` em `schemas.ts` e implementar no InMemory repository**

Adicionar campos `actorId`, `startDate`, `endDate`, `action` e filtros correspondentes no repositório em memória.

- [ ] **Step 4: Implementar filtros no Supabase Adapter (`adapters/audit.ts`)**

Montar query com `.eq("council_id", ...)`, `.eq("entity", ...)`, `.eq("actor_id", ...)`, `.gte("created_at", ...)`, `.lte("created_at", ...)`.

- [ ] **Step 5: Executar testes e typecheck**

Run: `npm test src/modules/audit/service.test.ts && npm run typecheck`  
Expected: PASS.

- [ ] **Step 6: Commit da Task 5**

```bash
git add src/modules/audit/ src/server/memory/audit-repository.ts src/server/supabase/adapters/audit.ts
git commit -m "feat(auditoria): expandir filtros de consulta estruturados por orgao, modulo, usuario e periodo"
```

---

### Task 6: Reformulação da Página de Relatórios e Tela de Auditoria com Abas e Filtros

**Files:**
- Create: `src/app/(app)/relatorios/audit-trail-tab.tsx`
- Create: `src/app/(app)/relatorios/audit-trail-tab.test.tsx`
- Modify: `src/app/(app)/relatorios/page.tsx`
- Modify: `src/app/(app)/administracao/auditoria/page.tsx`

**Interfaces:**
- Consumes: `services.reports.operationalSummary`, `services.audit.list`, `loadLookups`.
- Produces: Página `/relatorios` com abas dinâmicas (*Indicadores Operacionais* e *Trilha de Auditoria & Conformidade*) e filtros interativos por URL.

- [ ] **Step 1: Criar componente `AuditTrailTab`**

- Barra de filtros: Órgão (`select`), Módulo (`select`), Usuário (`input/select`), Período (`select`: Hoje, 7 dias, 30 dias, Todos), Resultado (`select`: Todos, Sucesso, Negado, Erro).
- Tabela rica formatada com badge de resultado, data no formato Fortaleza, autor, ação legível e detalhes.
- Totalizadores no topo: total de eventos, taxa de sucesso.

- [ ] **Step 2: Integrar abas em `src/app/(app)/relatorios/page.tsx`**

- Aba 1: "Indicadores Operacionais" (mantém os KPIs de processos, estoque, atas, contratos e adiciona economia gerada).
- Aba 2: "Trilha de Auditoria & Conformidade" (renderiza `AuditTrailTab`).
- Sincronização via query param `?tab=indicadores` ou `?tab=auditoria`.

- [ ] **Step 3: Atualizar `src/app/(app)/administracao/auditoria/page.tsx`**

- Reutilizar a barra de filtros avançados para permitir à administração central e gestores filtrar por órgão, usuário e período.

- [ ] **Step 4: Executar testes unitários e de UI**

Run: `npm test src/app/\(app\)/relatorios/audit-trail-tab.test.tsx && npm run typecheck`  
Expected: PASS.

- [ ] **Step 5: Commit da Task 6**

```bash
git add "src/app/(app)/relatorios/" "src/app/(app)/administracao/auditoria/"
git commit -m "feat(relatorios): adicionar abas operacionais e trilha de auditoria completa com filtros"
```

---

### Task 7: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

**Files:**
- Modify: `supabase/apply_all.sql`
- Run: `npm run db:bundle`
- Run: `npm run db:check`
- Run: `npm test`
- Run: `npm run typecheck`
- Run: `npm run build`

- [ ] **Step 1: Regenerar `supabase/apply_all.sql`**

Run: `npm run db:bundle`  
Expected: `apply_all.sql` atualizado com `20261110000003_material_orders.sql`.

- [ ] **Step 2: Verificar banco de dados**

Run: `npm run db:check`  
Expected: PASS.

- [ ] **Step 3: Executar suíte completa de testes**

Run: `npm test`  
Expected: 100% PASS (todos os testes verdes).

- [ ] **Step 4: Executar typecheck**

Run: `npm run typecheck`  
Expected: PASS (0 erros).

- [ ] **Step 5: Executar build de produção**

Run: `npm run build`  
Expected: PASS (rotas geradas com sucesso).

- [ ] **Step 6: Commit final da Onda 2**

```bash
git add -A
git commit -m "chore(onda2): consolidar pedidos de materiais, justificativas obrigatorias e auditoria com relatorios"
```
