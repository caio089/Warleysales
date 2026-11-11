# Design Spec: Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel"

**Data:** 11/11/2026  
**Status:** Validado com o usuário (Opção A: Layout Executivo Limpo & Focado em Ação)  
**Autor:** Antigravity (Pair Programming com Usuário)

---

## 1. Contexto e Problema

As páginas de **Visão Geral** (`/dashboard`) e **Meu Painel** (`/meu-conselho`) apresentavam uma sobrecarga visual acentuada ("card soup"), desproporção entre colunas e excesso de informações redundantes:
1. **Métricas espremidas:** Fileira horizontal de 6 cards de KPI (`xl:grid-cols-6`) com títulos em caixa alta com tracking largo que quebravam feio, ícones circulares pesados competindo com os números e valores vazios repetitivos.
2. **Assimetria vertical severa:** 
   - Na Visão Geral, a seção de 3 colunas gerava um "buraco" de ~70% de espaço em branco na coluna de Reuniões ao lado de uma coluna de Alertas muito longa.
   - No Meu Painel, o formulário de "Solicitar Reunião ou Alinhamento" ficava solto ocupando apenas metade da largura da tela no rodapé, deixando a metade direita 100% vazia (parecendo bug visual).
3. **Ruído textual:** Blocos de IA ("Resumo de IA") em tom bege monolítico com parágrafos densos e códigos técnicos soltos, acompanhados de rodapés redundantes (*"Narrado pela Groq..."*).
4. **Redundâncias operacionais:** Grids de botões gigantescos no topo do Meu Painel ("O que você pode fazer") e no rodapé da Visão Geral ("Ações Rápidas"), que apenas duplicavam os itens do menu lateral.

---

## 2. Objetivos e Não-Objetivos

### Objetivos
- **Harmonia e Proporção:** Eliminar buracos visuais e colunas assimétricas adotando grids de 2 colunas proporcionais (50/50 ou 60/40 balanceadas).
- **Hierarquia de Métricas:** Reduzir a régua de KPIs para 4 métricas mestras executivas por tela, com acabamento tipográfico refinado e sem ícones circulares pesados.
- **Microcopy & Resumo de IA:** Transformar o briefing de IA em um card executivo compacto com chips de ação prioritária.
- **Experiência de Ações:**
  - No Meu Painel, transformar os 6 cards gigantes em uma barra compacta de atalhos rápidos (*Quick Actions Bar*).
  - Transformar o formulário de solicitação de reunião em um **Modal / Dialog limpo e moderno**, eliminando o card pela metade no rodapé.
- **Preservação de Dados e Lógica:** Nenhuma regra de negócio, permissão ou dado do backend/Supabase será alterado.

### Não-Objetivos
- Não alterar as regras de autorização (`can`, `isWarley`, políticas de acesso).
- Não alterar as rotas e contratos de API/Server Actions existentes.
- Não reescrever páginas que não sejam `/dashboard` e `/meu-conselho`.

---

## 3. Especificação Detalhada da Página "Visão Geral" (`/dashboard`)

### 3.1. Topo & Briefing Executivo de IA
- **Cabeçalho:** `PageHeader` com título, descrição objetiva e o seletor `DashboardFilters` mantido.
- **Smart Briefing de IA (`BriefingCard`):**
  - Fundo neutro com leve borda de destaque e padding reduzido (`p-4 sm:p-5`).
  - Badge sutil: "Briefing Operacional (IA)" e status "Pontos de Atenção" ou "Operação Estável".
  - Em vez de parágrafos corridos com bullets pontuados: exibir pílulas/chips temáticos com ícone e texto objetivo:
    - 📦 *Estoque Crítico:* Itens sem disponibilidade ou abaixo do mínimo.
    - 📄 *Contratos & Prazos:* Contratos com vencimento iminente.
    - 🚚 *Entregas:* Entregas pendentes a confirmar.
  - Remoção de rodapé explicativo desnecessário.

### 3.2. Régua de Métricas Estratégicas (4 KPIs Mestres)
Grid de 4 colunas (`grid-cols-2 lg:grid-cols-4`):
1. **Solicitações Pendentes:** Contagem de pedidos aguardando ação, com realce de alerta quando > 0.
2. **Entregas Pendentes:** Total de unidades em trânsito com nota de itens entregues.
3. **Estoque Crítico:** Quantidade de itens que demandam reposição urgente.
4. **Economia Gerada:** Total economizado em reais nas contratações homologadas.

*(Nota: "Órgãos Parceiros" é exibido no próprio seletor de conselhos e "Próximas Reuniões" é centralizado no card de agenda).*

