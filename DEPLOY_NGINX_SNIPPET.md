# 🚀 Deploy do PetiçõesBR com Nginx Snippet

## 📋 Estrutura no Servidor (dev.wescctech.com.br)

```
/etc/nginx/
├── snippets/
│   └── peticoesbr.conf          # ← Configuração modular do app
├── sites-available/
│   └── dev.wescctech.com.br     # ← Include snippet aqui
└── sites-enabled/
    └── dev.wescctech.com.br     # ← Symlink

/var/www/html/peticoesbr/
├── docker-compose.yml           # ← Orquestração containers
├── .env                         # ← Variáveis de ambiente
└── uploads/                     # ← Volume montado para backend
```

---

## 🔧 Passo 1: Criar Snippet

No servidor, execute:

```bash
# Criar arquivo do snippet
sudo nano /etc/nginx/snippets/peticoesbr.conf
```

**Cole o conteúdo do arquivo `nginx-snippets/peticoesbr.conf` deste repositório.**

Salvar: `Ctrl+X`, `Y`, `Enter`

---

## 📝 Passo 2: Incluir Snippet no Site

Edite o arquivo do site:

```bash
sudo nano /etc/nginx/sites-available/dev.wescctech.com.br
```

**Adicione a linha de include ANTES do `location /`:**

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dev.wescctech.com.br www.dev.wescctech.com.br;

    ssl_certificate     /etc/letsencrypt/live/dev.wescctech.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev.wescctech.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/dev.wescctech.com.br/html;
    index index.html index.htm;
    
    # ===== Incluir PetiçõesBR =====
    include /etc/nginx/snippets/peticoesbr.conf;
    
    # ===== exportar_historico (Flask/whatever) =====
    location /exportar_whu/ {
        proxy_pass http://127.0.0.1:5001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Página inicial genérica (mantida)
    location / {
        try_files $uri $uri/ =404;
    }
}
```

Salvar: `Ctrl+X`, `Y`, `Enter`

---

## ✅ Passo 3: Testar e Aplicar

```bash
# Testar configuração
sudo nginx -t

# Se OK, recarregar Nginx
sudo systemctl reload nginx
```

---

## 🐳 Passo 4: Deploy dos Containers (Docker)

```bash
# Criar diretório
sudo mkdir -p /var/www/html/peticoesbr
cd /var/www/html/peticoesbr

# Criar diretório de uploads
sudo mkdir -p uploads
sudo chown -R sup_cristian:sup_cristian uploads

# Criar .env
nano .env
```

**Conteúdo do .env:**

```bash
# PostgreSQL
DATABASE_URL=postgresql://sup_cristian:SENHA@localhost:5432/sup_cristian

# JWT Secrets (gere com: openssl rand -base64 32)
JWT_SECRET=SEU_JWT_SECRET_AQUI
JWT_REFRESH_SECRET=SEU_REFRESH_SECRET_AQUI

# Backend
NODE_ENV=production
PORT=3001

# Frontend Build
VITE_BASE_URL=/peticoesbr/

# GitHub Container Registry
GITHUB_REPOSITORY_OWNER=devs-wescctech
```

**Criar docker-compose.yml:**

```bash
nano docker-compose.yml
```

**Cole o conteúdo do arquivo `docker-compose.server.yml` deste repositório.**

**Iniciar aplicação:**

```bash
# Pull das imagens do GHCR
docker-compose pull

# Subir containers
docker-compose up -d

# Ver logs
docker-compose logs -f
```

---

## ✅ Passo 5: Verificar Containers

```bash
# Ver status dos containers
docker-compose ps

# Containers devem estar rodando:
# - peticoesbr-frontend (porta 8080)
# - peticoesbr-backend (porta 3001)
```

---

## 🧪 Passo 6: Testar

```bash
# Testar backend direto
curl -i http://localhost:3001/api/health

# Testar API via Nginx
curl -i https://dev.wescctech.com.br/api/health

# Testar frontend container
curl -i http://localhost:8080/

# Testar frontend via Nginx
curl -i https://dev.wescctech.com.br/peticoesbr/

# Testar uploads
ls -la /var/www/html/peticoesbr/uploads/
curl -I https://dev.wescctech.com.br/uploads/ARQUIVO.jpg
```

**Acessar no navegador:**
- Frontend: `https://dev.wescctech.com.br/peticoesbr`
- Admin: `https://dev.wescctech.com.br/peticoesbr/AdminDashboard`
- Petições públicas: `https://dev.wescctech.com.br/p?s=teste` (redireciona para `/peticoesbr/p?s=teste`)
- Link Bio: `https://dev.wescctech.com.br/bio?s=teste` (redireciona para `/peticoesbr/bio?s=teste`)

---

## 🔄 Atualizar Aplicação (Após Push para GitHub)

```bash
cd /var/www/html/peticoesbr

# Parar, baixar novas imagens do GHCR, e reiniciar
docker-compose down && \
docker-compose pull && \
docker-compose up -d

# Ver logs
docker-compose logs -f
```

**GitHub Actions automaticamente:**
1. Faz build do frontend e backend
2. Gera imagens Docker
3. Faz push para GHCR (ghcr.io/devs-wescctech/peticoesbr-frontend e backend)
4. No servidor, basta fazer `pull` e `up`

---

## 📌 Checklist

- [ ] Snippet criado em `/etc/nginx/snippets/peticoesbr.conf`
- [ ] Snippet incluído em `sites-available/dev.wescctech.com.br`
- [ ] Nginx testado e recarregado (`sudo nginx -t && sudo systemctl reload nginx`)
- [ ] Containers rodando: `docker-compose ps`
  - [ ] Frontend (porta 8080)
  - [ ] Backend (porta 3001)
- [ ] Volume de uploads montado: `/var/www/html/peticoesbr/uploads`
- [ ] API acessível: `https://dev.wescctech.com.br/api/health`
- [ ] Frontend acessível: `https://dev.wescctech.com.br/peticoesbr`
- [ ] Rotas públicas redirecionam: `/p` → `/peticoesbr/p`, `/bio` → `/peticoesbr/bio`
- [ ] Uploads acessíveis: `https://dev.wescctech.com.br/uploads/`

---

## 🆘 Troubleshooting

**Containers não sobem:**
```bash
# Ver logs
docker-compose logs

# Verificar .env
cat .env

# Verificar portas
sudo netstat -tulpn | grep -E '3001|8080'
```

**Backend não responde:**
```bash
docker logs peticoesbr-backend --tail 50
docker exec -it peticoesbr-backend sh
```

**404 na API:**
```bash
# Verificar se snippet está incluído
grep -r "peticoesbr.conf" /etc/nginx/sites-enabled/

# Testar backend direto
curl -i http://localhost:3001/api/health

# Verificar sintaxe do Nginx
sudo nginx -t
```

**Uploads não aparecem:**
```bash
# Verificar volume
docker inspect peticoesbr-backend | grep -A 10 Mounts

# Verificar arquivos
ls -la /var/www/html/peticoesbr/uploads/

# Testar acesso direto
curl -I https://dev.wescctech.com.br/uploads/ARQUIVO.jpg
```

**Rotas /p e /bio não funcionam:**
```bash
# Verificar redirect no snippet
cat /etc/nginx/snippets/peticoesbr.conf | grep -A 2 "location /p"

# Deve mostrar: return 301 https://$host/peticoesbr/p$is_args$args;
```
