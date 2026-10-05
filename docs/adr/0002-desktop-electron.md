# ADR 0002 — base Electron, React e TypeScript

Data: 01/10/2026. Estado: Aceita como direção do backlog. Ticket: ALP-01.

## Contexto e decisão

Desktop instalado no Windows, preferência por JavaScript/TypeScript e Node nas integrações locais. A fundação usa Electron, React e TypeScript com processo principal, preload e interface separados. Exponha operações específicas por IPC tipado/validado; preview futuro de projetos terá superfície própria.

## Alternativas e consequências

Um desktop baseado em outro runtime exigiria integrações diferentes da preferência local escolhida. A alpha usa a base do backlog; troca de framework exige nova decisão, em vez de uma mudança incidental durante um ticket. Versões, ferramenta de build e estrutura mínima serão demonstradas em ALP-01. Não crie um framework interno para todas as funções futuras.

## Evidência

Critérios de ALP-01 ainda não verificados. Aceitar esta direção não equivale a uma build Windows funcionando.

## Acompanhamento em 03/10/2026

ALP-01 foi verificado no Windows nativo e está done; ver ../validation/ALPHA.md. Aceitação da direção e prova de execução têm registros separados.
