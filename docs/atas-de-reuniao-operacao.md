# Processamento de áudio e atas de reunião

O upload privado e a revisão manual funcionam sem IA. O módulo usa a gravação
original no bucket `meeting-audio` e registra a ata aprovada na própria reunião.

Para ativar o processamento externo em um ambiente autorizado, configure
`MEETING_EXTERNAL_AI=enabled`, `GROQ_API_KEY` e `CRON_SECRET` no servidor. Configure
um agendador para fazer GET em `/api/cron/meeting-ai` com o cabeçalho
`Authorization: Bearer <CRON_SECRET>`. A frequência depende da capacidade e do
orçamento aprovados. Cada chamada reserva no máximo um trabalho. Antes de
habilitar usuários, teste com áudio sintético e confirme a execução do agendador.

O processamento requer consentimento no formulário. A fila mantém estados
persistentes por reunião, recupera reservas expiradas e permite nova tentativa
após falha. Um trabalho interrompido após o envio ao provedor pode gerar nova
cobrança na recuperação. A reserva impede que um worker atrasado publique o
resultado de um trabalho que já foi reassumido.

Aplique a migration `20261127000001` antes de disponibilizar as novas ações no
ambiente de destino. O limite do arquivo é 25 MB e uma transcrição com mais de
20.000 caracteres entra em falha, sem substituir a gravação ou gravar texto
truncado. Atas históricas continuam disponíveis com identificação de registro
manual. Uma minuta sem aprovação não é exportada como ata.
