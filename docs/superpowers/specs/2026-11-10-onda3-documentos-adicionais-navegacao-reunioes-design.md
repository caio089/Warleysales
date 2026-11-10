# Documento de Design Técnico: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões

**Data:** 10 de Novembro de 2026  
**Status:** Aprovado para Implementação  
**Escopo:** Ecossistema Warley — Onda 3  

---

## 1. Contexto e Objetivos

Com as Ondas 1 e 2 concluídas (Estoque Bloqueado, Formalização, Economia, Pedidos de Materiais pelos órgãos, Justificativas Obrigatórias e Auditoria com Relatórios), a **Onda 3** atende aos aprimoramentos operacionais e de usabilidade práticos selecionados pelo usuário, sem acoplamento a serviços externos complexos:

1. **Artefatos Adicionais nos Processos:** Permitir anexar documentos complementares (despachos, certidões, pareceres técnicos, planilhas) mantendo a régua de 100% condicionada exclusivamente aos 7 documentos obrigatórios.
2. **Centralização da Navegação:** Unificar contratos, atas, processos e fornecedores sob o grupo principal **Acompanhamento** no menu lateral, eliminando a fragmentação do grupo "Assessoria".
3. **Modernização de UI/UX de Reuniões:** Exibir KPIs de reuniões, substituir a nomenclatura por "Órgão" e aprimorar a visualização de compromissos e pendências.

---

## 2. Subsistema 1: Artefatos Adicionais nos Processos Administrativos

### 2.1 Modelo de Dados e Banco (Supabase Migration)

Nova migração `supabase/migrations/20261110000004_additional_documents.sql`:
- Adicionar coluna `is_required boolean not null default true` na tabela `public.document_types`.
- Inserir o tipo documental complementar:
  ```sql
  insert into public.document_types (code, name, position, is_required)
  values ('OUTRO', 'Artefato Adicional / Complementar', 8, false)
  on conflict (code) do update set is_required = excluded.is_required;
  ```
- Atualizar a view `public.v_process_progress` para calcular o progresso documental considerando estritamente os tipos obrigatórios:
  ```sql
  create or replace view public.v_process_progress with (security_invoker = true) as
  select p.id as process_id,
         count(distinct case when dt.is_required then a.type_code end) as valid_types,
         round(count(distinct case when dt.is_required then a.type_code end) * 100.0 / 7.0, 2) as percent
    from public.administrative_processes p
    left join public.attachments a
      on a.process_id = p.id and a.link_status = 'active'
     and a.upload_status = 'confirmed' and a.retention_state = 'retained'
    left join public.document_types dt on dt.code = a.type_code
   group by p.id;
  ```
- Atualizar `scripts/check-supabase.mjs` para validar os 7 tipos obrigatórios via `.eq("is_required", true)`.

### 2.2 Domínio de Processos e Cálculo de Progresso

- Em `src/modules/processes/domain/document-types.ts`:
  - `DOCUMENT_TYPES` permanece com os 7 obrigatórios: `["DFD", "ETP", "MR", "TR", "PP", "PJ", "ED"]`.
  - Adicionar constante `ADDITIONAL_DOCUMENT_TYPES = [{ code: "OUTRO", label: "Artefato Adicional / Complementar" }] as const`.
  - Adicionar união de tipos `AllDocumentTypeCode = DocumentTypeCode | "OUTRO"`.
- Em `src/modules/processes/domain/progress.ts`:
  - `calculateProgress` filtra os anexos válidos cruzando com `DOCUMENT_TYPE_CODES` (os 7 obrigatórios).
  - Tipos com código `"OUTRO"` não aumentam o numerador nem alteram o denominador (que permanece fixo em `REQUIRED_DOCUMENT_COUNT = 7`).
  - Progresso documental continua rigoroso: 100% exige os 7 tipos obrigatórios; artefatos extras não diluem nem substituem os obrigatórios.

### 2.3 Interface do Usuário (UI)

- No drawer lateral de upload rápido (`src/app/(app)/processos/process-attachment-sheet.tsx`):
  - **Seção Principal:** *"Documentos Obrigatórios (Lei 14.133 / PNCP)"* com lista dos 7 tipos, badges de status, botões de upload e download.
  - **Seção Secundária:** *"Artefatos Adicionais & Documentos Complementares"* permitindo anexar múltiplos arquivos avulsos, exibindo nome do arquivo, tamanho, data de envio e botão de download.
- Na página `/processos/[id]`:
  - Exibir bloco com a contagem e lista dos documentos complementares anexados.

---

## 3. Subsistema 2: Centralização da Navegação e Nomenclatura Institucional

### 3.1 Unificação dos Grupos de Navegação (`src/shared/lib/authz/navigation.ts`)

- A lista `NAV_GROUPS` é simplificada para:
  1. `acompanhamento`: **Acompanhamento** (ícone `LayoutDashboard`)
  2. `estoque`: **Estoque** (ícone `Package`)
  3. `sistema`: **Sistema** (ícone `Settings`)
- A lista `NAV_ITEMS` transfere Processos, Contratos, Atas e Fornecedores do antigo grupo `conselho` para `acompanhamento`:
  - Visão geral (`/dashboard`)
  - Meu painel (`/meu-conselho`)
  - Órgãos (`/conselhos`)
  - Solicitações (`/solicitacoes`)
  - Processos (`/processos`)
  - Contratos (`/contratos`)
  - Atas (`/atas`)
  - Fornecedores (`/fornecedores`)
  - Reuniões (`/reunioes`)
- Atualizar testes de navegação em `src/shared/lib/authz/navigation.test.ts`.

---

## 4. Subsistema 3: Modernização de UI/UX do Módulo de Reuniões

### 4.1 KPIs e Indicadores no Topo de `/reunioes`

- Adicionar no topo da página de reuniões 4 `KpiCard`s institucionais:
  1. *Total de Reuniões*: contagem total de encontros registrados.
  2. *Próximas Agendadas*: reuniões futuras com status `agendada`.
  3. *Realizadas com Ata*: reuniões com status `realizada` e ata registrada.
  4. *Pendências / Ações*: ações vinculadas com indicador de pendentes vs. concluídas.

### 4.2 Padronização e Ações Rápidas

- Substituir a coluna *"Conselho"* por **"Órgão"** em todas as tabelas de reuniões e pendências.
- Diálogo modal de agendamento de reuniões (`NewMeetingForm`) com rótulos institucionais ("Órgão").

---

## 5. Estratégia de Verificação e Testes

1. **Testes de Domínio:**
   - Testar que anexos do tipo `"OUTRO"` não afetam o cálculo de `calculateProgress` (7 obrigatórios = 100%, 6 obrigatórios + 3 "OUTRO" = 85.71%).
2. **Testes de Navegação:**
   - Testar integridade dos grupos e visibilidade dos itens centralizados em `acompanhamento`.
3. **Testes de Interface:**
   - Testar upload de artefatos adicionais no drawer `ProcessAttachmentSheet`.
   - Testar renderização dos KPIs e colunas de `/reunioes`.
4. **Verificação Completa de Regressão:**
   - `npm run db:bundle && npm run db:check`
   - `npm test` (386+ testes)
   - `npm run typecheck`
   - `npm run build`