### 3.3. Grid Balanceado em 2 Colunas (50 / 50)
Substituir o grid triplo desproporcional por duas colunas balanceadas:
- **Coluna 1 (Operação e Demandas):**
  - *Solicitações Operacionais Recentes:* Tabela compacta com badges semânticos de status.
  - *Reposição de Estoque:* Alertas objetivos dos itens mais críticos com link direto.
  - *Entregas & Atendimento:* Indicador sintético com barra de conclusão integrada.
- **Coluna 2 (Agenda, Prazos & Governança):**
  - *Próximas Reuniões:* Altura fixa com card de calendário elegante e empty state proporcional.
  - *Alertas & Notificações:* Lista calibrada (limite de 4 alertas + link "Ver todos"), com altura controlada e scroll suave.
  - *Situação dos Processos & Prazos:* Barras de progresso e prazos de atas/contratos.

### 3.4. Rodapé Limpo
- Eliminação do componente `ShortcutGrid` ("Ações Rápidas") no rodapé, finalizando o dashboard de forma limpa.

---

## 4. Especificação Detalhada da Página "Meu Painel" (`/meu-conselho`)

### 4.1. Topo & Barra de Atalhos Rápidos
- **Cabeçalho:** Identificação da empresa ativa (ex: CREA), seletor de conselho e botão de ação primária `+ Fazer Solicitação`.
- **Barra de Atalhos (`QuickActionBar`):**
  - Substitui os 6 cards verticais gigantes por uma barra compacta horizontal ou 4 botões de atalho direto em linha:
    - `Nova Solicitação`
    - `Novo Processo / Docs`
    - `Agendar Reunião` (abre Modal/Dialog)
    - `Ver Catálogo de Estoque`
- **Card de Eficiência Orçamentária:**
  - Se o valor acumulado for `R$ 0,00` ou não houver economia, exibe uma faixa discreta e compacta com botão para abrir o diálogo de histórico.

### 4.2. Régua de Indicadores Operacionais da Empresa (4 KPIs)
Grid de 4 colunas (`grid-cols-2 lg:grid-cols-4`):
1. **Solicitações em Andamento** (com indicação de pendências).
2. **Materiais Recebidos** (unidades confirmadas).
3. **Entregas Pendentes** (unidades em trânsito).
4. **Pedidos de Material** (pedidos aguardando liberação/expedição).

### 4.3. Grade Principal em 2 Colunas Balanceadas
- **Coluna 1 (Físico & Materiais):**
  - *Estoque Disponível na Empresa:* Tabela compacta com campo de busca inline.
  - *Pedidos de Materiais:* Lista de retiradas com *empty state* proporcional e amigável (sem caixa cinza gigante desmedida).
- **Coluna 2 (Demandas & Agenda):**
  - *Solicitações Recentes do Conselho.*
  - *Processos e Documentação Vinculada.*
  - *Reuniões Agendadas.*

### 4.4. Modal de Agendamento de Reunião
- O componente `NewMeetingForm` (que antes renderizava um card solitário pela metade no rodapé) é movido para dentro de um `Dialog` / `Sheet` elegante:
  - Disparado pelo botão "Agendar Reunião" nos atalhos ou no card de Reuniões.
  - O rodapé da página permanece 100% alinhado e livre de caixas vazias.

---

## 5. Componentes e Alterações Estruturais de Código

| Arquivo | Mudança Principal |
|---------|-------------------|
| `src/app/(app)/dashboard/page.tsx` | Ajustar grid de KPIs para 4 cards, reestruturar grid para 2 colunas balanceadas, remover `ShortcutGrid`. |
| `src/app/(app)/dashboard/briefing-card.tsx` | Redesenhar em estilo card compacto executivo com chips acionáveis. |
| `src/app/(app)/dashboard/panels.tsx` | Harmonizar alturas e espaçamentos dos painéis de Reuniões, Alertas e Entregas. |
| `src/app/(app)/meu-conselho/page.tsx` | Ajustar grid de KPIs para 4 cards, unificar seções em 2 colunas, converter formulário de reunião em Dialog modal. |
| `src/app/(app)/meu-conselho/action-hub.tsx` | Refatorar para visual de barra compacta de atalhos em vez de 6 cartões gigantes. |
| `src/shared/ui/kpi-card.tsx` | Ajustar padding, proporção de ícones e tipografia de labels para evitar quebras feias. |

---

## 6. Verificação e Critérios de Aceite

1. **Testes Unitários:** Executar `pnpm test` e garantir que todos os testes passem sem regressão.
2. **Build do Next.js:** Executar `pnpm build` ou `pnpm lint` para garantir tipagem TypeScript 100% íntegra.
3. **Inspeção Visual:**
   - Conferir que não há mais "buracos" de espaço em branco vazios.
   - Conferir que os cards de KPI têm leitura harmoniosa em desktop e mobile.
   - Conferir que o formulário de agendamento de reunião abre fluidamente em modal sem quebrar o rodapé.
