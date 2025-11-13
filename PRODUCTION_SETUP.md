# 🏭 Configuração de Produção - PetiçõesBR

## 📍 Informações do Servidor

- **URL**: https://dev.wescctech.com.br/peticoesbr
- **Servidor**: dev.wescctech.com.br
- **Deployment Path**: `/var/www/html/peticoesbr`
- **Database**: PostgreSQL user `sup_cristian`, database `sup_cristian`

---

## 🐳 Containers Docker

### Frontend
- **Imagem**: `ghcr.io/devs-wescctech/peticoesbr-frontend:latest`
- **Porta**: 8080 (internal)
- **Base Path**: `/peticoesbr/`
- **Build ARG**: `VITE_BASE_URL=/peticoesbr/`

### Backend
- **Imagem**: `ghcr.io/devs-wescctech/peticoesbr-backend:latest`
- **Porta**: 3001 (internal)
- **Volume**: `/var/www/html/peticoesbr/uploads:/app/uploads`

---

## 🌐 Nginx Snippet Pattern

### Arquivo: `/etc/nginx/snippets/peticoesbr.conf`

```nginx
# API Backend
location /api {
    proxy_pass http://127.0.0.1:3001;
    # ... headers
}

# Uploads (proxy para backend Express)
location ^~ /uploads {
    proxy_pass http://127.0.0.1:3001/uploads;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Frontend SPA
location /peticoesbr {
    proxy_pass http://127.0.0.1:8080/;
    # ... headers
}

# Rotas Públicas (301 redirect)
location /p {
    return 301 https://$host/peticoesbr/p$is_args$args;
}

location /bio {
    return 301 https://$host/peticoesbr/bio$is_args$args;
}
```

### Incluir no site principal

**Arquivo**: `/etc/nginx/sites-available/dev.wescctech.com.br`

```nginx
server {
    listen 443 ssl http2;
    server_name dev.wescctech.com.br;
    
    # ... SSL config
    
    # ===== Incluir PetiçõesBR =====
    include /etc/nginx/snippets/peticoesbr.conf;
    
    # ... outros locations
}
```

---

## 📁 Estrutura de Arquivos

```
/var/www/html/peticoesbr/
├── docker-compose.yml      # Orquestração containers
├── .env                    # Variáveis de ambiente
└── uploads/                # Volume montado (backend)
    ├── image1.jpg
    └── logo.png
```

---

## 🔄 Workflow de Deploy

### 1. Desenvolvimento → GitHub

```bash
# No Replit ou local
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### 2. GitHub Actions (Automático)

- Build frontend com `VITE_BASE_URL=/peticoesbr/`
- Build backend
- Push para GHCR:
  - `ghcr.io/devs-wescctech/peticoesbr-frontend:latest`
  - `ghcr.io/devs-wescctech/peticoesbr-backend:latest`

### 3. Servidor (Manual)

```bash
ssh sup_cristian@dev.wescctech.com.br
cd /var/www/html/peticoesbr

# Parar, baixar novas imagens, e reiniciar
docker-compose down && \
docker-compose pull && \
docker-compose up -d

# Ver logs
docker-compose logs -f
```

---

## 🔗 Rotas e URLs

### Públicas (Sem Login)

| Rota Original | Redirect 301 | URL Final |
|--------------|--------------|-----------|
| `/p?s=slug` | → `/peticoesbr/p?s=slug` | Landing page da petição |
| `/bio?s=slug` | → `/peticoesbr/bio?s=slug` | Página link bio |

### Aplicação Principal

| Rota | URL | Descrição |
|------|-----|-----------|
| `/peticoesbr` | https://dev.wescctech.com.br/peticoesbr | Frontend React |
| `/peticoesbr/login` | https://dev.wescctech.com.br/peticoesbr/login | Login |
| `/peticoesbr/AdminDashboard` | https://dev.wescctech.com.br/peticoesbr/AdminDashboard | Super Admin |
| `/api` | https://dev.wescctech.com.br/api | Backend Express |
| `/uploads/file.jpg` | https://dev.wescctech.com.br/uploads/file.jpg | Uploads estáticos |

---

## 🔐 Credenciais

### Super Admin

- **Email**: `tecnologia@wescctech.com.br`
- **Senha**: `admin123`
- **Acesso**: `/peticoesbr/AdminDashboard`

---

## 🧪 Testes de Validação

```bash
# Backend direto
curl -i http://localhost:3001/api/health

