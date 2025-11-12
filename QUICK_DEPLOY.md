# 🚀 Deploy Rápido - PetiçõesBR

## ✅ Pré-requisitos no Servidor

- Docker e Docker Compose instalados
- PostgreSQL 18 rodando
- Portas 80 e 3001 liberadas

---

## 📦 Passo 1: Baixar Arquivos

No servidor:

```bash
# Criar diretório
sudo mkdir -p /opt/peticoesbr
cd /opt/peticoesbr

# Baixar docker-compose
wget https://raw.githubusercontent.com/Devs-Wescctech/app-peticoesbr/main/docker-compose.prod.yml

# Baixar scripts de banco
wget https://raw.githubusercontent.com/Devs-Wescctech/app-peticoesbr/main/scripts/import-database.sh
chmod +x import-database.sh
```

---

## 🔧 Passo 2: Configurar PostgreSQL 18

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Criar database e usuário
CREATE DATABASE peticoesbr;
CREATE USER peticoesbr WITH ENCRYPTED PASSWORD 'SUA_SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON DATABASE peticoesbr TO peticoesbr;
\q

# Permitir conexões locais (editar pg_hba.conf)
sudo nano /etc/postgresql/18/main/pg_hba.conf
# Adicionar linha:
# host    peticoesbr    peticoesbr    172.17.0.0/16    scram-sha-256

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

---

## 📝 Passo 3: Criar arquivo .env

```bash
cd /opt/peticoesbr
nano .env
```

**Copie e cole (AJUSTE OS VALORES):**

```bash
# PostgreSQL (IP do Docker host para acessar localhost)
DATABASE_URL=postgresql://peticoesbr:SUA_SENHA@172.17.0.1:5432/peticoesbr
DB_HOST=172.17.0.1
DB_PORT=5432
DB_NAME=peticoesbr
DB_USER=peticoesbr
DB_PASSWORD=SUA_SENHA

# JWT Secrets - GERE NOVOS!
JWT_SECRET=COLE_AQUI_RESULTADO_DO_OPENSSL_1
JWT_REFRESH_SECRET=COLE_AQUI_RESULTADO_DO_OPENSSL_2

# GitHub Container Registry
GITHUB_REPOSITORY_OWNER=devs-wescctech
```

**Gerar JWT secrets:**

```bash
# Gerar e copiar JWT_SECRET
openssl rand -base64 32

# Gerar e copiar JWT_REFRESH_SECRET  
openssl rand -base64 32
```

Salvar: `Ctrl+X`, `Y`, `Enter`

---

## 💾 Passo 4: Transferir e Restaurar Banco de Dados

**Do Replit para seu computador:**
- Baixe: `database-backup/peticoesbr_backup_20251112_183849.sql.gz`

**Do computador para servidor:**

```bash
# No seu computador
scp database-backup/peticoesbr_backup_20251112_183849.sql.gz usuario@SEU_SERVIDOR:/opt/peticoesbr/
```

**No servidor, restaurar:**

```bash
cd /opt/peticoesbr

# Restaurar banco
export DATABASE_URL="postgresql://peticoesbr:SUA_SENHA@localhost:5432/peticoesbr"
gunzip -c peticoesbr_backup_20251112_183849.sql.gz | psql -U peticoesbr -d peticoesbr -h localhost

# Verificar dados
psql -U peticoesbr -d peticoesbr -h localhost -c "SELECT COUNT(*) FROM control_plane.auth_users;"
psql -U peticoesbr -d peticoesbr -h localhost -c "SELECT COUNT(*) FROM public.petitions;"
```

---

## 🐳 Passo 5: Iniciar Aplicação

```bash
cd /opt/peticoesbr

# Criar diretório de uploads
sudo mkdir -p /var/peticoesbr/uploads
sudo chmod 777 /var/peticoesbr/uploads

# Pull das imagens do GHCR
docker compose -f docker-compose.prod.yml pull

# Subir containers
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## ✅ Passo 6: Verificar

```bash
# Ver containers rodando
docker ps

# Testar backend
curl http://localhost:3001/api/health
# Deve retornar: {"status":"ok","message":"Backend is running"}

# Testar frontend
curl http://localhost/
# Deve retornar HTML

# Ver logs do backend
docker logs peticoesbr-backend --tail 50

# Ver logs do frontend
docker logs peticoesbr-frontend --tail 50
```

---

## 🌐 Passo 7: Configurar Domínio (Opcional)

Se quiser acessar por domínio (ex: peticoes.seudominio.com):

```bash
# Instalar Nginx no host
sudo apt install nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/peticoesbr
```

**Conteúdo:**

```nginx
server {
    listen 80;
    server_name peticoes.seudominio.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/peticoesbr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Configurar SSL (opcional)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d peticoes.seudominio.com
```

---

## 🔄 Comandos Úteis

```bash
# Parar tudo
docker compose -f docker-compose.prod.yml down

# Reiniciar
docker compose -f docker-compose.prod.yml restart

# Atualizar (após novo push no GitHub)
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver uso de recursos
docker stats
```

---

## 🔐 Credenciais de Teste

**Super Admin:**
- Email: `tecnologia@wescctech.com.br`
- Senha: `admin123`
- URL: `http://SEU_IP/AdminDashboard`

⚠️ **IMPORTANTE:** Altere a senha após primeiro login!

---

## 🆘 Troubleshooting

**Backend não conecta ao PostgreSQL:**
```bash
# Testar conexão do container
docker exec -it peticoesbr-backend sh
apk add postgresql-client
psql "postgresql://peticoesbr:SENHA@172.17.0.1:5432/peticoesbr"
```

**Erro de permissão em uploads:**
```bash
sudo chmod -R 777 /var/peticoesbr/uploads
```

**Ver logs detalhados:**
```bash
docker logs peticoesbr-backend --tail 100
docker logs peticoesbr-frontend --tail 100
```

---

✅ **Deploy Completo!** Acesse: `http://SEU_SERVIDOR_IP`
