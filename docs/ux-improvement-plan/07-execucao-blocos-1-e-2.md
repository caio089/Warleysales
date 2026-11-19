# Execução dos blocos 1 e 2

**Data:** 2026-11-18. **Estado:** blocos 1 e 2 aprovados; bloco 3 inteiro não aprovado. Este registro complementa, não reescreve, o histórico em `01-diagnostico-validado.md` e `06-checklist-execucao.md`. Aprovação de blocos não equivale a aceite de produção nem autorização para dados reais, SQL ou autenticação/RLS.

## Estado por ID

| ID | Estado | Limite / pendência |
|---|---|---|
| UX-01 | Configuração e isolamento E2E existentes verificados. | Execuções locais/sintéticas não provam isolamento do servidor em produção. |
| UX-02 | Pendente; compra/recebimento ainda não têm atomicidade global. | Requer plano separado no limite de persistência e aprovação explícita de SQL/RPC antes de qualquer alteração. |
| UX-03 | Matriz de testes ampliada; verificação apenas. | Não significa policy/RLS validada integralmente nem autorização autenticada comprovada. |
| UX-04, UX-05 | Não implementados; recomendações de conclusão estão na seção “Decisões pendentes do bloco 3”. | Estados de correção e encerramento não foram alterados. |
| UX-06 | Implementado em código. | Aceite de produção depende de regressão e fluxos autenticados autorizados. |
| UX-07 | Implementado em código. | Teclado/leitor de tela e revisão humana completa permanecem por validar. |
| UX-08 | Implementado: estado de tabelas na URL e retorno contextual. | Cobertura de todas as tabelas e navegação real continua sujeita à matriz. |
| UX-09 | Não implementado; proposta de agrupamento aguarda decisão adicional. | Ver seção “Decisões adicionais dos blocos 1 e 2”. |
| UX-10 | Implementado em código. | Não equivale à validação de todas as rotas/estados no browser. |
| UX-11 | Não implementado; recomendação na seção “Decisões pendentes do bloco 3”. | — |
| UX-12 | Gate para autenticação browser não liberado. | Sem conta e autorização escrita, autenticação real e testes por perfil seguem bloqueados. |
| UX-13.1 | Implementado em código. | Não implica validação em produção. |
| UX-13.2 | Não implementado nesta execução. | — |
| UX-13.3 | Não implementado; recomendação na seção “Decisões pendentes do bloco 3”. | — |
| UX-14 | Não implementado; decisão independente de UX-27. | Definir escopo/KPIs de estoque e entregas sem alterar fórmulas; UX-27 trata separadamente a apresentação do dashboard por perfil. |
| UX-15 | Não implementado; recomendação na seção “Decisões pendentes do bloco 3”. | — |
| UX-16 | Baseline de testes e tipagem atualizado. | Verificações pós-correções listadas abaixo. |
| UX-17 | Correção do callback sem configuração implementada e comprovada em E2E local: HTTP 307 para login, sem sessão criada. | O fluxo usa servidor/Auth sintéticos locais; não comprova Auth real nem comportamento de produção. |
| UX-18 | Não implementado. | — |
| UX-19 | Implementado em código. | Não implica validação com dados reais. |
| UX-20 | Implementado em código, incluindo retorno contextual. | Testes unitários cobrem busca com `/` e `\\`; sem alegar cobertura universal das rotas. |
| UX-21 | Não implementado. | — |
| UX-22 | Implementado em código. | Revisão completa de idioma/acessibilidade continua pendente. |
| UX-23, UX-24, UX-25 | Não implementados. | — |
| UX-26 | Investigações e evidências sintéticas não provam causa/correção em produção. | Não declarar resolvido sem reprodução conclusiva. |
| UX-27 | Não implementado; decisão de apresentação por perfil aguarda aprovação. | Ver seção “Decisões adicionais dos blocos 1 e 2”. |

## Restrições e resultados de navegador

Não foram usados dados reais nem serviços remotos autorizados; não houve execução/aplicação de SQL. Auth real, sessão autenticada, RLS e autorização por perfil/órgão não foram validadas. Browser sintético local não representa produção.

Execuções anteriores em modo desenvolvimento tiveram intermitência nos checks de prontidão/navegação; a causa exata não foi confirmada. A fixture foi então alterada para build de produção local antes do servidor callback (`dev: false`), boundary `Suspense` para a rota e readiness sinalizada por ref. Duas execuções estabilizadas, verificadas diretamente em `artifacts/evidence/run1/results.json` e `artifacts/evidence/run2/results.json`, registraram cada uma 19 aprovados, 2 ignorados e 0 falhas. Ambas comprovam callback inválido redirecionado com HTTP 307. Os resultados atuais de `artifacts/results.json` podem pertencer a execução sobrescrita e não substituem esses dois relatórios identificados. Essa evidência é browser sintético local, não valida Auth real, banco, RLS, autorização autenticada nem produção.

