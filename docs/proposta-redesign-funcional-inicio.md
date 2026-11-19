# Proposta funcional — página inicial Warley Gestão Operacional

**Status: para aprovação.** Não altera código, identidade visual, permissões, regras, métricas nem funcionalidades. Base: página e componentes atuais, auditoria anterior e capturas locais de estrutura/dashboard referidas nos artefatos da auditoria. Não foram fornecidas novas capturas nesta solicitação; as capturas anteriores são locais e não representam sessão autenticada por perfil. A auditoria visual anterior foi automatizada, sem revisão humana. Proposta precisa de protótipo e teste antes de implementação.

## 1. Diagnóstico da página atual

A página já reúne filtros por órgão e foco, briefing operacional, filas de formalização e pedido de material para administração central, área de ação/estoque/pedidos do órgão, quatro cartões de indicador e painéis de solicitações, alertas, reposição, agenda, prazos e distribuição de processos. Boa parte do conteúdo e das ações existe; desafio é ordem, repetição, vocabulário e densidade, não falta de funcionalidade.

### Ordem e redundância observadas

Ordem atual no código: filtro/foco → filas centrais condicionais → briefing de quatro cartões → espaço de trabalho do órgão (ações, estoque, pedidos) ou aviso para escolher órgão → quatro indicadores → painéis conforme foco. Em tela “Todos”, solicitações e alertas ficam ao lado; reposição, agenda e distribuição de processos abaixo.

- **Solicitações repetidas:** briefing informa solicitações pendentes/em andamento; indicador “Solicitações Pendentes” mostra contagem; painel lista solicitações recentes. São visões de conceitos relacionados, mas o painel pode incluir estados diferentes do indicador. Não somar nem remover antes de definir escopo visual de cada um.
- **Estoque repetido:** briefing fala em estoque crítico/zerado; indicador “Estoque Crítico” conta itens cujo nível não é normal; painel de reposição lista itens. Mensagem/contagem podem repetir a mesma condição. Confirmar se “crítico” e “zerado” correspondem às mesmas categorias de `level` antes de qualquer mudança.
- **Contratos:** briefing mostra quantidade de contratos vencendo em até 30 dias (`facts.contracts.expiring30`). Não há cartão independente de contratos visível no trecho principal; alertas podem apontar para contrato/ata. Preservar a informação e o detalhe; proposta coloca aviso acionável na atenção operacional sem inventar lista ou regra.
- **Processos:** distribuição por situação aparece mais abaixo; não é ação nem fila de pendência. Manter como análise secundária, não traduzir distribuição em “processos atrasados” sem dado que prove atraso.
- **Entregas:** indicador soma unidades pendentes/entregues com base em itens de solicitações em estados específicos. É quantidade de unidades, não quantidade de pedidos. Rótulo “Entregas Pendentes” com unidade deve continuar explícito.
- **Briefing:** cartão combina estoque, demandas/entregas, contratos e reuniões/alertas. Os mesmos assuntos aparecem em KPIs e painéis. “Operação estável” ou “Em dia” deve ser conferido contra cada condição: estados distintos podem coexistir, então não usar resumo tranquilizador se houver pendência.
- **Filtro de órgão:** o texto atual “Todos os órgãos cadastrados” pode sugerir população maior que a consulta autorizada; auditoria anterior encontrou divergência entre rótulo e escopo permitido do resultado. A seleção “Todos” representa órgãos que usuário pode consultar, não necessariamente todos os cadastrados. Corrigir linguagem apenas após confirmar a fonte/opções autorizadas.
- **Filtros de foco:** “Visão Geral”, “Atenção & Reposição”, “Documentos”, “Prazos” apresentam uma decisão de navegação antes das tarefas. Manter filtros e URLs, mas não deixar que escondam acesso direto às três tarefas prioritárias.
- **Espaço e cartões:** há composição em grids e `justify-between` que pode aumentar espaços em áreas com conteúdo curto. Capturas anteriores não validaram conteúdo autenticado; redução real de espaço precisa ser checada com dados e telas pequenas.

### Significado confirmado vs. não confirmado

