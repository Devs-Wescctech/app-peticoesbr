# 🏭 Configuração de Produção - PetiçõesBR

## 📍 Informações do Servidor

### Opção A: Domínio Raiz (Recomendado)
- **URL**: https://peticoesbr.com.br/
- **Base Path**: `/`
- **Rotas Públicas**: `/p?s=slug` e `/bio?slug=x`

### Opção B: Subpath (legado)
- **URL**: https://dev.wescctech.com.br/peticoesbr
- **Base Path**: `/peticoesbr/`
- **Rotas Públicas**: Redirect 301 para subpath

---

## 🐳 Containers Docker

### Frontend
- **Imagem**: `ghcr.io/devs-wescctech/peticoesbr-frontend:latest`
- **Porta**: 8080 (internal) ou 80 (standalone)
- **Build ARG**: `VITE_BASE_URL=/` (domínio raiz) ou `/peticoesbr/` (subpath)

### Backend
- **Imagem**: `ghcr.io/devs-wescctech/peticoesbr-backend:latest`
- **Porta**: 3001
- **Volume**: `/path/to/uploads:/app/uploads`

---

## 🌐 Configuração Nginx

### A) Para Domínio Raiz (peticoesbr.com.br)

Use o arquivo `nginx-snippets/peticoesbr-root.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name peticoesbr.com.br www.peticoesbr.com.br;
    
    # SSL config...
    
    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }
    
    # Uploads
    location ^~ /uploads {
        proxy_pass http://127.0.0.1:3001/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend SPA na raiz
    location / {
        root /var/www/html/peticoesbr;
        try_files $uri $uri/ /index.html;
        
        # Cache para assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### B) Para Subpath (dev.wescctech.com.br/peticoesbr)

Use o arquivo `nginx-snippets/peticoesbr.conf` com redirects para /p e /bio.

---

## 📁 Estrutura de Arquivos

```
/var/www/html/peticoesbr/
├── docker-compose.yml      # Orquestração containers
├── .env                    # Variáveis de ambiente
├── index.html              # Frontend build (se não usar container)
├── assets/                 # JS/CSS build
└── uploads/                # Volume montado (backend)
```

---

## 🔄 Workflow de Deploy

### 1. Build com Docker (Domínio Raiz)

```bash
# Build frontend para raiz
docker build --build-arg VITE_BASE_URL=/ -t peticoesbr-frontend .

# Ou com Docker Compose
docker-compose build --build-arg VITE_BASE_URL=/
```

### 2. Deploy no Servidor

```bash
# No servidor
cd /var/www/html/peticoesbr

# Pull novas imagens
docker-compose pull

# Restart containers
docker-compose down
docker-compose up -d

# Verificar status
docker-compose ps
docker-compose logs -f
```

---

## 🔧 docker-compose.yml para Produção (Domínio Raiz)

```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/devs-wescctech/peticoesbr-backend:latest
    container_name: peticoesbr-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    volumes:
      - ./uploads:/app/uploads
    ports:
      - "3001:3001"

  frontend:
    image: ghcr.io/devs-wescctech/peticoesbr-frontend:latest
    container_name: peticoesbr-frontend
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - backend
```

---

## 📋 .env (Exemplo)

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

---

## ✅ Checklist de Deploy

- [ ] Configurar DNS do domínio peticoesbr.com.br
- [ ] Gerar certificado SSL (Let's Encrypt)
- [ ] Criar arquivo .env com credenciais
- [ ] Criar diretório uploads com permissões
- [ ] Pull das imagens Docker
- [ ] Iniciar containers
- [ ] Configurar Nginx
- [ ] Testar rotas públicas (/p, /bio)
- [ ] Testar login e dashboard
