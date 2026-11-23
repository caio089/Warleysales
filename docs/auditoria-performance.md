# Auditoria de desempenho do Warley

Versão auditada: `74319c8`, incluindo `da4d9b1` e `83230db`. Escopo de leitura e medições locais. Nenhuma alteração no produto ou no banco.

## Diagnóstico executivo

As evidências mais fortes apontam para volume de dados e consultas repetidas antes de a tela receber os dados principais. O pior padrão encontrado é a leitura de todo o histórico de estoque uma vez por órgão nas telas de movimentações e entregas. O Dashboard também consulta níveis de estoque duas vezes. O commit `da4d9b1` já substitui as consultas individuais de anexos e eventos de ata por lotes. O timeout de cinco minutos vem da descrição do commit e não foi reproduzido nesta auditoria.

O código comprova os caminhos redundantes. Sem tempos autenticados, cardinalidade de produção ou dados do provedor, a contribuição de cada caminho para a lentidão percebida segue aberta.

## Arquitetura e caminho dos dados

- Next.js 16.4.6 App Router e React 19.3.0, com Server Components, Server Actions, Route Handlers e componentes interativos com estado React e parâmetros de URL. Tailwind e Base UI compõem a interface. Lucide fornece ícones e GSAP aparece na tela de autenticação. Geist é configurada via Next.
- Uma navegação passa pela sessão e pelo carregador da tela, que chama serviços de domínio e adaptadores. O Supabase fornece Auth, PostgreSQL via PostgREST e Storage privado. A sessão verifica os claims, consulta perfil ativo e lê associações de órgão. Os serviços limitam o escopo do ator. Os adaptadores usam `service_role`, portanto os filtros e guardas do serviço precisam ser preservados independentemente das políticas RLS das tabelas.
- Os dados voltam como HTML e payload React. Tabelas recebem linhas serializadas e filtram no navegador. Mutações chamam serviços e RPCs e invalidam rotas com `revalidatePath`. Várias rotas invalidadas na mesma ação são fato estático. Quantas novas requisições isso gera depende da navegação e precisa ser medido.
- `next.config.ts` habilita Cache Components e prefetch parcial. `loadScreen` usa `connection()` e dados de sessão. O cache de `getServices` reutiliza instâncias de serviço no processo. Não foi identificado cache de resultados nas chamadas de IA analisadas.
- O repositório documenta deploy na Vercel e configura três crons em `vercel.json`. Região real, plano, concorrência, cold starts, compressão, cabeçalhos HTTP, memória e tempos de rede não foram verificados. Resend atende e-mail, com timeout de 10 s no adaptador. Upload de anexos usa URL assinada diretamente no Storage. Exportação PDF usa pdf-lib no servidor, extração de PDF usa unpdf e os parsers xlsx e mammoth são externos ao bundle de servidor do Next. Essas dependências merecem medição nas respectivas rotas sob demanda.

## Gargalos priorizados

