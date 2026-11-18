# Roadmap de implementação

## Regras

Este documento planeja; não implementa melhoria funcional/visual/arquitetural nem autoriza migration, mudança de regra ou alteração de dados. P0 é risco preventivo crítico, não incidente confirmado. `GATE` é bloqueio técnico/autorização, não prioridade de produto; revisão de permissão é verificação, não alegação de bypass. P1 fluxo/estrutura, P2 capacidade/clareza, P3 acabamento. Esforço baixo/médio/alto, sem dias. Resultados da configuração de testes estão no diagnóstico; as melhorias de produto abaixo ainda não foram implementadas. Reverter commits pequenos, manter schema compatível e dados; gates operacionais só para conter risco, nunca apagar dados para “reverter”. Dependências abaixo formam grafo sem ciclos.

## Tarefas

### UX-01 — Verificar isolamento E2E existente
- **Prioridade:** P1, pré-requisito técnico de verificação. **Módulo/problema:** verificar que browser não atinge ambiente real; config Playwright já existe.
- **Evidência:** `package.json:11` (`e2e`: `playwright test`); `playwright.config.ts:3-24` define `e2e/`, `127.0.0.1:4317`, canal `msedge`, servidor `npm run dev -- --hostname 127.0.0.1 --port 4317`, backend/IA/SMTP vazios; `src/app/(app)/authenticated-shell.tsx:17-20,80-87` distingue estrutura sem fonte de sessão autenticada.
- **Solução mínima/fluxo:** usar a configuração existente, verificar executável Edge e origem/env; nenhuma chamada externa ou credencial herdada. Não recriar config nem inferir browser instalado.
- **Arquivos/componentes:** `playwright.config.ts`, `package.json`, `e2e/` existentes.
- **Dependências:** nenhuma.
- **Risco:** vazamento de chamada para remoto. **Esforço:** baixo.
- **Aceite:** `npm run e2e` inicia somente servidor isolado, requests não vão a backend remoto; auth não autorizada fica bloqueada.
- **Testes necessários:** inspeção config, smoke Playwright, inspeção requests/env sem segredos.
- **Reversão:** nenhuma alteração de produto; configuração existente permanece.

### UX-02 — Tornar compra/recebimento íntegros
- **Prioridade:** P0 preventivo; risco estrutural, não incidente. **Módulo/problema:** criação tem efeitos sucessivos antes do insert; recebimento grava ledger por linha antes de totais/status.
- **Evidência:** `src/modules/purchases/service.ts:32-69,195-218`; adapter `src/server/supabase/adapters/purchases.ts:64-74`; conexão real `src/server/container.ts:76-106`.
- **Solução mínima/fluxo:** estudar operação atômica no limite de persistência, idempotência completa e concorrência; não alterar fluxos já atômicos de aprovação/cancelamento/transferência.
- **Arquivos/componentes:** purchase service, `src/server/supabase/adapters/purchases.ts`, migration/RPC somente após plano e aprovação explícita.
- **Dependências:** UX-01.
- **Risco:** efeitos parciais, sem incidente comprovado. **Esforço:** alto.
- **Aceite:** falha injetada em cada fronteira/retry/concorrência deixa um resultado único coerente; mudança SQL aprovada.
- **Testes necessários:** unit, integração com DB local descartável, concorrência e RLS, E2E autorizado isolado.
- **Reversão:** commits pequenos e schema compatível; reverter código preservando ledger; gate operacional se risco exigir, sem restauração destrutiva.

### UX-03 — Verificar policy e guards por serviço
- **Prioridade:** P1, pré-requisito de verificação de segurança; não há falha/bypass confirmado. **Módulo/problema:** demonstrar matriz de autorização e escopo por órgão antes de afirmar cobertura.
- **Evidência:** `src/shared/lib/authz/policy.ts:53-110`; guard purchase `src/modules/purchases/service.ts:27-30,170-175`.
- **Solução mínima/fluxo:** testar unitariamente allow/deny por ator, papel, órgão e ação, inclusive chamada direta; corrigir somente divergência comprovada. Viewer possui report.view; operator não. Sem ampliar regras.
- **Arquivos/componentes:** policy, guard e serviços/actions cobertos pela matriz.
- **Dependências:** UX-01; unit/serviço independe de conta de browser.
- **Risco:** cobertura insuficiente ou negação indevida, sem vulnerabilidade constatada. **Esforço:** alto.
- **Aceite:** matriz esperada/observada completa, casos cross-org negados, revisão humana; discrepância vira tarefa própria antes de ajuste.
- **Testes necessários:** unit policy, integração serviço/RLS em DB descartável; testes diretos de actions.
- **Reversão:** reverter somente correção comprovadamente regressiva, preservar deny-by-default e dados; gate operacional quando necessário.