Confirmado pelo código: `reqPending` conta status `enviada`, `em_analise`, `aguardando_correcao`; `reqInProgress` conta `aprovada`, `em_atendimento`, `parcialmente_atendida`; unidades entregues e pendentes são calculadas item a item; reposição usa `level !== "normal"`; briefing recebe fatos de estoque, solicitações, entregas, reuniões e alertas. Contratos que vencem em até 30 dias vêm de `facts.contracts.expiring30`.

Não confirmado: semântica exata de cada nível de estoque, se todos os dados do briefing compartilham escopo de órgão idêntico, significado operacional de cada prazo, composição de “processos” por situação, relação entre cartões “estável” e pendências individuais, e se reunião agendada passada é apresentada como futura. Não mudar fórmula, filtros, estado ou regra sem rastrear serviço e validação com responsável.

## 2. Hierarquia proposta

1. **Escolher/confirmar contexto:** nome do órgão ativo ou “Visão consolidada — órgãos que você pode acessar”, com filtro visível e mantido na URL.
2. **O que fazer:** três acessos simples no topo, se permitidos no órgão selecionado: **Acompanhar processos**, **Solicitações de compra**, **Estoque e materiais**. Ações secundárias existentes (criar solicitação/processo, pedido de retirada, reunião) entram em cada área sem virar novos cartões concorrentes.
3. **O que precisa de atenção:** filas e itens existentes, filtrados pelo órgão/contexto e permissões: solicitações que aguardam ação, processos com prazo quando fonte confiável existir, contratos vencendo até 30 dias, formalizações e pedidos de material centrais, alertas, estoque que exige reposição, agenda/prazos. Cada item abre seu registro. Não exibir item como pendente sem status/fonte que sustente isso.
4. **Indicadores e análise:** distribuição de situação de processos, entregas/unidades, economia, estoque e outros indicadores existentes em seção “Indicadores e relatórios”, recolhível ou abaixo da área operacional. Filtros de foco continuam disponíveis e preservam query.