| ID | Gravidade técnica | Evidência e impacto | Correção, complexidade e risco |
|---|---|---|---|
| P1 | Alta | `inventory/service.ts:425` chama `listMovements()` sem escopo SQL e filtra no servidor depois. `entregas/page.tsx:30` e `estoque/movimentacoes/page.tsx:25` repetem isso por órgão. Para C órgãos e P páginas do histórico global, são C × P consultas, além do processamento repetido. A duração em produção é desconhecida. | Passar o órgão ao filtro já aceito pelo repositório. Complexidade baixa, risco baixo a médio pela necessidade de equivalência de escopo e ordem. Mesmo comportamento. |
| P2 | Alta | `dashboard/page.tsx:82` dispara até 11 operações de serviço e espera todas. `reports/service.ts:101` consulta níveis de estoque e o Dashboard também os consulta diretamente. Há duas leituras lógicas do saldo por renderização, além de duas listagens de pedidos com filtros diferentes para administrador. A duplicação de processos já foi corrigida. | Compartilhar níveis no mesmo request após confirmar equivalência de escopo e erro. Comparar os dois conjuntos de pedidos antes de unificar. Complexidade média, risco médio. Mesmo comportamento se os conjuntos forem equivalentes. |
| P3 | Alta | `processos/page.tsx:26` carrega processos, anexos em lote e solicitações para calcular prioridade. O SELECT de solicitações em `adapters/purchases.ts:36` inclui itens, eventos e chaves de recebimento. O calendário espera seis serviços em `calendario/page.tsx:80`. Estoque também carrega essas coleções. Páginas de 20 ou 50 limitam o DOM, mas o navegador recebe o conjunto usado no filtro. | Projeções por consumidor, consultas por vínculo/escopo e, em seguida, paginação no servidor com filtros, totais e ordenação global. Complexidade média a alta, risco médio a alto para filtros e contagens. Manter Todos, exportações e KPI globais. |
| P4 | Alta | `processos/[id]/page.tsx:15` aguarda processo, documentos, formalização e fornecedores em sequência, depois três listas e lookups. `ProcessService.get` já consulta anexos para calcular progresso. A consulta para listar os documentos precisa ser comparada quanto a autorização e metadados antes de reaproveitar. | Depois da guarda do processo, paralelizar leituras independentes e usar consultas direcionadas. Complexidade média, risco médio. Preservar erros, abas, progresso e ordenação das listas de vínculo. |
| P5 | Média, impacto global a medir | `groq.ts:16` e `:43` chamam o provedor automaticamente quando o recurso é renderizado e configurado. Há fallback sob `Suspense`, mas o cartão depende da resposta externa e o briefing do Dashboard carece de prazo explícito no código. | Medir latência, falhas, tamanho e repetição antes de decidir timeout, deduplicação e cache. Complexidade média, risco médio de frescor e experiência. Mudanças de frequência ou fallback exigem aprovação. |

## Frontend, API e banco

- `data-table-logic.ts` normaliza, filtra e ordena antes de cortar a página. A tabela de processos memoriza o resultado, mas cada mudança de busca refaz o trabalho no conjunto carregado. “Todos” acrescenta até 100 linhas por clique e mantém as anteriores no DOM. Não há evidência de loop de efeitos ou travamento do menu. Avaliar long tasks, commits do React, prefetch e montagem do modal do calendário com perfil real antes de mexer em animações ou virtualizar.
- O calendário usa o histórico do PCA para marcar conclusão e vencimento e também inclui reuniões, atas e contratos. Muitos desses dados entram antes do recorte mensal. Mudar a janela da consulta exige preservar a visão anual, registros sem dia exato e os totais do relatório.
- Relatórios agregam processos, estoque, contratos e atas no serviço. O PDF deve ser medido separadamente da tela. APIs de importação e PDF são acionadas sob demanda. Importação de solicitação e extração de contrato podem aguardar IA com limites explícitos de 25 s e 20 s. Medir separadamente leitura, parser, IA e serialização em arquivos representativos.
- `selectAll` em `src/server/supabase/db.ts:39` usa páginas sequenciais de 1.000 linhas para recuperar todo o conjunto. Isso é paginação de transporte. O limite não reflete a página visível. O envio das relações completas e de metadados deve ser avaliado por consumidor. Quando a ordem vem só de `created_at`, verificar empates e consistência antes de migrar a cursor.
- As migrations declaram índices para processos e solicitações por órgão/data, anexos por processo, reuniões por órgão/data e movimentações por órgão/material/data. Para listar movimentações por órgão com ordenação global por data, confirmar o plano com dados representativos antes de recomendar um índice novo. Políticas RLS de leitura usam escopo por órgão. Nenhum scan, índice ausente em produção, saturação de pool ou custo de RLS foi confirmado. Usar planos de leitura em homologação e comparar identidades autenticadas e serviço conforme a consulta real.
- `server/session.ts` e `server/supabase/session.ts` fazem verificação de identidade, perfil e associações. Verificar no trace se chamadas em layout e página se repetem no mesmo render. Uma eventual deduplicação deve ficar estritamente no request e preservar revogação de acesso.

## IA

O Dashboard renderiza `BriefingCard` sob `Suspense`, e páginas de módulos usam `ModuleInsight` da mesma forma. A geração começa depois que há fatos autorizados. O conteúdo convencional é irmão do cartão e pode ser transmitido antes do resumo. A aplicação espera o carregamento de dados anterior ao cartão, e o stream completo pode continuar aberto pela IA. Isso justifica medir separadamente a primeira exibição útil, a chegada do cartão e o término da resposta.

