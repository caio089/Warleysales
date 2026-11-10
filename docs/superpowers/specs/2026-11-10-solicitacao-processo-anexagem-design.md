# Especificação de Design: Vínculo Solicitação-Processo e Painel Rápido de Anexagem

**Data:** 10 de Novembro de 2026  
**Status:** Aprovado para Implementação  
**Autor:** Antigravity & Warley  

---

## 1. Visão Geral e Contexto

No fluxo de compras e contratações do sistema de gestão do Warley, a criação de uma demanda ocorre em **Solicitações** (etapa 01). Para que o processo avance até a formalização e liberação do saldo de estoque, é indispensável a abertura de um **Processo Administrativo** (etapa 02) com a inserção dos 7 documentos obrigatórios:
1. DFD (Documento de Formalização da Demanda)
2. ETP (Estudo Técnico Preliminar)
3. MR (Matriz de Riscos)
4. TR (Termo de Referência)
5. PP (Pesquisa de Preços)
6. PJ (Parecer Jurídico)
7. ED (Edital / Minuta de Contrato)

### Objetivo
Permitir que, ao criar uma solicitação de compra em `/solicitacoes/nova`, o operador possa optar por gerar automaticamente o processo administrativo correspondente com o próximo número sequencial anual (ex.: `001/2026`). Na sequência, ao consultar a solicitação ou a listagem de processos (`/processos`), o usuário deve conseguir abrir com apenas **1 clique** um painel lateral deslizante (*Sheet*) para anexar os documentos de forma rápida e intuitiva, com a barra de progresso e o status do processo se atualizando em tempo real.

---

## 2. Requisitos e Casos de Uso

### UC-01: Geração Automática do Processo na Nova Solicitação
- **Ator:** Operador do Conselho ou Administrador Central.
- **Entrada:** Conselho/Empresa, título/objeto da demanda, itens e a caixa de seleção *"Gerar processo administrativo correspondente"* (marcada por padrão).
- **Comportamento:**
  - Se desmarcada, a solicitação é criada como rascunho sem vínculo com processo.
  - Se marcada, o sistema obtém a próxima sequência numérica para o conselho no ano vigente, cria o processo com status `em_andamento` e associa o `process_id` à solicitação.
- **Saída:** Redirecionamento para a tela da solicitação (`/solicitacoes/[id]`).

### UC-02: Visualização do Processo Vinculado na Solicitação
- **Tela:** `/solicitacoes/[id]`.
- **Comportamento:** Se a solicitação possuir `processId`, exibe um card institucional de destaque contendo:
  - Número e objeto do processo administrativo.
  - Indicadores de situação (ex.: *Em andamento*) e documentação (ex.: *0 de 7 documentos*).
  - Barra de progresso visual.
  - Botão de ação primário: *"Anexar documentos do processo"*, que direciona para `/processos?abrir=<processId>`.

### UC-03: Painel Lateral de Anexagem Rápida na Listagem de Processos
- **Tela:** `/processos`.
- **Comportamento:**
  - A tabela de processos exibe botão de ação direta *"Anexar"* e permite clique na linha para abrir a gaveta lateral (*Sheet*).
  - Se a URL contiver o parâmetro `?abrir=<id>`, o painel do processo correspondente abre automaticamente ao carregar a página.
  - No painel lateral:
    - Cabeçalho com o número do processo, objeto e barra de progresso (0% a 100%).
    - Lista dos 7 tipos documentais com badges de status (anexado com nome do arquivo ou pendente).
    - Botão de upload direto de 1 clique para cada tipo documental pendente (utilizando Storage assinado e conferência SHA-256).
    - Ao confirmar o upload, a barra de progresso e o status atualizam instantaneamente no painel e na linha da tabela de fundo, sem recarregar a tela inteira.
    - Link no rodapé para acessar a página detalhada do processo (`/processos/[id]`).

---

## 3. Arquitetura e Modelo de Dados

### 3.1. Banco de Dados (PostgreSQL / Supabase)
- **Tabela `public.purchase_requests`:**
  - Adição da coluna: `process_id uuid references public.administrative_processes (id) on delete set null`.
  - Criação de índice: `create index if not exists idx_purchase_requests_process_id on public.purchase_requests (process_id);`.

### 3.2. Sequenciamento de Processos (`nextProcessNumber`)
- Para garantir números contínuos no formato `NNN/AAAA`:
  - Consulta da maior `sequence` na tabela `administrative_processes` para o par `(council_id, year)`.
  - Próximo sequencial: `(max_sequence ?? 0) + 1`.
  - Formatação com `formatProcessNumber(nextSeq, currentYear)`.

### 3.3. Repositório e Camada de Domínio
- **Tipagem `PurchaseRequest`:**
  - Campo opcional `processId: string | null`.
- **Tipagem e Repositório de Processos:**
  - Método `nextSequence(councilId: string, year: number): Promise<number>`.
- **Serviço de Compras (`purchases.create`):**
  - Parâmetro adicional no input: `createProcess?: boolean`.
  - Se `createProcess` for verdadeiro, injeta dependência de `processes.create` ou sequenciador, cria o processo e atribui `processId`.

---

## 4. Design de Interface (UI/UX)

### 4.1. Formulário em `/solicitacoes/nova`
- Adiciona o campo checkbox utilizando o padrão visual do Design System:
  - Label: *"Gerar processo administrativo correspondente"*
  - Descrição de apoio: *"Abre automaticamente o processo para inserção dos 7 documentos obrigatórios."*
  - Valor padrão: selecionado (`checked`).

### 4.2. Card em `/solicitacoes/[id]`
- Localizado acima ou ao lado das abas de itens da solicitação.
- Card com borda sutil, ícone de pasta (`FolderArchive` ou `FileText`), status badge e progresso percentual.
- Botão com estilo de destaque chamando para a ação de anexagem.

### 4.3. Componente `ProcessAttachmentSheet` em `/processos`
- Construído sobre `src/components/ui/sheet.tsx`.
- Gerenciamento de estado via URL (`useSearchParams` e `useRouter` / `pushState` leve) para que links diretos (`/processos?abrir=UUID`) funcionem instantaneamente.
- Reutiliza o fluxo de upload seguro existente (`prepareDocumentUploadAction`, envio ao bucket privado via URL assinada e `confirmDocumentUploadAction`).

---

## 5. Segurança, RLS e Auditoria

- **Permissões:** A criação do processo segue a permissão `process.create` para o conselho selecionado. Caso o usuário não tenha permissão para criar processos no conselho da solicitação, o sistema retorna erro claro de validação.
- **Upload Seguro:** Preserva todas as validações de extensões permitidas (PDF, DOCX), magic bytes, tamanho máximo (25 MB) e hash SHA-256 no client e server.
- **Auditoria:** Grava eventos estruturados em `audit_logs` para `request.create` e `process.create` vinculados ao ator da sessão.

---

## 6. Estratégia de Testes

1. **Testes Unitários / Domínio:**
   - Criação de solicitação com e sem a flag `createProcess`.
   - Cálculo e incremento correto do número sequencial `nextSequence`.
2. **Testes de Integração:**
   - Validação do `PurchaseRequestRepository` e `ProcessRepository` em memória mantendo `process_id`.
   - Suíte `purchases/service.test.ts` e `processes/service.test.ts` passando com 100% de sucesso.
3. **Validação E2E / Visual:**
   - Submissão da nova solicitação com geração do processo.
   - Navegação direta para os detalhes e clique em "Anexar documentos".
   - Abertura do Sheet na listagem de processos e upload do arquivo com atualização do progresso.
