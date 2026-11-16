# Áudio, transcrição e proposta de ata

Em `/reunioes`, selecione uma reunião para gravar no navegador ou anexar um áudio existente (WebM, MP4/M4A, OGG ou MP3, até 25 MB). Depois de parar a gravação, reproduza a prévia, confira ou edite a transcrição e salve. O áudio fica no bucket privado `meeting-audio`; a reprodução usa uma URL assinada com validade de uma hora. O sistema registra a inclusão na auditoria.

O reconhecimento de fala ao vivo usa a Web Speech API do navegador, em `pt-BR`, com resultados parciais durante a gravação. [O suporte varia por navegador](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition); em alguns deles, o áudio pode ser processado por um serviço do fabricante do navegador. Quando não houver reconhecimento disponível, a gravação e o campo de transcrição manual continuam funcionando.

Após marcar a reunião como **realizada**, o botão **Gerar proposta com IA** usa a transcrição registrada para criar um rascunho pelo Groq. A proposta aparece no campo de edição e **não é salva automaticamente**: uma pessoa deve revisar e clicar em **Salvar ata revisada**. Sem `GROQ_API_KEY`, a ata pode ser escrita manualmente.

Para ativar o armazenamento, aplique `supabase/migrations/20261116000002_meeting_audio.sql` no banco da aplicação e publique o código. O bucket continua privado e não concede acesso público aos arquivos.
