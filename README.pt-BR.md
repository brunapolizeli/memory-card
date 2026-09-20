[🇺🇸 English](README.md) | [🇧🇷 Português](README.pt-BR.md)

## ⚠️ Status Atual

Em desenvolvimento ativo, mobile-first. Desktop ainda não é suportado.

Para a melhor experiência, visualize em um dispositivo móvel, use o modo de emulação mobile do navegador, ou redimensione sua janela para ~375–425px.

---

# Memory Card

Um rastreador pessoal de videogames desenvolvido com JavaScript vanilla, Node.js, Express e PostgreSQL.

[**Demo ao vivo: memcard-log.vercel.app**](https://memcard-log.vercel.app/)

---

## Visão Geral do Projeto

Memory Card é um rastreador de videogames full stack, com autenticação própria, banco de dados PostgreSQL normalizado, API REST e integração com a API da RAWG.

O projeto está sendo desenvolvido com uma identidade visual inspirada em Frutiger Aero (2004–2013) e uma abordagem mobile-first.

---

## Funcionalidades

- Cadastro e login próprios com hash de senhas usando bcrypt
- Sessões baseadas em JWT armazenadas em cookies httpOnly
- Modal de login/cadastro com validação e mensagens de erro específicas por campo
- Header e footer compartilhados, renderizados por meio de um módulo JavaScript reutilizável, com estado de login/logout em tempo real
- Navegação mobile com menu hamburger
- Carrossel de **Currently Playing** preenchido com dados da biblioteca do usuário
  - Navegação com scroll-snap e indicadores de paginação sincronizados por IntersectionObserver
  - Até 5 jogos, com link para a biblioteca completa quando houver mais
  - Estados separados para usuário deslogado, biblioteca vazia e biblioteca com jogos
- Busca de jogos pela API da RAWG por meio de um proxy no backend
- Fluxo de **Add Game** para adicionar jogos da RAWG à biblioteca do usuário
  - Entradas já existentes no catálogo compartilhado `games` são reutilizadas em vez de duplicadas
- Página **Library** com:
  - Grid paginado com os jogos do usuário
  - Remoção de jogo com modal de confirmação
  - Navegação para a página de detalhes de cada jogo
- Página de **detalhes do jogo** com:
  - Acompanhamento de progresso (não iniciado / iniciado / completo / platina)
  - Seleção de status entre 7 estados (Wishlist, Backlog, Playing, On Hold, Finished, Replaying, Dropped)
  - Seleção de plataforma via lista pesquisável, alimentada pela API de plataformas da RAWG
  - Horas e minutos jogados editáveis, com sanitização de entrada
  - Avaliação do usuário em escala de 6 estrelas, com rótulo dinâmico e colorido
- Estrutura de banco de dados normalizada utilizando as tabelas `games` e `user_games`

---

## Funcionalidades Planejadas

- Filtros e ordenação na Library por status, plataforma, gênero/tag, conclusão, tempo de jogo e avaliação
- Dificuldade, datas de conclusão/platina e observações na página de detalhes do jogo
- Página de **perfil** com estatísticas e gráficos
- Layout responsivo para desktop

---

## Estrutura do Projeto

```text
memory-card/
├── client/
│   ├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── render/
│   │   ├── shared/
│   │   ├── api.js
│   │   ├── config.js
│   │   └── main.js
│   ├── index.html
│   ├── library.html
│   └── game.html
├── server/
│   ├── db/
│   ├── middleware/
│   ├── migrations/
│   ├── routes/
│   ├── package.json
│   └── server.js
├── README.md
└── README.pt-BR.md
```

---

## Tecnologias

- **Frontend:** JavaScript vanilla, HTML5, CSS3
- **Backend:** Node.js, Express
- **Banco de Dados:** PostgreSQL hospedado na [Neon](https://neon.tech)
- **Migrations:** `node-pg-migrate`
- **Autenticação:** bcrypt, JSON Web Tokens, cookies httpOnly
- **API Externa:** [RAWG Video Games Database API](https://rawg.io/apidocs)
- **Deploy:** Vercel

---

## Créditos

O projeto está sendo desenvolvido do zero com base em um prompt de projeto e uma [referência Figma](https://www.figma.com/design/hE5klIn1AEQ9XWZWmurs7y/Learning-Journal-Blog?node-id=0-1&t=5IRAjYyGX68SigMk-1) da Scrimba, que forneceram o conceito inicial do frontend e uma referência de layout. O backend, a arquitetura do banco de dados, autenticação, integração com APIs e as decisões posteriores de funcionalidades e design foram desenvolvidos além do briefing original da Scrimba.

Dados dos jogos e imagens de capa são fornecidos pela [API da RAWG](https://rawg.io).

Os ícones utilizados na interface foram gerados com o ChatGPT.

---

## Licença

Licenciado sob [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Livre para visualização e avaliação; modificações, redistribuição e uso comercial não são permitidos.
