# Graphify neste repositório

O Graphify cria um grafo estrutural do código para consultas curtas sobre símbolos e dependências. O grafo versionado está em `graphify-out/graph.json`; o resumo está em `graphify-out/GRAPH_REPORT.md`. A visualização HTML e o cache são gerados localmente e ignorados pelo Git.

## Preparar no Windows

Requer Python 3.11.5 a 3.14. Na raiz do projeto, em PowerShell:

```powershell
python -m venv .graphify-venv
.\.graphify-venv\Scripts\python.exe -m pip install "graphifyy[sql]==0.9.120"
```

O pacote oficial no PyPI chama-se `graphifyy` (dois `y`), do projeto [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify). A skill do Codex já está em `.codex/skills/graphify/` e deve aparecer nas próximas sessões.

## Consultar antes de abrir muitos arquivos

```powershell
.\.graphify-venv\Scripts\graphify.exe query "PurchaseRequestService receive" --budget 450
.\.graphify-venv\Scripts\graphify.exe path "PurchaseRequestService" "SupabasePurchaseRequestRepository" --undirected
.\.graphify-venv\Scripts\graphify.exe explain "PurchaseRequestService"
```

Confirme no código as linhas indicadas pelo grafo antes de alterar comportamento. Uma consulta curta pode reduzir o contexto enviado ao agente; não há economia garantida para toda tarefa.

## Atualizar após mudanças de código

```powershell
.\.graphify-venv\Scripts\graphify.exe update .
```

Para reconstruir do zero sem chamadas a modelo, incluindo SQL:

```powershell
.\.graphify-venv\Scripts\graphify.exe extract . --code-only
.\.graphify-venv\Scripts\graphify.exe cluster-only . --no-label
```

Esses comandos analisam código localmente. Documentos e PDFs não foram indexados; a integração não altera a IA do produto nem acrescenta RAG à aplicação.
