---
id: MED-01
status: doing
outcome: em_andamento
depends_on: ["ALP-03","ALP-05","UI-02"]
criteria_count: 7
---

# MED-01 — YouTube, cinema e PiP

Pedido de 03/10/2026: salvar links de vídeos do YouTube, assistir em modo cinema e em PiP arrastável. Branch codex/youtube-cinema parte de 2690372. Incremento local por matéria, sem downloads de vídeo ou chave de API.

C1. Salvar/listar/remover vídeo com título, ID estável e link normalizado por matéria; formatos watch/youtu.be/shorts/embed e tempo inicial, argumentos inválidos negados no main.
C2. Migração aditiva conserva notas/mesas/PDF/jogo/projetos; reiniciar restaura lista e seleção, sem conectar ao YouTube automaticamente.
C3. Player oficial funciona em superfície isolada, sem preload/Node/IPC/arquivos; URL construída a partir do ID validado, navegação/popups/permissões/downloads negados, sessão separada e identificação HTTP Referer.
C4. Modo cinema destaca o vídeo e retorna à mesa com Escape/controle, conservando o mesmo player e rascunho.
C5. PiP interno arrastável por cabeçalho, ajustável por teclado, contido após resize e disponível no Explorer; controles de voltar/cinema/fechar acessíveis.
C6. Transições normais/reduzidas conservam reprodução ao mudar cinema/PiP/mesa; fechamento para reprodução e não apaga link. Falha externa é visível e permite nova tentativa.
C7. Typecheck, testes pertinentes, pacote e jornada Windows real; capturas, audit independente, guia/contratos/arquitetura/quadro/validação, commits e push com limites registrados.

## Plano e retomada

Contratos/migração/lista → superfície isolada → biblioteca/cinema/PiP/movimento → testes reais de dados/isolamento/reprodução → audit e documentos → commits/push. C1–C6 aprovados em [YOUTUBE](../../validation/YOUTUBE.md): schema v4/URLs/dedup/preservação, player oficial real/isolamento, cinema/PiP arrastável com continuidade, crash/retry. Windows Node24.21/Electron44.5, 21 testes/typecheck/package e novas jornadas/regressões passaram. Fix do gate oculto sob cinema observado pelo auditor verificado no pacote. Audit independente final aprovado com mitigações, fonte congelada/suplemento final conferidos, sem achado de código aberto; High de tooling permanece delimitado. C7 pendente de scan do stage documental/commit/push; próxima ação concreta: enviar checkpoints autorizados e fechar quadro. Perfis/capturas/build são locais ignorados, sem dados pessoais.