## Decisões pendentes do bloco 3

- **UX-04 — edição/correção de solicitação:** o serviço atual permite transição `em_analise` → `aguardando_correcao` e reenvio `aguardando_correcao` → `em_analise`; isso muda estado, não título nem itens. A action `resubmitAfterCorrection` recebe somente `requestId`. Recomenda-se primeiro definir com o responsável de negócio se, em quais estados e por quais atores os dados podem ser editados; depois especificar validação, histórico e sincronização de bloqueios. Não anunciar “corrigir dados” como capacidade existente enquanto isso não estiver implementado.
- **UX-05 — encerramento de recebimento incompleto:** expor ação separada do recebimento parcial, com saldo pendente e justificativa obrigatória; preservar mínimo atual de 15 caracteres, permissão, ledger e histórico. Testar limites de justificativa e transições antes do aceite.
- **UX-11 — fornecedor:** delimitar campos/estados editáveis e permissões, preservar histórico e validar reativação/alteração autorizada antes de implementar; sem inferir requisitos não aprovados.
- **UX-13.3 — mídia de reunião:** definir feedback para falha após upload, retry idempotente e limpeza segura de objeto; usar fixture isolada, sem áudio real sensível.
- **UX-14 — dashboard/estoque/entregas:** antes de mudar apresentação, aprovar populações, filtros e fórmulas existentes. Reconciliar cada KPI com sua fonte e respeitar órgão selecionado; não alterar saldo, unidade ou regra de estoque.
- **UX-15 — identidade/vínculo:** especificar confirmação, escopo e autorização da operação, manter verificação no serviço e testar negação sem vínculo; não mudar papéis ou permissões por inferência.

## Decisões adicionais dos blocos 1 e 2

- **UX-02 — atomicidade de compras, sem implementação:** submeter desenho separado de uma operação transacional no limite de persistência para (1) criação conjunta de processo opcional, materiais/bloqueios e solicitação e (2) recebimento conjunto de lançamentos de ledger, totais, chave(s) de idempotência e estado/eventos. Incluir falha entre etapas, retry com a mesma chave, concorrência com chaves distintas, consistência de leituras, testes em banco local descartável e reversão. Serviço atual cria efeitos em chamadas separadas; recebimento grava ledger item a item antes de salvar totais/estado. A chave idempotente por linha não torna o recebimento inteiro atômico. Qualquer RPC/migração SQL requer documento técnico e aprovação explícita; não executar SQL nem alterar dados até essa aprovação.
- **UX-09 — proposta de menu antes de codificar:** apresentar os seis grupos exatamente como definidos em `03-arquitetura-proposta.md`: **Visão geral** (dashboard e alertas), **Aquisições** (solicitações de compra, processos, atas de registro de preços, contratos e fornecedores), **Estoque e logística** (saldos/estoque, materiais, movimentações, entregas e transferências), **Agenda** (calendário e reuniões), **Análise** (relatórios) e **Administração**. Preservar os 16 destinos primários, rotas existentes, subpáginas, distinção entre domínios, permissões e escopo; conselhos/órgãos mantêm fluxo próprio. Evitar duplicações e submenus profundos. Obter aprovação da estrutura antes de implementação.
- **UX-27 — proposta de dashboard por perfil antes de codificar:** usar apenas filas e métricas existentes e validar escopo/ações por autorização servidor-side. A ordenação recomendada em `03-arquitetura-proposta.md` é: admin central, filas de formalização e pedidos pendentes; gestor, decisões e prazos do órgão selecionado; operador, rascunhos/ajustes/documentos/recebimento somente onde a policy permita; viewer, leitura, relatórios autorizados, prazos e alertas, sem ações de escrita. Esta é proposta de hierarquia visual, não hierarquia de permissões. Aprovar estrutura e obter contas/ambiente autorizados antes de implementar ou testar perfis autenticados.

## Verificações após correções

- `npm run lint`: exit 0; 0 erros, 10 warnings de código fonte (variáveis/imports não usados e dependência `sort` em `useMemo`).
- `npm test`: exit 0; 557/557 testes em 83 arquivos.
- `npm run typecheck`: exit 0 (`tsc --noEmit`).
- E2E: dois relatórios estabilizados em `artifacts/evidence/run1/results.json` e `artifacts/evidence/run2/results.json`, cada um 19 aprovados, 2 ignorados, 0 falhas. Fixture com build antes do servidor callback, `dev: false`, boundary `Suspense` e readiness via ref; causa exata da instabilidade dev anterior não confirmada.
- `git diff --check` executado após a atualização desta documentação.
- E2E não valida Auth real, banco, RLS, perfis autenticados ou produção; não houve uso de dados reais ou execução SQL.
