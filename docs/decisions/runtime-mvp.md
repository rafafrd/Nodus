# Runtime do MVP

02/10/2026 — ALP-01. Electron 44.5.1, React 19.3.0, TypeScript 5.9.3, Vite 8.3.2. npm e package-lock.json fixam as dependências. Node 26.3.0 estava no PATH; Node 24.21.0 portátil foi obtido de nodejs.org e conferido contra SHA-256 oficial em .local, sem modificar o host. A instalação inicial usou npm 11.17.0/Node 26 e as verificações usam Node 24.

Main e preload são bundles CommonJS; React é uma build estática com protocolo próprio study://app. Sandbox, contextIsolation e webSecurity ativos; Node desativado no renderer. IPC confere webContents, frame principal e URL exata; argumentos são validados no main. Novas janelas, navegação externa e permissões são negadas. A versão retorna de app.getVersion() pelo preload. Previews futuros precisam de outra superfície sem esse preload.

Fontes consultadas: [segurança Electron](https://www.electronjs.org/docs/latest/tutorial/security), [Vite](https://vite.dev/guide/), [SQLite do Node](https://nodejs.org/api/sqlite.html). O lockfile é a referência das versões efetivamente instaladas.

CSP permite estilos inline para propriedades de layout/animação controladas pelo app; não permite scripts inline/eval nem conteúdo remoto. Conexão WebSocket de localhost é para desenvolvimento e será removida da build de produção. Artefato inicial é um diretório Windows sem assinatura, destinado a validação local.
