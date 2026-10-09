# ADR-0020 — Clareza do estudo e animação 3D por estado confirmado

Estado: aceita para UX-02, 09/10/2026.

## Contexto

O usuário autorizou revisão do projeto inteiro, acabamento visual e animação Three.js, preservando UX-01/GAM-05 e sem perguntas. O app já tem os módulos e operações necessários para escrever, importar, consultar material e progredir na Cidade. A apresentação pode tornar essas operações mais fáceis de reconhecer.

## Decisão

Hoje destaca um próximo passo usando o estado existente: primeira matéria, cartões vencidos, tarefa da última matéria ou retomada. Uma tarefa abre a matéria e seu checklist. A sugestão não altera datas, tarefas, recompensas ou domínio acadêmico. Referências de matérias ausentes são descartadas ao escolher uma sugestão.

Adicionar conteúdo é uma entrada comum para escrita, importação Markdown, PDF e link YouTube. Reutiliza operações/validações existentes e mostra a matéria de destino. A ação ocorre após o diálogo fechar; não há nova tabela, moeda, serviço ou envio automático à rede. Nova nota e nova matéria levam ao Caderno antes de abrir edição/formulário.

Uma composição 3D de livro, páginas e ideias conectadas aparece em Hoje e no primeiro uso. O texto e as ações ficam fora do canvas. O renderer limita a taxa a aproximadamente 30 quadros/s, usa DPR até 1,5 e pausa em áreas ocultas, minimização e fora do viewport. Movimento reduzido desenha uma composição estática, incluindo ao mudar a preferência durante um quadro. Falha gráfica mostra alternativa decorativa e conserva ações.

A Cidade usa água por shader, nuvens instanciadas, pontos de luz e partículas instanciadas após construção, recolhimento ou pulso com ganho confirmado pelo main. Os três projetos têm silhuetas próprias; uma estrutura em contorno indica o próximo projeto. Rodas e cargas dos postos pausam no estoque cheio. Motor esgotado pausa seu rotor. Antenas e indicadores do distrito produtivo se movimentam sem escalar a quantidade de objetos com unidades compradas.

O relógio de animação é separado do relógio econômico. Nenhum callback gráfico concede recursos/XP, modifica estoque ou acelera produção. Sombras são atualizadas por mudança de estado e aproximadamente uma vez por segundo durante animação, reduzindo passes sem remover as sombras de construções.

Ao concluir uma transição, áreas que não fazem parte da divisão usam display:none e fundo próprio. Os componentes continuam montados, preservando editor, rascunho, contexto e player; o gate de atividade/inert continua necessário. Durante a transição, as áreas participantes permanecem desenháveis.

## Consequências e validação

Sem mudança de schema/lockfile/IPC privilegiado. Quatro temas e três skins conservam suas escolhas. Há caminhos DOM independentes para locais, objetivos e ferramentas se WebGL falhar. O acabamento não comprova compreensão humana, desempenho em todos os GPUs ou provas externas da alpha.

Resultados e capturas em [VISUAL_EXPERIENCE](../validation/VISUAL_EXPERIENCE.md); relatório de uso em [Bom dia](../reports/BOM_DIA_2026-10-09.md). Implementação baseada nas APIs instaladas Three.js r186 e no índice da [documentação oficial](https://threejs.org/docs/). Os contratos e includes dos shaders foram conferidos na dependência instalada e por execução gráfica no pacote Windows.
