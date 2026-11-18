# Plano de testes e validação UX

## Estado da execução

Resultados atuais constam em `01-diagnostico-validado.md` (Fase 0): `E2E_RUN_ID=callback-local-20261118 npm run e2e` terminou exit 0, 8 passed, 0 failed, 2 skipped; `npm test` 517/519, 2 falhas; typecheck TS2322. Nenhuma correção de produto implementada. Isso não é aprovação visual nem E2E com contas reais.

Execução anterior `rework-20261118`: 7 passed, 0 failed, 3 skipped. Na revalidação atual, callback inválido não está skip: request real ao endpoint callback de produção, via fixture Next isolada, efetuou troca PKCE com stub Auth sintético local e redirecionou para login. Os únicos skips atuais são validação de senha sem configuração Auth e busca sem controle shell. O callback sem código também redireciona ao login. HTTP 500 histórico com Auth sem configuração segue não resolvido em UX-17; integração sintética não cobre Auth real, contas, perfis ou sessões. Ver resultados em 01. Playwright já configurado: `npm run e2e` chama `playwright test` (`package.json:11`); `playwright.config.ts:3-24` usa `e2e/`, baseURL `http://127.0.0.1:4317`, canal `msedge`, servidor `npm run dev -- --hostname 127.0.0.1 --port 4317`, env Supabase/IA/SMTP vazias. Não presumir executável Edge instalado; não inventar Chromium ou script alternativo. Usar configuração existente, sem alteração funcional/visual/arquitetural. Auth real bloqueada: sem conta teste aprovada; modo `Fonte de dados não configurada` não é sessão.

## Gate de baseline técnica

Baseline e execução final constam em 01 (Fase 0). Corrigir tipo/mock e exigir typecheck e testes afetados aprovados para concluir correção; não há correção feita nesta atribuição.

## Camadas e evidência

| Camada | Cenários | Evidência exigida |
|---|---|---|
| Unitária | domínio, schemas, transições, policy/guard, idempotência, datas, URL parser, loading/erro/vazio | saída Vitest por caso e exit code |
| Integração | serviços/adapters locais, falhas injetadas, RLS, ledger/estoque, retenção/storage | DB/storage descartáveis identificados; estado antes/depois; alvo aprovado |
| E2E | redirects, navegação, formulários, erro, vazio, loading, retry e retorno contextual | `npm run e2e`, trace/log por cenário; revisar DOM sintético antes de compartilhar: traces não ficam completamente anonimizados; nunca incluir segredos em chat. HTTP 200 não aceita fluxo |
| Auth/permissões | anônimo, papel, órgão, sessão expirada, ação direta, callback, logout e recuperação | matriz esperada/observada; sem credenciais autorizadas: bloqueado, nunca aprovado |
| Browser/responsivo | desktop, tablet e mobile; Edge canal configurado só se executável disponível | browser real/versão, viewport, screenshot e console registrados |
| DOM/ARIA | role, nome, heading, foco, tab order, estado live, labels | inspeção DOM, axe/equivalente como triagem, falhas anotadas |
| Acessibilidade manual | teclado e leitor; contraste, zoom/reflow, toque | NVDA/VoiceOver conforme disponível; responsável humano e observações |
| Visual regressivo | screenshots em viewport/estado iguais, clipping, overflow e contraste | diff revisto; baseline aprovada; sem baseline, não declarar aprovação |
| Inspeção IA | leitura screenshots separada da funcional | apontamentos com imagem/rota e limites, classificada inspeção IA |
| Revisão humana | revisão independente de IA e automação | responsável, data, escopo; ausente = pendente |

## Estados e segurança

Para cada rota: loading; sucesso com fixture autorizada; vazio verdadeiro; falha serviço/rede; validação inválida; sessão anônima/expirada; negado; submit lento/double-submit; retry; query válida/inválida; viewport estreito. Erro não pode virar vazio. Fixtures apenas memória ou backend local isolado; sem produção, seed remoto, PII, áudio real, credencial ou email real. Cron nunca envia email em execução de teste.

Banco: nenhuma escrita sem prova de host/DB local descartável e aprovação explícita. Auth/mutações E2E só com conta autorizada e dados isolados. Teste unit/serviço de policy não depende de conta browser.

### Integridade backend prioritária