## 3. Wireframe detalhado

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Visão geral                                                        │
│ Órgão: [Órgão selecionado ▼]   ou [Visão consolidada ▼]            │
│ Dados limitados aos órgãos que você pode acessar.                   │
├─────────────────────────────────────────────────────────────────────┤
│ O que você precisa fazer                                            │
│ [Acompanhar processos] [Solicitações de compra] [Estoque e materiais]│
│                                                                     │
│ Dentro de Estoque: [Consultar saldo] [Registrar movimentação]       │
│                   [Pedir retirada de material disponível]           │
│ (ações/subações somente se autorizadas; sem misturar com compra)    │
├─────────────────────────────────────────────────────────────────────┤
│ Precisa da sua atenção                         [Ver todos os alertas]│
│ Solicitações   • estado + órgão + data       [Abrir solicitação]    │
│ Processos      • prazo/status disponível     [Abrir processo]       │
│ Contratos      • vence em até 30 dias        [Ver contrato]         │
│ Estoque        • item/nível real              [Ver estoque]          │
│ Reuniões/prazos/alertas e filas centrais conforme permissão         │
│ Sem pendências: “Não há itens que precisem de atenção neste órgão.” │
│ Falha: “Não foi possível carregar. Tente novamente.”               │
├─────────────────────────────────────────────────────────────────────┤
│ Briefing operacional (resumo curto, não repetir cartões abaixo)     │
│ Alertas prioritários factuais e link para dado de origem            │
│ [Ver detalhes]                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Indicadores e relatórios [expandir/recolher]                        │
│ Solicitações | unidades entregues/pendentes | estoque | economia    │
│ Situação dos processos | agenda | distribuição | relatórios atuais  │
└─────────────────────────────────────────────────────────────────────┘
```

Desktop: primeira linha com três ações de largura equilibrada; atenção em lista compacta, não cartões espelhados do briefing. Mobile: ações empilhadas/roláveis sem ocultar texto, órgão e destino; atenção aparece antes de indicadores. Identidade visual, cores, tipografia e componentes de cartão atuais permanecem. Wireframe não decide visual final.

## 4. Fluxos de acesso rápido

### Processos

Início → confirmar órgão ativo → **Acompanhar processos** → lista existente já filtrada pelo órgão e filtros autorizados → abrir processo. Ação “Novo processo” só aparece se `process.create` permitir. Preservar filtros e retornar à lista/contexto ao voltar; validar implementação atual antes de prometer preservação.

### Solicitações de compra

Início → **Solicitações de compra** → lista existente. “Nova solicitação de compra” fica em destaque se `request.create` permitir. Formulário e estados atuais preservados; evitar chamar pedido de material de solicitação de compra.

### Estoque e materiais

Início → **Estoque e materiais** → escolher tarefa por verbo: “Consultar saldo”, “Registrar movimentação”, “Ver materiais”. **Pedir retirada de material disponível** abre fila/painel existente (não fluxo de compra), se usuário puder agir. Ações respeitam o órgão ativo e permissão servidor-side; interface não substitui autorização.

### Visão consolidada

Selecionar “Visão consolidada” mantém KPIs e painéis nos órgãos autorizados, sem sugerir abrangência global. Ao iniciar ação vinculada a um órgão, exigir seleção explícita se contexto ambíguo; não selecionar órgão apenas pela primeira opção. Conservar `councilId` e `focus` na URL como hoje.

## 5. Componentes existentes a reutilizar e mudanças propostas

| Componente / fonte | Uso atual | Mudança proposta (não implementada) |
|---|---|---|
| `DashboardFilters` (`dashboard/filters.tsx`) | Filtros de foco e órgão; URL GET preserva `councilId` e `focus`. | Manter URLs e focos; rótulo de escopo preciso; órgão selecionado sempre evidente. Simplificar apresentação dos focos para “Visão geral”, “Pendências”, “Prazos”, mantendo conteúdo e destinos. Confirmar autorização/escopo da lista de opções. |
| `CouncilWorkspace` | Ações, saldo, pedidos de retirada do órgão; reutiliza `ActionHub`, `StockSection`, `MaterialOrdersSection`. | Dividir visualmente o cabeçalho: tarefas primeiro, informação de estoque/pedidos em atenção abaixo; tornar órgão associado explícito sem repetir cabeçalho; manter recursos e props de permissão. |
| `ActionHub` / `buildCouncilActions` | Ações do órgão condicionadas a capacidades atuais. | Reutilizar como origem das ações, elevar processos/solicitações/estoque; rótulos orientados à tarefa e ordem conforme prioridade validada; não duplicar ação ou relaxar condição. |
| `StockSection` | Mostra estoque do órgão. | Reposicionar em “Precisa da sua atenção” ou conteúdo de estoque; preservar cálculos. Diferenciar consulta de ação de movimentar. |
| `MaterialOrdersSection` | Fila/pedido de retirada de material e acesso relacionado. | Manter como “Retirada de material disponível”, afastada visual e textualmente da compra; rótulo de busca e estados acessíveis. |
| `BriefingCard` / `BriefingFallback` | Quatro cartões com resumo de estoque, demandas, contratos e reuniões/alertas. | Encurtar/colapsar como resumo factual secundário; remover duplicação visual, não dados. Eliminar “estável/em dia” só se não representar exatamente todos os fatos; manter geração e fallback atuais. Linkar cada item à fonte autorizada se destino e dado existirem. |
| `FormalizationQueue` | Fila central de formalizações pendentes; visível para admin central. | Preservar, mover a “Precisa da sua atenção” e manter escopo central/permissão. |
| `OrderQueue` | Fila central de pedidos de material; visível para admin central. | Preservar, identificar como retirada/pedido de material, não compra. |
| `KpiCard` | Solicitações pendentes, entregas, estoque crítico, economia. | Reaproveitar abaixo da área de trabalho; evitar contagem duplicada com briefing/atenção; conservar valor, unidade, destino e fórmula até conferência semântica. |
| `RecentRequestsPanel` | Lista de seis solicitações recentes, ordenada por criação. | Reposicionar em atenção ou sob link “Ver solicitações”; diferenciar “recentes” de “aguardando ação”; não rotular todas como pendentes. |
| `AlertsPanel` | Até quatro alertas e não lidos. | Integrar visualmente com atenção sem perder marcar como lido nem misturar lido com resolvido. Preservar links/destinos autorizados. |
| `ReplenishmentPanel` | Itens de nível diferente de normal. | Mostrar na atenção se pertinente ao órgão/contexto; manter como lista de estoque crítico real, não segunda métrica duplicada. |
| `AgendaAndDeadlinesPanel` / `DeadlinesPanel` | Reuniões agendadas e prazos do painel. | Reunir na seção atenção; distinguir agenda de prazo vencido/próximo. Validar regra temporal e escopo antes de reordenar prioridade. |
| `StatusDistribution` | Distribuição de status de processos. | Manter como análise secundária; sem reinterpretar status como atraso. |
| `DeliveriesSummaryPanel` e relatórios | Resumo analítico disponível no código/painéis. | Preservar nos detalhes analíticos; mostrar unidade e população com clareza. Confirmar se é renderizado nessa rota/variante antes de alterar composição. |

## 6. Valores, estados e mensagens: salvaguardas

- Não alterar mapeamento de status de solicitação nem fórmula de unidades recebidas/pendentes.
- Não dizer “X pedidos pendentes” quando valor representa unidades.
- Não substituir contagem `level !== "normal"` por uma interpretação nova de “crítico” sem conferir domínio de estoque.
- “Contrato vence em até 30 dias” deve manter janela atual e levar aos contratos correspondentes; não dizer vencido, renovação obrigatória ou risco jurídico sem dados/regra.
- Distribuição de processo é status, não prazo; “pendente” só quando estado e ação requerida forem verificáveis.
- Briefing e painéis precisam compartilhar órgão/filtro, período e população, ou declarar diferença. Erro de consulta não vira zero nem “estável”.
- “Todos” deve significar consolidado dentro do escopo autorizado, nunca todos os cadastros indiscriminadamente.
- Guardas e permissões permanecem no servidor e no `buildCouncilActions` atual.

## 7. Plano incremental

1. **Conferência de dados:** rastrear `dashboard-data`, `buildBriefingFacts`, `contracts.expiring30`, deadlines, estados e queries por órgão; documentar definições e sobreposição exata dos cartões. Confirmar capturas desktop/mobile autenticadas em ambiente autorizado.
2. **Protótipo:** reorganizar apenas blocos existentes em wireframe clicável; testar nomes, órgão ativo e distinção compra/retirada. Não mudar cálculos nem ações.
3. **Primeira entrega de baixo risco:** reordenação visual, rótulos e links de acesso rápido usando `ActionHub`/componentes existentes; manter consultas, rotas, filtros, estado e permissões.
4. **Atenção operacional:** agrupar filas existentes; deduplicar apresentação sem remover conteúdo. Só incluir contratos/prazos se escopo e estado forem comprovados. Testar por papel e seleção consolidada.
5. **Indicadores secundários:** recolher/mover métricas, mantendo todos os valores, destinos, filtros e formatos. Comparar números antes/depois para garantir igualdade por órgão/foco.
6. **Teste e liberação gradual:** validar responsividade, teclado, estados erro/vazio/carregando e realizar piloto; manter retorno à organização anterior durante piloto se possível.

## 8. Critérios de validação

Teste moderado com usuários pouco experientes, sem treinamento, em dados fictícios autorizados. Tarefas: acompanhar processo existente; criar/localizar solicitação de compra; localizar retirada de material sem confundi-la com compra; consultar saldo e encontrar movimentação; selecionar órgão e explicar se está em modo individual ou consolidado; abrir contrato que vence em até 30 dias quando fixture apropriada existir.

Registrar conclusão sem ajuda, tempo, cliques, hesitações, erros, escolha de órgão, retorno à tarefa, entendimento de unidades e interpretação das mensagens. Comparar interface atual e protótipo com mesmas tarefas/viewport.

Aceite inicial proposto: pelo menos 4 de 5 participantes concluem cada tarefa principal sem ajuda; nenhum confunde compra com retirada; todos identificam o órgão/escopo ativo antes de ação; falha de carga não é entendida como lista vazia; valores e unidades no protótipo coincidem com baseline do mesmo filtro; todo recurso atual permanece acessível ao papel autorizado; tabulação, foco e toque alcançam cada ação. Cinco participantes formam rodada qualitativa, não prova estatística. Testar desktop e celular, além de erro, vazio e carregamento; revisão humana de acessibilidade segue necessária.

## Decisões para aprovação

1. Aprovar ordem: ações → atenção → indicadores.
2. Aprovar os três acessos em destaque e nomes de compra/retirada.
3. Definir se briefing vira resumo recolhível ou permanece compacto sempre visível.
4. Confirmar definição e escopo de prazos/processos/estoque/contratos antes de exibir na atenção.
5. Aprovar rótulo correto para visão consolidada autorizada.
