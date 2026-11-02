# Fase 1 — Descoberta e Arquitetura (fonte da verdade)

Status: **proposta aguardando aprovação**. Nenhum código de aplicação foi escrito.

## 1. Regras confirmadas (imutáveis sem decisão do usuário)

| # | Regra |
|---|-------|
| R1 | Progresso documental = `tipos_com_anexo_valido / 7 × 100`, 2 casas. Vários arquivos do mesmo tipo contam 1. |
| R2 | Anexo válido = upload confirmado no Storage (não falho/descartado) e não eliminado antes da conclusão. |
| R3 | Percentual nunca é editável manualmente; é derivado. |
| R4 | Completude documental (Pendente/Completa) é independente da situação administrativa. 100% não conclui o processo. |
| R5 | Ao atingir 100%: grava `documental_completed_at`. Ao perder: registra reversão e cancela elegibilidade à limpeza. |
| R6 | Limpeza: 30 dias corridos desde a última aquisição de 100%, **somente com** relatório de encerramento, sem bloqueio e com autorização de retenção. Sem autorização → manter/arquivar. |
| R7 | Após limpeza autorizada, o processo não volta a 0% (snapshot histórico dos 7 tipos). |
| R8 | Ata de registro de preços ≠ estoque ≠ contrato ≠ ata de reunião. |
| R9 | Saldo da ata = registrada − comprometida. Rascunho não consome saldo. Sem comprometimento acima do limite. |
| R10 | Ata: 1 ano prorrogável por igual período (art. 84, Lei 14.133/2021), nunca 10 anos. Sem prorrogação automática. |
| R11 | Estoque só por movimentações (ledger). Aprovação de solicitação não aumenta estoque; só o recebimento. Sem saldo negativo. |
| R12 | Transferência não é consumo; material em trânsito não está disponível em ambos os conselhos. |
| R13 | Exclusão manual: exclusivamente o usuário Warley, vinculado ao `auth.users.id` (UUID). Automação usa identidade técnica própria. |
| R14 | Isolamento por conselho com RLS + autorização em serviços; `council_id` do cliente nunca é confiável. |
| R15 | Storage privado, URLs temporárias, sem blob no Postgres. Instantes em UTC; exibição `America/Fortaleza`. |
| R16 | Contrato: histórico de prazos/valores preservado; sem regra fixa "13+1 meses". |

## 2. Decisões pendentes (bloqueios reais)

| ID | Pergunta | Impacto | Padrão seguro se não houver resposta |
|----|----------|---------|--------------------------------------|
| P1 | **UUID da conta do Warley** (ou e-mail para eu vincular após o primeiro login, por seed manual) | Permissão de exclusão | Ninguém exclui até ser definido |
| P2 | Existe **tabela de temporalidade** / política de retenção aprovada? | Limpeza dos 30 dias | Job só gera relatório e **arquiva**; não elimina fisicamente |
| P3 | Projeto Supabase e Vercel já existem? Quais ambientes (dev/prod)? | Fundação/deploy | Supabase local (CLI) + migrations; deploy depois |
| P4 | Regra de numeração de processo (ex.: `NNN/AAAA` por conselho ou global)? | Unicidade | `número + ano` único por conselho, formato configurável |
| P5 | Atas compartilhadas: limites por conselho são obrigatórios ou opcionais? | Saldo | Alocação opcional; sem alocação, saldo comum com bloqueio por lock |
| P6 | Nomenclatura exata dos 7 tipos (MR = Matriz de Riscos?) | Seed | Usar a do prompt; editável em configurações |
| P7 | Cadastro de usuários: convite pelo admin ou autocadastro? | Auth | Somente convite (sem autocadastro) |
| P8 | Fornecedor com CNPJ único global? | Unicidade | Sim, único quando informado |

## 3. Hipóteses técnicas (documentadas)