### UX-04 — Corrigir ajuste e linhas de solicitação
- **Prioridade:** P1. **Módulo/problema:** reenviar sem editar e formulário de linha sem remover, erros por índice.
- **Evidência:** `src/app/(app)/solicitacoes/[id]/request-actions.tsx:110-112`; `src/app/(app)/solicitacoes/[id]/page.tsx:64-95`; `src/modules/purchases/actions.ts:49`; `src/app/(app)/solicitacoes/nova/new-request-form.tsx:38-44`; `src/modules/purchases/actions.ts:9-13`.
- **Solução mínima/fluxo:** edição restrita a estado/ator aprovados pelo dono da regra; validar servidor, manter histórico e sincronizar bloqueio. Remoção/reordenação preserva associação de erro.
- **Arquivos/componentes:** páginas/form citados, purchase actions/service/schema; estoque somente se sincronização aprovada.
- **Dependências:** UX-02, UX-03.
- **Risco:** item/status/estoque divergente. **Esforço:** alto.
- **Aceite:** segunda linha mantém erro correto após remover primeira; edição só no estado permitido, servidor nega indevido.
- **Testes necessários:** unit schema/transição; integração estoque; E2E isolado com duas linhas, erro, correção e reenvio.
- **Reversão:** reverter commit mantendo schema/dados/histórico; gate operacional se risco exigir.

### UX-05 — Expor encerramento de recebimento incompleto
- **Prioridade:** P2. **Módulo/problema:** serviço permite justificativa mínima de 15 caracteres, UI não expõe opção.
- **Evidência:** `src/modules/purchases/service.ts:180-193`; `src/app/(app)/solicitacoes/[id]/request-actions.tsx:116-129`.
- **Solução mínima/fluxo:** ação explícita com saldo pendente e justificativa obrigatória, sem misturar com recebimento parcial.
- **Arquivos/componentes:** request-actions e validação já existente.
- **Dependências:** UX-02, UX-03.
- **Risco:** fechamento prematuro. **Esforço:** baixo.
- **Aceite:** mínimo vigente validado e registrado, ator indevido negado.
- **Testes necessários:** 14/15 caracteres, parcial, ledger/status e E2E autorizado isolado.
- **Reversão:** reverter UI sem apagar recebimento ou evento.

### UX-06 — Diferenciar falha, vazio e loading
- **Prioridade:** P1. **Módulo/problema:** falhas viram arrays/null/zero em consultas de processo/conselho/estoque.
- **Evidência:** `src/app/(app)/processos/[id]/page.tsx:18-35,50-88`; `src/app/(app)/conselhos/page.tsx:18`; `src/app/(app)/conselhos/[id]/page.tsx:32`; `src/app/(app)/estoque/movimentacoes/page.tsx:20-32`; `src/server/lookups.ts:15-24`.
- **Solução mínima/fluxo:** estado de falha recuperável separado de vazio verdadeiro/loading; retry conserva filtro e não duplica mutação.
- **Arquivos/componentes:** fontes citadas e estados compartilhados.
- **Dependências:** UX-01.
- **Risco:** usuário decide com informação falsa. **Esforço:** médio.
- **Aceite:** falha não comunica inexistência; vazio só com consulta bem sucedida; estado anunciado.
- **Testes necessários:** unit resultados, integração erro por fonte, E2E loading/vazio/falha e leitor.
- **Reversão:** reverter apresentação preservando feedback mínimo de erro.

### UX-07 — Acessibilidade de abas e menu recolhido
- **Prioridade:** P1. **Módulo/problema:** tabs sem setas e menu fechado pode manter links focáveis.
- **Evidência:** `src/app/(app)/processos/[id]/process-view.tsx:174-190`; `src/shared/ui/app-shell/sidebar-nav.tsx:178-194`.
- **Solução mínima/fluxo:** setas/Home/End segundo padrão ARIA; menu fechado sem descendants no tab order.
- **Arquivos/componentes:** `process-view.tsx`, `sidebar-nav.tsx`.
- **Dependências:** UX-01.
- **Risco:** foco oculto. **Esforço:** médio.
- **Aceite:** teclado e leitor anunciam seleção; links não recebem foco recolhidos.
- **Testes necessários:** unit teclado/ARIA, inspeção manual leitor/teclado, axe como triagem, viewports.
- **Reversão:** reverter commit sem reintroduzir foco em conteúdo oculto.

