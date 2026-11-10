# Documento de Design Técnico: Onda 2 — Pedidos de Materiais, Justificativas e Trilha de Auditoria

**Data:** 10 de Novembro de 2026  
**Status:** Aprovado para Implementação  
**Escopo:** Ecossistema Warley — Onda 2  

---

## 1. Contexto e Objetivos

Após a implementação e consolidação da Onda 1 (Estoque Bloqueado, Formalizações, Economia e Usabilidade), a aplicação possui o ciclo documental completo que provisiona estoque bloqueado e, após 100% dos documentos e homologação por Warley, libera o saldo para "Pronto para Uso".

A **Onda 2** implementa as etapas subsequentes do ecossistema:
1. **Pedidos de Materiais pelos Órgãos:** Permitir que órgãos solicitem a retirada de materiais diretamente de seu estoque liberado ("Pronto para Uso"), com reserva imediata no ato do pedido e veredito final de expedição e baixa pelo painel de Warley.
2. **Justificativa Obrigatória abaixo de 100%:** Exigência de parecer fundamentado institucional ao encerrar processos administrativos sem os 7 documentos obrigatórios ou finalizar recebimentos com quantitativos faltantes.
3. **Auditoria Multidimensional & Relatórios:** Filtros dinâmicos completos (por órgão, módulo/entidade, autor, intervalo de datas e resultado) integrados em abas dedicadas na área de Relatórios (`/relatorios`) e na tela administrativa (`/administracao/auditoria`).

---

## 2. Subsistema 1: Pedidos de Materiais (`material_orders`)

### 2.1 Modelo de Dados (Supabase Migration)

