# PRD — decisões do produto

Estado em 03/10/2026: MVP local implementado, alpha integral parcial. Cidade/farm/loja/memória/build (GAM-01) e motor/QTE/skillcheck/Explorer com edição (GAM-02) foram antecipados por pedidos explícitos. MED-01 acrescenta links YouTube por matéria, cinema e PiP interno, com reprodução oficial que precisa de internet. CFG-01 oferece configurações de perfil local (nome/foto), três temas, animações e consulta/abertura das pastas do app. As jornadas abaixo são requisitos do produto completo; confira [estado real](../status/ALPHA_STATE.md) e evidências antes de considerá-las entregues.

EXP-01 oferece exportação explícita de uma pasta/subpastas de notas Markdown salvas, do vault ou Explorer, em PDF A4 formatado com fundo preto. Saída local em Downloads com capa/sumário/paginação, sem modificar fontes. O guia distingue caderno de leitura de backup completo; arquivos de código/PDFs anexados/imagens não entram. [Provas](../validation/PDF_EXPORT.md).

## Problema

Materiais/notas espalhados e acúmulo de conteúdo antes das provas. O app reúne uma mesa por matéria, planejamento ajustável e práticas com evidência de aprendizagem. Serve ao usuário individual e também será um projeto de destaque no portfólio.

## Jornadas escolhidas

| Frente | Resultado esperado |
| --- | --- |
| Estudo | Abrir uma tarefa concreta, PDF/nota e retomar a mesa anterior |
| Planejamento | Informar provas, conteúdo e horários; ajustar proposta e redistribuir sessões |
| Aprendizagem | Tutor referenciado, prática e correção ao fim da sessão com KPIs |
| Conhecimento | Sugestões de relações aceitas pelo usuário e grafo 3D com prévia lateral |
| Jogo | XP/moedas, Memória de Conceitos, farm, loja, habilidades e classes derivadas da build |
| Programação | JS/TS primeiro; projetos locais completos, editor, execução e Git manual |
| Celular | Consultar notas, links, agenda e progresso e receber lembretes sem depender do PC |
| Técnico posterior | Laboratórios locais de vulnerabilidades conhecidas e evidências de correção |

## Requisitos confirmados

Notas visuais com Markdown/Obsidian, arquivos originais no PC, serviços gerenciados, OpenRouter com chave própria e perfis/limites, Google Agenda acessível também pelo Calendário do iPhone. Alteração externa de sessão é adotada e pode voltar a ser reagendada; compromissos fixos continuam protegidos.

Foco tem duração escolhida. Revisões se adaptam ao desempenho; status acadêmico tem critérios visíveis e fica separado do XP. Quizzes mostram fontes; o tutor identifica complemento de conhecimento geral e ajuda com outro exemplo antes de voltar ao exercício. Correções consolidadas ao final da sessão.

Estudo e minigames podem gerar moedas/XP; farm híbrido com coleta automática e interações, loja, respec gratuito e classes derivadas dos pontos. Motor clicável com upgrades é a fonte principal ativa de farm; moinho continua passivo. QTE e skillcheck são desafios opcionais de timing com ritmo tranquilo/normal. Primeiro jogo: memória sem limite de tempo, com conceito/definição, conceito/exemplo e fórmula/situação. Progresso é preservado durante ausência.

## Recortes

Alpha: matérias, nota preservadora, mesa, PDF, foco, checklist e snapshot web. Primeira pública: núcleo ampliado, grafo, farm/loja/builds e programação JS/TS. Python/SQL e laboratórios vêm nos incrementos seguintes. A ordem histórica foi ajustada pelos pedidos GAM-01/GAM-02: jogo local e navegação/edição de projetos existem; execução, terminal, Git de projetos, nuvem e IA continuam futuros. Consulte tickets e estado atual para a ordem efetiva.

Capacidade humana: até 3 horas por semana. Meta inicial de 2–3 meses é condicional; preserve funcionalidades e ajuste o prazo se os checkpoints exigirem. Nome/marca, licença e valores de orçamento não foram fechados.
