# Proposta de experiência simplificada

## Objetivo e limites

Proposta para aprovação antes de qualquer alteração no sistema. Preserva recursos, permissões, regras de negócio e endereços atuais; muda somente organização e apresentação após validação. Não presume quais tarefas são mais frequentes. “Mais usadas” abaixo significa atalhos configuráveis ou confirmados em pesquisa, não uma conclusão sobre uso atual.

A auditoria anterior mapeou páginas e código, e testou navegação local sem sessão autenticada. Logo, achados marcados **observado no código** não equivalem a dificuldade comprovada com usuários. Achados **hipótese** pedem teste com pessoas. Nenhuma alteração de produto foi feita neste trabalho.

## Diagnóstico

- **Observado no código:** menu tem 16 destinos primários em grupos de acompanhamento, estoque e sistema; funcionalidades relacionadas estão espalhadas entre páginas e painéis. Conselhos/órgãos e subpáginas administrativas também existem. Rotas legadas e detalhes fazem parte do fluxo e não devem ser removidos.
- **Observado no código:** solicitações de compra têm formulário com linhas sem remoção e erros técnicos como `items.0.*`; pedido de retirada de material, embora também chamado pedido/solicitação, é outro recurso e fica no painel/fila.
- **Observado no código:** processo concentra documentos, contratação e governança em abas. Leituras com erro podem aparecer como listas vazias em algumas páginas, confundindo “não há dados” com “não foi possível carregar”.
- **Observado no código:** estoque separa saldos, materiais e movimentações; fornecedor tem atualização no serviço sem ação correspondente evidente na página. Alertas mostram texto e marcar como lido, sem ligação direta ao item relacionado.
- **Observado na inspeção visual automatizada anterior:** login e estrutura foram vistos em larguras mobile e desktop; sem recorte horizontal aparente em alguns formulários. Não houve revisão humana, contraste medido, sessão autenticada nem dados reais. Isso não valida facilidade de uso.
- **Hipóteses a testar:** menu atual exige que iniciante conheça nomes de módulos; a distinção entre “solicitação de compra”, “pedido de material” e “transferência” pode ser difícil; filas e atalhos do painel podem variar conforme papel e órgão; termos como “formalização”, “retenção” e “auditoria” podem exigir explicação.
- **Contagem de etapas/cliques:** não foi medida para fluxos autenticados. Código/rotas disponíveis não permitem afirmar quantos cliques reais ou decisões um usuário faz sem percorrer a interface por perfil.

## Menu proposto

Manter os 16 destinos e URLs; trocar agrupamento e rótulos, sem esconder recursos. Um destino que não cabe nos grupos abaixo deve continuar acessível em “Mais opções”, sem remover permissões.

1. **Início** — painel e alertas.
2. **Compras e contratos** — Solicitações de compra, Processos, Atas de registro de preços, Contratos, Fornecedores.
3. **Estoque e entregas** — Estoque, Materiais, Movimentações, Entregas, Transferências. Manter subpáginas sob o destino estoque/logística existente, sem misturar pedido de retirada com compra.
4. **Agenda** — Calendário e Reuniões.
5. **Relatórios** — Relatórios e análise.
6. **Órgãos e empresas** — Conselhos/organizações e cadastros relacionados, conforme acesso atual.
7. **Administração** — Usuários, Auditoria e Retenção, visíveis somente conforme regras existentes.
8. **Mais opções** — Alertas, se não estiverem no Início como lista; itens pouco frequentes e recursos que não caibam nos grupos, preservados e pesquisáveis. Evitar duplicar destino sem razão.

Agrupamento é proposta, não decisão validada. Antes de fechar nomes e posições, conferir inventário integral de `NAV_ITEMS`, permissões e telas em sessão real. Não fundir “Atas de registro de preços” com atas de reunião. Não criar nível de menu profundo; grupos expansíveis devem funcionar por teclado e toque.

## Início proposto

- Saudação e seleção clara do órgão de trabalho quando a pessoa tiver mais de um vínculo; mostrar o órgão ativo junto de toda ação que o afete.
- Área “Continuar de onde parei” somente se houver estado confiável e autorizado; caso contrário, omitir.
- Atalhos de tarefas: “Criar solicitação de compra”, “Abrir processo”, “Registrar movimentação”, “Ver agenda”. Ordem final decidida com entrevistas/telemetria autorizada; não tratar esta lista como ranking de uso.
- “Precisa da sua atenção”: filas e prazos que já existem e que aquele perfil pode ver. Cada cartão informa quantidade, órgão, significado e destino. Falha de leitura deve dizer “Não foi possível carregar”, nunca “Tudo certo” ou lista vazia.
- Acesso secundário visível a relatórios, fornecedores, entregas, transferência, administração e demais recursos autorizados. Nenhum recurso eliminado por frequência presumida.

