# ADR-0012 — Tema Editorial e classificação local de projetos

Estado: aceita para UI-03, 06/10/2026. Complementa [ADR-0009](0009-preferencias-locais.md).

O usuário pediu um frontend quase preto, denso, serifado nos títulos, sans/mono nos controles/metadados, com grid e bordas em lugar de sombras. A referência é um portfólio; o produto permanece uma mesa/dashboard de estudos. O design anterior deve continuar disponível como tema.

Editorial é o default de novos perfis. Perfis existentes conservam o tema salvo, inclusive Oliva; trocar exige somente escolher Editorial em Ajustes/Aparência. Estilos do novo tema são delimitados por data-theme=editorial. As paletas anteriores e a apresentação anterior de Hoje continuam disponíveis. A cidade conserva as cores da cena e os materiais PDF/vídeo conservam sua aparência original.

Principais/secundários são uma preferência de organização, armazenada como featuredProjectIds na chave preferences já existente. A validação admite até 40 UUIDs distintos; o renderer classifica apenas os projetos registrados no catálogo. Perfis antigos recebem a lista vazia na leitura, sem reescrita ou reset. Update e auditoria continuam na mesma transação existente. Nenhuma migration, dependência, acesso a arquivo ou canal privilegiado novo é necessário.

O catálogo mostra duas seções, classificação por botão e árvore correspondente. Abas/rascunhos continuam no mecanismo existente do Explorer. A vista geral pode ser aberta sem fechar abas. A organização não renomeia nem move pastas e não mede prioridade acadêmica.

Alternativas: substituir globalmente o CSS perderia o tema anterior; recalcular principais pela ordem das pastas não conservaria a escolha do usuário; adicionar uma migration para essa preferência ampliaria desnecessariamente a mudança. Manter duas apresentações completas da mesa duplicaria os fluxos de dados; apenas a apresentação histórica de Hoje foi isolada.

Provas e limitações em [EDITORIAL_DESIGN](../validation/EDITORIAL_DESIGN.md).
