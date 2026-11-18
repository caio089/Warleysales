# Checklist de execução

**Estado:** nenhuma melhoria funcional, visual ou arquitetural foi implementada. Rerun 2026-11-18: `npm test` 517 aprovados, 2 falhos /519 em 70 arquivos, mock `services.atas.list` ausente em `src/modules/formalizations/actions.test.ts`; `npm run typecheck` TS2322 persistente em `src/app/(app)/estoque/page.tsx:184`. Nenhuma correção implementada. Resultados/diagnósticos completos centralizados em 01; logs completos temporários não foram publicados.

## Preparação executada

- [x] Config Playwright existente revisada: `npm run e2e`, Edge `msedge`, loopback `127.0.0.1:4317`, env provider sobrescritos vazios. Next ainda lê `.env`; browser bloqueia rede externa no próprio browser, não é firewall Next/servidor.
- [x] Execução histórica `reviewed-20261118`: 6 passed, 1 failed, 2 skipped; execução `rework-20261118`: 7 passed, 0 failed, 3 skipped. Atual `callback-local-20261118`: 8 passed, 0 failed, 2 skipped. Os dois skips atuais: validação de senha sem configuração Auth e busca sem controle shell. Ver `01-diagnostico-validado.md` (Fase 0) e `artifacts/evidence/callback-local-20261118/`.
- [x] Rotas visitadas em modo sem fonte: evidência em 01; isso não aprova autorização por papel.
- [x] Typecheck e Vitest rerun: TS2322 e 517/519 com 2 falhas persistem; detalhes em 01.
- [x] Sanitização self-check executado; DOM/traces sintéticos não totalmente anonimizados, revisão obrigatória antes de compartilhar. Nunca incluir segredos em chat.

## Portões

- [x] Configuração e evidência de execução revisadas; consulta a 01 como fonte final.
- [ ] Isolamento do processo/servidor contra toda rede externa: **NÃO COMPROVADO**. Browser bloqueia rede externa apenas no browser; não é firewall do Next.
- [ ] Banco apenas após prova de alvo local descartável e aprovação explícita.
- [ ] Sem conta Auth teste autorizada: E2E com Auth real, login autenticado, multi-perfil e mutações browser **BLOQUEADOS**. A integração atual cobre somente callback contra stub Auth sintético local.
- [ ] Policy por papel/órgão/action e testes de feature futura.
- [ ] Correções futuras e testes afetados passando antes de concluir cada tarefa.

## Verificações por rota

Para **cada** rota, abrir deep link e navegação; validar redirect/query, sessão, órgão/papel, heading, loading, vazio verdadeiro, erro, conteúdo, DOM/ARIA, teclado e desktop/tablet/mobile. Testar mutação somente com conta autorizada e dados isolados. Cada item fica pendente/bloqueado até execução. Registrar N/A com motivo.

- [ ] `/`, `/dashboard`: redirect/sessão e modo sem fonte não simula dados; filtro só órgãos autorizados; KPIs e links escopo coerente.
- [ ] `/meu-conselho`: redirect `/dashboard`, query preservada; conferir componentes legados ainda acessíveis.
- [ ] `/conselhos`, `/conselhos/novo`, `/conselhos/[id]`: lista/vazio/erro, criação guardada, detalhe cross-org negado, ausência de zeros enganosos.
- [ ] `/solicitacoes`, `/solicitacoes/nova`, `/solicitacoes/[id]`: fila; duas linhas/remover primeira/erros associados; criação atômica; correção por estado aprovado; parcial/encerramento justificado; não confundir retirada de material com compra.
- [ ] Pedido de material no painel/fila (sem rota própria): busca label acessível, toque, texto longo completo, seleção correta.
- [ ] `/processos`, `/processos/novo`, `/processos/[id]`: lista/form/detalhe, falhas de consulta, abas documentos/contratação/governança, formalização exige ata E contrato, tabs teclado e deep-link.
- [ ] `/atas`, `/atas/nova`, `/atas/[id]`: CRUD autorizado, vínculo/desvínculo, atualização processo antigo/novo; ata de preços distinta de ata de reunião.
- [ ] `/contratos`, `/contratos/novo`, `/contratos/[id]`: detalhe, upload/extract fixture, validação, guard e vínculo/cache.
- [ ] `/estoque`, `/estoque/materiais`, `/estoque/movimentacoes`: disponível/bloqueado/reservado, unidades inclusive resma, consulta por órgão, erros; typecheck baseline.
- [ ] `/entregas`: origem manual versus compra e escopo de KPIs, sem mudar fórmula/regras de saldo.
- [ ] `/transferencias`, `/transferencias/nova`, `/transferencias/[id]`: permissões, atomicidade local aprovada, quantidades e eventos persistidos; justificativa explícita de divergência somente se regra for aprovada.
- [ ] `/fornecedores`: lista, edição/reativação permitida, validação e histórico preservado.
- [ ] `/calendario`: data/fuso/filtro; condicional observada em `src/app/(app)/calendario/page.tsx:300` só `monthView && dayMarks.length > 0`; efeito UX é hipótese, não erro vazio genérico confirmado.
- [ ] `/reunioes`: data versus status; `meeting-media-panel.tsx` upload/retry isolado, falha pós-upload e duplicação; SpeechRecognition a confirmar.
- [ ] `/alertas`: link contextual, erro/vazio; marcar lido não é resolver.
- [ ] `/relatorios`: indicadores escopo autorizado, auditoria cursor/paginação e limites de exportação.
- [ ] `/administracao`, `/administracao/usuarios`, `/administracao/auditoria`, `/administracao/retencao`: guard admin, troca/remover vínculo confirmada, paginação, hold/snapshot/retry; sem exclusão real sem política e aprovação.
- [ ] `/login`, `/recuperar-senha`, `/redefinir-senha`: validação, resposta anti-enumeração, token inválido/expirado, falha de provedor com retry seguro. Auth real bloqueada sem conta aprovada.
- [ ] `/auth/callback`: token inválido, parâmetros/redirect permitidos, mensagem segura; sessão somente autorizada.
- [ ] `/api/audit/older`, `/api/contracts/extract-pdf`, `/api/reports/pdf`: auth, papel/órgão, erros, limites e payload inválido; sem dados reais.
- [ ] `/api/cron/alertas`, `/api/cron/limpeza`, `/api/cron/reconciliacao`: segredo ausente/inválido nega; simulação sem email/exclusão/escrita externa.
- [ ] `not-found`, `error`, `loading`: acessível e sem stack/segredo; URLs inexistentes não aparentam sucesso.

