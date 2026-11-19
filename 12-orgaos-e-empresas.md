# Órgãos e empresas no Acompanhamento

O grupo **Acompanhamento** reúne Processos, Contratos, Atas e Fornecedores. O cadastro de organizações, disponível para a administração central/assessoria, agora distingue:

- **Órgão público**: tipo padrão aplicado aos cadastros existentes.
- **Empresa privada**: organização privada atendida pela assessoria, com o mesmo fluxo de solicitações, processos, contratos, estoque e reuniões.

Em **Órgãos e empresas → Cadastrar organização**, escolha o tipo antes de preencher nome, sigla, WhatsApp e informações institucionais. O tipo também aparece na listagem e pode ser alterado na visão 360°. Criações e alterações continuam registradas na auditoria.

Para ativar o campo no banco, aplique `supabase/migrations/20261116000003_private_organizations.sql`. A migração preserva os registros atuais e os classifica como `public_body`.
