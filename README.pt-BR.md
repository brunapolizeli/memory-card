# Memory Card

Um rastreador pessoal de videogames, com uma identidade visual Frutiger Aero (2004–2013) planejada para ser aplicada após a conclusão das funcionalidades principais.

[**Demo ao vivo — memcard-log.vercel.app**](https://memcard-log.vercel.app/)

---

## ⚠️ Status Atual

Este projeto está sendo desenvolvido com abordagem **mobile-first** e ainda está em **desenvolvimento ativo**; nem todas as funcionalidades foram implementadas, e apenas algumas delas estão descritas abaixo. Novos commits são adicionados regularmente, então volte futuramente para acompanhar o progresso. Os breakpoints para desktop serão adicionados somente após a experiência mobile estar completa.

Para visualizar o projeto corretamente em seu estágio atual, abra-o em um dispositivo móvel, use o modo de emulação de dispositivos móveis do navegador (DevTools → Toggle device toolbar) ou redimensione a janela para uma largura menor (~375–425px).

---

## Visão Geral do Projeto

Memory Card é um rastreador pessoal de videogames, desenvolvido individualmente e do zero como parte do Scrimba Full Stack Path.

O layout mobile-first do frontend é baseado no [design Figma do Learning Journal Blog da Scrimba](https://www.figma.com/design/hE5klIn1AEQ9XWZWmurs7y/Learning-Journal-Blog?node-id=0-1&t=5IRAjYyGX68SigMk-1), utilizado como referência inicial. A partir dele, o tema foi alterado de um diário de aprendizado para um rastreador de jogos, e uma identidade visual Frutiger Aero (2004–2013) está planejada para substituir o estilo original da Scrimba após a conclusão das funcionalidades principais. Um backend também está sendo desenvolvido do zero sobre o briefing de frontend fornecido pela Scrimba: autenticação própria, um schema PostgreSQL normalizado e uma API REST, combinados com um frontend em JavaScript vanilla, sem frameworks.

---

## Funcionalidades (implementadas até agora)

- Autenticação própria (cadastro e login) com hash de senhas usando bcrypt
- Sessões baseadas em JWT armazenadas em cookies httpOnly
- Modal de login/cadastro com alternância entre formulários e mensagens de erro específicas por campo (conflitos de e-mail ou nome de usuário, campos ausentes e credenciais inválidas)
- Header e footer compartilhados, renderizados dinamicamente e reutilizados entre páginas por meio de um módulo JavaScript
- Menu de navegação mobile do tipo hamburger
- Carrossel de **"Currently Playing"** na página inicial, utilizando dados em tempo real da biblioteca do usuário
  - Carrossel com scroll-snap e indicadores de paginação clicáveis sincronizados por meio de IntersectionObserver
  - Limitado a 5 jogos, com um card contendo link para a biblioteca completa quando houver mais
  - Estados distintos para usuário deslogado, biblioteca vazia e biblioteca com jogos
- Busca de jogos utilizando a API da RAWG, intermediada pelo backend para manter a chave da API privada
- Fluxo de **Add Game**, permitindo buscar jogos na RAWG e adicioná-los à biblioteca do usuário
  - Reutiliza uma entrada já existente na tabela de catálogo `games` quando o jogo já está armazenado, evitando duplicação de dados
- Schema de banco de dados normalizado: uma tabela compartilhada `games` como catálogo e uma tabela associativa `user_games`, evitando duplicação dos dados dos jogos entre usuários

---

## Funcionalidades Planejadas

- **Página My Library**: grid completo dos jogos do usuário, com filtros de múltipla seleção (status, plataforma, gênero/tag, conclusão, tempo de jogo e avaliação) e opções de ordenação
- **Página de detalhes do jogo**: status, plataforma, horas jogadas, avaliação, escala de dificuldade representada por gotas d'água, acompanhamento de conclusão e platina (cada um com data e observações opcionais)
- **Página de perfil**: dashboard de estatísticas, incluindo um gráfico de rosca mostrando as horas jogadas por plataforma
- Breakpoints para desktop, adicionados após a conclusão da experiência mobile

---

## Estrutura do Projeto

```
memory-card/
├── client/
│   ├── assets/
│   │   ├── icons/
│   │   ├── default-cover.png
│   │   └── logged-out.png
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── render/
│   │   │   ├── home.js
│   │   │   └── library.js
│   │   ├── shared/
│   │   │   └── layout.js
│   │   ├── api.js
│   │   ├── config.js
│   │   └── main.js
│   ├── index.html
│   └── library.html
├── server/
│   ├── db/
│   │   └── pool.js
│   ├── middleware/
│   │   └── authenticate.js
│   ├── migrations/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── games.js
│   │   └── library.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
├── LICENSE
├── README.md
└── README.pt-BR.md
```

---

## Tecnologias Utilizadas

- **Frontend**: JavaScript Vanilla, HTML5, CSS3 (Grid, Flexbox, scroll-snap)
- **Backend**: Node.js, Express
- **Banco de Dados**: PostgreSQL (hospedado na [Neon](https://neon.tech)), utilizando `node-pg-migrate` para migrations do schema
- **Autenticação**: bcrypt para hash de senhas e JSON Web Tokens para sessões
- **API Externa**: [RAWG Video Games Database API](https://rawg.io/apidocs)
- **Deploy**: Vercel (frontend como site estático e backend como Serverless Functions)

---

## Créditos

Dados dos jogos e imagens de capa fornecidos pela [API da RAWG](https://rawg.io).

Os ícones utilizados na interface do projeto foram gerados com o ChatGPT.

---

## Licença

Este projeto está licenciado sob a [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). É livre para visualização e avaliação, mas modificações, redistribuição ou uso comercial não são permitidos.