### UX-08 — URL de abas e estado de tabelas
- **Prioridade:** P2. **Módulo/problema:** aba de processo é estado local; filtros/paginação/tabelas devem sobreviver a refresh/retorno quando URL não os representa.
- **Evidência:** `src/app/(app)/processos/[id]/process-view.tsx:95,174-190` usa `useState` e clique local; `src/shared/ui/data-table.tsx` e `src/shared/ui/data-table-logic.ts` (confirmar parâmetros e comportamento antes da solução).
- **Solução mínima/fluxo:** mapear estado já codificado; serializar somente estado de navegação/filtro suportado em query, parsear/validar URL e preservar retorno; sem duplicar fonte de verdade nem alterar query por estética.
- **Arquivos/componentes:** process-view, tabelas que forem comprovadas e links de retorno específicos.
- **Dependências:** UX-01.
- **Risco:** URL incompatível ou estado inesperado. **Esforço:** médio.
- **Aceite:** abrir/copiar/refresh mantém aba/filtro válido; valor inválido volta a padrão seguro; retorno preserva filtros aprovados.
- **Testes necessários:** unit parse/serialize, E2E refresh/back/forward/query inválida e teclado.
- **Reversão:** reverter código mantendo URLs antigas e dados; sem migration.

### UX-09 — Arquitetura de menu e retorno contextual
- **Prioridade:** P1. **Módulo/problema:** manter rotas e 16 itens NAV_ITEMS, consolidar grupos propostos sem submenus profundos nem perder retorno contextual.
- **Evidência:** `src/shared/lib/authz/navigation.ts` (fonte de NAV_ITEMS); `src/shared/ui/app-shell/sidebar-nav.tsx`; `src/app/(app)/meu-conselho/page.tsx` (compatibilidade legado; redirects definidos no inventário de auditoria).
- **Solução mínima/fluxo:** avaliar estrutura única de navegação Painel, Aquisições, Estoque/logística, Agenda, Análise e Administração; manter URLs/redirects e query de volta em detalhes. Não criar rotas duplicadas nem declarar 17 itens.
- **Arquivos/componentes:** navigation, sidebar, links para detalhes e redirects só se mudança aprovada.
- **Dependências:** UX-07, UX-08.
- **Risco:** usuários perdem rota/filtro/contexto. **Esforço:** médio.
- **Aceite:** cobertura de todas URLs e papéis, deep link e retornar à lista preserva query aprovada; sem duplicação de navegação.
- **Testes necessários:** unit filtro navigation, E2E rota direta/redirect/back/return em viewport e papéis.
- **Reversão:** reverter somente estrutura de menu preservando URLs e query.

### UX-10 — Correções contextuais de componentes compartilhados
- **Prioridade:** P2. **Módulo/problema:** confirmação pode fechar após callback que resolveu mesmo com toast de erro; remoção da lista de upload não cancela transporte; “Banco conectado” não é healthcheck; action-form já chama router.refresh.
- **Evidência:** `src/shared/ui/confirm-dialog.tsx:33-39`; `src/shared/ui/file-upload.tsx:43-58,91`; `src/app/(app)/authenticated-shell.tsx:46-51`; `src/shared/ui/forms/action-form.tsx:60-69`.
- **Solução mínima/fluxo:** contrato de sucesso/erro para diálogo; impedir remoção durante envio ou informar que envio prossegue; badge factual. Não repetir refresh global.
- **Arquivos/componentes:** fontes indicadas e callbacks que comprovadamente retornem sucesso indevido.
- **Dependências:** UX-01.
- **Risco:** confirmação falsa/upload duplicado. **Esforço:** médio.
- **Aceite:** falha mantém diálogo, envio não fica ambíguo e status não afirma verificação ausente.
- **Testes necessários:** unit callback/upload, E2E erro e envio lento, DOM/ARIA.
- **Reversão:** reverter commit pequeno sem apagar upload já persistido.

### UX-11 — Ajuste de fornecedor
- **Prioridade:** P2. **Módulo/problema:** serviço update existe sem ação visível de editar/reativar.
- **Evidência:** `src/app/(app)/fornecedores/page.tsx:42-55`; `src/modules/suppliers/service.ts:30-40`.
- **Solução mínima/fluxo:** formulário autorizado, validação servidor e reativação sem apagar histórico.
- **Arquivos/componentes:** página, action e service existentes.
- **Dependências:** UX-03.
- **Risco:** alteração cadastral indevida. **Esforço:** médio.
- **Aceite:** gestor permitido edita, ator não permitido negado, referências mantidas.
- **Testes necessários:** unit schema/guard, integração e E2E autorizado/negado.
- **Reversão:** reverter commit sem deletar cadastro; correção de valor via edição auditada.