- H1: Monólito modular Next.js (App Router) + Supabase; regras críticas em **funções SQL transacionais** (RPC) chamadas pelos serviços, com `SELECT … FOR UPDATE`.
- H2: Saldos de estoque em `stock_balances` atualizados **apenas** por função de movimentação (mesma transação) + rotina de reconciliação contra o ledger.
- H3: Comprometimento de ata idem (`ata_commitments` como ledger; saldo derivado/atualizado transacionalmente).
- H4: Jobs via Vercel Cron → Route Handler protegido por segredo, com lock em `scheduled_job_runs` (idempotência).
- H5: Varredura antivírus indisponível inicialmente: validação de MIME por magic bytes, extensão, tamanho, hash SHA-256.
- H6: Progresso calculado por view/função SQL (fonte única), não coluna editável; `documental_completed_at` mantido por função.
- H7: Notificações apenas internas, deduplicadas por `(tipo, entidade, destinatário, marco)` único.

## 4. Mapa de arquitetura

```
Browser ──> Next.js (RSC + Server Actions + Route Handlers)
              │  Zod (entrada) → authz → Service (domínio) → Repository
              ▼
        Supabase: Auth │ Postgres (RLS + RPC transacionais) │ Storage privado
              ▲
Vercel Cron ──┘ (jobs: alertas, reconciliação, limpeza)
```

Estrutura de pastas (por domínio):

```
src/
  app/(auth)/ (app)/ api/
  modules/<dominio>/{schemas,service,repository,actions,components}
    identity, councils, processes, documents, purchases, atas,
    contracts, materials, inventory, transfers, suppliers,
    meetings, notifications, reports, retention, audit
  shared/{ui,lib/result,lib/authz,lib/db,design-tokens}
supabase/{migrations,seed,tests}
docs/
```

Padrão de resposta: `Result<T> = { ok: true, data } | { ok: false, code, message, fieldErrors? }`. Erros de banco nunca vazam ao cliente.

## 5. Modelo relacional (núcleo, refinado)

- **Identidade:** `profiles(id=auth.users.id, full_name, is_special_deleter)`; `councils`; `council_memberships(user_id, council_id, role)` UNIQUE(user,council); papéis: `central_admin`, `council_manager`, `council_operator`, `viewer`. `central_admin` é global (tabela `platform_roles`). Remoção de `roles/permissions` dinâmicos no MVP (enum + matriz em código/SQL) — evita complexidade.
- **Processos:** `administrative_processes(council_id, number, year, status_admin enum, documental_completed_at, documental_snapshot jsonb)` UNIQUE(council_id, number, year); `document_types` (7 seeds); `process_documents(process_id, type_id, status: active|replaced|archived|disposed)`; `process_status_history`.
- **Arquivos:** `attachments(storage_path, sha256, mime, size, upload_status: pending|confirmed|failed, retention_state)`, `attachment_versions`; `retention_policies`, `retention_authorizations`, `retention_holds`, `document_cleanup_jobs`.
- **Atas:** `price_registration_atas`, `_items`, `ata_participants`, `ata_allocations`, `ata_commitments` (ledger com `event_type`, `legal_basis`), `ata_extensions`.
- **Contratos:** `contracts`, `contract_amendments` (guarda vigência/valor anteriores e novos), `contract_documents`.
- **Compras:** `purchase_requests`, `_items`, `_approvals`, `_history`; `receipts`, `receipt_items` (esperado/recebido/pendente).
- **Estoque:** `materials`, `stock_balances(material, council, physical, reserved)` CHECK ≥0, `stock_movements` (append-only, `idempotency_key` UNIQUE), `stock_reservations`, `stock_adjustments`.
- **Transferências:** `stock_transfers`, `_items`, `_events`.
- **Demais:** `suppliers`, `meetings`, `meeting_participants`, `meeting_minutes`, `meeting_action_items`, `notifications` (UNIQUE dedup), `notification_preferences`, `audit_logs` (append-only, sem UPDATE/DELETE por RLS), `system_settings`, `scheduled_job_runs`.
- Valores: `numeric(15,2)`; quantidades: `numeric(15,3)`; datas de vigência: `date`; eventos: `timestamptz`.

