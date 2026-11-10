# Especificação de Design: Onda 1 — Estoque Bloqueado, Formalização, Economia e Usabilidade

**Data:** 10 de Novembro de 2026  
**Status:** Aprovado para Implementação  
**Autor:** Antigravity & Warley  

---

## 1. Visão Geral e Objetivos

Esta especificação define a **Onda 1** de evolução do sistema de gestão do Warley, implementando a esteira operacional completa de 5 passos definida no fluxo central:
1. **01 Solicitação:** Órgão informa material, quantidade, responsável e valor estimado inicial.
2. **02 Processo:** Processo vinculado com os 7 documentos obrigatórios.
3. **03 Estoque Bloqueado:** Quantidade provisionada imediatamente no estoque do órgão, em estado de bloqueio (visível, porém indisponível para movimentações e consumo).
4. **04 Formalização:** Exigência de 100% dos 7 documentos obrigatórios + dados da contratação (fornecedor vencedor, tipo de instrumento, número e valor contratado).
5. **05 Saldo Liberado (Pronto para Uso):** Transição e liberação do saldo condicionadas exclusivamente ao **veredito final e homologação de Warley** no painel central, apurando formalmente a **Economia Gerada**.

Adicionalmente, inclui as correções imediatas de usabilidade:
- Botão "← Voltar para Processos" em `/processos/[id]`.
- Visibilidade resiliente e informativa do botão "Nova Solicitação" em `/solicitacoes`.
- Padronização institucional da nomenclatura para **"Órgão"**.

---

## 2. Requisitos e Casos de Uso

### UC-01: Registro do Valor Estimado e Bloqueio de Estoque
- **Na criação da solicitação (`/solicitacoes/nova`):**
  - O operador pode opcionalmente informar o `estimatedValue` (R$).
  - Ao salvar, os itens da solicitação provisionam o saldo correspondente na tabela `stock_balances` do órgão com acréscimo no campo `blocked`.
  - Esse saldo **não** pode ser utilizado para transferências nem consumos.

### UC-02: Formulário de Formalização da Contratação
- **Na tela do processo (`/processos/[id]`):**
  - **Enquanto documentos < 100%:** Exibe card informativo: *"Aguardando conclusão dos 7 documentos obrigatórios para formalizar a contratação."*
  - **Ao atingir 100% dos documentos:** O card de formalização é liberado:
    - Campo `estimatedValue` (obrigatório se não tiver sido preenchido na criação da solicitação).
    - Seleção de `supplierId` (fornecedor cadastrado).
    - Seleção de `instrumentType`: `ata` | `contrato` | `empenho`.
    - Campo de texto `instrumentNumber`.
    - Campo numérico `contractedValue` (R$).
    - **Cálculo da Economia em tempo real no cliente:** Exibe `savingsValue = estimatedValue - contractedValue` e `savingsPercent = (savingsValue / estimatedValue) * 100`.
    - Botão: *"Enviar para Homologação de Warley"*.
- **Ao submeter:** A formalização é gravada com status `aguardando_homologacao`.

### UC-03: Veredito e Homologação de Warley
- **No painel central do Warley (`/dashboard`):**
  - Card/painel prioritário: *"Formalizações Aguardando Veredito"*.
  - Exibe órgão, número do processo, fornecedor, valor estimado, valor contratado e economia apurada.
  - Botão de ação do Warley: **"Homologar e Liberar Estoque"** (ou *"Recusar com Justificativa"*).
- **Ao homologar:**
  - Status da formalização muda para `homologado`.
  - O saldo de estoque no órgão muda: `blocked` decresce e `physical` (ou saldo liberado) acresce.
  - O status do estoque do lote passa para **"Pronto para uso"**.
  - A economia gerada é registrada para consolidação nos relatórios e KPIs.

### UC-04: Exibição da Economia no Painel do Gestor
- **No portal do órgão (`/meu-conselho`) e no dashboard (`/dashboard`):**
  - Card de KPI destacado: **Economia Gerada** (Total em R$ acumulado e percentual médio de economia obtido nas contratações homologadas).
  - Botão *"Ver Histórico de Economia e Contratações"*, que abre uma listagem detalhada de todos os processos homologados com seus valores iniciais, contratados e economia obtida.