### UX-12 — Gate para autenticação browser autorizada
- **Prioridade:** P1, pré-requisito de autorização para testes autenticados. **Módulo/problema:** nenhuma conta Auth teste autorizada documentada; ambiente `.env.local` remoto.
- **Evidência:** configuração sem credenciais em `playwright.config.ts:16-24`; modo estrutural `src/app/(app)/authenticated-shell.tsx:17-20,80-87`.
- **Solução mínima/fluxo:** requerer autorização escrita, ambiente isolado e perfis/órgãos teste; só então rodar browser auth/mutações. Sem seed remoto.
- **Arquivos/componentes:** apenas configuração de runner autorizada; nenhuma mudança de policy.
- **Dependências:** UX-01 somente. UX-03 unit/serviço corre independente; UX-12 não é dependência de UX-03.
- **Risco:** acesso real não autorizado. **Esforço:** médio.
- **Aceite:** origem e contas aprovadas documentadas, dados isolados, teste negativo cross-org; sem isso bloqueado.
- **Testes necessários:** auth, matriz de papéis, browser multi-perfil; não marcar skip como aprovado.
- **Reversão:** revogar credenciais de teste e descartar apenas ambiente autorizado, sem tocar compartilhado.


### UX-13.1 — Links de alertas
- **Prioridade:** P2. **Módulo/problema:** alertas sem destino contextual.
- **Evidência:** `src/app/(app)/alertas/page.tsx:40-54`.
- **Solução mínima/fluxo:** link somente a recurso existente e autorizado; lido não é resolvido.
- **Arquivos/componentes:** alertas e destino confirmado.
- **Dependências:** UX-01, UX-03; UX-12 se operação autenticada.
- **Risco:** destino não autorizado. **Esforço:** baixo.
- **Aceite:** link abre recurso autorizado; teste de destino/permissão.
- **Testes necessários:** unit link/policy e E2E autorizado se liberado.
- **Reversão:** remover link sem alterar estado do alerta.

### UX-13.2 — Datas de reuniões
- **Prioridade:** P2. **Módulo/problema:** “próximas” usa status sem comparar data.
- **Evidência:** `src/app/(app)/reunioes/page.tsx:31,126`.
- **Solução mínima/fluxo:** acordar data/fuso/status antes da regra.
- **Arquivos/componentes:** reuniões.
- **Dependências:** UX-01, UX-03; UX-12 se operação autenticada.
- **Risco:** classificar reunião errada. **Esforço:** baixo.
- **Aceite:** fronteiras data/fuso conforme regra aprovada.
- **Testes necessários:** unit datas/fuso e teste afetado.
- **Reversão:** restaurar critério anterior.

### UX-13.3 — Falha e retry de mídia
- **Prioridade:** P2. **Módulo/problema:** risco de objeto órfão pós-upload, não incidente provado.
- **Evidência:** `src/app/(app)/reunioes/meeting-media-panel.tsx:150`; `src/modules/meetings/media-actions.ts:40`.
- **Solução mínima/fluxo:** retry idempotente e limpeza segura sem áudio real.
- **Arquivos/componentes:** painel e actions de mídia.
- **Dependências:** UX-01, UX-03; UX-12 se operação autenticada.
- **Risco:** duplicação/perda de objeto. **Esforço:** médio.
- **Aceite:** retry não duplica; falha permite recuperação.
- **Testes necessários:** storage isolado, falha pós-upload e retry.
- **Reversão:** reverter código sem apagar objetos.

### UX-14 — Dashboard, estoque e entregas
- **Prioridade:** P2. **Módulo/problema:** rótulo do filtro diz “Todos órgãos cadastrados”, enquanto o resultado é limitado aos órgãos autorizados; não há prova de bypass/exposição. Unidade retida hard-coded singular; entregas incluem origem manual, KPI populações diferem.
- **Evidência:** `src/app/(app)/dashboard/council-workspace.tsx:6-10,40-77`; `src/app/(app)/dashboard/filters.tsx:78`; `src/modules/reports/service.ts:88`; `src/app/(app)/estoque/hold-rows.ts:46-55`; `src/app/(app)/estoque/page.tsx:214-220`; `src/app/(app)/estoque/materiais/new-material-form.tsx:8-13`; `src/app/(app)/entregas/page.tsx:30-37,58-76,116-150`.
- **Solução mínima/fluxo:** ajustar somente o rótulo para refletir órgãos autorizados; não alegar bypass ou exposição. Propagar unidade sem conversão implícita; distinguir origem e documentar KPI. Rótulo físico+bloqueado é hipótese, não alterar fórmula.
- **Arquivos/componentes:** dashboard, reports, hold-rows/consumidores, material form, entregas.
- **Dependências:** UX-03, UX-06.
- **Risco:** escopo ou quantidade enganosa. **Esforço:** médio.
- **Aceite:** cross-org nunca exposto, unidade fiel, origem e KPI reconciliáveis.
- **Testes necessários:** unit policy/unidade/agregação, integração consultas, E2E por perfil e origens.
- **Reversão:** reverter apresentação sem alterar dados ou ampliar consulta.

