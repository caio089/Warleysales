# Redesign Visual da Página de Processos — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar a página de detalhes do processo administrativo (`/processos/[id]`), substituindo a rolagem vertical infinita de 10 blocos e 8 caixas de upload por uma interface executiva moderna organizada em 3 abas focadas, régua de métricas compactas, microcopy institucional sem jargões e alinhamento simétrico do formulário de formalização.

**Architecture:** A página `/processos/[id]` é refatorada em componentes focados e coesos: `ProcessHeader` (topo + 4 métricas compactas), navegação por abas gerenciada no cliente (`DocumentationTab`, `ContractingTab`, `GovernanceTab`), substituição das 8 caixas pontilhadas gigantes por `CompactDocumentRow` com gatilho limpo de upload, e correção da grade assimétrica do formulário em `FormalizationCard`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI / Lucide icons, Vitest e React Testing Library.

## Global Constraints

- Preservar integralmente o cálculo rigoroso dos 7 documentos obrigatórios para 100% de conformidade (Régua da Lei 14.133 / PNCP).
- Preservar a prerrogativa do Veredito Exclusivo de Warley (`actor.isCentralAdmin === true`) para homologar e liberar o estoque.
- Preservar a Regra R11 do estoque bloqueado convertendo para pronto para uso.
- Manter 100% dos 401 testes da aplicação passando sem quebras ou regressões.
- Substituir textos de jargão de desenvolvimento (*"R6"*, *"job examina e pula"*, *"não confundir com..."*) por microcopy institucional e profissional.

---

### Task 1: Componente de Topo Executivo e Régua de Métricas (`ProcessHeader`)

**Files:**
- Create: `src/app/(app)/processos/[id]/process-header.tsx`
- Create: `src/app/(app)/processos/[id]/process-header.test.tsx`

**Interfaces:**
- Produces: `ProcessHeader`
  ```tsx
  export interface ProcessHeaderProps {
    processNumber: string;
    productName: string;
    description: string;
    statusLabel: string;
    statusTone: "neutral" | "info" | "success" | "warning" | "danger";
    completionLabel: string;
    completionTone: "neutral" | "info" | "success" | "warning" | "danger";
    initialValue: number | null;
    quantity: number;
    validTypesCount: number;
    totalTypesCount: number;
    displayPercent: number;
    releaseStatusText: string;
  }
  ```

- [ ] **Step 1: Escrever teste de unidade para o `ProcessHeader`**
  - Validar renderização do número do processo, nome do produto e badges.
  - Validar os 4 cards de métricas (Valor Inicial formatado em moeda, Quantidade, % Documental com mini progress bar e Status de Liberação).
- [ ] **Step 2: Executar teste e verificar falha esperada (vermelho)**
  ```powershell
  npm test src/app/(app)/processos/[id]/process-header.test.tsx
  ```
- [ ] **Step 3: Implementar `ProcessHeader`**
  - Breadcrumb limpo `Processos / Processo {number}` com link de retorno sutil `← Voltar para Processos`.
  - Título limpo com tipografia moderna (sem o underline laranja grosso).
  - Régua de 4 cards compactos e responsivos (`grid grid-cols-2 lg:grid-cols-4 gap-3`).
- [ ] **Step 4: Executar teste e verificar aprovação (verde)**
  ```powershell
  npm test src/app/(app)/processos/[id]/process-header.test.tsx
  ```
- [ ] **Step 5: Commitar Task 1**
  ```powershell
  git add src/app/(app)/processos/[id]/process-header.tsx src/app/(app)/processos/[id]/process-header.test.tsx
  git commit -m "feat(processos): criar componente de topo executivo e regua de metricas ProcessHeader"
  ```

---

### Task 2: Linha Compacta de Documento (`CompactDocumentRow`)

**Files:**
- Create: `src/app/(app)/processos/[id]/compact-document-row.tsx`
- Create: `src/app/(app)/processos/[id]/compact-document-row.test.tsx`

**Interfaces:**
- Produces: `CompactDocumentRow`
  ```tsx
  export interface CompactDocumentRowProps {
    processId: string;
    typeCode: string;
    label: string;
    valid: boolean;
    files: { id: string; name: string; size?: number; createdAt?: string }[];
    canUpload: boolean;
    canUnlink: boolean;
    canManualDelete: boolean;
    onUploadClick?: () => void;
  }
  ```

