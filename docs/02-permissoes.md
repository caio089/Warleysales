# Matriz de permissões

Fonte única no código: `src/shared/lib/authz/policy.ts` (testada em `policy.test.ts`). Admin central tem acesso global às ações abaixo, **exceto** `data.delete_manual` (R13).

| Ação | Gestor | Operador | Leitor | Admin central |
|---|:-:|:-:|:-:|:-:|
| Ler conselho/dados do conselho | ✔ | ✔ | ✔ | ✔ |
| Criar processo / anexar documento | ✔ | ✔ | – | ✔ |
| Desvincular documento | ✔ | – | – | ✔ |
| Criar solicitação de compra | ✔ | ✔ | – | ✔ |
| Aprovar/rejeitar solicitação | ✔ | – | – | ✔ |
| Solicitar transferência | ✔ | ✔ | – | ✔ |
| Decidir transferência | ✔ | – | – | ✔ |
| Movimentar estoque | ✔ | ✔ | – | ✔ |
| Ajustar estoque / materiais / mínimos | ✔ | – | – | ✔ |
| Fornecedores, atas, contratos | ✔ | – | – | ✔ |
| Reuniões | ✔ | ✔ | – | ✔ |
| Relatórios | ✔ | – | ✔ | ✔ |
| Auditoria | ✔ (seu conselho) | – | – | ✔ |
| Conselhos, usuários, retenção | – | – | – | ✔ |
| **Exclusão manual** | – | – | – | – (somente `is_special_deleter`) |

Regras: leitura de entidade de outro conselho responde NOT_FOUND (oculta existência); tentativas negadas são auditadas; flags `is_central_admin`/`is_special_deleter` só mudam via SQL/service_role (coluna sem UPDATE para `authenticated`).