Nova tabela `public.material_orders`:
- `id` (UUID, PK, default `gen_random_uuid()`)
- `number` (TEXT, NOT NULL, ex.: `"PED-2026/001"`)
- `council_id` (UUID, NOT NULL, FK `councils.id`)
- `status` (TEXT, NOT NULL, CHECK: `'pendente'`, `'aprovado'`, `'rejeitado'`, `'cancelado'`)
- `requested_by` (UUID, NOT NULL, FK `profiles.id`)
- `notes` (TEXT, NULL)
- `reviewed_by` (UUID, NULL, FK `profiles.id`)
- `reviewed_at` (TIMESTAMPTZ, NULL)
- `rejection_reason` (TEXT, NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL, default `now()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, default `now()`)

Nova tabela `public.material_order_items`:
- `id` (UUID, PK, default `gen_random_uuid()`)
- `order_id` (UUID, NOT NULL, FK `material_orders.id` ON DELETE CASCADE)
- `material_id` (UUID, NOT NULL, FK `materials.id`)
- `quantity` (INT, NOT NULL, CHECK: `quantity > 0`)

Índices:
- `idx_material_orders_council_status` em `(council_id, status)`
- `idx_material_orders_status` em `(status)`

Políticas RLS:
- Select: Membros do órgão vêem os pedidos do próprio órgão; administradores centrais (`is_central_admin`) vêem todos.
- Insert/Update: Apenas via funções/service_role protegidas pelas regras de domínio e auditoria.

### 2.2 Regras de Negócio e Domínio de Estoque

1. **Criação do Pedido (`createOrder`):**
   - Ator deve possuir permissão `stock.move` ou papel de operador/gestor no órgão (`councilId`).
   - Para cada item solicitado, a quantidade deve ser `> 0` e `quantity <= availableOf(balance)` (onde `available = physical - reserved`). Saldo bloqueado em formalização (`blocked`) **não** pode ser utilizado.
   - Ao confirmar o pedido, o serviço de estoque aciona `inventory.reserveForOrder(councilId, items)`. O saldo de cada item tem seu campo `reserved` incrementado em `quantity`.
   - O pedido é gravado com status `pendente`.
   - Dispara auditoria `material_order.create`.

2. **Aprovação e Expedição por Warley (`approveOrder`):**
   - **Veredito exclusivo do Warley:** Requer `actor.isCentralAdmin === true`.
   - O serviço de estoque aciona `inventory.dispatchOrder(councilId, items)`.
   - Operação atômica no estoque:
     - Decrementa `reserved` no balance.
     - Cria movimentação no ledger físico (`stock_movements`) com tipo `"transfer_out"`, referência ao ID do pedido e razão `"Expedição de Pedido de Material Homologada por Warley"`.
   - Atualiza o pedido para status `aprovado`, com `reviewedBy = actor.userId` e `reviewedAt = new Date()`.
   - Dispara auditoria `material_order.approve`.

3. **Rejeição por Warley (`rejectOrder`):**
   - Requer `actor.isCentralAdmin === true` e `rejectionReason` obrigatório (mínimo 5 caracteres).
   - O serviço de estoque aciona `inventory.unreserve(councilId, items)`, debitando o `reserved` e devolvendo o saldo integral para `available`.
   - Atualiza o pedido para status `rejeitado` com o motivo registrado.
   - Dispara auditoria `material_order.reject`.

4. **Cancelamento pelo Órgão (`cancelOrder`):**
   - Permitido ao próprio órgão enquanto o pedido estiver com status `pendente`.
   - Estorna o saldo reservado via `inventory.unreserve`.
   - Atualiza o pedido para status `cancelado`.
   - Dispara auditoria `material_order.cancel`.

### 2.3 Interfaces de Usuário para Pedidos

- **No Portal do Órgão (`/meu-conselho`):**
  - Componente `MaterialOrderModal` / `MaterialOrderSection`:
    - Botão *"Novo Pedido de Retirada"*.
    - Listagem dos materiais com o saldo **Pronto para Uso** em tempo real ao lado de cada seletor de quantidade.
    - Validação reativa de quantidade máxima permitida.
    - Tabela de pedidos recentes do órgão com badges de status (`Pendente`, `Aprovado`, `Rejeitado`).
- **Na Central do Warley (`/dashboard`):**
  - Componente `OrderApprovalQueue`:
    - Exibe lista de pedidos pendentes com órgão, solicitante, data e lista de materiais/quantidades.
    - Ações de 1 clique: **"Aprovar & Expedir"** (com confirmação rápida) e **"Recusar"** (com campo para motivo da recusa).

---

## 3. Subsistema 2: Justificativas para Conclusão Incompleta (< 100%)

### 3.1 Encerramento de Processo com Documentação Parcial

- **Regra:** Se o processo administrativo estiver com `view.completion !== "completa"` (menos de 7 documentos obrigatórios anexados no momento do encerramento):
  - O botão de encerramento em `ProcessActions` (`src/app/(app)/processos/[id]/process-actions.tsx`) exige obrigatoriamente uma justificativa formal circunstanciada (`closingJustification`, string com no mínimo 20 caracteres).
  - O schema Zod `closeProcessSchema` valida: se o processo não tiver os 7 documentos, `closingJustification` é estritamente obrigatório.
  - Persiste a justificativa no processo e grava evento de auditoria `process.close_incomplete` contendo a justificativa nos detalhes do log.

### 3.2 Recebimento de Materiais com Saldo Pendente

- **Regra:** No formulário de recebimento de materiais de solicitações de compra (`receiveFormAction`):
  - Se a quantidade recebida somada ao já entregue for inferior ao total da solicitação e o usuário marcar `"Declarar entrega finalizada (sem remessas futuras)"`:
  - O campo `incompleteJustification` torna-se obrigatório (mínimo 15 caracteres).
  - O evento é registrado em `purchase_request_events` com tipo `delivery_closed_incomplete` e na tabela de auditoria `audit_logs`.

---

## 4. Subsistema 3: Trilha de Auditoria Multidimensional & Relatórios Consolidados

### 4.1 Expansão dos Filtros de Auditoria (`AuditService.list`)

A interface de consulta de auditoria passa a suportar o schema estruturado:

```ts
export interface AuditFilter {
  councilId?: string;
  entity?: string;
  actorId?: string;
  action?: string;
  result?: "success" | "denied" | "error";
  startDate?: string; // ISO date
  endDate?: string;   // ISO date
}
```

Implementações:
- **Supabase Adapter (`src/server/supabase/adapters/audit.ts`):** Monta consulta com filtros compostos dinâmicos (`eq`, `gte`, `lte`, `in`) respeitando o isolamento multi-tenant (R14).
- **InMemory Adapter (`src/server/memory/audit-repository.ts`):** Filtra coleção em memória para suporte completo na suíte de testes.

### 4.2 Reformulação da Página de Relatórios (`/relatorios`)

Criação de sistema de abas acessível:
- **Aba 1: "Indicadores Operacionais & Módulos"**
  - Seletor de Órgão (Todos os órgãos ou órgão específico) e Período.
  - Seção Processos: distribuição por status e progresso documental médio.
  - Seção Estoque: total bloqueado, pronto para uso, reservado e itens críticos.
  - Seção Contratos e Atas: vigentes, a vencer em 30 dias e vencidos.
  - Seção Economia: total economizado acumulado e percentual médio de economia.
- **Aba 2: "Trilha de Auditoria & Conformidade"**
  - Barra de filtros: Órgão, Módulo (Processos, Estoque, Pedidos, Formalizações, etc.), Usuário, Período e Resultado.
  - Tabela com paginação/listagem estruturada: Data/Hora, Usuário, Módulo, Ação, Identificador, Justificativa/Detalhes e Badge de Resultado.
  - Indicadores no topo: Total de Ações, Ações com Sucesso, Ações Negadas.
- **Reutilização:** A tela `/administracao/auditoria` consome o mesmo componente de filtros avançados.

---

## 5. Matriz de Autorização e Segurança (RBAC / RLS)

| Ação | Papéis de Órgão (`council_manager`, `council_operator`) | Administrador Central (Warley) |
| :--- | :---: | :---: |
| `order.create` | ✅ Permitido para o próprio órgão | ✅ Permitido para qualquer órgão |
| `order.cancel` | ✅ Permitido se o pedido for do próprio órgão e estiver pendente | ✅ Permitido |
| `order.approve` | ❌ Proibido (exclusivo Warley) | ✅ Permitido (despacha e baixa estoque) |
| `order.reject` | ❌ Proibido (exclusivo Warley) | ✅ Permitido (estorna reserva) |
| `audit.view` com filtros | ✅ Apenas registros vinculados ao próprio órgão | ✅ Acesso global a todos os registros |

---

## 6. Estratégia de Testes

1. **Testes Unitários de Domínio:**
   - Transições de estado do pedido (`pendente` $\rightarrow$ `aprovado` / `rejeitado` / `cancelado`).
   - Cálculo e validação de reserva de estoque (`reserveForOrder`, `dispatchOrder`, `unreserve`).
   - Validações Zod de justificativa obrigatória (< 100%).
2. **Testes de Integração de Serviços:**
   - `MaterialOrderService`: criação com sucesso, falha por saldo insuficiente, aprovação exclusiva por Warley com baixa no ledger contábil.
   - `AuditService.list`: testes de filtragem por múltiplos critérios combinados (órgão + módulo + período + resultado).
3. **Testes de Interface (React Testing Library):**
   - Modal de pedido no portal do órgão com validação de saldo máximo.
   - Card de fila de aprovação de pedidos no dashboard do Warley.
   - Modal de encerramento de processo exigindo justificativa quando incompleto.
4. **Verificação Completa de Regressão:**
   - `npm run db:bundle && npm run db:check`
   - `npm test` (306+ testes)
   - `npm run typecheck`
   - `npm run build`
