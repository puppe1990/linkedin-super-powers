# LinkedIn Super Powers

Extensao Chrome para melhorar fluxos dentro do LinkedIn sem sair do feed.

## O que faz

- Abre notificacoes em um drawer lateral sem navegar para a pagina de notificacoes.
- Adiciona a acao `Extrair posts` no menu `Eu`.
- Extrai dados iniciais dos posts visiveis no feed.
- Salva os posts extraidos em `localStorage` com a chave `lnsp-extracted-posts`.
- Mostra os posts extraidos em um dropdown no estilo do LinkedIn.

## Stack

- TypeScript
- Vite
- Vitest
- Chrome Extension Manifest V3

## Estrutura

```text
src/background          service worker
src/content             scripts injetados no LinkedIn
src/content/posts       extracao de posts, dropdown e persistencia
src/content/notifications  drawer e parser de notificacoes
src/popup               popup da extensao
public/manifest.json    manifesto da extensao
tests                   testes unitarios
```

## Instalar dependencias

```bash
npm install
```

## Rodar verificacoes

```bash
npm run test:run
npm run typecheck
npm run build
```

## Carregar no Chrome

1. Rode o build.
2. Abra `chrome://extensions`.
3. Ative `Modo do desenvolvedor`.
4. Clique em `Carregar sem compactacao`.
5. Selecione a pasta `dist`.

## Como usar

### Notificacoes

1. Abra o LinkedIn em `https://www.linkedin.com/feed/`.
2. Clique em `Notificacoes`.
3. A extensao intercepta o clique e abre um drawer lateral.

### Extracao de posts

1. No LinkedIn, abra o menu `Eu`.
2. Clique em `Extrair posts`.
3. A extensao coleta os posts visiveis no feed.
4. Os dados aparecem no proprio dropdown.
5. O resultado fica salvo no `localStorage`.

## Scripts

```bash
npm run build
npm run lint
npm run format
npm run format:check
npm run test
npm run test:run
npm run typecheck
```

## Limitacoes

- Os seletores dependem do HTML atual do LinkedIn.
- Mudancas no DOM do LinkedIn podem exigir ajuste nos parsers.
- A extracao atual salva apenas dados iniciais dos posts visiveis na tela.
