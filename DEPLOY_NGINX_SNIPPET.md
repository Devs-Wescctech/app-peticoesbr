# 🚀 Deploy do PetiçõesBR com Nginx Snippet

## 📋 Estrutura no Servidor

```
/etc/nginx/
├── snippets/
│   └── peticoesbr.conf          # ← Criar este arquivo
├── sites-available/
│   └── dev.wescctech.com.br     # ← Incluir snippet aqui
└── sites-enabled/
    └── dev.wescctech.com.br     # ← Symlink
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

## 🐳 Passo 4: Deploy do Backend (Docker)

```bash
# Criar diretório
sudo mkdir -p /opt/peticoesbr
cd /opt/peticoesbr

# Criar .env
sudo nano .env
```

**Conteúdo do .env:**

```bash
# PostgreSQL
DATABASE_URL=postgresql://peticoesbr:SUA_SENHA@localhost:5432/peticoesbr

# JWT Secrets (gere com: openssl rand -base64 32)
JWT_SECRET=SEU_JWT_SECRET_AQUI
JWT_REFRESH_SECRET=SEU_REFRESH_SECRET_AQUI

# Backend
NODE_ENV=production
PORT=3001
```

**Iniciar backend:**

```bash
# Download do docker-compose
wget https://raw.githubusercontent.com/SEU-USUARIO/peticoesbr/main/docker-compose.prod.yml

# Pull e start
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d backend

# Ver logs
docker logs peticoesbr-backend -f
```

---

## 📦 Passo 5: Deploy do Frontend (Build Estático)

### Opção A: Build Local e Upload

**No Replit/Local:**

```bash
# Build com base path
VITE_BASE_URL=/peticoesbr/ npm run build

# Compactar dist/
tar -czf peticoesbr-frontend.tar.gz -C dist .
```

**No servidor:**

```bash
# Criar diretório
sudo mkdir -p /var/www/html/peticoesbr

# Upload do arquivo tar.gz (via scp/sftp)
# Exemplo: scp peticoesbr-frontend.tar.gz user@server:/tmp/

# Extrair
sudo tar -xzf /tmp/peticoesbr-frontend.tar.gz -C /var/www/html/peticoesbr

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/html/peticoesbr
sudo chmod -R 755 /var/www/html/peticoesbr
```

### Opção B: Build via Docker (Mais Automático)

```bash
cd /opt/peticoesbr

# Pull e extract do frontend
docker compose -f docker-compose.prod.yml pull frontend
docker create --name temp-frontend ghcr.io/SEU-USUARIO/peticoesbr-frontend:latest
docker cp temp-frontend:/usr/share/nginx/html /var/www/html/peticoesbr
docker rm temp-frontend

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/html/peticoesbr
```

---

## 🧪 Passo 6: Testar

```bash
# Testar backend
curl -i http://localhost:3001/api/health
# Deve retornar: {"status":"ok","message":"Backend is running"}

# Testar API via Nginx
curl -i https://dev.wescctech.com.br/api/health

# Testar frontend
curl -i https://dev.wescctech.com.br/peticoesbr/
# Deve retornar HTML
```

**Acessar no navegador:**
- Frontend: `https://dev.wescctech.com.br/peticoesbr`
- Admin: `https://dev.wescctech.com.br/peticoesbr/AdminDashboard`
- Petições públicas: `https://dev.wescctech.com.br/p?s=teste`

---

## 🔄 Atualização Futura

```bash
# Backend
cd /opt/peticoesbr
docker compose -f docker-compose.prod.yml pull backend
docker compose -f docker-compose.prod.yml up -d backend --force-recreate

# Frontend (rebuild e upload conforme Opção A ou B acima)
```

---

## 📌 Checklist

- [ ] Snippet criado em `/etc/nginx/snippets/peticoesbr.conf`
- [ ] Snippet incluído em `sites-available/dev.wescctech.com.br`
- [ ] Nginx testado e recarregado (`sudo nginx -t && sudo systemctl reload nginx`)
- [ ] Backend rodando na porta 3001 (`docker ps`)
- [ ] Frontend deployado em `/var/www/html/peticoesbr`
- [ ] API acessível: `https://dev.wescctech.com.br/api/health`
- [ ] Frontend acessível: `https://dev.wescctech.com.br/peticoesbr`

---

## 🆘 Troubleshooting

**Backend não responde:**
```bash
docker logs peticoesbr-backend --tail 50
sudo systemctl status postgresql
```

**404 na API:**
```bash
# Verificar se snippet está incluído
grep -r "peticoesbr.conf" /etc/nginx/sites-enabled/

# Verificar sintaxe
sudo nginx -t
```

**Frontend não carrega assets:**
```bash
# Verificar permissões
ls -la /var/www/html/peticoesbr
sudo chown -R www-data:www-data /var/www/html/peticoesbr
```
