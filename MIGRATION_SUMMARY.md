# 📦 Resumo da Migração - PetiçõesBR

**Data:** 12 de Novembro de 2025  
**Status:** ✅ Pronto para migração

---

## ✅ O que foi criado

### 🐳 Docker & Infraestrutura

1. **Dockerfiles**
   - ✅ `backend/Dockerfile` - Backend Node.js otimizado
   - ✅ `Dockerfile` - Frontend multi-stage (Build + Nginx)
   - ✅ `.dockerignore` e `backend/.dockerignore` - Otimização de builds

2. **Docker Compose**
   - ✅ `docker-compose.yml` - Desenvolvimento local (com PostgreSQL)
   - ✅ `docker-compose.prod.yml` - Produção (PostgreSQL externo)

3. **CI/CD**
   - ✅ `.github/workflows/docker-publish.yml` - Build automático no GitHub Actions
   - ✅ Push automático para GHCR (GitHub Container Registry)
   - ✅ Suporte multi-arquitetura (amd64, arm64)

### 📊 Banco de Dados

1. **Scripts de Migração**
   - ✅ `scripts/export-database.sh` - Export completo (schema + dados)
   - ✅ `scripts/import-database.sh` - Import/restauração
   - ✅ Executáveis e prontos para uso

2. **Backup Atual**
   - ✅ `database-backup/peticoesbr_backup_20251112_183833.sql` (50KB)
   - ✅ `database-backup/peticoesbr_backup_20251112_183849.sql.gz` (9KB compactado)
   - ✅ Schema + Dados completos incluídos

### 📝 Documentação

1. **Guias Completos**
   - ✅ `DEPLOY.md` - Guia completo de migração (passo a passo)
   - ✅ `README.md` - Documentação geral do projeto
   - ✅ `.env.example` - Exemplo de variáveis de ambiente
   - ✅ `backend/.env.example` - Variáveis do backend

2. **Este Arquivo**
   - ✅ `MIGRATION_SUMMARY.md` - Resumo e checklist

---

## 📋 Checklist de Migração

### Fase 1: GitHub (✅ Pronto para executar)

- [ ] Criar repositório no GitHub
- [ ] Fazer push do código: `git push origin main`
- [ ] Aguardar GitHub Actions completar
- [ ] Verificar imagens criadas no GHCR:
  - `ghcr.io/SEU-USUARIO/peticoesbr-backend:latest`
  - `ghcr.io/SEU-USUARIO/peticoesbr-frontend:latest`

### Fase 2: Preparação do Servidor

- [ ] Instalar Docker e Docker Compose
- [ ] Instalar PostgreSQL 18
- [ ] Criar diretórios:
  ```bash
  sudo mkdir -p /opt/peticoesbr
  sudo mkdir -p /var/peticoesbr/uploads
  ```
- [ ] Configurar PostgreSQL:
  ```sql
  CREATE DATABASE peticoesbr;
  CREATE USER peticoesbr WITH PASSWORD 'senha_forte';
  GRANT ALL PRIVILEGES ON DATABASE peticoesbr TO peticoesbr;
  ```

### Fase 3: Deploy da Aplicação

- [ ] Copiar `docker-compose.prod.yml` para `/opt/peticoesbr/`
- [ ] Criar arquivo `.env` com as variáveis (ver `.env.example`)
- [ ] Gerar JWT secrets:
  ```bash
  openssl rand -base64 32  # JWT_SECRET
  openssl rand -base64 32  # JWT_REFRESH_SECRET
  ```
- [ ] Fazer pull das imagens:
  ```bash
  docker compose -f docker-compose.prod.yml pull
  ```
- [ ] Subir containers:
  ```bash
  docker compose -f docker-compose.prod.yml up -d
  ```

### Fase 4: Migração do Banco

- [ ] Transferir backup para o servidor:
  ```bash
  scp database-backup/*.sql.gz servidor:/opt/peticoesbr/
  ```
- [ ] Restaurar banco de dados:
  ```bash
  export DATABASE_URL="postgresql://peticoesbr:senha@localhost:5432/peticoesbr"
  ./scripts/import-database.sh database-backup/peticoesbr_backup_*.sql.gz
  ```
- [ ] Verificar dados:
  ```sql
  SELECT COUNT(*) FROM control_plane.auth_users;
  SELECT COUNT(*) FROM public.petitions;
  ```
- [ ] Reiniciar aplicação:
  ```bash
  docker compose -f docker-compose.prod.yml restart
  ```

### Fase 5: Configuração Opcional

- [ ] Configurar Nginx reverso
- [ ] Configurar SSL (Certbot)
- [ ] Configurar domínio
- [ ] Ajustar `VITE_API_URL` no `.env`

---

## 🎯 Estrutura de Arquivos Criados

