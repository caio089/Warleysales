# Plano de Implementação: Onda 3 — Documentos Adicionais nos Processos, Centralização da Navegação e UI de Reuniões

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir o upload e consulta de artefatos adicionais/complementares nos processos administrativos mantendo a regra rígida dos 7 documentos obrigatórios para 100%, centralizar a navegação da assessoria e contratos sob o grupo Acompanhamento, e modernizar a interface de Reuniões com KPIs e rótulos institucionais ("Órgão").

**Architecture:** Next.js 16 (App Router + Turbopack), Supabase (PostgreSQL + RLS + Storage), Clean Architecture com funções puras de cálculo documental imutáveis, integridade referencial com migração segura de tipos documentais, e consistência visual institucional.

**Tech Stack:** Next.js 16.4.4, React 19, TypeScript, Tailwind CSS, Lucide React, Vitest, Supabase JS Client, Zod v4.

## Global Constraints

- A conclusão de 100% dos documentos nos processos exige obrigatoriamente os 7 tipos legais mínimos (DFD, ETP, MR, TR, PP, PJ, ED); documentos complementares (`OUTRO`) nunca reduzem nem diluem a exigência mínima.
- Manter o isolamento multi-tenant (R14) em todas as telas e consultas.
- No Windows PowerShell, caminhos com parênteses (ex.: `src/app/(app)/...`) devem ser passados sempre com aspas duplas nos comandos do Git.
- Todos os testes unitários e de integração existentes (386 testes) devem continuar verdes em cada tarefa.

---

### Task 1: Migração SQL e Modelo de Domínio para Artefatos Adicionais (`OUTRO`)

**Files:**
- Create: `supabase/migrations/20261110000004_additional_documents.sql`
- Modify: `scripts/check-supabase.mjs`
- Modify: `src/modules/processes/domain/document-types.ts`
- Modify: `src/modules/processes/domain/progress.ts`
- Modify: `src/modules/processes/domain/processes.test.ts`

**Interfaces:**
- Consumes: `DOCUMENT_TYPES`, `REQUIRED_DOCUMENT_COUNT`, `calculateProgress`.
- Produces: Tipo documental `"OUTRO"` (is_required = false), `calculateProgress` preservando cálculo estrito sobre os 7 obrigatórios.

- [ ] **Step 1: Escrever testes unitários em `processes.test.ts` para progresso com documentos adicionais**
  - Anexos contendo os 7 obrigatórios + 2 adicionais (`typeCode: "OUTRO"`) resultam em 100% (`isComplete: true`).
  - Anexos contendo 5 obrigatórios + 4 adicionais resultam em 71.43% (`isComplete: false`, 5/7).
  - Anexos contendo apenas documentos adicionais resultam em 0% (`isComplete: false`).

- [ ] **Step 2: Atualizar domínio em `document-types.ts` e `progress.ts`**
  - Em `document-types.ts`:
    - Adicionar tipo `"OUTRO"` com rótulo `"Artefato Adicional / Complementar"`.
    - Manter `REQUIRED_DOCUMENT_COUNT = 7` e `DOCUMENT_TYPE_CODES` contendo estritamente os 7 obrigatórios.
  - Em `progress.ts`:
    - Garantir que `ProcessAttachment` aceite `typeCode: string` e que `calculateProgress` filtre estritamente sobre `DOCUMENT_TYPE_CODES`.

- [ ] **Step 3: Criar migração SQL `supabase/migrations/20261110000004_additional_documents.sql`**
  - Adicionar coluna `is_required boolean not null default true` em `public.document_types`.
  - Inserir tipo `('OUTRO', 'Artefato Adicional / Complementar', 8, false)`.
  - Atualizar a view `public.v_process_progress` para contar apenas os tipos onde `dt.is_required = true`.

- [ ] **Step 4: Atualizar `scripts/check-supabase.mjs`**
  - Ajustar verificação para filtrar os tipos obrigatórios: `admin.from("document_types").select("code, is_required").eq("is_required", true)`.

- [ ] **Step 5: Executar testes de domínio e typecheck**
  - `npm test src/modules/processes/domain/processes.test.ts`
  - `npm run typecheck`

- [ ] **Step 6: Commitar da Task 1**
  - `git add supabase/migrations/20261110000004_additional_documents.sql scripts/check-supabase.mjs src/modules/processes/domain/`
  - `git commit -m "feat(processos): adicionar suporte a artefatos adicionais preservando calculo dos 7 obrigatorios"`

---

### Task 2: Interface de Artefatos Adicionais no Drawer e na Página do Processo

**Files:**
- Modify: `src/app/(app)/processos/process-attachment-sheet.tsx`
- Modify: `src/app/(app)/processos/[id]/page.tsx`
- Modify: `src/modules/documents/actions.ts`

**Interfaces:**
- Consumes: `confirmDocumentUploadAction`, `prepareDocumentUploadAction`, `loadProcessDocumentsAction`.
- Produces: Seção de upload e listagem de artefatos adicionais no drawer e na visualização completa do processo.