### UX-15 — Identidade e confirmação de vínculo
- **Prioridade:** P2. **Módulo/problema:** título identifica identidade; não inferir falha além do escopo descrito aqui.
- **Evidência:** `src/app/(app)/conselhos/page.tsx:220`; `src/modules/identity/service.ts:124-140`; `src/app/(app)/administracao/usuarios/membership-forms.tsx:40`.
- **Solução mínima/fluxo:** UI reflete guard sem substituir segurança servidor; explicar troca e confirmar efeito da remoção; preservar vínculo histórico.
- **Arquivos/componentes:** conselhos page, identity service, membership-forms.
- **Dependências:** UX-03.
- **Risco:** mudança de acesso inadvertida. **Esforço:** médio.
- **Aceite:** ação direta indevida negada; papel substituído explícito e remoção confirmada.
- **Testes necessários:** unit guard/upsert, integração vínculo e E2E confirmado/negado.
- **Reversão:** reverter commit sem apagar/recriar vínculo sem autorização.

### UX-16 — Baseline de testes e tipagem
- **Prioridade:** P0 técnico de liberação; não representa incidente de produção. **Módulo/problema:** rerun 2026-11-18 mantém falhas; nenhuma correção foi implementada.
- **Evidência:** `npm test`: 517 aprovados, 2 falhos / 519 testes em 70 arquivos; `services.atas.list` ausente no mock `src/modules/formalizations/actions.test.ts` (`assertInstrumentsLinked`). `npm run typecheck`: TS2322 persistente em `src/app/(app)/estoque/page.tsx:184` (`HoldRow[]` vs `SimpleRow[]`).
- **Solução mínima/fluxo:** corrigir tipo real e mock conforme interface; não ocultar incompatibilidade com cast. Saída mínima registrada em 01; logs completos ficaram temporários e não são evidência pública.
- **Arquivos/componentes:** estoque page, formalization test e tipos reais relacionados.
- **Dependências:** nenhuma; unit/typecheck independem de UX-12 e de browser auth.
- **Risco:** baseline falsa mascara regressão. **Esforço:** baixo.
- **Aceite:** suíte e typecheck sem falhas, todos os testes afetados passam.
- **Testes necessários:** typecheck completo, teste formal afetado e conjunto Vitest.
- **Reversão:** reverter commit de teste/código sem casts que ocultem incompatibilidade; schema/dados intocados.

### UX-17 — Recovery, callback e falha de provedor
- **Prioridade:** P1 preventiva de segurança/clareza, não incidente confirmado. **Módulo/problema:** falha recovery na implementação Supabase; `auth-gateway` é interface. `/auth/callback?code=invalid` retorna 500 quando env backend está vazio porque `createSessionClient` lança por falta de configuração; limitado a esse ambiente, não prova falha de auth real/produção. Sem `code`, o teste confirmou 307 para `http://localhost:4317/login`, sem seguir o redirecionamento; o 500 com código inválido permanece reproduzível.
- **Evidência:** `src/server/supabase/auth.ts:24`; `src/modules/identity/actions.ts`; `src/server/auth-gateway.ts` (interface); `src/app/auth/callback/route.ts`.
- **Solução mínima/fluxo:** resposta/redirect seguro para configuração indisponível e token inválido; sem enumeração, sem open redirect. Preservar recuperação neutra e habilitar retry seguro; mudança de produção fora desta tarefa.
- **Arquivos/componentes:** implementação Supabase, identity actions, callback route, recovery/reset pages/forms.
- **Dependências:** UX-01.
- **Risco:** enumeração ou perda de sessão/redirect. **Esforço:** médio.
- **Aceite:** token inválido dá mensagem genérica adequada; falha provedor permite retry; resposta pública não distingue conta inexistente; redirect validado.
- **Testes necessários:** unit callback/redirect, integração provider success/failure, E2E anônimo estrutural e autorizado somente após UX-12.
- **Reversão:** reverter mensagem/handling sem mudar credenciais ou expor erros internos.

