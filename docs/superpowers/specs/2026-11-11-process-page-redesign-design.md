# Documento de Design Técnico: Redesign Visual e Arquitetura em Abas da Página de Processos

**Data:** 11 de Novembro de 2026  
**Status:** Proposto para Aprovação  
**Escopo:** Página de Detalhes do Processo Administrativo (`/processos/[id]`)  

---

## 1. Contexto e Diagnóstico dos Problemas Atuais

Ao analisar os 6 prints enviados pelo usuário e o código-fonte em [`src/app/(app)/processos/[id]/page.tsx`](file:///C:/Users/alder/Warleysales/src/app/(app)/processos/[id]/page.tsx), [`formalization-card.tsx`](file:///C:/Users/alder/Warleysales/src/app/(app)/processos/[id]/formalization-card.tsx) e [`document-card.tsx`](file:///C:/Users/alder/Warleysales/src/app/(app)/processos/[id]/document-card.tsx), constatou-se que a página acumulou **10 blocos verticais sequenciais**, resultando em uma rolagem infinita confusa e desordenada:

1. **Excesso de Dropzones Enormes (8 caixas de arrastar arquivo na mesma tela):**
   - Os 7 documentos obrigatórios e a seção de artefatos adicionais possuem, cada um, uma área pontilhada gigante permanente de upload (`Arraste arquivos aqui ou Selecionar arquivo`). Isso força o usuário a rolar dezenas de telas de espaço vazio.
2. **Textos de Jargão Técnico e "Recados de Desenvolvedor":**
   - Frases longas poluindo a tela, tais como: *"É o andamento do processo... Não confundir com 'documentação completa'"*, *"Obrigatório para a limpeza documental (R6). Sem este registro o job só examina e pula"* e *"Sobe sozinho quando cada tipo recebe um anexo válido..."*.
3. **Instruções Redundantes e Repetitivas:**
   - O aviso de contratação é exibido repetidamente 4 vezes em blocos distintos (NextStepCallout, card de métricas, checklist com bullets e no cabeçalho do formulário de formalização).
4. **Formulário com Alinhamento Quebrado:**
   - No bloco de formalização, o nome do item (*"iphone 18 pro max"*) está empurrado na extrema esquerda e o campo de *"Quantidade"* flutuando 800px à direita, seguido de campos de valores dispostos sem harmonia.
5. **Mistura de Governança com o Fluxo Operacional de Compras:**
   - Ações de encerramento e situação administrativa disputam a atenção imediata no topo da tela com as tarefas diárias de consulta de documentos e contratação.

---

## 2. Objetivos do Redesign

1. **Eliminar a Rolagem Infinita com Navegação em 3 Abas Temáticas:**
   - `📁 Documentação (7+N)`: Gestão de arquivos obrigatórios e complementares.
   - `🤝 Contratação, Atas & Economia`: Vínculo de atas, contratos, dados do pregão e cálculo de economia.
   - `⚙️ Governança & Histórico`: Situação administrativa, relatório de encerramento e trilha de auditoria.
2. **Substituir os 8 Dropzones por Cards/Linhas Compactas e Elegantes:**
   - Cada documento obrigatório torna-se uma linha ou card compacto e informativo (Status 🟢/⏳, Tipo Legal, Arquivo Atual, Tamanho, Data, Botões *Baixar* e *Desvincular*).
   - O upload passa a ser acionado por um botão direto sutil `+ Anexar` ou diálogo rápido, eliminando caixas pontilhadas vazias e gigantescas.
3. **Harmonizar a Tipografia, Espaçamentos e Hierarquia Visual:**
   - Topo com breadcrumb limpo, título do processo sem linhas laranjas pesadas, badges de status padronizadas e uma **Régua de 4 Métricas Chave** (Valor Inicial, Quantidade, Conformidade Documental com mini progress bar e Status de Liberação).
4. **Alinhamento Perfeito do Formulário de Formalização:**
   - Grid coeso e simétrico: Fornecedor $\rightarrow$ Data do Pregão $\rightarrow$ Valor de Referência $\rightarrow$ Quantidade Contratada $\rightarrow$ Valor Comprado $\rightarrow$ Painel Reativo de Economia.
5. **Limpeza Geral de Microcopy:**
   - Textos institucionais claros, diretos e sem jargões de backend/banco de dados.

---

## 3. Arquitetura da Solução e Componentes

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ← Voltar para Processos                                                               │
│  Processo 002/2026 · iPhone 18 Pro Max                                                 │
│  [Em Andamento]  [Documentação 100%]  [Apto para Contratação]                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [ 💰 R$ 15.000,00 ]   [ 📦 23 unidades ]   [ 📑 7/7 Documentos (100%) ]  [ 🔓 Status ]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┬──────────────────────────┬───────────────────────────────┐  │
│  │ 📁 Documentação (7+N) │ 🤝 Contratação & Atas    │ ⚙️ Governança & Histórico     │  │
│  └───────────────────────┴──────────────────────────┴───────────────────────────────┘  │
│                                                                                        │
│  [Conteúdo da Aba Ativa]                                                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Cabeçalho & Régua de 4 Métricas (`ProcessHeader`)
- **Breadcrumb:** `Processos / Processo {number}` com link de retorno sutil.
- **Identificação:** Título do produto/objeto e descrição com badges de status limpas.
- **Régua de 4 Indicadores Rápidos:**
  1. **Valor Estimado:** `R$ 15.000,00` (ou *"A definir"*).
  2. **Quantidade Total:** `23 un`.
  3. **Conformidade Documental:** `7/7 (100%)` com mini barra de progresso verde integrada.
  4. **Status de Liberação:** Indicador pill claro (*"Aguardando Contratação"*, *"Pronto para Uso"*, etc.).

### 3.2 Aba 1: `📁 Documentação (7+N)` (`ProcessDocumentationTab`)
- **Lista de Conformidade dos 7 Obrigatórios:**
  - Componente compacto `CompactDocumentRow`:
    - Ícone de status: verde circular para ativo/validado, âmbar/cinza para pendente.
    - Código e nome: `1. DFD - Documento de Formalização da Demanda`.
    - Metadados do arquivo anexado: nome legível, extensão, tamanho formatado e data de upload.
    - Ações discretas: Botão de download (`Baixar`), botão de desvincular e botão de exclusão manual (se `isSpecialDeleter`).
    - Para tipos pendentes: botão sutil `+ Anexar arquivo` que abre o upload focado, sem poluir os outros cards.
- **Artefatos Adicionais & Complementares (`OUTRO`):**
  - Lista de arquivos adicionais anexados com badge discreta `OUTRO`, botão de download/exclusão e botão `+ Adicionar anexo complementar`.

### 3.3 Aba 2: `🤝 Contratação, Atas & Economia` (`ProcessContractingTab`)
- **Atas e Contratos Vinculados:**
  - Cards horizontais limpos apresentando número, fornecedor, vigência e link direto para a ata/contrato.
  - Indicador claro de conformidade para liberação.
- **Formulário de Formalização Refinado:**
  - Grid de 2 colunas perfeitamente alinhadas:
    - Coluna 1: Fornecedor (com datalist e busca rápida) + Data do Pregão (date picker).
    - Coluna 2: Valor de Referência (R$) + Quantidade Contratada.
    - Coluna 1 e 2: Valor Comprado (R$) e itens detalhados.
  - **Card de Economia em Tempo Real:**
    - Fundo esmeralda suave, exibindo em tempo real a diferença em R$ e a porcentagem economizada (`+X% de economia`).
  - **Ações:** Botão primário *"Gravar economia e liberar estoque"* ou botões de Homologação/Recusa exclusiva do Warley quando já submetido.

### 3.4 Aba 3: `⚙️ Governança & Histórico` (`ProcessGovernanceTab`)
- **Situação Administrativa:** Card dedicado e limpo para alteração do status do processo (`Em andamento`, `Suspenso`, `Concluído`, `Cancelado`).
- **Encerramento & Retenção:** Formulário/ação para registro do relatório formal de encerramento.
- **Histórico e Trilha de Eventos:** Exibição da linha do tempo com autor, data e ação realizada no processo.

---

## 4. Garantia de Compatibilidade e Invariantes

1. **Preservação de Todas as Regras de Negócio Existentes:**
   - Cálculo estrito dos 7 documentos obrigatórios para 100% inalterado.
   - Veredito exclusivo de Warley (`actor.isCentralAdmin === true`) preservado.
   - Regra R11 de estoque bloqueado convertendo para pronto para uso preservada.
   - Vínculo de atas e contratos ao processo administrativo preservado.
2. **Aderência aos Testes Automatizados:**
   - Manutenção de todos os 401 testes unitários e de integração passando com 100% de sucesso.
   - Criação de novos testes de renderização e interação para as abas da página.

---

## 5. Próximos Passos
1. Obter a validação final deste documento de design pelo usuário.
2. Criar a branch de desenvolvimento e escrever o plano detalhado de implementação via `writing-plans`.
3. Executar o redesign com testes e validações visuais contínuas.
