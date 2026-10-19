# EMPREST.AI — Frontend

Interface React, Vite e TypeScript com design Nocturne. Consome a API NestJS do
repositório [backend](https://github.com/GustHenriqueFerreira/empresta.ai).

## Executar

Requer Node.js 22.12 ou superior. Crie `.env` a partir de `.env.example` e preencha:

```dotenv
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=<URL do projeto Supabase>
VITE_SUPABASE_PUBLISHABLE_KEY=<chave pública do projeto>
```

```bash
npm ci
npm run dev
```

Abra http://localhost:5173. A API precisa estar em execução; use uma conta real
do Supabase Auth. O botão de Operações exige perfil autorizado no banco.

## Build

```bash
npm run build
npm run preview
```

O build é gerado em `dist/`. Configure as variáveis `VITE_*` antes do build e
ajuste o CORS do backend para a origem pública do frontend ao publicar.
Nunca coloque senha PostgreSQL ou chave de serviço no frontend.

Login, catálogo, solicitações, devoluções, Operações e cadastro usam dados reais;
não há conta ou catálogo de demonstração. Catálogo começa vazio até o cadastro.