### UX-18 — Validar calendário sem datas fechadas
- **Prioridade:** P2. **Módulo/problema:** grade diária só renderiza em visão mensal com pelo menos uma data fechada; impacto na orientação do usuário é hipótese, não defeito confirmado.
- **Evidência:** `src/app/(app)/calendario/page.tsx:162,300`; gerar semanas não garante renderização da grade.
- **Solução mínima/fluxo:** comparar mês sem eventos, mês com previsão sem dia e mês com data fechada. Manter comportamento atual se entendimento for claro; propor grade permanente ou explicação somente com evidência de dificuldade, sem mudar datas de negócio.
- **Arquivos/componentes:** calendário e componentes atuais de relatório/filtros, apenas se a hipótese for confirmada.
- **Dependências:** UX-01; UX-12 para dados autenticados.
- **Risco:** acrescentar informação visual sem benefício. **Esforço:** baixo para investigação; médio se mudança aprovada.
- **Aceite:** usuário identifica mês, ausência de data fechada e próximo passo; decisão manter/alterar documentada; filtros e retorno preservados.
- **Testes necessários:** fixtures isoladas dos três estados, navegação de mês, teclado, desktop/mobile e comparação de entendimento antes/depois; erro de consulta testado separadamente em UX-06.
- **Reversão:** reverter somente apresentação, preservando filtros, eventos e datas registradas.

### UX-19 — Pedidos de material: busca e truncamento
- **Prioridade:** P2. **Módulo/problema:** campo busca sem nome acessível e truncamento dificulta toque/conferência.
- **Evidência:** `src/app/(app)/meu-conselho/material-orders-section.tsx:70-79,129-140`.
- **Solução mínima/fluxo:** label programático/visível e texto completo acessível; alvos confortáveis em touch sem mudar rota ou regra de pedido.
- **Arquivos/componentes:** `material-orders-section.tsx`, testes de diálogo/fila se afetados.
- **Dependências:** UX-07.
- **Risco:** item incorreto selecionado. **Esforço:** baixo.
- **Aceite:** leitor anuncia busca; nome completo disponível; seleção verificável desktop/mobile.
- **Testes necessários:** DOM/ARIA, teclado e touch; E2E com dados fixture.
- **Reversão:** reverter styling mantendo label acessível e valor completo acessível.

### UX-20 — Propagação de rota e retorno contextual
- **Prioridade:** P2. **Módulo/problema:** propagar query de retorno validada entre lista/detalhe e preservar filtros/página quando aprovado. Não inclui serializar estado local de componente/aba, coberto por UX-08.
- **Evidência:** `process-view.tsx:95,174-190`; `src/shared/ui/data-table.tsx`; `src/shared/ui/data-table-logic.ts`; links de detalhes em rotas `solicitacoes/[id]`, `processos/[id]`, `atas/[id]`, `contratos/[id]`, `transferencias/[id]`.
- **Solução mínima/fluxo:** propagar query de retorno permitida e validar; suportar back/forward/deep link sem alteração de URLs canônicas.
- **Arquivos/componentes:** processo, tabelas e links de lista/detalhe validados no inventário.
- **Dependências:** UX-08.
- **Risco:** query quebrada/open redirect. **Esforço:** médio.
- **Aceite:** abrir detalhe e retornar preserva filtros/página; query inválida cai para destino seguro.
- **Testes necessários:** unit URL parser, E2E back/forward/direct link e query malformada.
- **Reversão:** reverter query adicional mantendo deep links antigos.

### UX-21 — Tokens visuais e tipografia
- **Prioridade:** P3. **Módulo/problema:** painel legado usa estilos locais; hipótese de consistência de tokens/tipografia. Legibilidade não foi medida e não é defeito comprovado.
- **Evidência:** `src/app/(app)/meu-conselho/material-orders-section.tsx:53-79`; inspeção visual por IA limitada, sem medição de contraste ou avaliação humana.
- **Solução mínima/fluxo:** avaliar tokens/tipografia no painel; propor alteração somente se teste documentar problema de legibilidade. Não alterar fechamento de dialogs nem rótulo Close.
- **Arquivos/componentes:** `material-orders-section.tsx` e tokens existentes, se avaliação justificar.
- **Dependências:** UX-19 somente se compartilhar componente; pode avaliar isoladamente após UX-01.
- **Risco:** regressão visual/contraste. **Esforço:** baixo.
- **Aceite:** hipótese medida e decisão registrada; não declarar legibilidade ou contraste sem teste.
- **Testes necessários:** comparação tipográfica/tokens e contraste automatizado/manual; screenshots e revisão humana separados.
- **Reversão:** reverter só classes/estilo, sem alterar layout/dados.