### UC-05: Visão Segmentada do Estoque
- **Na tela `/estoque` e no painel do órgão (`/meu-conselho`):**
  - Cards de destaque no topo:
    1. 🔒 **Bloqueado em Processos** (aguardando 100% dos documentos e chancela de Warley).
    2. ✅ **Pronto para Uso (Liberado)** (saldo liberado para pedidos e distribuição).
    3. 📦 **Utilizado / Entregue**.
    4. 📊 **% do Saldo Disponível**.
  - Tabela com colunas detalhando quantidade bloqueada e quantidade liberada.

### UC-06: Ajustes de Usabilidade
- **Botão Voltar:** Inserção de link/botão claro `← Voltar para Processos` no cabeçalho de `/processos/[id]`.
- **Botão Nova Solicitação:** Em `/solicitacoes/page.tsx`, o botão fica sempre visível. Caso o operador não pertença a nenhum órgão ativo, ao clicar é exibida orientação de contato com a administração em vez de ocultar a interface.
- **Rótulos "Órgão":** Ajuste de terminologia de "Conselho/Empresa" para **"Órgão"** nos menus, cabeçalhos e tabelas.

---

## 3. Modelo de Dados e Arquitetura

### 3.1. Migração PostgreSQL / Supabase

```sql
-- 1. Valor estimado na solicitação
alter table public.purchase_requests
  add column if not exists estimated_value numeric(15,2) check (estimated_value is null or estimated_value >= 0);

-- 2. Coluna de estoque bloqueado
alter table public.stock_balances
  add column if not exists blocked numeric(15,3) not null default 0 check (blocked >= 0);

-- 3. Tabela de Formalizações Contratuais
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

### 3.2. Serviços e Ações
- `FormalizationService` (ou método em `ProcessService` / `PurchaseService`):
  - `submitFormalization(actor, input)`: Valida se o processo tem 100% dos documentos, calcula a economia e cria o registro com status `aguardando_homologacao`.
  - `homologate(actor, input)`: Exige autorização de Warley (`actor.isCentralAdmin`). Atualiza status para `homologado`, debita `blocked` e credita `physical` em `stock_balances`, e registra auditoria.
  - `listPending(actor)`: Retorna as formalizações pendentes de homologação.
  - `getSavingsSummary(actor, councilId?)`: Retorna total economizado, valor inicial total, valor contratado total e percentual médio.

---

## 4. Segurança, Permissões e Auditoria

- **Submissão de Formalização:** Permitida a operadores e gestores do conselho/órgão (`request.create` ou `process.create`).
- **Homologação e Liberação:** Restrita ao Administrador Central (Warley). Qualquer tentativa por usuário não autorizado é rejeitada com código `FORBIDDEN`.
- **Auditoria:** Gravação obrigatória em `audit_logs` dos eventos:
  - `formalization.submit` (com valores e fornecedor)
  - `formalization.homologate` (com id de Warley, timestamp e saldo liberado)
  - `formalization.reject` (com justificativa obrigatória)

---

## 5. Estratégia de Testes

1. **Testes Unitários de Domínio:**
   - Cálculo da economia em valor monetário e percentual.
   - Bloqueio de submissão se progresso documental for inferior a 100%.
   - Bloqueio de homologação por usuário sem perfil de Warley/Admin Central.
2. **Testes de Integração de Estoque:**
   - Criação de solicitação com itens incrementa `blocked` no saldo do órgão.
   - Homologação de formalização converte `blocked` em `physical` (pronto para uso).
   - Movimentações de saída continuam proibidas de consumir saldo bloqueado.
3. **Testes de Interface (UI):**
   - Renderização dos cards de estoque segmentados (Bloqueado vs. Pronto para uso).
   - Exibição da fila de homologação no `/dashboard` de Warley.
   - Botão "Voltar para Processos" e resiliência do botão "Nova Solicitação".