- [ ] **Step 1: Escrever teste de unidade para `CompactDocumentRow`**
  - Validar exibição de documento validado (com ícone verde, nome do arquivo e botões Baixar/Desvincular).
  - Validar exibição de documento pendente (com badge âmbar e botão `Anexar`).
- [ ] **Step 2: Executar teste e verificar falha esperada**
  ```powershell
  npm test src/app/(app)/processos/[id]/compact-document-row.test.tsx
  ```
- [ ] **Step 3: Implementar `CompactDocumentRow`**
  - Linha/card horizontal fino e moderno.
  - Se houver arquivo anexado: exibe ícone de arquivo, nome legível, botões sutis de ação (`Baixar`, `Desvincular`, `Excluir`).
  - Se não houver: botão direto e elegante `+ Anexar` para upload focado, sem dropzone gigante permanente ocupando a tela.
- [ ] **Step 4: Executar teste e verificar aprovação**
  ```powershell
  npm test src/app/(app)/processos/[id]/compact-document-row.test.tsx
  ```
- [ ] **Step 5: Commitar Task 2**
  ```powershell
  git add src/app/(app)/processos/[id]/compact-document-row.tsx src/app/(app)/processos/[id]/compact-document-row.test.tsx
  git commit -m "feat(processos): criar componente de linha compacta de documentos CompactDocumentRow"
  ```

---

### Task 3: Aba 1 — Pasta Documental (`DocumentationTab`)

**Files:**
- Create: `src/app/(app)/processos/[id]/tabs/documentation-tab.tsx`
- Create: `src/app/(app)/processos/[id]/tabs/documentation-tab.test.tsx`

**Interfaces:**
- Produces: `DocumentationTab`
  ```tsx
  export interface DocumentationTabProps {
    processId: string;
    validTypes: string[];
    documents: ProcessAttachment[];
    canManage: boolean;
    canUnlink: boolean;
    isSpecialDeleter: boolean;
  }
  ```

- [ ] **Step 1: Escrever teste de unidade para `DocumentationTab`**
  - Validar renderização dos 7 tipos obrigatórios na ordem da Lei 14.133.
  - Validar renderização da seção de artefatos adicionais (`OUTRO`).
- [ ] **Step 2: Executar teste e verificar falha esperada**
  ```powershell
  npm test src/app/(app)/processos/[id]/tabs/documentation-tab.test.tsx
  ```
- [ ] **Step 3: Implementar `DocumentationTab`**
  - Card consolidado *"Documentos Obrigatórios da Lei 14.133 / PNCP"* com lista dos 7 itens em `CompactDocumentRow`.
  - Card integrado para *"Artefatos Adicionais & Complementares"* com lista dos documentos `OUTRO` e botão de upload rápido.
- [ ] **Step 4: Executar teste e verificar aprovação**
  ```powershell
  npm test src/app/(app)/processos/[id]/tabs/documentation-tab.test.tsx
  ```
- [ ] **Step 5: Commitar Task 3**
  ```powershell
  git add src/app/(app)/processos/[id]/tabs/documentation-tab.tsx src/app/(app)/processos/[id]/tabs/documentation-tab.test.tsx
  git commit -m "feat(processos): criar aba de documentacao DocumentationTab com visual compacto"
  ```

---

### Task 4: Ajustar Alinhamento do Formulário em `FormalizationCard` e Criar Aba 2 (`ContractingTab`)

**Files:**
- Modify: `src/app/(app)/processos/[id]/formalization-card.tsx`
- Create: `src/app/(app)/processos/[id]/tabs/contracting-tab.tsx`
- Modify: `src/app/(app)/processos/[id]/formalization-card.test.tsx`

**Interfaces:**
- Produces: `ContractingTab`
  ```tsx
  export interface ContractingTabProps {
    processId: string;
    councilId: string;
    documentalComplete: boolean;
    formalization: ProcessFormalization | null;
    suppliers: FormalizationSupplier[];
    isWarley: boolean;
    defaultEstimatedValue?: number | null;
    requestId?: string | null;
    requestItems?: { materialId: string; name: string; quantity: number }[];
    linkedAtas: { id: string; number: string; endDate: string; status: string }[];
    linkedContracts: { id: string; number: string; object: string; value: number; endDate: string }[];
  }
  ```