## 6. Matriz de permissões (resumo)

| Ação | Admin central | Gestor | Operador | Consulta | Warley |
|------|:-:|:-:|:-:|:-:|:-:|
| Ver todos os conselhos | ✔ | — | — | — | ✔ (se admin) |
| Ver dados do próprio conselho | ✔ | ✔ | ✔ | ✔ | — |
| Criar/editar conselho e usuários | ✔ | — | — | — | — |
| Criar processo / anexar documento | ✔ | ✔ | ✔ | — | — |
| Remover (desvincular) documento ativo | ✔ | ✔ | — | — | — |
| Criar solicitação | ✔ | ✔ | ✔ | — | — |
| Aprovar/rejeitar solicitação, transferência | ✔ | ✔ | — | — | — |
| Registrar entrada/consumo | ✔ | ✔ | ✔ | — | — |
| Ajuste de estoque | ✔ | ✔ | — | — | — |
| Cadastrar ata/contrato/prorrogar | ✔ | ✔ (próprio) | — | — | — |
| Ver auditoria | ✔ | próprio conselho | — | — | — |
| **Exclusão manual definitiva** | ✘ | ✘ | ✘ | ✘ | **✔ (UUID fixo)** |

Nota: "remover" por usuários comuns = desvincular/versionar (soft), nunca eliminar fisicamente.

## 7. Máquinas de estado

- **Solicitação:** rascunho→enviada→em_análise→(aguardando_correção↔em_análise)→aprovada|rejeitada→em_atendimento→parcialmente_atendida→atendida; cancelada a partir de rascunho/enviada/em_análise/aprovada. Rejeitada só reabre por ação explícita autorizada.
- **Transferência:** solicitada→em_análise→aprovada(reserva)→separada→em_trânsito(saída confirmada)→recebida(entrada no destino); rejeitada/cancelada libera reserva; divergência registrada na recepção.
- **Reunião:** agendada→realizada|cancelada|reagendada(→agendada).
- **Processo (admin):** em_andamento↔aguardando_providência→concluído|cancelado→arquivado.

## 8. Contratos entre agentes

1. Tipos de domínio e enums em `src/modules/<dominio>/schemas` (Zod) = fonte única; gerar tipos SQL via Supabase CLI.
2. Toda mutação crítica = função SQL `SECURITY INVOKER` (ou `DEFINER` justificada, com `search_path` fixo e checagem interna de `auth.uid()`).
3. Serviços retornam `Result<T>`; actions só orquestram.
4. Migrations imutáveis após aplicadas; correções por nova migration.
5. Cada módulo: dono único, mudanças de contrato via PR no `docs/`.

## 9. Backlog por dependência

1. **F2 Fundação:** Next.js + TS strict + Tailwind/shadcn, Supabase local, auth por convite, `profiles/councils/memberships`, RLS base, layout/sidebar, `audit_logs`, Result/erros.
2. **F3 Processos:** 7 tipos, upload confirmado (2 fases), função de progresso, histórico, testes dos cenários A.
3. F4 Fornecedores/Atas/Contratos → F5 Compras/Estoque/Transferências (testes de concorrência) → F6 Reuniões/Alertas → F7 Relatórios/Retenção → F8 Homologação.

Primeiras tarefas independentes (paralelizáveis após aprovação): (a) Dados: migration inicial + RLS; (b) UX: design tokens e componentes base; (c) DevOps: scaffolding e CI; (d) QA: harness de testes SQL/RLS.

## 10. Riscos

- Eliminação física sem política aprovada (mitigado por P2/padrão seguro).
- Concorrência em saldos (mitigado por locks + testes).
- Escopo gigantesco: entrega estritamente incremental por fase.
