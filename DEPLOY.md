# 🚀 Guia de Deploy - PetiçõesBR

Documentação completa para migração e deploy do sistema PetiçõesBR em servidor próprio com Docker e PostgreSQL 18.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Parte 1: Preparação do GitHub](#parte-1-preparação-do-github)
3. [Parte 2: Export do Banco de Dados](#parte-2-export-do-banco-de-dados)
4. [Parte 3: Preparação do Servidor](#parte-3-preparação-do-servidor)
5. [Parte 4: Deploy com Docker](#parte-4-deploy-com-docker)
6. [Parte 5: Configuração do Banco de Dados](#parte-5-configuração-do-banco-de-dados)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### No Servidor:
- Ubuntu 22.04 LTS ou superior
- Docker 24+ instalado
- Docker Compose v2+ instalado
- PostgreSQL 18 instalado (fora do Docker)
- Git instalado
- Acesso root ou sudo
- Portas 80, 443 e 3001 liberadas no firewall

### No GitHub:
- Repositório criado (público ou privado)
- Acesso para configurar GitHub Actions
- GitHub Container Registry (GHCR) habilitado

---

## 📦 Parte 1: Preparação do GitHub

### 1.1 Criar Repositório no GitHub

```bash
# Criar novo repositório no GitHub
# Nome sugerido: peticoesbr ou peticoes-wescctech
```

### 1.2 Subir Código para o GitHub

```bash
# Na raiz do projeto (no Replit ou localmente)
git init
git add .
git commit -m "feat: initial commit - PetiçõesBR full stack"

# Adicionar remote do GitHub
git remote add origin https://github.com/SEU-USUARIO/peticoesbr.git

# Push para o GitHub
git branch -M main
git push -u origin main
```

### 1.3 Habilitar GitHub Container Registry

O GitHub Actions já está configurado para fazer push automático para GHCR!

**Arquivo criado:** `.github/workflows/docker-publish.yml`

Após o push, o GitHub Actions irá:
- ✅ Fazer build do backend
- ✅ Fazer build do frontend
- ✅ Publicar imagens no GHCR
- ✅ Criar tags automáticas (latest, branch, sha)

**Verificar builds:**
- Acesse: `https://github.com/SEU-USUARIO/peticoesbr/actions`
- Aguarde conclusão do workflow "Build and Push to GHCR"

**Imagens geradas:**
```
ghcr.io/SEU-USUARIO/peticoesbr-backend:latest
ghcr.io/SEU-USUARIO/peticoesbr-frontend:latest
```

### 1.4 Tornar Imagens Públicas (Opcional)

Se o repositório for privado, você precisa autenticar no servidor:

1. Acesse: `https://github.com/settings/tokens`
2. Crie um Personal Access Token (classic) com escopo `read:packages`
3. No servidor, faça login:

```bash
echo "SEU_TOKEN" | docker login ghcr.io -u SEU-USUARIO --password-stdin
```

**OU** torne o package público:
1. Acesse: `https://github.com/SEU-USUARIO?tab=packages`
2. Selecione o package `peticoesbr-backend` e `peticoesbr-frontend`
3. Package Settings → Change visibility → Public

---

## 💾 Parte 2: Export do Banco de Dados

### 2.1 Exportar Banco do Replit

No Replit, execute o script de export:

```bash
# Dar permissão de execução
chmod +x scripts/export-database.sh

# Executar export
./scripts/export-database.sh
```

**Arquivos gerados:**
- `database-backup/peticoesbr_backup_YYYYMMDD_HHMMSS.sql` (Completo)
- `database-backup/peticoesbr_backup_YYYYMMDD_HHMMSS.sql.gz` (Compactado)
- `database-backup/peticoesbr_schema_YYYYMMDD_HHMMSS.sql` (Apenas schema)

### 2.2 Baixar Backup

```bash
# No Replit, compactar tudo
cd database-backup
tar -czf backup-completo.tar.gz *.sql* *.gz

# Baixar via SFTP/SCP ou interface do Replit
# Salvar em local seguro
```

---

## 🖥️ Parte 3: Preparação do Servidor

### 3.1 Instalar Docker

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão
exit
# Faça login novamente

# Verificar instalação
docker --version
docker compose version
```

### 3.2 Instalar PostgreSQL 18

```bash
# Adicionar repositório oficial do PostgreSQL
sudo apt install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh

# Instalar PostgreSQL 18
sudo apt install -y postgresql-18 postgresql-client-18

# Verificar status
sudo systemctl status postgresql

# Verificar versão
psql --version
```

### 3.3 Configurar PostgreSQL

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar database e usuário
CREATE DATABASE peticoesbr;
CREATE USER peticoesbr WITH ENCRYPTED PASSWORD 'SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON DATABASE peticoesbr TO peticoesbr;

# Sair
\q

# Configurar acesso externo (se necessário)
sudo nano /etc/postgresql/18/main/postgresql.conf
# Descomentar e alterar:
# listen_addresses = 'localhost'  # ou '*' para todos

# Configurar autenticação
sudo nano /etc/postgresql/18/main/pg_hba.conf
# Adicionar linha:
# local   peticoesbr      peticoesbr                              scram-sha-256

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 3.4 Criar Diretórios do Projeto

```bash
# Criar estrutura de diretórios
sudo mkdir -p /opt/peticoesbr
sudo mkdir -p /var/peticoesbr/uploads
sudo chown -R $USER:$USER /opt/peticoesbr /var/peticoesbr

cd /opt/peticoesbr
```

---

## 🐳 Parte 4: Deploy com Docker

### 4.1 Criar Arquivo de Ambiente

```bash
cd /opt/peticoesbr

# Criar .env para produção
nano .env
```

**Conteúdo do .env:**

```bash
# Database (PostgreSQL 18 - Fora do Docker)
DATABASE_URL=postgresql://peticoesbr:SENHA_FORTE_AQUI@localhost:5432/peticoesbr
DB_HOST=172.17.0.1  # IP do host Docker
DB_PORT=5432
DB_NAME=peticoesbr
DB_USER=peticoesbr
DB_PASSWORD=SENHA_FORTE_AQUI

# JWT Secrets (Gerar com: openssl rand -base64 32)
JWT_SECRET=seu_jwt_secret_super_secreto_aqui_32_chars_min
JWT_REFRESH_SECRET=seu_refresh_secret_super_secreto_aqui_32_chars_min

# Backend
NODE_ENV=production
PORT=3001

# Frontend
VITE_API_URL=https://api.seudominio.com/api

# GitHub Container Registry
GITHUB_REPOSITORY_OWNER=seu-usuario-github
```

**⚠️ IMPORTANTE:** Gere novos JWT secrets:

```bash
# Gerar JWT_SECRET
openssl rand -base64 32

# Gerar JWT_REFRESH_SECRET
openssl rand -base64 32
```

### 4.2 Baixar docker-compose.prod.yml

```bash
# Clonar repositório ou criar arquivo manualmente
git clone https://github.com/SEU-USUARIO/peticoesbr.git .

# OU baixar apenas o docker-compose
wget https://raw.githubusercontent.com/SEU-USUARIO/peticoesbr/main/docker-compose.prod.yml
```

### 4.3 Ajustar docker-compose.prod.yml

```bash
nano docker-compose.prod.yml
```

**Ajustar DATABASE_URL no backend:**

```yaml
backend:
  environment:
    DATABASE_URL: postgresql://peticoesbr:SENHA@172.17.0.1:5432/peticoesbr
    # 172.17.0.1 é o IP do host Docker para acessar localhost
```

### 4.4 Pull das Imagens

```bash
# Login no GHCR (se necessário)
docker login ghcr.io

# Pull das imagens
docker compose -f docker-compose.prod.yml pull
```

### 4.5 Iniciar Aplicação

```bash
# Subir containers
docker compose -f docker-compose.prod.yml up -d

# Verificar logs
docker compose -f docker-compose.prod.yml logs -f

# Verificar status
docker compose -f docker-compose.prod.yml ps
```

---

## 📊 Parte 5: Configuração do Banco de Dados

### 5.1 Transferir Backup para o Servidor

```bash
# No servidor
scp usuario@origem:/path/backup-completo.tar.gz /opt/peticoesbr/

# Ou usar SFTP, rsync, etc.

# Descompactar
cd /opt/peticoesbr
tar -xzf backup-completo.tar.gz
```

### 5.2 Restaurar Banco de Dados

```bash
# Opção 1: Usando script de import (recomendado)
chmod +x scripts/import-database.sh

export DATABASE_URL="postgresql://peticoesbr:SENHA@localhost:5432/peticoesbr"
./scripts/import-database.sh database-backup/peticoesbr_backup_YYYYMMDD_HHMMSS.sql.gz

# Opção 2: Manualmente
gunzip -c database-backup/peticoesbr_backup_*.sql.gz | \
  psql -U peticoesbr -d peticoesbr -h localhost
```

### 5.3 Verificar Dados

```bash
# Conectar ao banco
psql -U peticoesbr -d peticoesbr -h localhost

# Verificar schemas
\dn

# Verificar tabelas
\dt control_plane.*
\dt public.*

# Verificar dados (exemplo)
SELECT COUNT(*) FROM control_plane.auth_users;
SELECT COUNT(*) FROM public.petitions;

# Sair
\q
```

### 5.4 Reiniciar Aplicação

```bash
# Reiniciar containers para conectar ao banco restaurado
docker compose -f docker-compose.prod.yml restart
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## 🌐 Configuração de Domínio e SSL (Opcional)

### Nginx Reverso (Recomendado)

```bash
# Instalar Nginx
sudo apt install nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/peticoesbr

# Conteúdo:
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Habilitar site
sudo ln -s /etc/nginx/sites-available/peticoesbr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

---

## 🔄 Atualizações Futuras

### Pull e Restart

```bash
cd /opt/peticoesbr

# Pull das novas imagens
docker compose -f docker-compose.prod.yml pull

# Recreate containers
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Verificar logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🛠️ Troubleshooting

### Backend não conecta ao PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar se aceita conexões
sudo netstat -plnt | grep 5432

# Testar conexão do container
docker exec -it peticoesbr-backend sh
apk add postgresql-client
psql "postgresql://peticoesbr:SENHA@172.17.0.1:5432/peticoesbr"

# Se falhar, ajustar pg_hba.conf
sudo nano /etc/postgresql/18/main/pg_hba.conf
# Adicionar: host peticoesbr peticoesbr 172.17.0.0/16 scram-sha-256

sudo systemctl restart postgresql
```

### Imagens não atualizam

```bash
# Forçar pull
docker compose -f docker-compose.prod.yml pull --ignore-pull-failures

# Limpar cache
docker system prune -a

# Rebuild sem cache
docker compose -f docker-compose.prod.yml build --no-cache --pull
```

### Ver logs detalhados

```bash
# Logs do backend
docker logs peticoesbr-backend -f --tail 100

# Logs do frontend
docker logs peticoesbr-frontend -f --tail 100

# Logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-18-main.log
```

### Problemas com uploads

```bash
# Verificar permissões
ls -la /var/peticoesbr/uploads
sudo chown -R 1000:1000 /var/peticoesbr/uploads
sudo chmod -R 755 /var/peticoesbr/uploads
```

---

## 📝 Checklist Final

- [ ] Código no GitHub
- [ ] GitHub Actions rodando e criando imagens GHCR
- [ ] Servidor com Docker instalado
- [ ] PostgreSQL 18 instalado e configurado
- [ ] Banco de dados restaurado
- [ ] Arquivo .env configurado com secrets
- [ ] Containers rodando (`docker ps`)
- [ ] Backend respondendo em `/api/health`
- [ ] Frontend acessível
- [ ] Nginx configurado (se usar)
- [ ] SSL configurado (se usar)
- [ ] Backup agendado

---

## 🎯 Comandos Úteis

```bash
# Ver containers rodando
docker ps

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Reiniciar tudo
docker compose -f docker-compose.prod.yml restart

# Parar tudo
docker compose -f docker-compose.prod.yml down

# Subir novamente
docker compose -f docker-compose.prod.yml up -d

# Limpar volumes (CUIDADO!)
docker compose -f docker-compose.prod.yml down -v

# Executar comando no container
docker exec -it peticoesbr-backend sh

# Verificar uso de recursos
docker stats
```

---

## 🆘 Suporte

Em caso de problemas:

1. Verificar logs: `docker logs peticoesbr-backend`
2. Verificar PostgreSQL: `sudo systemctl status postgresql`
3. Verificar conectividade: `docker exec -it peticoesbr-backend ping 172.17.0.1`
4. Consultar documentação do Docker
5. Contatar suporte Wescctech

---

**Desenvolvido por Wescctech** 🚀