### UX-22 — Localizar rótulo do botão Sheet Close
- **Prioridade:** P3. **Módulo/problema:** botão padrão de fechar painel anuncia rótulo inglês em interface portuguesa.
- **Evidência:** `src/components/ui/sheet.tsx:74` contém o botão real Close; tradução proposta ainda não implementada.
- **Solução mínima/fluxo:** trocar rótulo acessível para português (“Fechar”), manter ícone e comportamento; verificar outros usos do Sheet antes de alteração.
- **Arquivos/componentes:** `src/components/ui/sheet.tsx`.
- **Dependências:** UX-07.
- **Risco:** baixo; regressão de nome acessível. **Esforço:** baixo.
- **Aceite:** leitor anuncia “Fechar” e acionador continua funcionando por teclado/toque.
- **Testes necessários:** teste DOM de accessible name, teclado, axe/inspeção humana.
- **Reversão:** reverter commit de texto, sem impacto em estado/dados.

### UX-23 — Corrigir documentação operacional stale
- **Prioridade:** P2. **Módulo/problema:** docs antigas alegam limite 1000 sem paginação e alertas apenas internos apesar de paginação cursor e cron email.
- **Evidência:** `docs/06-pendencias.md`; implementação cursor `src/modules/audit/service.ts:12` (falha append); cron `src/app/api/cron/alertas/route.ts` e módulo notifications `src/modules/notifications/email-delivery.ts`.
- **Solução mínima/fluxo:** corrigir somente afirmações comprovadamente obsoletas e distinguir capacidade, limite e configuração; documentar risco de envio cron e validação, sem mudar operação.
- **Arquivos/componentes:** `docs/06-pendencias.md` e, se for a fonte exata, documentação operacional correspondente.
- **Dependências:** UX-01; confirmar execução/config atual antes da redação.
- **Risco:** operador confiar em instrução incorreta. **Esforço:** baixo.
- **Aceite:** afirmações ligadas a fonte e verificação atual, limites corretamente descritos; nenhuma mudança em cron/email.
- **Testes necessários:** revisão cruzada código/docs e aprovação do responsável operacional.
- **Reversão:** reverter commit documental; nenhuma alteração em dados/operação.

### UX-24 — Revalidar cache e custo de consultas
- **Prioridade:** P2. **Módulo/problema:** revalidação de processo anterior removido e custo de listas amplas não medidos; não há bug/cache comprovado.
- **Evidência:** `src/modules/atas/actions.ts:64-78`; `src/modules/contracts/actions.ts:73-87`; `src/app/(app)/processos/[id]/page.tsx:21-28`.
- **Solução mínima/fluxo:** invalidar rotas antiga/nova quando relação mudar; medir consultas antes de cache/paginação.
- **Arquivos/componentes:** actions atas/contratos e processo page.
- **Dependências:** UX-01.
- **Risco:** informação obsoleta ou otimização errada. **Esforço:** baixo; otimização eventualmente alto.
- **Aceite:** após unlink ambas páginas atualizadas; otimização só sustentada por medição reproduzível.
- **Testes necessários:** unit invalidation, E2E link/unlink/refresh, profiling.
- **Reversão:** reverter commit sem alterar relação persistida.

### UX-25 — Retenção, auditoria e cron seguros
- **Prioridade:** P1, pré-requisito de decisão institucional; risco potencial, não incidente. **Módulo/problema:** retenção sem tabela institucional aprovada; descarte arquivo a arquivo; audit append deliberadamente não bloqueante; cron alertas envia email.
- **Evidência:** `src/modules/retention/service.ts:140-152`; `src/modules/audit/service.ts:12`; `src/app/api/cron/alertas/route.ts`, `limpeza/route.ts`, `reconciliacao/route.ts`.
- **Solução mínima/fluxo:** validar elegibilidade, hold, snapshot antes de descarte, retry e destino cron; obter decisão de política e falha audit. Não mudar prazo, envio ou exclusão sem aprovação.
- **Arquivos/componentes:** retention/actions/repository, audit e cron indicados.
- **Dependências:** UX-01, UX-03.
- **Risco:** perda irrecuperável/efeito externo potencial. **Esforço:** alto.
- **Aceite:** simulação em ambiente isolado prova hold/snapshot/retry; política aprovada; nenhum envio externo.
- **Testes necessários:** unit eligibility, integração storage/DB descartáveis e falha parcial, segredo cron inválido, revisão humana.
- **Reversão:** reverter código preservando dados/schema; pausar job operacional somente se necessário antes de nova exclusão.