# API via Nginx
curl -i https://dev.wescctech.com.br/api/health

# Frontend container
curl -i http://localhost:8080/

# Frontend via Nginx
curl -i https://dev.wescctech.com.br/peticoesbr/

# Uploads
curl -I https://dev.wescctech.com.br/uploads/arquivo.jpg

# Redirect /p
curl -I https://dev.wescctech.com.br/p?s=teste
# Deve retornar: HTTP/1.1 301 Moved Permanently
# Location: https://dev.wescctech.com.br/peticoesbr/p?s=teste

# Redirect /bio
curl -I https://dev.wescctech.com.br/bio?s=teste
# Deve retornar: HTTP/1.1 301 Moved Permanently
# Location: https://dev.wescctech.com.br/peticoesbr/bio?s=teste
```

---

## 📦 Volumes Docker

```bash
# Backend container
/var/www/html/peticoesbr/uploads → /app/uploads (container)

# Verificar volume montado
docker inspect peticoesbr-backend | grep -A 10 Mounts

# Arquivos no host
ls -la /var/www/html/peticoesbr/uploads/
```

---

## 🔄 Comandos Úteis

### Containers

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f
docker logs peticoesbr-backend --tail 50
docker logs peticoesbr-frontend --tail 50

# Reiniciar
docker-compose restart

# Entrar no container
docker exec -it peticoesbr-backend sh
docker exec -it peticoesbr-frontend sh
```

### Nginx

```bash
# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Uploads

```bash
# Permissões corretas
sudo chown -R sup_cristian:sup_cristian /var/www/html/peticoesbr/uploads
sudo chmod -R 755 /var/www/html/peticoesbr/uploads

# Verificar arquivos
ls -la /var/www/html/peticoesbr/uploads/
```

---

## 🆘 Troubleshooting

### Containers não sobem

```bash
docker-compose logs
cat .env
sudo netstat -tulpn | grep -E '3001|8080'
```

### 404 na API

```bash
# Verificar snippet incluído
grep -r "peticoesbr.conf" /etc/nginx/sites-enabled/

# Testar backend direto
curl -i http://localhost:3001/api/health
```

### Uploads retornam 404

```bash
# Verificar volume
docker inspect peticoesbr-backend | grep -A 10 Mounts

# Verificar arquivos no host
ls -la /var/www/html/peticoesbr/uploads/

# Testar acesso direto no backend
curl -I http://localhost:3001/uploads/arquivo.jpg

# Testar via Nginx
curl -I https://dev.wescctech.com.br/uploads/arquivo.jpg
```

### Rotas /p e /bio não funcionam

```bash
# Verificar redirect no snippet
cat /etc/nginx/snippets/peticoesbr.conf | grep -A 2 "location /p"

# Deve mostrar: return 301 https://$host/peticoesbr/p$is_args$args;

# Testar redirect
curl -I https://dev.wescctech.com.br/p?s=teste
# Espera: 301 + Location header
```

### React Router não encontra rotas

- **Problema**: Erro `<Router basename="/peticoesbr"> is not able to match the URL`
- **Causa**: URL não começa com `/peticoesbr`
- **Solução**: Usar redirect 301 para `/peticoesbr/` ao invés de proxy direto

---

## ✅ Checklist de Deploy

- [ ] Snippet criado em `/etc/nginx/snippets/peticoesbr.conf`
- [ ] Snippet incluído em `sites-available/dev.wescctech.com.br`
- [ ] Nginx testado e recarregado
- [ ] Containers rodando (`docker-compose ps`)
- [ ] Volume de uploads montado
- [ ] API acessível: `https://dev.wescctech.com.br/api/health`
- [ ] Frontend acessível: `https://dev.wescctech.com.br/peticoesbr`
- [ ] Redirects funcionando: `/p` e `/bio`
- [ ] Uploads acessíveis: `https://dev.wescctech.com.br/uploads/`
- [ ] Login funcional
- [ ] Admin Dashboard acessível

---

**Última atualização**: 13/11/2025  
**Configurado por**: Wescctech  
**Status**: ✅ Produção Estável
