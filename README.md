# Petições – Web (Deploy via GHCR + Docker + Nginx do host)

Frontend em React/Vite publicado como imagem **runtime-only** no **GitHub Container Registry (GHCR)** e servido no servidor via **Docker Compose**, com **Nginx do host** fazendo o proxy para `/peticoes/`.

> **Base path de produção:** `/peticoes/`

---

## Sumário

- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Estrutura criada no repositório](#estrutura-criada-no-repositório)
- [Passo a passo — do ZIP ao GitHub](#passo-a-passo--do-zip-ao-github)
- [CI: GitHub Actions (build Vite + push para GHCR)](#ci-github-actions-build-vite--push-para-ghcr)
- [Dockerfile (runtime-only)](#dockerfile-runtime-only)
- [Nginx do container (SPA)](#nginx-do-container-spa)
- [.dockerignore](#dockerignore)
- [Vite: base path em produção](#vite-base-path-em-produção)
- [Deploy no servidor (Docker Compose + Nginx do host)](#deploy-no-servidor-docker-compose--nginx-do-host)
- [Fluxo de atualização](#fluxo-de-atualização)
- [Troubleshooting](#troubleshooting)
- [Próximos passos (API própria)](#próximos-passos-api-própria)

---

## Arquitetura

1. **Build Vite** roda no **GitHub Actions** e gera `dist/`.
2. Docker **runtime-only** empacota apenas `dist/` com **Nginx**.
3. A imagem é publicada em **`ghcr.io/devs-wescctech/app-peticoes-web:main`**.
4. No servidor: **Docker Compose** sobe o container expondo `127.0.0.1:3002`.
5. **Nginx do host** faz **proxy** de `/peticoes/` → `127.0.0.1:3002`.

---

## Pré-requisitos

- Repositório: `Devs-Wescctech/app-peticoes-web`.
- **GitHub Actions habilitado** com **Workflow permissions → Read and write permissions**  
  (Repo → Settings → Actions → General).
- Node 20 (apenas se precisar buildar localmente).
- Acesso ao **GHCR** (se a imagem for privada, token com `read:packages` no servidor).

---

## Estrutura criada no repositório

```
.
├─ .docker/
│  └─ nginx.conf         # Nginx interno do container (SPA)
├─ .github/
│  └─ workflows/
│     └─ docker-ghcr.yml # CI: build Vite + publish GHCR
├─ dockerfile            # Dockerfile runtime-only (minúsculo)
├─ vite.config.js        # base path por env (VITE_BASE_URL)
├─ package.json          # (adicione as deps que o build exigir)
└─ ...
```

---

## Passo a passo — do ZIP ao GitHub

1. **Criar repo vazio** no GitHub (`app-peticoes-web`).
2. **Descompactar o ZIP** localmente e **subir os arquivos pelo GitHub** (Upload files).  
   > Evite subir o `.zip` em si; envie o conteúdo descompactado.
3. (Opcional) Gerar e commitar `package-lock.json`:
   ```bash
   npm i --package-lock-only
   git add package-lock.json
   git commit -m "chore: add package-lock.json"
   git push
   ```

---

## CI: GitHub Actions (build Vite + push para GHCR)

Crie o arquivo **`.github/workflows/docker-ghcr.yml`** com:

```yaml
name: Build Web & Push Image (GHCR)

on:
  push:
    branches: ["main"]

env:
  IMAGE_NAME: ghcr.io/devs-wescctech/app-peticoes-web

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node 20
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install deps
        run: npm install --no-audit --no-fund

      - name: Build Vite (verbose)
        run: npm run build -- --debug
        env:
          VITE_BASE_URL: /peticoes
          # VITE_API_URL: https://api.seu-dominio.com.br  # quando a API própria estiver ativa

      - name: Verify dist exists
        run: |
          echo "PWD=$(pwd)"
          ls -la
          echo "---- dist ----"
          ls -la dist

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build & Push runtime-only image
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./dockerfile
          push: true
          tags: |
            ${{ env.IMAGE_NAME }}:main
            ${{ env.IMAGE_NAME }}:${{ github.sha }}
```

> Dica: se algum **pacote faltar** no build (ex.: `@tanstack/react-query`), adicione em `"dependencies"` do `package.json` e faça commit.

---

## Dockerfile (runtime-only)

Crie **`dockerfile`** (minúsculo) na raiz:

```docker
FROM nginx:1.27-alpine

COPY ./.docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

EXPOSE 80
```

---

## Nginx do container (SPA)

Crie **`./.docker/nginx.conf`**:

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # Assets com hash: cache forte
  location /assets/ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # HTML da SPA: não cachear
  location = /index.html { add_header Cache-Control "no-store"; }

  # SPA fallback
  location / { try_files $uri /index.html; }

  # Segurança + compressão
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "geolocation=()" always;

  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
  gzip_min_length 1024;
}
```

---

## .dockerignore

> **Não ignore `dist/`** (o Docker precisa copiá-lo).

```text
node_modules
.vite
.git
.github
*.log
.env
.env.*.local
.DS_Store
.idea
.vscode
coverage
# dist  <- NÃO coloque esta linha
```

---

## Vite: base path em produção

Ajuste o **`vite.config.js`** para ler `VITE_BASE_URL`:

```js
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: env.VITE_BASE_URL || '/', // garante /peticoes/ em produção
  };
});
```

No Router (ex.: `main.jsx` / `App.jsx`):
```jsx
import { BrowserRouter } from "react-router-dom";

<BrowserRouter basename={import.meta.env.VITE_BASE_URL || "/"}>
  {/* ... */}
</BrowserRouter>
```

---

## Deploy no servidor (Docker Compose + Nginx do host)

### 1) Docker Compose

Crie `/var/www/html/peticoes/docker-compose.yml`:

```yaml
services:
  web:
    container_name: peticoes-web
    image: ghcr.io/devs-wescctech/app-peticoes-web:main
    restart: always
    ports:
      - "127.0.0.1:3002:80"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1/"]
      interval: 30s
      timeout: 3s
      retries: 3
```

Se a imagem do GHCR for **privada**, faça login no host:
```bash
echo <TOKEN_COM_read:packages> | docker login ghcr.io -u <SEU_USUARIO> --password-stdin
```

Suba:
```bash
cd /var/www/html/peticoes
docker compose pull
docker compose up -d
docker ps
curl -I http://127.0.0.1:3002/
```

### 2) Nginx do host (proxy para o container)

Inclua/atualize **`/etc/nginx/snippets/peticoes_front.conf`**:

```nginx
location = / { return 301 /peticoes/; }

location /peticoes/ {
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;

  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";

  proxy_pass http://127.0.0.1:3002/;
}

location /peticoes/assets/ {
  proxy_pass http://127.0.0.1:3002/assets/;
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

No seu **server block** do domínio, inclua:
```nginx
include snippets/peticoes_front.conf;
```

Aplicar:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

Acesse: `https://SEU-DOMINIO/peticoes/`.

---

## Fluxo de atualização

1. Commit/push na **main** → Actions publica a nova imagem em `ghcr.io/devs-wescctech/app-peticoes-web:main`.
2. No servidor:
   ```bash
   cd /var/www/html/peticoes
   docker compose pull
   docker compose up -d
   sudo nginx -t && sudo systemctl reload nginx
   ```

(Sugestão) Script `/var/www/html/peticoes/deploy.sh`:
```bash
#!/usr/bin/env bash
set -e
cd /var/www/html/peticoes
docker compose pull
docker compose up -d
sudo nginx -t && sudo systemctl reload nginx
echo "OK - $(date)"
```
Dê permissão:
```bash
chmod +x /var/www/html/peticoes/deploy.sh
```

---

## Troubleshooting

| Sintoma | Causa | Solução |
|---|---|---|
| `manifest unknown` ao `docker compose pull` | A imagem/tag ainda não existe ou owner errado | Confira o Actions, `IMAGE_NAME` e o owner real do repo |
| `failed to calculate checksum: "/dist": not found` | `dist/` não está no contexto do build | Garante build do Vite, `Verify dist exists` OK e `.dockerignore` **sem** `dist` |
| `Rollup failed to resolve import ...` | Dependência faltando | Adicione a lib em `package.json` → `"dependencies"` e faça commit |
| 404 em `/assets/*.js` ao acessar `/peticoes/` | `base` do Vite incorreta | `vite.config.js` com `base: env.VITE_BASE_URL || '/'` e `VITE_BASE_URL=/peticoes` no Actions |
| Container `unhealthy` | Healthcheck falhando | `docker logs -f peticoes-web` para analisar. Ajuste health ou verifique resposta em `/` |
| Actions não publica no GHCR | Permissão insuficiente | Repo → Settings → Actions → Workflow permissions → **Read and write permissions** |

---

## Próximos passos (API própria)

Criar o repo **`app-peticoes-api`** (FastAPI + Postgres) com:
- `Dockerfile` + `docker-compose.yml` (api + db)
- `main.py`, `routers/` (`/petitions`, `/signatures`, `/campaigns`, `/templates`)
- `models/` + Alembic (migrações)
- CORS liberando o domínio do Web
- Auth JWT simples
- Workflow que publica `ghcr.io/devs-wescctech/app-peticoes-api:main`

No Web, use `VITE_API_URL` apontando para a API.

---

**Manutenção rápida**

```bash
# logs do container web
docker logs -f peticoes-web

# validar container local
curl -I http://127.0.0.1:3002/

# logs do Nginx do host
tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```