## Checklist UX-27 — hierarquia do dashboard por perfil

Não marcar nenhum perfil como testado: browser autenticado e mutações seguem **BLOQUEADOS** sem autorização escrita, contas de teste e ambiente isolado aprovados (UX-12). A hipótese de ordem do painel não valida hierarquia auth.

- [ ] Admin central: conferir filas existentes de formalização/pedidos, métricas, links e escopo; teste autenticado bloqueado.
- [ ] Gestor: conferir decisões permitidas e prazos no órgão selecionado; cross-org negado; teste autenticado bloqueado.
- [ ] Operador: conferir rascunhos/ajustes/documentos/recebimento somente quando permitido; sem report.view; teste autenticado bloqueado.
- [ ] Viewer: leitura e relatórios autorizados; sem affordances/escritas; tentativa direta negada; teste autenticado bloqueado.
- [ ] Para cada perfil: contadores reconciliam com filas existentes, links com destino/escopo correto e capacidade negada sem mutação; validar órgão selecionado para usuário multi-órgão.
- [ ] Unit: ordem/visibilidade por perfil; integração: consulta, escopo e negação de action; browser desktop e mobile para cada perfil somente após liberação UX-12.
- [ ] Reversão: commit de apresentação isolado, sem schema/dados; nenhuma reversão executada nesta checklist.

## Regressão e critérios transversais

- [ ] `npm run typecheck` TS2322 persiste; corrigir tipagem real, e só concluir com typecheck aprovado.
- [ ] `npm test`: reproduzir falhas e completar mocks de `services.atas.list` em teste formalização segundo interface verdadeira; distinguir erro de teste de bug funcional; registrar suite completa; só concluir com testes afetados aprovados.
- [x] `E2E_RUN_ID=callback-local-20261118 npm run e2e`: exit 0, 8 passed, 0 failed, 2 skips; callback inválido integrado com stub Auth sintético local. Ver 01 e `artifacts/evidence/callback-local-20261118/`. E2E com Auth real/perfis segue bloqueado sem contas autorizadas.
- [ ] Falha injetada na criação após processo/material/bloqueio/insert: sem parcial; retry não duplica. Recebimento falha entre itens e persistência: ledger/saldo/total/status/eventos coerentes, mesma chave e concorrência distinta.
- [ ] Regressão de aprovação/cancelamento/transferência SQL atômicas; não alegar perda de quantidades confirmada.
- [ ] Policy unit: anônimo, viewer, operator, manager, admin, sem vínculo, órgão cruzado; chamada direta negativa. Browser auth só após autorização escrita.
- [ ] Teclado Tab/Shift+Tab/Enter/Espaço/Escape/setas/Home/End; menu recolhido sem foco oculto; retorno de foco ao fechar.
- [ ] DOM/ARIA: nome, role, estado, labels, live region, ordem e headings; leitor de tela em formulário erro, abas, dialogs, loading e falha.
- [ ] Contraste foco/texto/controles/estados; zoom/reflow; alvo touch. Automação é triagem, reviewer humano confirma.
- [ ] Screenshots fixas desktop/tablet/mobile por rota/estado e diff; revisão IA e humana separadas, sem declarar baseline inexistente aprovada.
- [ ] URL e tabelas: refresh/back/forward, query válida/inválida, filtro/página/aba e retorno contextual, sem open redirect.
- [ ] Estados de erro, vazio, loading, validação, sessão expirada, permissão, retry e submit lento; HTTP 200 não é aceite.
- [ ] Docs stale: evidência de paginação `src/server/supabase/adapters/audit.ts:70-87`, UI `src/app/(app)/relatorios/audit-trail-tab.tsx:190-215,290-292`; sem alterar cron/prazo.

- [x] Callback inválido: request real ao endpoint de produção reexportado por fixture Next isolada com build separado; cookie PKCE sintético; stub Auth local confirma troca executada, rejeição sintética, redirect HTTP 307 e ausência de cookie de sessão/chunks. Fixture usa URL/chave pública sintéticas, sem service-role key ou credencial real. Integração com serviço Auth sintético, não E2E com Auth real/perfis/sessões. HTTP 500 sem configuração histórico segue não resolvido em UX-17.
