---
id: CFG-01
status: doing
outcome: em_andamento
depends_on: ["ALP-03","UI-02","MED-01"]
criteria_count: 6
---

# CFG-01 — Configurações, aparência e perfil local

Pedido: aba de configurações com temas, desligar animações, nome/foto editáveis e gerenciamento do app. Branch codex/settings-profile parte de 92cc357; autorização vigente de commits/push por fases.

C1. Área Configurações na barra fixa, navegação/retorno conservam buffers de notas/projetos, PDF e contexto; PiP permanece disponível e áreas ocultas não capturam atalhos.
C2. Três temas sóbrios persistentes (Oliva, Grafite, Azul noite), aplicados à interface/editores/diálogos sem recriar documentos ou cidade.
C3. Controle persistente de animações complementa preferência do sistema; altera GSAP/CSS/Three dinamicamente, mantendo timing essencial de foco/minigames e reprodução remota.
C4. Nome/foto locais editáveis; foto PNG/JPEG limitada/validada e normalizada antes de persistir, opção de remover, restart conserva perfil e preferências. Sem caminhos/HTML/URL remota arbitrários no renderer.
C5. Gerenciamento mostra versão/runtime/pastas e contagens reais; operações de pasta recebem enum e resolvem apenas diretórios registrados. Erros não confirmam sucesso nem eliminam dados.
C6. Testes/argumentos/rollback/pacote e jornada Windows reais, capturas, audit independente, docs/memória/quadro e commits/push registrados com limites.

## Plano e retomada

Preferências/contratos e foto normalizada → área/perfil/temas → controle comum de movimento → provas de dados/UI/restart/isolamento e regressões → audit/docs/commits/push. Implementação/pacote/typecheck/24 testes/test:settings final aprovados, com perfil/photo/3 temas/off/on/OS/gestão/restart/BOM/CRLF e sixIPCsender recusados; critérios C1–C5 com provas em [SETTINGS](../../validation/SETTINGS.md). Primeira ação restante: scan documental, checkpoint de docs e push; parecer independente aprovado com mitigações; Settings/Videos/Journey/Smooth-ui passaram no pacote final, correção O-011 comprovada. C6 ainda não aprovado.