## Fluxos atuais versus proposta

| Tarefa | Atual observado / etapas verificáveis | Dúvida possível | Proposta | Comparação |
|---|---|---|---|---|
| Encontrar módulo | Menu possui 16 destinos primários em três grupos; cliques exatos para chegar à tarefa não foram medidos. | Nome do módulo pode não corresponder ao objetivo da pessoa. | Abrir grupo por tarefa, usar rótulos claros e busca por tarefa; manter links diretos e endereço atual. | Mesmas páginas e recursos; objetivo passa a orientar o primeiro passo. Ganho em cliques ainda precisa ser medido. |
| Criar solicitação de compra | Abre `/solicitacoes/nova`, informa dados/itens e envia; formulário permite adicionar linhas, mas não remover; validação pode expor índice técnico. Quantidade exata de campos/cliques não medida. | Como corrigir linha, diferença entre compra e retirada, qual campo falhou. | Uma página curta com título “Pedir uma compra”, linhas removíveis, nome do campo no erro e resumo antes de enviar quando necessário. Explicar que compra não é retirada de estoque. | Evita erro técnico e correção por recomeço; regra e etapas de negócio permanecem. Confirmar se revisão final agrega clareza sem etapa inútil. |
| Corrigir solicitação devolvida | Detalhe tem ação “Reenviar corrigida”; edição de título/itens não aparece disponível na tela auditada. | Não fica claro o que pode mudar nem como corrigir o pedido. | Mostrar motivo da devolução no topo, campos que podem ser ajustados e botão “Salvar alterações e reenviar”; expor encerramento incompleto com justificativa apenas se compatível com permissão/regra existentes. | Menos busca por instrução; alteração dos dados permitidos requer decisão e teste de integridade antes de implementar. |
| Abrir processo e localizar documento | Entra na lista, abre processo e escolhe abas de documentos/contratação/governança. Cliques não medidos. | “Contratação” e “governança” podem ser termos abstratos; falha pode parecer lista vazia. | Abas nomeadas pelo resultado (“Documentos”, “Compras e contratos”, “Acompanhamento”), com resumo de próxima ação; mensagem separada para vazio, erro e carregamento. | Mesmo conteúdo e abas; linguagem e estado mais explícitos, sem tela intermediária nova. |
| Registrar material/estoque | Estoque, materiais e movimentações são destinos/subpáginas distintas; movimentação oferece busca de produto conforme mudança recente. | Qual tipo de movimento escolher e qual saldo representa disponibilidade. | Entrada principal “Movimentar estoque”; perguntar tipo em linguagem direta; exibir item, unidade e saldo antes de confirmar. Manter física, reservada, disponível e bloqueada com explicação contextual aprovada. | Mantém subfunções e fórmulas; agrupa ponto de entrada, não confunde significados. Não alterar regra de saldo sem decisão do negócio. |
| Atender pedido de material | Fila/painel no workspace; não existe rota independente equivalente à compra. Busca tinha placeholder sem rótulo acessível. | Pode parecer solicitação de compra. | Chamar “Retirada de material disponível”; acesso pela fila existente e busca com rótulo; detalhar item sem truncamento inacessível. | Mantém fluxo e distingue compra de retirada; não cria rota nova. |
| Acompanhar alerta | `/alertas`: ler texto e marcar lido; vínculo à página relacionada não aparece no código auditado. | “Lido” pode parecer “resolvido”. | Link “Abrir item relacionado” quando identificador e permissão permitirem; ação “Marcar como lido” separada, com mensagem de que isso não conclui a tarefa. | Um salto a menos para localizar item quando vínculo existe; não inventa resolução. |
| Planejar reunião/agenda | Calendário e reuniões são destinos diferentes; número de etapas não medido. | Onde criar compromisso versus consultar eventos; “próximas” pode incluir reunião passada agendada. | Agenda reúne acesso a calendário e reuniões, com botões explícitos “Ver calendário” e “Registrar reunião”; datas/status descritos de forma coerente após regra aprovada. | Navegação relacionada agrupada, páginas preservadas; corrigir significado temporal só após validar regra. |
| Encontrar relatório | Destino Relatórios; inclui relatórios e trilha de auditoria, cursor de paginação no adapter e limites comunicados no PDF de auditoria. | Escopo e limite podem ser pouco claros. | Categorias por pergunta (“Compras”, “Estoque”, “Atividades do sistema”) e texto de escopo/período antes de exportar; manter limite existente e informar. | Mantém exportações e paginação; menos decisão técnica sobre tipo de relatório. Validar categorias com usuários. |
| Administrar acessos/dados | Administração e subpáginas de usuários, auditoria, retenção; acesso depende de perfil. | “Retenção” é termo técnico e ações podem ser irreversíveis. | Rótulos “Usuários e acessos”, “Histórico de alterações”, “Prazo e descarte de dados”; confirmação informa efeito, escopo e possibilidade de desfazer. | Recursos permanecem; vocabulário e consequência mais claros. Política de retenção não muda. |

