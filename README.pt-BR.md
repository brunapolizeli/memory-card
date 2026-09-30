[English](README.md) | [Português](README.pt-BR.md)

## ⚠️ Status Atual

Em desenvolvimento ativo, mobile-first. Desktop ainda não é suportado.

Para a melhor experiência, acesse por um dispositivo móvel, use o modo de emulação mobile do seu navegador, ou redimensione a janela para ~375–425px.

---

# Memory Card

Um tracker pessoal de jogos construído com JavaScript puro, Node.js, Express e PostgreSQL.

[**Demo ao vivo: memcard-log.vercel.app**](https://memcard-log.vercel.app/)

---

## Visão Geral do Projeto

Memory Card é um tracker de jogos full-stack com autenticação própria, banco de dados PostgreSQL normalizado, API REST, e integração com a API da RAWG.

O projeto está sendo desenvolvido com identidade visual inspirada em Frutiger Aero (2004–2013) e abordagem mobile-first.

---

## Funcionalidades

- Cadastro/login próprios com bcrypt e sessões JWT em cookies httpOnly
- Busca e metadados de jogos via API da RAWG
- Adição de jogos à biblioteca, com detecção de duplicata contra um catálogo compartilhado
- Página de Biblioteca com filtros combináveis (status, plataforma, gênero, progresso, tempo jogado, nota), busca por nome com debounce, e colunas ordenáveis
- Página de detalhes do jogo cobrindo progresso, status, múltiplas plataformas com tempo jogado individual por plataforma, nota do usuário, dificuldade, datas de conclusão, e notas livres
- Schema PostgreSQL normalizado, com trigger de banco mantendo o tempo total jogado sincronizado entre plataformas

---

## Funcionalidades Planejadas

- Página de Dashboard com estatísticas e gráficos da biblioteca inteira
- Página de Perfil com configurações de conta (avatar, email, senha)
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
│   ├── dashboard.html
│   ├── game.html
│   ├── index.html
│   └── library.html
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

- **Frontend:** JavaScript puro, HTML5, CSS3
- **Backend:** Node.js, Express
- **Banco de dados:** PostgreSQL hospedado na [Neon](https://neon.tech)
- **Migrations:** `node-pg-migrate`
- **Autenticação:** bcrypt, JSON Web Tokens, cookies httpOnly
- **API externa:** [RAWG Video Games Database API](https://rawg.io/apidocs)
- **Deploy:** Vercel

---

## Créditos

O projeto está sendo construído do zero com base num prompt de projeto da Scrimba e [referência no Figma](https://www.figma.com/design/hE5klIn1AEQ9XWZWmurs7y/Learning-Journal-Blog?node-id=0-1&t=5IRAjYyGX68SigMk-1), que forneceram o conceito inicial de frontend e referência de layout. O backend, arquitetura de banco de dados, autenticação, integração de API, e as decisões de funcionalidade e design subsequentes foram desenvolvidos além do briefing original da Scrimba.

Dados de jogos e imagens de capa são fornecidos pela [API da RAWG](https://rawg.io).

Os ícones usados na interface foram gerados com ChatGPT.

---

## Licença

Licenciado sob [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Livre para visualizar e avaliar; modificação, redistribuição e uso comercial não são permitidos.
