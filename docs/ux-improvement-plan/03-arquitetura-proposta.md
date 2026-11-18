# Arquitetura proposta

## Objetivo e restrições

Evoluir UX e confiabilidade do monólito modular Next.js/Supabase com menor mudança possível. Esta é proposta, não estado implementado. Preservar URLs, regras de domínio, papéis, vínculos, esquema e integrações atuais. Não introduzir banco, dependência, camada de abstração ou serviço novo. Nenhuma melhoria é aprovada ou executada por este documento.

Evidência de código e teste não equivale a comprovação de interface em navegador. Resultados atuais e rerun técnico ficam centralizados em `01-diagnostico-validado.md` (Fase 0). Consulte `01-diagnostico-validado.md` (Fase 0) para evidência e resultados atuais. Teste errado, não bug de produção. Screenshots e inspeção IA estão descritas em 01; nenhuma revisão humana ou sessão autenticada autorizada. Estado sem backend é placeholder técnico, não fluxo real.

## Estrutura lógica existente a preservar

1. **Interface:** rotas `src/app`, layouts e componentes compartilhados renderizam estados e coletam ações. Preservar os caminhos públicos atuais; `/meu-conselho` redireciona para `/dashboard` com query e componentes dessa pasta ainda são usados.
2. **Ações e serviços de domínio:** actions validam payload, sessão, autorização e regras; services coordenam operações. Corrigir validações, estados de feedback e autorização aqui, não apenas ocultar botões.
3. **Repositórios/adapters:** módulos existentes já têm repositórios (`src/modules/atas/repository.ts`, por exemplo) que isolam persistência; adapters Supabase conectam container e runtime. Reutilizar interfaces atuais e não duplicar persistência em página.
4. **Persistência e integrações:** Supabase, storage, email, IA e endpoints/jobs existentes. Continuar isolando chamadas externas nos adapters já existentes; E2E sem acesso ao Supabase remoto, IA ou SMTP.

A organização modular já é suficiente; necessidade de reorganização não foi demonstrada. Alterações devem permanecer dentro dos módulos donos: `purchases`, `processes`, `formalizations`, `inventory`, `transfers`, `orders`, `meetings`, `notifications`, `reports`, `audit`, `retention`, `identity`, `suppliers`, `contracts`, `atas` e `documents`, usando componentes UI compartilhados apenas para padrões realmente comuns.

## Navegação e arquitetura de informação proposta

Manter o inventário `NAV_ITEMS` e seus 16 destinos primários atuais (9 acompanhamento, 3 estoque, 4 sistema), sem afirmar que todas as rotas e subpáginas cabem nesses 16. Reagrupar visualmente os destinos existentes, sem duplicar entradas nem criar menu profundo: dashboard e alertas em **Visão geral**; solicitações de compra, processos, atas de registro de preços, contratos e fornecedores em **Aquisições**; saldos/estoque, materiais, movimentações, entregas e transferências em **Estoque e logística**; calendário e reuniões em **Agenda**; relatórios em **Análise**; administração como destino primário com `/administracao/usuarios`, `/administracao/auditoria` e `/administracao/retencao` como subpáginas contextuais. `/conselhos`, `/conselhos/novo` e `/conselhos/[id]` mantêm destino próprio/fluxo vigente de órgãos e empresas, não se perdem sob o total de 16. Preservar também `/atas/nova`, `/atas/[id]`, `/contratos/novo`, `/contratos/[id]`, `/processos/novo`, `/processos/[id]` e abas, `/solicitacoes/nova`, `/solicitacoes/[id]`, `/transferencias/nova`, `/transferencias/[id]`, `/login`, `/recuperar-senha`, `/redefinir-senha`, `/auth/callback` e endpoints atuais: continuam rotas/ações, não destinos primários adicionais.

Isso é hipótese de navegação, sujeita a conferência visual e avaliação de usuários; não é constatação de usabilidade. Pedido de material/retirada continua na fila e painel já existentes, sem rota nova nem atalho presumido. Calendário e pedido material mantêm fluxos próprios: calendário preserva filtros e escopo autorizado; pedidos mantêm fila, busca acessível e acesso por teclado/toque no painel (`src/app/(app)/meu-conselho/material-orders-section.tsx:70-79,129-140`). Não confundir solicitação de compra com retirada de estoque, nem ata de registro de preços com ata de reunião. Preservar URLs e retorno com filtros; oferecer contexto processo–instrumento somente quando houver vínculo. A execução visual deve validar desktop/tablet/mobile e foco/teclado antes de aceitar agrupamento.

## Modelo de acesso e escopo

Reutilizar policy e autorização de serviço existentes; não criar papéis ou permissões paralelas. Admin central segue global, com exceção de exclusão manual protegida por `isSpecialDeleter`; gestor de conselho mantém operações gerenciais dentro de seus vínculos; operador cria e movimenta conforme permissões existentes, sem `report.view`; visualizador permanece leitura/relatórios autorizados. Um usuário pode ter papel diferente em cada órgão. Respeitar `canInAnyCouncil` nas ações globais autorizadas.