- [ ] **Step 1: Corrigir a grade simétrica do formulário de formalização em `formalization-card.tsx`**
  - Eliminar o layout quebrado onde a descrição ficava na esquerda e o input de quantidade 800px longe à direita.
  - Organizar campos em grade alinhada de 2 colunas:
    - Linha 1: Fornecedor (com autocomplete / datalist) + Data do Pregão.
    - Linha 2: Valor de Referência Estimado + Quantidade Contratada.
    - Linha 3: Valor Comprado Proposta Vencedora.
  - Card de Cálculo de Economia em Tempo Real em largura total com destaque visual esmeralda.
- [ ] **Step 2: Implementar `ContractingTab`**
  - Cards horizontais elegantes para Atas Vinculadas e Contratos Vinculados com link direto e indicador de vigência.
  - Incorporação do `FormalizationCard` corrigido.
- [ ] **Step 3: Executar testes de formalização**
  ```powershell
  npm test src/app/(app)/processos/[id]/formalization-card.test.tsx
  ```
- [ ] **Step 4: Commitar Task 4**
  ```powershell
  git add src/app/(app)/processos/[id]/formalization-card.tsx src/app/(app)/processos/[id]/tabs/contracting-tab.tsx src/app/(app)/processos/[id]/formalization-card.test.tsx
  git commit -m "feat(processos): corrigir alinhamento do formalization-card e criar aba ContractingTab"
  ```

---

### Task 5: Aba 3 — Governança e Histórico (`GovernanceTab`)

**Files:**
- Create: `src/app/(app)/processos/[id]/tabs/governance-tab.tsx`
- Modify: `src/app/(app)/processos/[id]/process-actions.tsx`

**Interfaces:**
- Produces: `GovernanceTab`
  ```tsx
  export interface GovernanceTabProps {
    processId: string;
    status: ProcessStatus;
    canChangeStatus: boolean;
    canRegisterClosing: boolean;
    closingReportRegistered: boolean;
    documentalComplete: boolean;
  }
  ```

- [ ] **Step 1: Implementar `GovernanceTab`**
  - Card limpo para alteração da Situação Administrativa (com microcopy institucional sem termos de R6 ou recados para dev).
  - Card limpo para Relatório de Encerramento (com status se já registrado ou botão para registrar).
- [ ] **Step 2: Higienizar textos em `process-actions.tsx`**
  - Substituir jargões técnicos por explicações institucionais claras.
- [ ] **Step 3: Testar e commitar Task 5**
  ```powershell
  npm test
  git add src/app/(app)/processos/[id]/tabs/governance-tab.tsx src/app/(app)/processos/[id]/process-actions.tsx
  git commit -m "feat(processos): criar aba GovernanceTab e higienizar microcopy de governanca"
  ```

---

### Task 6: Orquestração da Página Principal com Tabs (`/processos/[id]/page.tsx`)

**Files:**
- Create: `src/app/(app)/processos/[id]/process-view.tsx`
- Modify: `src/app/(app)/processos/[id]/page.tsx`

- [ ] **Step 1: Implementar `ProcessView` com gerenciamento de abas no cliente**
  - Componente client com abas elegantes:
    - `📁 Documentação (7+N)`
    - `🤝 Contratação & Atas`
    - `⚙️ Governança & Histórico`
  - Renderização fluida e responsiva sem rolagem vertical desnecessária.
- [ ] **Step 2: Atualizar `page.tsx` para usar `ProcessHeader` e `ProcessView`**
  - Remover blocos soltos, eliminar dropzones gigantes e redundâncias de texto.
- [ ] **Step 3: Executar a suíte de testes completa e validações de build**
  ```powershell
  npm test
  npm run typecheck
  npm run build
  ```
- [ ] **Step 4: Commitar Task 6**
  ```powershell
  git add src/app/(app)/processos/[id]/process-view.tsx src/app/(app)/processos/[id]/page.tsx
  git commit -m "feat(processos): unificar pagina de processos em layout moderno com abas e metadados compactos"
  ```

---

### Task 7: Verificação Final e Demonstração

- [ ] **Step 1: Executar todas as verificações do sistema**
  - `npm test`: todos os testes devem passar (401+ aprovados).
  - `npm run typecheck`: 0 erros de tipagem.
  - `npm run db:check`: integridade do banco validada.
  - `npm run build`: rotas compiladas com sucesso.
- [ ] **Step 2: Apresentar o resultado final ao usuário com detalhes da transformação visual.**
