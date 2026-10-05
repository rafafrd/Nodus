# ADR 0001 — ambiente inicial Windows

Data: 01/10/2026. Estado: Aceita para o bootstrap. Ticket inicial: ALP-01.

## Contexto

O usuário escolheu Windows nativo e repositório novo. A primeira pública atende Windows, com até 3 h humanas por semana e necessidade de abrir a build empacotada.

## Decisão

Desenvolver e validar inicialmente no Windows nativo. Base proposta do host: Node.js 24 LTS, npm e Git for Windows. Use um gerenciador/lockfile da aplicação. Registre versões exatas e compatibilidade em ALP-01; .node-version registra a base principal, não instala Node.

## Alternativas e consequências

WSL2 foi oferecido e o usuário preferiu nativo. WSL2/Docker continua no plano dos laboratórios futuros. Validação Linux pode apoiar código compartilhado, mas não aprova build Windows. Electron embarca runtime próprio; documente-o separado do Node do host.

## Evidência

Escolha do usuário nesta etapa. Referências de ferramentas no setup Windows. Instalação no PC ainda não executada por este pacote.

## Acompanhamento em 03/10/2026

Windows nativo/Node24 portátil/empacotamento foram executados em ALP-01; ver ../validation/ALPHA.md e ../decisions/runtime-mvp.md. O registro acima descreve a decisão original, não o estado atual.