### UX-26 — Investigar logs de hidratação e erro Next em relatórios
- **Prioridade:** P1 diagnóstico. **Módulo/problema:** warnings de hidratação em forms e erro Next em `/relatorios` “encountered URL data during prerendering or navigation”, observados em console/network da execução final. Evidência em `artifacts/evidence/reviewed-20261118/public-routes-show-unconfigured-state-legacy-route-redirects-to-dashboard/` e auth local; risco a reproduzir, não bug de produção.
- **Solução mínima/fluxo:** medir reprodução em dev/build com configuração isolada antes de mexer. Preservar configuração de produção e dados.
- **Arquivos/componentes:** forms e relatórios identificados após reprodução. **Dependências:** UX-01.
- **Risco:** falso diagnóstico/alteração indevida. **Esforço:** médio. **Prioridade:** P1 diagnóstico.
- **Aceite:** causa reproduzida e resolvida ou descartada com teste; configuração produção/dados preservados.
- **Testes necessários:** console/network, dev/build isolado, regressão da causa.
- **Reversão:** reverter correção causal; preservar configuração e dados.

### UX-27 — Hierarquia do dashboard por perfil
- **Prioridade:** P2; melhora foco e ordem de trabalho sem evidência de falha crítica. **Módulo/problema:** painel atual combina métricas e workspace de órgão; filas centrais ficam restritas ao admin central. Ordem ideal por papel ainda é hipótese, e não hierarquia validada pela auth.
- **Evidência:** `src/app/(app)/dashboard/page.tsx` monta filas, métricas, painéis e workspace; `src/app/(app)/dashboard/council-workspace.tsx`; filas `formalization-queue.tsx` e `order-queue.tsx`; métricas/listas `panels.tsx`; permissões `src/shared/lib/authz/policy.ts`.
- **Solução mínima/fluxo:** reorganizar somente prioridade e ordem de componentes/ações existentes por papel. Admin central: filas de formalização/pedidos, depois prazos e alertas. Gestor: decisões autorizadas do órgão e prazos. Operador: rascunhos, ajustes, documentos e recebimento somente se permitido pela action existente. Viewer: leitura e relatórios, sem affordances de escrita. Sem novo indicador, consulta, fila ou regra de permissão. Multi-órgão: toda ação usa o órgão selecionado; servidor revalida escopo e capacidade.
- **Arquivos/componentes:** `src/app/(app)/dashboard/page.tsx`, `council-workspace.tsx`, `formalization-queue.tsx`, `order-queue.tsx`, `panels.tsx` e testes correspondentes existentes; alterar somente os necessários.
- **Dependências:** UX-01 para execução browser isolada; UX-03 para verificação policy; UX-12 para E2E autenticado autorizado. UX-06 para estados de erro/vazio onde painel for afetado.
- **Risco:** prioridade inferida como hierarquia autorizativa, link/contador não reconciliável ou escrita indevida. **Esforço:** médio. Auth browser segue bloqueada sem autorização e contas aprovadas.
- **Aceite:** contadores reconciliam com filas atuais; links levam à lista/registro com mesmo escopo e filtros; capacidade negada não exibe ação executável e chamada direta não altera dados; métrica/filas sem nova fonte; seleção de órgão respeitada em usuários multi-órgão.
- **Testes necessários:** unit da ordem e visibilidade por papel; integração de consulta/escopo e negação de action; browser desktop e mobile por perfil autorizado, com contadores, links, seleção multi-órgão e escrita negada; sem credenciais ou dados reais.
- **Reversão:** reverter commit isolado de apresentação/ordem, sem alterações de schema, policy ou dados.

## Ordem e checkpoints

G0 UX-01 isola browser. G1 UX-16 estabiliza baseline; UX-02 testa integridade antes de mutações. G2 UX-03 executa em paralelo com testes unitários; não aguarda UX-12. G3 UX-07/08/09/10 estabelecem shared/navigation. G4 módulos UX-04/05/11/13.1/13.2/13.3/14/15/17/18/19/20/21/22/23/24/25/26 conforme dependências. Shared UX-06/07/08/09/10 tem checkpoint antes de iniciar cada módulo consumidor. UX-12 libera apenas browser autenticado quando autorização documentada. G5 revisão separada humana/IA e resultados; nenhum item implementado por este plano. Banco não compartilhado sem prova de alvo e aprovação.