Os módulos limitam os fatos a dez e o briefing envia indicadores agregados e até cinco títulos de alerta. Não há evidência de contexto excessivo para esses resumos. Reabrir ou renderizar novamente uma rota pode reenviar os mesmos fatos quando não houver reaproveitamento da navegação. Filtros locais com History API não chamam diretamente o modelo. Filtros que causam navegação ou invalidações devem ser medidos. O resumo de módulo tem sinal de aborto de 8 s. A geração do Dashboard não fixa `abortSignal` ou `maxRetries`. O comportamento efetivo de retry, fila e limites do provedor não foi medido.

## Medições e limites

| Medição | Resultado | Interpretação |
|---|---|---|
| Função real de busca e ordenação, dados sintéticos, Node 22.14.0, 5 aquecimentos e 30 amostras | 1.000 linhas: p50 1,13 ms, p95 1,88 ms. 10.000: p50 47,00 ms, p95 79,46 ms | Busca textual com correspondência em todo o conjunto, ordenação de títulos embaralhados, página de 20. Exclui browser, DOM e rede. Demonstra custo crescente e não quantifica INP real. |
| Teste adicional de busca e ordenação, mesmo protocolo, somente coluna de título | 50.000 linhas: p50 300,18 ms, p95 446,08 ms | Cenário sintético de escala. Não representa a cardinalidade nem a experiência de produção. |
| Artefato local existente em `.next/static` | 53 JS com 1.665.059 bytes brutos no total, 2 CSS com 123.632 bytes e 10 fontes com 129.484 bytes | Build preexistente com carimbo anterior ao commit auditado. Soma global de arquivos, sem compressão ou atribuição à rota. |
| Produção autenticada e banco | Sem amostra de TTFB, LCP, INP, navegação, volume por rota, tempo SQL, latência de IA ou perfil de memória | Sem sessão de teste e ambiente de medição identificado para esse fim. Nenhuma consulta ao banco ou geração externa foi disparada. |

Para obter uma linha de base, rodar build com ambiente de homologação e dados representativos. Medir primeiro acesso e navegação quente, com operador de um órgão e administrador. Em cada cenário coletar p50/p95, waterfall, bytes comprimidos de HTML/RSC/JS e chamadas ao Supabase por operação. Capturar LCP e INP no navegador, TTFB da rota e tempo até tabela e IA visíveis. Abrir Dashboard, Processos, Solicitações, Estoque, Calendário e Relatórios, pesquisar e ordenar tabelas, abrir modais, importar arquivo e gerar resumo/PDF. Separar dev, build local e produção. Na produção, começar por telemetria passiva, sem teste de carga. Confirmar região da Vercel e Supabase, cold/warm, CPU, memória, timeout e erros com métricas do ambiente.

## Plano em ordem de execução

1. **Linha de base.** Capturar tempos e contagem/bytes por operação, sem registrar dados privados, incluindo a janela da IA. Isso permite distinguir processamento, tempo de banco, rede e provedor.
2. **A — Ganhos rápidos.** Aplicar escopo de órgão às movimentações e remover leitura duplicada de estoque no Dashboard. Em seguida, encurtar o caminho do detalhe de processo após autorização de leitura. Verificar identidade dos resultados e comparar tempos antes/depois. Cada mudança pode voltar por revert independente.
3. **B — Projeções por rota.** Criar leituras com campos estritamente necessários para calendário, estoque e prioridade, preservando origem no PCA e sem mudar os DTOs dos detalhes. Revisar RSC, prefetch e carregamento dos modais com base no perfil. Medir economia de bytes e tempo, com rollback para o adaptador atual.
4. **C — Paginação e agregados no servidor.** Começar pela listagem de maior volume medido. Validar busca sem acento, ordenação numérica em português, empate, filtros combinados, totais globais e Todos progressivo. Separar listagem e indicadores apenas se ambos conservarem a mesma visão dos dados. Testar estabilidade diante de inserções e manter retorno possível ao caminho atual.
5. **D — Decisões individuais.** Aprovar eventual índice/migração depois de EXPLAIN e volume real. Discutir duração ou frequência do cache de IA, isolamento dos escopos, frescor, atualização manual, timeout e política de retry. Aprovar mudanças de comportamento de Todos, separação de painéis, eventual atraso de dados e custos de observabilidade ou infraestrutura. Alterações de RLS, regiões ou rotinas operacionais exigem avaliação própria.

