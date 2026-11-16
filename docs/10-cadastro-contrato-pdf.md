# Cadastro de contrato a partir de PDF

Em **Contratos → Novo contrato**, selecione um PDF com texto selecionável (até 10 MB e 30 páginas) e clique em **Ler PDF**. O sistema extrai o texto localmente no servidor e envia até 35 mil caracteres ao Groq para identificar empresa/fornecedor, CNPJ, número, objeto, início, fim/validade e valor global. O arquivo não é salvo por esse fluxo.

Os campos retornados são apenas uma proposta. Confira e corrija todos os valores antes de clicar em **Confirmar e cadastrar contrato**. Quando o fornecedor já existe, selecione-o; caso contrário, informe nome e, se disponível, CNPJ para cadastrá-lo junto com o contrato. O sistema valida a permissão de cadastro para o órgão escolhido.

PDFs digitalizados sem texto selecionável exigem OCR antes da leitura. A extração depende de `GROQ_API_KEY`; o formulário manual continua disponível sem a chave. Para documentos longos, apenas os primeiros 35 mil caracteres são analisados, e a tela avisa sobre o corte.