## Exemplos de tela

**Menu lateral**

- Início
- Compras e contratos ▾
  - Solicitações de compra
  - Processos
  - Atas de registro de preços
  - Contratos
  - Fornecedores
- Estoque e entregas ▾
  - Visão do estoque
  - Materiais
  - Movimentações
  - Entregas
  - Transferências
- Agenda ▾
  - Calendário
  - Reuniões
- Relatórios
- Órgãos e empresas
- Administração ▾ (somente acesso permitido)
- Mais opções ▾

**Tela de solicitação**

Título: **Pedir uma compra**

1. Sobre o pedido: órgão atual, título e motivo (se exigido hoje).
2. Itens: material, quantidade e unidade; “Adicionar outro item” e “Remover item” junto à linha; erro escrito ao lado do campo correspondente.
3. Ação principal destacada: **Enviar pedido para análise**. Ação secundária: **Salvar e sair** somente se rascunho suportado atualmente.
4. Confirmação: “Pedido enviado para análise” e link “Ver pedido”. Em falha, preservar preenchimento e dizer o próximo passo.

**Detalhe de processo**

Cabeçalho com nome, número, órgão e estado; botão primário definido por ação permitida; abas com nomes de tarefa; breadcrumb “Processos / [número]”; voltar à lista preserva busca/filtros quando tecnicamente possível. Exibir erros e vazios separados.

## Nomes recomendados

- “Solicitações” → **Solicitações de compra**.
- “Pedido de material” → **Retirada de material disponível**.
- “Atas” → **Atas de registro de preços**; reservar “Ata de reunião” a reuniões.
- “Estoque” (quando for saldo) → **Visão do estoque**; “Movimentação” → **Registrar entrada, saída ou ajuste**, usando tipos existentes.
- “Conselhos” → **Órgãos e empresas** quando essa for a população real da página.
- “Auditoria” → **Histórico de alterações** na navegação simples, com termo técnico explicado na página.
- “Retenção” → **Prazo e descarte de dados**, sem alterar regra ou antecipar exclusão.
- “Governança” → nome da tarefa específica que a aba contém, decidido após observar conteúdo e vocabulário do usuário.
- Mensagens: “Não foi possível carregar. Tente novamente” distinto de “Ainda não há registros”; “Marcar como lido” distinto de “Resolver”.

## Ranking: impacto provável e esforço relativo

Impacto é previsão a validar, não frequência observada. Esforço não é estimativa de prazo.

| Ordem | Melhoria | Impacto | Esforço | Base |
|---|---|---|---|---|
| 1 | Erros em linguagem clara, separar falha de lista vazia e apontar campo exato | Alto | Baixo/médio | Problemas observados no código; benefício ao iniciante precisa teste. |
| 2 | Remover linha de formulário, preservar dados e facilitar correção | Alto | Baixo/médio | Limitação observada no formulário de compra. |
| 3 | Distinguir compra de retirada; rótulos claros de ações | Alto | Baixo | Dois fluxos e vocabulários observados; confusão é hipótese. |
| 4 | Reagrupar navegação por tarefas e manter tudo acessível | Alto | Médio | 16 destinos observados; dificuldade de localização não medida. |
| 5 | Início com filas autorizadas e atalhos escolhidos por evidência | Alto | Médio | Painel/filas existentes; ordem dos atalhos aguarda pesquisa. |
| 6 | Links de alertas para recurso e retorno contextual | Médio | Baixo/médio | Tela atual sem link observado; disponibilidade de vínculo depende de dados/permissão. |
| 7 | Termos simples e consequências explícitas em administração | Médio | Baixo | Termos observados; compreensão não testada. |
| 8 | Revisar filtros/retorno à lista, mobile e teclado com pessoas | Médio | Médio | Necessidade transversal; comportamento autenticado pendente. |