1. **Criação compra:** injetar falha após processo, material, provisionamento bloqueado e insert; verificar ausência de parcial/retry duplicado. `src/modules/purchases/service.ts:32-69`; adapter `src/server/supabase/adapters/purchases.ts:64-74`.
2. **Recebimento:** falha entre linhas do ledger e gravação de totais/status; mesma chave e concorrência chaves distintas; comparar saldo, receipt keys, totais, eventos. `src/modules/purchases/service.ts:195-218`.
3. **Regressão de fluxo atômico:** aprovação, cancelamento, transferência; transferência SQL persiste quantidade/eventos (`supabase/migrations/20261102000007_atomic_workflows.sql:180-230`). Não afirmar perda sem evidência.
4. **Permissões/RLS:** matriz `src/shared/lib/authz/policy.ts:53-110`, viewer/operator/manager/admin, sem vínculo e cross-org, chamada direta; revisar negação report.view de operador. É verificação, não falha já descoberta.
5. **Retenção/audit/cron:** hold, elegibilidade, snapshot antes do descarte, retry em storage isolado; segredo cron inválido. Política institucional e falha audit requerem decisão; não modificar prazo ou excluir real.

## E2E e navegação

Modo sem backend verifica estrutura, redirects, erros e acessibilidade; não simula login autenticado. Com autorização futura: login/logout/recovery; solicitação duas linhas, remover/reordenar, corrigir e reenviar; processo e abas; ata+contrato necessários; pedido material no painel/fila (sem rota própria); recebimento parcial/incompleto; estoque, movimento, entrega, transferência; fornecedor; reunião/mídia/transcrição; alertas, relatório/exportação, administração/auditoria/retenção. Negativos por perfil e órgão. Todos autenticados bloqueados até gate de autorização.

Estado de URL: abrir aba/filtro/página por deep link; refresh, back/forward, query inválida, retorno de detalhe à lista; confirmar query sanitizada, sem open redirect e sem perda de filtro aprovada. Menu: verificar NAV_ITEMS único, 16 destinos, redirects/legado e grupos; não contar menus presumidos. Busca pedido material deve ter nome acessível e item truncado completo acessível. Recovery/callback: falha de provedor/retry, token inválido, redirect restrito, mensagem neutra sem enumeração. Calendário: vazio real separado de erro/loading, preserva filtro/data. Revisão de labels deve identificar botão Sheet “Close” real em `src/components/ui/sheet.tsx:74`; UX-22 planeja tradução, ainda não implementada.

## Matriz navegador e acessibilidade

Desktop/tablet/mobile em todas rotas da checklist, sem overflow/clipping e com toque. Capturar screenshot estado fixo, commit e viewport; revisão diff humana/IA registrada separadamente.

Teclado: Tab/Shift+Tab, Enter/Espaço, Escape, setas/Home/End em tablist; menu recolhido sem foco; fechar diálogo devolve foco ao acionador. DOM/ARIA: nome acessível, role, selected/expanded/busy/error, labels/descriptions, live regions e ordem de headings. Contraste de texto, foco, controles e estados; zoom/reflow e alvos. Leitor de tela percorre login, nav, formulário com erro, aba, diálogo, vazio e falha. Axe é triagem, não certificação. Revisão humana separada da leitura IA de screenshots.

## Registro

Para cada caso registrar commit, comando, exit code, env/origem sem segredo, browser efetivo, viewport, perfil/autorização, fixture isolada, resultado, trace/screenshot/log e responsável. Classificar: código+testes; só código; inspeção visual; hipótese; descartado; bloqueado. Infra falha separada de produto. Estado geral: execução final descrita em 01; correções de produto pendentes e auth real bloqueada.

Atualização 2026-11-18: callback inválido coberto por request real ao endpoint de produção reexportado por fixture Next isolada, com build separado; stub Auth local sintético rejeita troca PKCE. Teste confirma uma chamada com código inválido/verifier sintético, redirect HTTP 307 ao login local e ausência de cookies de sessão, inclusive chunks. Fixture recebe apenas URL/chave pública sintéticas, sem service-role key ou credenciais reais. Classificação: integração com serviço Auth sintético; não E2E com Auth real, contas, perfis ou sessões. HTTP 500 histórico sem configuração permanece não resolvido (UX-17). Execução completa atual: 8 passed, 0 failed, 2 skipped; skips são senha sem configuração Auth e busca sem controle shell.