Cada consulta e mutation deve limitar-se aos vínculos permitidos. Menus/botões são affordances, nunca controle de segurança. Testar chamada direta de action/endpoint e alteração de órgão, incluindo identidade sem vínculo e papéis distintos. Não inferir aprovação visual nem comportamento por perfil: credenciais autorizadas ainda faltam.

## Padrões transversais de interface e dados

### Estados explícitos

Listas, detalhes e painéis distinguem carregando, dados, vazio real, erro recuperável, erro de autorização e indisponibilidade. Não converter falha de consulta em `[]`, `null` ou zero com aparência de sucesso; tratar independentemente seções independentes de processo. Manter mensagens e retry local quando seguro. Formulário preserva valores em erro; `ActionForm` já chama `router.refresh()` após sucesso e mantém inputs em erro (`src/shared/ui/forms/action-form.tsx:60-69`), portanto corrigir necessidades específicas sem alegar ausência de refresh global.

### Ações e integridade

Reutilizar forms, dialogs, toasts, validação Zod, action runner e serviços atuais. Dialog só fecha após sucesso verdadeiro: callback que emite toast de erro e retorna normalmente hoje pode fechá-lo (`src/shared/ui/confirm-dialog.tsx:33-39`; `src/app/(app)/processos/[id]/compact-document-row.tsx:264-272`). Não remover feedback já existente em upload complementar (`src/app/(app)/processos/[id]/tabs/documentation-tab.tsx:103-116`) nem funcionalidade válida de unlink; validar erro específico antes de generalizar.

Solicitação de compra atual cria processo, materiais/bloqueio e solicitação em operações separadas; recebimento grava ledger por item antes dos totais/status. Planejar atomicidade ou compensação explícita antes de ampliar fluxo (`src/modules/purchases/service.ts:32-69,195-218`; `src/server/supabase/adapters/purchases.ts:64-74`). Não apresentar como incidente de produção: auditoria comprova risco estrutural, não falha injetada. Transferências já usam SQL atômico e persistem recebimento/divergência (`supabase/migrations/20261102000007_atomic_workflows.sql:180-230`); conservar isso. Aprovação/cancelamento/transferência não devem ser indevidamente descritos como não atômicos.

Não alterar fórmulas de saldo ou política de estoque por rótulo ambíguo. Unidade de medida deve vir do material em todas as superfícies. Mantém-se exigência de ata **e** contrato para formalização. Retenção só elimina após job checar elegibilidade e holds; autorização antecipada não equivale a descarte e prazo não muda. Auditoria atualmente registra falha de append sem derrubar a operação (`src/modules/audit/service.ts:12`); compliance deve decidir política antes de mudar. Sem outbox ou tabela nova.

### Consultas, atualização e performance

Erros de carregamento de documentos/formalização/lookups/atas/contratos devem ser visíveis, não mascarados como vazio. Estoque deve expor erro de leitura por órgão. Processos faz leituras amplas filtradas posteriormente e chamadas sequenciais; medir volume, latência e plano antes de introduzir cache/paginação. Revalidar origem e destino após vínculo de ata/contrato; risco de estado desatualizado precisa teste, não é bug já provado. Preservar paginação por cursor do adapter (`src/server/supabase/adapters/audit.ts:70-87`) e interface de 15, com aviso do PDF de limite 5000 (`src/app/(app)/relatorios/audit-trail-tab.tsx:190-215,290-292`); não atribuir paginação a `audit/service.ts` nem remover recurso existente.

### Formulários e acessibilidade

Associar mensagens de validação à linha correta após adicionar/remover; testar pelo menos segunda linha, remoção e campos vazios. `ActionForm` preserva campos em erro. Tabs de processo precisam foco, semântica ARIA e navegação por teclado consistente; seleção pode ser refletida em URL somente após decisão de navegação. Sidebar recolhida não pode manter links focáveis em região invisível; usar padrão acessível já disponível. Labels devem ser explícitos e não apenas placeholder. Upload não promete cancelar transporte se remoção só tira a linha: impedir remoção durante envio ou explicar claramente seu efeito (`src/shared/ui/file-upload.tsx:43-58,91`).

### Indicadores e domínios

Cada KPI declara população, período, filtros e unidade, e linka à listagem com exatamente o mesmo escopo. Alinhar dashboard e relatórios ao conjunto de órgãos autorizados. Entregas distinguem origem manual de pedido quando aplicável; “próximas” reuniões deve respeitar regra de data e status aprovada; alertas mantêm “lido” distinto de “resolvido”. Análise IA distingue fallback de resultado gerado. PDF e tela conservam população autorizada equivalente; não inventar filtro de órgão ausente no produto atual.

### Integrações e segurança operacional

Auth mantém recuperação neutra contra enumeração. Callback inválido não cria sessão e informa caminho seguro sem expor detalhe sensível. Extração PDF apresenta conteúdo como sugestão revisável, não dado confirmado. Cron de alertas tem potencial de email externo; jobs e testes rodam somente no ambiente isolado, com URL de Supabase/IA/SMTP vazias e sem seed remoto. Não testar credenciais de produção nem enviar mensagens reais.