## Perguntas para usuários

1. Quais três tarefas realiza com mais frequência? Quais só faz raramente?
2. Qual nome procura para pedir compra? E para retirar material já disponível?
3. O que entende por “processo”, “ata”, “formalização”, “governança”, “retenção” e “auditoria”?
4. Ao entrar, precisa ver pendências, criar algo ou localizar registro? Qual órgão usa?
5. O que espera que aconteça ao marcar alerta como lido? E ao reenviar pedido corrigido?
6. Que informação precisa para confiar numa confirmação ou corrigir uma ação?
7. Prefere grupos expansíveis, busca por tarefa ou menu sempre aberto? Testar sem ensinar previamente.
8. Usa celular, computador, teclado ou leitor de tela? Em quais condições?

## Plano incremental

1. **Validar vocabulário e prioridades:** entrevistar usuários de cada papel e órgão; coletar tarefas reais sem credenciais/dados sensíveis; medir frequência, erros e termos entendidos. Aprovar mapa de tarefas.
2. **Protótipo clicável sem mudar produção:** testar menu, Início e telas exemplo com iniciantes; manter URLs e inventário de funcionalidades no mapa; corrigir grupos que não sejam encontrados.
3. **Melhorias pequenas e seguras:** rótulos, estados de erro/vazio, ajuda contextual e foco/teclado; testar cada superfície que compartilha componente.
4. **Formulários e retorno:** linha removível, mensagens no campo, preservação de dados e retorno à lista. Antes de editar solicitação enviada, definir campos permitidos e sincronização de bloqueios; teste de integridade obrigatório.
5. **Menu e Início:** reorganizar visualmente mantendo destinos, papéis e rotas; telemetria somente conforme política de privacidade/autorização, ou observação moderada.
6. **Iterar:** repetir teste com iniciantes e comparar com linha de base; liberar gradualmente, manter possibilidade de voltar ao menu anterior durante validação.

## Testes de usabilidade

Recrutar 5–8 pessoas com pouca experiência digital, de mais de um papel quando disponível; número serve para rodada qualitativa, não representa toda população. Não treinar antes. Dar tarefas realistas com dados fictícios e ambiente autorizado: localizar solicitação, criar pedido com dois itens, corrigir campo inválido, diferenciar retirada de compra, localizar documento de processo, encontrar evento e abrir relatório. Não executar exclusão real, retenção ou envio externo.

Registrar, sem induzir: conclusão sem ajuda, tempo, cliques/etapas, hesitações, erros, voltar/cancelar, destino escolhido, leitura da mensagem e confiança declarada. Testar desktop e celular, teclado e escala de texto; incluir estados vazio, erro e dados. Após cada tarefa, perguntar o que esperava e qual termo confundiu. Comparar proposta com interface atual nas mesmas tarefas e condições.

Critérios iniciais para aprovação do protótipo: ao menos 4 de 5 participantes completam cada tarefa crítica sem ajuda; ninguém confunde retirada com compra; erros corrigíveis sem perda dos dados; todos localizam como voltar/cancelar; zero recurso existente fica sem caminho acessível ao papel autorizado; erro de carregamento nunca é interpretado como lista vazia. Ajustar metas após linha de base e risco da tarefa. Validar também foco/teclado, contraste e leitor de tela com revisão própria; teste qualitativo não substitui acessibilidade.

## Decisões pendentes e salvaguardas

Aprovar nomes, grupos e chamadas principais somente após pesquisa. Confirmar inventário integral do menu e destinos por papel; posição dos atalhos; edição de solicitação devolvida; conteúdo da aba governança; regra de datas de reuniões; política de falha da auditoria. Preservar aprovação, autorização no servidor, escopo por órgão, regras de estoque, formalização conjunta de ata e contrato, paginação, exportações, integrações e URLs. Não alterar retenção, saldo, permissões ou mutações irreversíveis como parte de uma simplificação visual.
