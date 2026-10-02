> Registro histórico do pacote original. A validação desta edição do script aparece ao final; nenhuma seção comprova a aplicação no PC do usuário.

# Validação do bootstrap

Data: 01/10/2026, America/Sao_Paulo. Escopo: documentação, quadro e verificador deste pacote. Aplicação Electron, instalação no PC e serviços externos não foram testados.

## Ambiente da revisão

Linux x64; Node.js v24.19.0; npm 11.9.0; Git 2.51.1. Codex CLI e PowerShell não estavam disponíveis neste ambiente. A base escolhida para o uso real continua Windows nativo.

## Verificações executadas

| Verificação | Resultado observado |
| --- | --- |
| node --check scripts/check-bootstrap.mjs | Aprovado, saída 0 |
| node scripts/check-bootstrap.mjs | Aprovado: 11 tickets, 70 critérios, 47 arquivos Markdown e 61 links locais |
| Status divergente da pasta, em cópia isolada | Rejeitado como esperado, saída 1 |
| Ticket movido a done com resultados não verificados, em cópia isolada | Rejeitado como esperado, saída 1 |
| Link local quebrado, em cópia isolada | Rejeitado como esperado, saída 1 |
| Movimentação consistente todo → doing, em cópia isolada | Aceita, saída 0 |
| git init -b main no diretório de revisão | Repositório local de revisão criado; nenhum commit/remote |
| git check-ignore para .env, .env.local, vault, banco local e dependências | 5 caminhos ignorados como esperado |
| git check-ignore para exemplo de ambiente, AGENTS, ticket e verificador | 4 candidatos a versionamento não ignorados |
| Integridade do ZIP e seleção dos arquivos | Conferida na criação do pacote: sem .git, arquivos pessoais ou dados de runtime |

Os casos alterados foram executados em cópias temporárias, com comparação do código de saída e da mensagem esperada. Não modificaram o quadro entregue: todos os tickets continuam em todo/a_fazer.

## Limites da evidência

O verificador checa consistência e a presença de referência de evidência; não autentica uma evidência nem comprova a aplicação. Critérios ALP continuam não verificados. Comandos de instalação, login, primeiro commit, GitHub e execução do Codex no Windows são instruções para o PC do usuário.

Os arquivos originais de planejamento foram copiados das versões atuais lidas nesta etapa. AGENTS.md, CLAUDE.md, gotcha.md, ADRs e SDD foram revisados como instruções/documentação, sem alegação de implementação da arquitetura.

## Edição do script único — 02/10/2026

Pedido atual: gerar somente estrutura e conteúdo, sem executar Git/Node ou instalar/configurar ferramentas. O script BOOTSTRAP_APP_ESTUDOS.ps1 tem somente os parâmetros Destination e Force; seus comandos executáveis são operações de arquivos, inspeção de caminhos e mensagens.

Verificação realizada pelo autor em Linux x64, PowerShell 7.5.11 e Node v24.19.0, com diretórios temporários isolados:

| Caso | Resultado observado |
| --- | --- |
| Geração e conteúdo | 59 arquivos, bytes UTF-8/LF comparados com os conteúdos esperados; sem Git/app criado |
| Caminhos | Espaços, acentos, colchetes e apóstrofo aceitos |
| Repetição | Zero arquivos regravados; conteúdo e timestamps preservados |
| Arquivo divergente sem Force | Recusado antes de gravar qualquer arquivo, inclusive arquivo ausente |
| Substituição com Force | Conteúdo anterior salvo em pasta irmã; extras e marcador Git preservados |
| Links e colisões de caminho | Link de pasta e colisões arquivo/pasta recusados antes de gravar |
| Raiz de sistema de arquivos | Recusada |
| Verificador documental | 11 tickets, 70 critérios, 51 arquivos Markdown, 73 links locais |
| Parser PowerShell | Sem erros; sintaxe recente de ternário/pipeline chain não usada |

Execução nativa no Windows e PowerShell 5.1 não foi feita neste ambiente. A base sintática alvo é PowerShell 5.1, sem alegação de prova nesse runtime. Esses resultados avaliam o script/documentos; todos os critérios da aplicação continuam não verificados.
