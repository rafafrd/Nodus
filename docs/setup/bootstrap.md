# Script único — estrutura e conteúdo

Arquivo entregue: BOOTSTRAP_APP_ESTUDOS.ps1. Salve fora da pasta que você pretende limpar. Todos os conteúdos estão embutidos: ele não depende de ZIP ou downloads.

## Executar

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\BOOTSTRAP_APP_ESTUDOS.ps1 -Destination "C:\dev\app-estudos"
```

O script somente cria pastas e arquivos com conteúdo. Não instala ferramentas, executa Node/Git, inicializa repositório, configura autor, cria commits, altera políticas globais ou inicia o Codex. ExecutionPolicy Bypass vale para o processo usado no comando. Git e Node já são ferramentas disponíveis no PC do usuário; confira versões durante ALP-01.

## Repetir e preservar

- Arquivos idênticos são preservados.
- Arquivos divergentes impedem qualquer gravação na estrutura antes de começar; use outra pasta ou -Force para substituí-los com backup.
- Com -Force, todos os arquivos divergentes são copiados para uma pasta irmã antes da substituição. Arquivos extras e metadados Git não são removidos.
- A raiz de volume e links/reparse points nos caminhos de saída são recusados. Caminhos com espaços e acentos são aceitos.
- O script usa sintaxe de PowerShell 5.1 e é salvo em UTF-8 com BOM; os arquivos criados usam UTF-8 sem BOM e LF.

| Parâmetro | Uso |
| --- | --- |
| -Destination | Raiz do projeto; padrão é a pasta atual |
| -Force | Substituir arquivos divergentes depois de backup |

Não use -Force para continuar uma implementação: ele pode repor documentos iniciais por cima de estados atualizados. Retome pela documentação atual em docs/status.

Depois de gerar, você pode verificar os documentos com node scripts/check-bootstrap.mjs. Esse comando não testa a aplicação. Abra a raiz no Codex e envie [o pedido de início](CODEX_START.md) para autorizar a implementação sequencial.
