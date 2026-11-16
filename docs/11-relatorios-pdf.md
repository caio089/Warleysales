# Relatórios em PDF

Na área **Relatórios**, o botão **Baixar relatório em PDF** gera o consolidado operacional com processos, estoque, contratos, atas e economia. Na aba de auditoria, **Baixar auditoria em PDF** respeita os filtros de órgão, módulo, tipo de evento, usuário, período e resultado.

O documento inclui cabeçalho institucional, data e horário de emissão em Fortaleza, usuário responsável, escopo, fonte dos dados e paginação. A trilha de auditoria é consultada novamente no servidor com as permissões do usuário. A exportação suporta até 5.000 eventos por arquivo; quando esse limite é atingido, o próprio PDF orienta a refinar os filtros.

Como o projeto ainda não possui a imagem oficial do papel timbrado, o cabeçalho textual usa os valores abaixo. Configure-os no ambiente de produção quando os dados oficiais forem definidos:

```env
REPORT_INSTITUTION_NAME=Nome oficial da instituição
REPORT_INSTITUTION_SUBTITLE=Subtítulo ou identificação da unidade
```

O padrão atual é **Warley - Central Operacional**. Os arquivos são gerados sob demanda, não ficam armazenados no servidor e são enviados como download privado.

## Análise com IA na tela de Relatórios

Os indicadores operacionais e a amostra de auditoria carregada recebem observações da IA quando `GROQ_API_KEY` está configurada. Cada observação exibe os indicadores numéricos de origem e links para consultá-los. O texto gerado não pode conter números próprios nem citar fontes desconhecidas; se a resposta falhar nessa validação, a tela mostra um resumo baseado nos dados calculados pelo sistema. A análise da auditoria abrange os eventos carregados no filtro, inicialmente até mil.
