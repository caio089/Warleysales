# E2E

## Resultados estabilizados

Duas execuções independentes do fixture atualizado foram verificadas em `artifacts/evidence/run1/results.json` e `artifacts/evidence/run2/results.json`. Cada relatório registra **19 aprovados, 2 ignorados e 0 falhas**. As duas execuções incluem callback inválido respondendo com redirect HTTP 307 para login sem configuração de backend/Auth. Os dois skips existentes cobrem validação de senha sem Auth configurada e busca sem controle no shell.

Houve falhas/intermitência anteriores no modo de desenvolvimento: fixture readiness e navegação/hot reload. A causa exata da intermitência não foi confirmada. A estabilização alterou o callback fixture para fazer build antes de servir com `dev: false`, envolveu renderização que depende da rota em `Suspense` e passou a sinalizar readiness usando ref, evitando `setState` no callback de ref. Duas rodadas consecutivas passaram após essas mudanças. Isso demonstra estabilidade nessas rodadas, não prova causalidade exata nem elimina toda flakiness futura.

Não confundir esses resultados com `artifacts/results.json`, que pode ser sobrescrito por outra execução. Os relatórios imutáveis usados para esta conclusão são os dois caminhos `artifacts/evidence/run1/results.json` e `artifacts/evidence/run2/results.json`.

## Escopo e limites

As rotas de captura em `callback-app/app/[...path]/page.tsx` renderizam componentes reais `SimpleTable`, `ProcessesTable` e `ReturnLink` com linhas sintéticas. Não executam loaders de páginas produtivas, serviços autenticados, banco ou RLS. Os testes de `ProcessView`, confirmação, upload, Sheet, sidebar, tabelas, `ContextualLink` e `ReturnLink` exercitam componentes e navegação com fixture, não fluxos autenticados de produção.

O `npm run e2e` inicia app isolado em `127.0.0.1:4317`, callback fixture em `127.0.0.1:4319` e Auth stub sintético em `127.0.0.1:4320`. Configuração sobrescreve variáveis sensíveis herdadas e valores de Auth/serviços com valores vazios; stub usa somente chave pública sintética, responde `invalid_grant` e expõe estado sintético local. Sem serviço remoto, credenciais reais, dados reais ou sessão autenticada.

O teste de callback inválido envia cookie PKCE sintético para rota de produção reexportada pelo fixture. Verifica redirect HTTP 307 para login, uma troca com o stub Auth e ausência de cookies de sessão, inclusive chunks. Isso prova integração com Auth sintético local, não E2E com Auth real, contas, perfis, autorização, banco ou RLS. Não usar os resultados para afirmar validação de produção.

A barreira de rede do browser restringe navegação a loopback; não é firewall do servidor app. Reexecuções não devem acessar Supabase remoto, enviar email nem executar seed. Microsoft Edge instalado é necessário.

## Fixture de callback e configuração

`playwright.config.ts` executa a app principal pelo servidor isolado e inicia fixture callback via `npx next build e2e/callback-app` seguido de `node e2e/callback-server.mjs`. O servidor callback usa `next({ dev: false })` com diretório de build separado `artifacts/callback-next`; o servidor local Auth stub só aceita rotas previstas e demais caminhos retornam 404. O fixture usa layout com boundary `Suspense` para dependências da rota e marca prontidão por ref após montagem.

Para executar: `E2E_RUN_ID=run-name npm run e2e` (PowerShell: `$env:E2E_RUN_ID='run-name'; npm run e2e`). A configuração guarda reporter temporário em `artifacts/results.json`; para evidência durável, copiar cada relatório identificado para um diretório de execução distinto sem sobrescrever resultados anteriores.