Upload de áudio/transcrição deve tratar confirmação de metadados e limpeza de objeto falho/retry; testar sem áudio real sensível. Browser SpeechRecognition só será declarado suportado após matriz de navegadores. Arquivos de auditoria/retenção e exportações devem respeitar auth e limites existentes.

## Reutilização em painéis por perfil

Usar a mesma fonte e componentes do dashboard para cartões/listas variáveis por permissões; não criar dashboards com consultas que contornem o escopo de relatórios. Priorizar filas acionáveis, alertas com destino autorizado e links KPI→lista com query preservada. Não inventar indicadores sem fonte de dados e regra definida. A hipótese precisa ser confrontada em E2E autenticado por papel antes de qualquer aceitação.

| Perfil (hipótese) | Estado atual observado | Prioridade/ações propostas usando apenas filas e métricas existentes | Sucesso verificável |
|---|---|---|---|
| Admin central | `dashboard/page.tsx` exibe filas de formalização e pedidos somente quando `isCentralAdmin`; policy concede acesso global às ações, exceto `data.delete_manual`, sujeita a `isSpecialDeleter`. | Priorizar filas de formalização e pedidos pendentes já existentes, depois prazos/alertas e visão agregada; preservar ações administrativas existentes e escopo autorizado. | Contadores das filas correspondem aos itens exibidos; links abrem processo/pedido correto; operações negadas não se apresentam como concluídas. |
| Gestor | Dashboard apresenta métricas, solicitações, prazos e workspace conforme órgão; policy permite decisões e gestão no órgão vinculado. | Priorizar solicitações que pedem decisão e prazos do órgão selecionado; ações de decisão existentes ficam em contexto do órgão, sem fila global presumida. | Contador/lista e destino reconciliam no mesmo órgão; decisão permitida conclui e negada permanece sem efeito. |
| Operador | Dashboard apresenta ações e métricas existentes; policy permite criação/movimentação permitida, mas não `report.view` nem decisões de gestor. | Priorizar rascunhos, ajustes, documentos e recebimento somente quando a action/policy existente permitir; não mostrar controles de escrita negados. | Contadores e links levam a registros existentes; cada ação permitida tem resultado observável e cada capacidade negada não grava alteração. |
| Viewer | Dashboard compartilha indicadores, alertas e links; policy concede `report.view`, sem actions de escrita. | Priorizar leitura, relatórios autorizados, prazos e alertas; não exibir affordances de escrita. | Links de leitura respeitam escopo; tentativa de escrita é negada sem mutação. |

Evidência atual: `src/app/(app)/dashboard/page.tsx` compõe métricas e filas; `src/app/(app)/dashboard/council-workspace.tsx` usa `buildCouncilActions` e filas/estoque do órgão; `src/app/(app)/dashboard/formalization-queue.tsx` e `order-queue.tsx` mostram filas e ações; `src/app/(app)/dashboard/panels.tsx` contém listas, alertas e prazos; `src/shared/lib/authz/policy.ts` define permissões por action e papel. Ordem hierárquica acima é hipótese de UX, não hierarquia validada por auth: a policy confirma permissões pontuais, não uma hierarquia entre papéis. Para usuário multi-órgão, toda ação de órgão deve usar sempre o órgão selecionado e autorização servidor-side correspondente; filtro visual não substitui guard.

## Verificação e critérios arquiteturais de aceite

- Cada mutação mantém validação, autorização, escopo e regra no serviço; teste direto de action/endpoint cobre ator sem vínculo e papel insuficiente.
- Erro, vazio, loading e sucesso diferem visualmente em telas e integrações; falha em uma seção não apaga sucesso das outras.
- Compras e recebimento não deixam registros parciais em falha; transferência segue atômica; formalização continua exigindo os dois instrumentos.
- Estoque preserva unidade e semântica aprovadas; retenção não altera prazos nem remove dados fora do job elegível.
- Nenhum teste E2E acessa backend remoto, envia email ou usa dados reais; executar com configuração isolada e fornecer saída reproduzível.
- Testar desktop/tablet/mobile, teclado, leitores de tela e estados de erro/vazio/loading; inspeção automatizada não substitui avaliação humana.
- `npm run typecheck` deve passar após correção do TS2322 reportado; testes existentes reportaram 517 aprovados e 2 falhos em 519/70 arquivos. Falha de mock `services.atas.list` em `formalizations/actions.test.ts` não deve ser confundida com bug de produção. Resultados atuais e barreiras estão em `01-diagnostico-validado.md` (Fase 0).

## Limites e referência ao roadmap

Este desenho não cria novos IDs de tarefa; a execução deve referenciar somente IDs definidos em `04-roadmap-implementacao.md`. Não inclui implementação, migração, dependência ou ajuste de política. Sequenciar integridade/permissões antes de mudanças de UX que alterem mutações; executar E2E isolado em paralelo quando configuração estiver validada. Cada decisão que altere regra, retenção, saldo, papel ou dado irreversível exige aprovação explícita. Resultados e evidência atualizados estão em 01 (Fase 0).