```
peticoesbr/
├── .github/
│   └── workflows/
│       └── docker-publish.yml      ✅ GitHub Actions CI/CD
│
├── backend/
│   ├── Dockerfile                  ✅ Backend container
│   ├── .dockerignore              ✅ Otimização build
│   └── .env.example               ✅ Variáveis backend
│
├── database-backup/
│   ├── peticoesbr_backup_*.sql    ✅ Backup completo
│   └── peticoesbr_backup_*.sql.gz ✅ Backup compactado
│
├── scripts/
│   ├── export-database.sh         ✅ Script de export
│   └── import-database.sh         ✅ Script de import
│
├── Dockerfile                      ✅ Frontend container
├── .dockerignore                  ✅ Otimização build
├── docker-compose.yml             ✅ Desenvolvimento local
├── docker-compose.prod.yml        ✅ Produção
├── .env.example                   ✅ Variáveis gerais
├── DEPLOY.md                      ✅ Guia de deploy
├── README.md                      ✅ Documentação geral
└── MIGRATION_SUMMARY.md           ✅ Este arquivo
```

---

## 📦 Dados Incluídos no Backup

### Control Plane (Autenticação & Tenants)
- ✅ 3 usuários (super admin + 2 tenants)
- ✅ 2 tenants configurados
- ✅ Relações tenant-usuário (roles)

### Dados das Aplicações
- ✅ 4 petições
- ✅ Assinaturas das petições
- ✅ 1 campanha de email
- ✅ 1 página Link Bio
- ✅ Templates de mensagens

### Configurações
- ✅ JWT secrets (precisam ser regenerados)
- ✅ Permissões e roles
- ✅ Super admin configurado

---

## 🔑 Credenciais (alterar em produção!)

**Super Admin:**
- Email: tecnologia@wescctech.com.br
- Senha: admin123
- Acesso: `/AdminDashboard`

**Tenant 2:**
- Email: user@tenant2.com
- Senha: demo123

**Teste:**
- Email: teste@teste
- Senha: teste123

⚠️ **CRÍTICO:** Altere todas as senhas após deploy em produção!

---

## 🚀 Fluxo de Atualização (Futuro)

1. **Fazer alterações no código**
2. **Push para GitHub:**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```
3. **GitHub Actions faz build automático**
4. **No servidor:**
   ```bash
   cd /opt/peticoesbr
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d --force-recreate
   ```

---

## 🛠️ Comandos Úteis

### Docker
```bash
# Ver status
docker ps

# Ver logs
docker logs peticoesbr-backend -f
docker logs peticoesbr-frontend -f

# Reiniciar
docker compose -f docker-compose.prod.yml restart

# Parar tudo
docker compose -f docker-compose.prod.yml down

# Subir novamente
docker compose -f docker-compose.prod.yml up -d
```

### PostgreSQL
```bash
# Conectar
psql -U peticoesbr -d peticoesbr -h localhost

# Ver tabelas
\dt control_plane.*
\dt public.*

# Backup manual
pg_dump -U peticoesbr peticoesbr > backup.sql

# Restore manual
psql -U peticoesbr peticoesbr < backup.sql
```

---

## ⚠️ Pontos de Atenção

### Obrigatório Antes do Deploy

1. **Gerar novos JWT secrets:**
   ```bash
   openssl rand -base64 32
   ```

2. **Alterar senhas padrão:**
   - Super admin: tecnologia@wescctech.com.br
   - Todos os usuários de teste

3. **Ajustar DATABASE_URL:**
   - No `.env`: apontar para PostgreSQL do servidor
   - Usar `172.17.0.1` como host (IP do Docker host)

4. **Configurar VITE_API_URL:**
   - Para domínio real: `https://api.seudominio.com/api`
   - Ou IP público do servidor

### Opcional mas Recomendado

1. **Configurar backup automático:**
   - Cron job diário executando `export-database.sh`
   - Upload para S3/Cloud Storage

2. **Configurar SSL:**
   - Certbot com Nginx
   - Renovação automática

3. **Monitoramento:**
   - Logs centralizados
   - Alertas de erro
   - Métricas de uso

---

## ✅ Validação Final

Após deploy, verificar:

- [ ] Backend responde: `curl http://localhost:3001/api/health`
- [ ] Frontend acessível: `curl http://localhost/`
- [ ] Login funciona com credenciais de teste
- [ ] Petições listadas corretamente
- [ ] Upload de imagens funciona
- [ ] Dados do banco carregados corretamente

---

## 📞 Suporte

- **Documentação completa:** [DEPLOY.md](DEPLOY.md)
- **Email:** tecnologia@wescctech.com.br
- **GitHub Issues:** (após criar repo)

---

**Preparado por Wescctech** - 12/11/2025 ✅