- [ ] **Step 1: Atualizar `ProcessAttachmentSheet`**
  - Separar os documentos em duas seções:
    1. *Documentos Obrigatórios (Lei 14.133 / PNCP)* com os 7 tipos fixos e seus respectivos status.
    2. *Artefatos Adicionais & Complementares* com botão de upload para `typeCode: "OUTRO"` permitindo anexar múltiplos arquivos complementares com download direto.
  - Atualizar contadores visuais sem impactar o percentual.

- [ ] **Step 2: Atualizar a página `/processos/[id]/page.tsx`**
  - Renderizar bloco ou card listando os artefatos adicionais anexados com link para download, tamanho e data.

- [ ] **Step 3: Executar testes e typecheck**
  - `npm test`
  - `npm run typecheck`

- [ ] **Step 4: Commitar da Task 2**
  - `git add "src/app/(app)/processos/process-attachment-sheet.tsx" "src/app/(app)/processos/[id]/page.tsx"`
  - `git commit -m "feat(processos): exibir e gerenciar artefatos adicionais no drawer e na pagina do processo"`

---

### Task 3: Centralização do Módulo Acompanhamento na Navegação Lateral

**Files:**
- Modify: `src/shared/lib/authz/navigation.ts`
- Modify: `src/shared/lib/authz/navigation.test.ts`

**Interfaces:**
- Consumes: `NAV_GROUPS`, `NAV_ITEMS`, `filterNavigation`.
- Produces: Menu lateral com Processos, Contratos, Atas e Fornecedores sob o grupo `acompanhamento`.

- [ ] **Step 1: Atualizar testes em `navigation.test.ts`**
  - Refletir os 3 grupos consolidados (`acompanhamento`, `estoque`, `sistema`).
  - Testar que Processos, Contratos, Atas e Fornecedores pertencem ao grupo `acompanhamento`.

- [ ] **Step 2: Atualizar `src/shared/lib/authz/navigation.ts`**
  - Mudar `group` dos itens `Processos`, `Contratos`, `Atas` e `Fornecedores` para `"acompanhamento"`.
  - Remover grupo redundante `"conselho"` de `NAV_GROUPS` e da tipagem `NavGroup["id"]`.

- [ ] **Step 3: Executar testes e typecheck**
  - `npm test src/shared/lib/authz/navigation.test.ts`
  - `npm run typecheck`

- [ ] **Step 4: Commitar da Task 3**
  - `git add src/shared/lib/authz/navigation.ts src/shared/lib/authz/navigation.test.ts`
  - `git commit -m "feat(navegacao): centralizar processos, contratos, atas e fornecedores em Acompanhamento"`

---

### Task 4: Modernização de UI/UX do Módulo de Reuniões

**Files:**
- Modify: `src/app/(app)/reunioes/page.tsx`
- Modify: `src/app/(app)/reunioes/meeting-forms.tsx`

**Interfaces:**
- Consumes: `services.meetings.list`, `loadLookups`.
- Produces: Página `/reunioes` moderna com 4 KPIs, nomenclatura institucional "Órgão" e visualização clara de pautas e atas.

- [ ] **Step 1: Adicionar KPIs estratégicos no topo de `/reunioes/page.tsx`**
  - *Total de Reuniões*, *Próximas Agendadas*, *Realizadas com Ata*, *Pendências em Aberto*.

- [ ] **Step 2: Padronizar nomenclatura institucional nas tabelas e formulários**
  - Renomear coluna `"Conselho"` para `"Órgão"`.
  - Atualizar `NewMeetingForm` e diálogos para usar rótulo `"Órgão"`.

- [ ] **Step 3: Executar testes e typecheck**
  - `npm test src/modules/meetings/service.test.ts`
  - `npm run typecheck`

- [ ] **Step 4: Commitar da Task 4**
  - `git add "src/app/(app)/reunioes/"`
  - `git commit -m "feat(reunioes): adicionar kpis estrategicos e padronizar termo Orgao"`

---

### Task 5: Consolidação Geral, `db:bundle`, `db:check`, Testes 100% e Build

**Files:**
- Modify: `supabase/apply_all.sql`
- Run: `npm run db:bundle`
- Run: `npm run db:check`
- Run: `npm test`
- Run: `npm run typecheck`
- Run: `npm run build`

- [ ] **Step 1: Regenerar `supabase/apply_all.sql` com nova migração**
  - `npm run db:bundle`

- [ ] **Step 2: Executar verificação de banco**
  - `npm run db:check`

- [ ] **Step 3: Executar suíte completa de testes**
  - `npm test` (100% PASS)

- [ ] **Step 4: Executar typecheck**
  - `npm run typecheck` (0 erros)

- [ ] **Step 5: Executar build de produção**
  - `npm run build`

- [ ] **Step 6: Commitar consolidação final**
  - `git add -A`
  - `git commit -m "chore(onda3): consolidar artefatos adicionais, navegacao centralizada e reunioes"`
