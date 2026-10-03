# Arquitetura ativa

Estado em 03/10/2026: Electron/React/TypeScript, editor assistido, SQLite, vault, mesa por matéria, PDF, foco e checklist implementados no MVP local. GAM-01 acrescenta cidade Three.js e economia local, conforme regras específicas. GAM-02 acrescenta motor/desafios e Explorer/editor local de arquivos. MED-01 acrescenta links YouTube por matéria e um player remoto isolado com cinema/PiP. Supabase e consulta web ainda não implementados. Evidências em docs/validation/ALPHA.md.

## Estrutura proposta

Monólito modular com desktop e uma interface web complementar. Crie diretórios e abstrações quando o ticket precisar deles, evitando pacotes vazios para módulos futuros.

```mermaid
flowchart TB
  R["Interface desktop"] --> P["Preload e IPC"]
  P --> M["Serviços locais Node"]
  M --> V["Vault Markdown"]
  M --> L["SQLite local"]
  M -. "ALP-09 futuro" .-> S["Supabase"]
  W["Consulta web futura"] -.-> S
```

| Camada | Papel | Etapa |
| --- | --- | --- |
| Electron main/preload | Arquivos, SQLite e operações locais específicas | ALP-01/03/04 |
| React/TypeScript | Mesa e controles próprios | ALP-01/05 |
| Vault | Conteúdo canônico das notas | ALP-02/04 |
| SQLite | Identidade, referências, layout, foco, tarefas e operações | ALP-03 em diante |
| PDF | Leitura local com arquivo/página no checkpoint | ALP-06 |
| Jogo | Cidade/farm/loja/memória/build; economia autoritativa no main | GAM-01 |
| Explorer | Pastas reais, árvore, abas, fonte UTF-8, save/conflito/recuperação; sem execução | GAM-02 |
| Vídeos | Links locais por matéria; WebContentsView remoto isolado, cinema/PiP interno | MED-01 |
| Supabase + web | Snapshot de nota, Auth e acesso por proprietário | ALP-09 |

## Limites importantes

A interface não recebe acesso genérico ao sistema. Previews de código futuros ficam separados das APIs privilegiadas. Contratos são tipados e validados na fronteira; adaptadores de arquivos/banco ficam fora dos componentes.

Markdown e metadados portáveis devem ser preservados. SQLite pode guardar rascunho para recuperação, separado da nota canônica. Alteração externa limpa atualiza a visão; conflito mantém as versões.

No MVP local, SQLite guarda matérias/estado local; Markdown fica no vault e PDFs permanecem locais. Em ALP-09, Supabase receberá apenas snapshots de notas. No desenho completo, dados selecionados de planejamento/progresso/jogo terão sincronização própria; essa expansão não torna o banco da alpha automaticamente sincronizado.

## Próximas fronteiras

IA/OpenRouter, agenda Google, notificações, grafo Three.js e execução/Git de projetos seguem o roadmap. Navegação e edição de projetos foram antecipadas em GAM-02. Farm/loja/build têm um primeiro incremento local GAM-01; integração com notas e sincronização do jogo continuam futuras. Serviços locais continuam com Node; funções de nuvem devem respeitar seu runtime próprio. Não partilhe dependências de runtime no domínio apenas porque ambas usam TypeScript.

Veja [modelo de dados](data-model.md), [SDD](../sdd.md), [ADRs](../adr/README.md) e [arquitetura completa de concepção](../planning/ARQUITETURA_APP_ESTUDOS.md).

YouTube usa sessão efêmera separada, sem preload/Node/bridge/protocolo study; CSP da mesa continua sem frames. Só abrir um vídeo registrado inicia rede. URL/bounds específicos passam validação no main. A reprodução usa o mesmo guest entre modos, e fechar o destrói. [ADR-0008](../adr/0008-video-isolado.md) e [provas](../validation/YOUTUBE.md).
