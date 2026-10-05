# ADR-0009 — Preferências, perfil local e movimento

Estado: aceita para CFG-01, 03/10/2026.

O usuário pediu configurações de tema, animações, nome/foto e gestão do app. Notas e projetos precisam conservar seus editores e rascunhos durante essas mudanças.

Preferências ficam na chave `preferences` da tabela settings existente: nome, tema, animations e photo. Schema v4 permanece, sem migration/reset, conta ou sincronização. Ausência usa nome vazio/Oliva/animações ativadas/foto ausente; leitura inválida oferece defaults sem reescrever o valor armazenado. Salvamento validado e audit compartilham transação; o audit não inclui nome, foto ou caminho.

A foto chega como Uint8Array por capacidade específica, sem caminho ou URL arbitrários. Main aceita somente PNG/JPEG até 5 MiB, valida dimensões antes do codec (4096 px por lado/4 milhões de pixels), decodifica via nativeImage e confere tamanho novamente. Recorte central quadrado e resize 256×256 geram PNG estático; saída até380 KiB/base64 limitado. O byte original não é persistido. Uma URL remota ou SVG não entra nesse contrato. Validar header não demonstra segurança exaustiva do codec nativo.

Provider carrega preferências antes da mesa, aplica atributos de tema/movimento e confirma alterações só depois do IPC. Três paletas escuras usam variáveis CSS, incluindo editores, sem remount. As cores naturais dos materiais da cena Three permanecem próprias. Configurações são a quarta área persistente, com os mesmos gates de atalhos/cinema e filas de rascunhos.

Movimento efetivamente reduzido é `animations === false || prefers-reduced-motion`. Observador comum atende GSAP/Three e remove listeners ao desmontar; CSS desliga transições/decoração. Cronômetro de foco, timing de QTE/skillcheck e reprodução remota continuam essenciais. O controle do app não sobrepõe a preferência reduzida do Windows.

Gestão consulta contagens reais, versão/runtime, diretório do perfil/vault e tamanho de SQLite/WAL/SHM. Abrir pasta recebe exclusivamente enum data/vault, resolve diretório registrado/canônico e trata erro de shell.openPath. Não há terminal, URL/caminho genérico, limpeza de dados, updater ou importação automática. Backup é orientado: fechar app e copiar perfil/vault/PDFs/projetos originais.

Alternativas: perfil remoto ampliaria escopo de identidade/nuvem; persistir original de foto aumentaria superfície e armazenamento; recriar App/CodeMirror ao trocar tema arriscaria contexto. A solução usa infraestrutura existente e nenhuma dependência nova.

APIs conferidas em fontes oficiais: [nativeImage](https://github.com/electron/electron/blob/main/docs/api/native-image.md), [shell.openPath](https://www.electronjs.org/docs/latest/api/shell). Provas efetivas e limites em [SETTINGS](../validation/SETTINGS.md).