Ganhos verificáveis: P1 elimina a transferência do histórico de outros órgãos em cada consulta; P2 elimina uma leitura lógica redundante por Dashboard. Projeções reduzem colunas, relações e bytes. Qualquer ganho percentual de latência, LCP ou INP depende de medição comparável.

## Matriz de regressão

| Área | Comportamento a preservar | Otimização e risco | Validação |
|---|---|---|---|
| Sessão e permissões | Perfil ativo, papéis, órgão e escopo de administrador | Compartilhar dados no request, alto | Sessão anônima, inativa, revogada, múltiplos órgãos e isolamento entre usuários |
| Dashboard e navegação | Indicadores, filtros de órgão/foco, pedidos, alertas e resumo | Reutilização de estoque, médio | Comparar totais por papel e órgão, links, estados vazios e falhas |
| Estoque, entregas e transferências | Movimentos por órgão, saldos físico/reservado/bloqueado e recebimento idempotente | P1 e DTOs, alto | Ledger paginado, saldo antes/depois, recebimento parcial, repetição, transferência e escopo cruzado |
| Processos e documentos | Progresso, exceções, anexos, retenção, valor estimado e prioridade do PCA | P3/P4, alto | Prazos nas fronteiras, filtros combinados, anexos pendentes, upload privado, 20/50/Todos e navegação de volta |
| Solicitações e formalização | Histórico, importação, vínculo, homologação e valor do processo | Projeções, alto | Comparar histórico completo no detalhe, importação, criação sem valor, homologação e auditoria |
| Calendário e reuniões | Dia, mês, ano, órgão, eventos e links de origem | Recorte de dados, médio | Datas exatas e vagas, extensões, troca de mês, teclado, totais anuais |
| Relatórios e auditoria | Agregados, PDF, filtros, leitura de páginas antigas | Agregação e projeções, alto | Comparar valores e acesso entre tela e PDF, inclusive sem dados |
| Atas, contratos, fornecedores e conselhos | Vigência efetiva, vínculos, eventos e escopo | Leituras direcionadas, médio | Prorrogações, aditivos, vínculos autorizados, listagens e filtros |
| IA, alertas e crons | Resumos e fallback, notificações e idempotência dos jobs | Cache/timeout, alto | Provedor rápido/lento/indisponível, fatos alterados, escopo, deduplicação e fallback |

## Implementação posterior à auditoria

- **P1:** Movimentações e Entregas consultam o histórico com filtro de órgão no repositório. A consulta de reconciliação mantém o filtro adicional por material.
- **P2:** O Dashboard reutiliza os níveis de estoque do relatório da própria tela. As duas consultas de pedidos foram mantidas porque têm escopos diferentes.
- **P3, Processos:** A lista lê apenas as notas das solicitações vinculadas, os campos de anexos válidos para o progresso e os rótulos dos órgãos. O navegador reaproveita o conjunto filtrado e ordenado entre trocas de página. Busca, ordenação e totais continuam globais. A paginação no servidor e as outras telas da P3 seguem pendentes.
- **P4, detalhe de Processos:** Leituras independentes avançam em paralelo após autorização. Uma leitura de anexos serve ao progresso e aos arquivos visíveis. A solicitação é buscada pelo vínculo, e atas e contratos são filtrados no repositório para incluir os vínculos e as opções disponíveis ao órgão.
- **P5, medição:** O evento estruturado `insights.generation` registra tipo de resumo, duração e sucesso ou falha da chamada ao provedor, sem registrar o prompt ou os dados de origem. O tempo mede a chamada ao provedor, incluindo eventuais retries, e exclui a interpretação do texto após a resposta. O tamanho da amostra e a latência autenticada precisam ser coletados antes de decidir mudanças de execução.

A próxima medição deve comparar os tempos até a listagem e o detalhe ficarem visíveis, além de chamadas, linhas e bytes retornados em homologação. Sem essa linha de base ainda não há ganho de latência quantificado.
