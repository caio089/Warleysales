# Pendências e limitações conhecidas

## Decisões do usuário ainda abertas
- **P1 – Warley**: UUID/e-mail não informado. Enquanto não vincular `is_special_deleter`, **ninguém** exclui manualmente.
- **P2 – Retenção**: sem tabela de temporalidade aprovada. O job de limpeza só **arquiva**; elimina somente com autorização formal registrada (`retention_authorizations`) após 30 dias, relatório de encerramento e sem bloqueios.
- **P6 – Nomenclatura dos 7 tipos**: provisória (DFD, ETP, MR=Matriz de Riscos, TR, PP, PJ, ED); editar `document_types` e `document-types.ts` quando confirmada.
- Seções §19, §25 e §29 citadas no pedido não existem em `00-fase1-arquitetura.md`; foram aplicados os padrões seguros documentados.

## Não validado neste ambiente (sem Docker/Supabase)
- Migrations 0002–0004, RPCs, RLS e adapters Supabase **nunca foram executados contra um banco real** (apenas typecheck/build). Rodar `supabase db reset` e `supabase test db` é o primeiro passo; esperar pequenos ajustes de SQL.
- Auth real (`getClaims`, convite, recuperação), Storage e cron em produção.
- Sem testes E2E (Playwright) nem teste de carga.

## Limitações de projeto
- **Operações multi-etapa** (aprovar solicitação com várias linhas de ata; avançar transferência com vários materiais) usam compensação em TypeScript, **não** uma única transação SQL. Uma queda entre etapas pode deixar compromisso/reserva órfã; a reconciliação diária detecta divergência de estoque, mas não de ata. Evolução: mover para RPCs únicas.
- **Upload de anexos** via Server Action (limite configurado 26 MB). Na Vercel o corpo de função é limitado (~4,5 MB), então arquivos grandes falharão em produção: migrar para upload direto ao Storage por URL assinada.
- `transact` carrega todas as chaves de idempotência do par conselho/material; adequado para o volume esperado, mas deve virar consulta por chave se o ledger crescer muito.
- `reconcile` faz uma consulta de ledger por saldo (N consultas); usar a view `v_stock_reconciliation` quando o volume crescer.
- Auditoria lista os 1000 registros mais recentes (sem paginação nem filtro por data na UI).
- Alertas são apenas internos (sem e-mail), conforme H7.
- Varredura de antivírus indisponível (H5): validação por extensão, magic bytes, tamanho e SHA-256.
- Falha em job marca a janela como `failed` e não repete sozinha (reexecução manual).
