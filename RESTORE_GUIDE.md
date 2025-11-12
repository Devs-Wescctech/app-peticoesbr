# 🔧 Guia de Restauração do Banco de Dados

## ⚠️ Problema Identificado

O backup foi criado com as tabelas no schema `public`, mas você pode ter tentado acessar `control_plane.auth_users`.

---

## 🚀 Solução - Execute no Servidor

### **Passo 1: Limpar banco de dados**

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Dentro do PostgreSQL, execute:
DROP DATABASE IF EXISTS peticoesbr;
CREATE DATABASE peticoesbr;
GRANT ALL PRIVILEGES ON DATABASE peticoesbr TO peticoesbr;
\q
```

### **Passo 2: Baixar e restaurar backup**

```bash
cd /opt/peticoesbr

# Baixar backup do GitHub
wget https://raw.githubusercontent.com/Devs-Wescctech/app-peticoesbr/main/database-backup/peticoesbr_backup_20251112_183849.sql.gz

# Restaurar (digite a senha quando solicitado)
gunzip -c peticoesbr_backup_20251112_183849.sql.gz | psql -U peticoesbr -d peticoesbr -h localhost
```

### **Passo 3: Verificar dados importados**

```bash
# Verificar usuários
psql -U peticoesbr -d peticoesbr -h localhost -c "SELECT email, is_super_admin FROM public.auth_users;"

# Verificar tenants
psql -U peticoesbr -d peticoesbr -h localhost -c "SELECT name, status FROM public.tenants;"

# Verificar petições
psql -U peticoesbr -d peticoesbr -h localhost -c "SELECT title FROM public.petitions;"
```

**Saída esperada dos usuários:**
```
              email               | is_super_admin 
----------------------------------+----------------
 tecnologia@wescctech.com.br      | t
 user@tenant2.com                 | f
 teste@teste                      | f
```

### **Passo 4: Criar schemas necessários**

Se o backend precisar do schema `control_plane`:

```bash
psql -U peticoesbr -d peticoesbr -h localhost <<EOF
CREATE SCHEMA IF NOT EXISTS control_plane;
GRANT ALL ON SCHEMA control_plane TO peticoesbr;

-- Mover tabela auth_users para control_plane se necessário
-- ALTER TABLE public.auth_users SET SCHEMA control_plane;
EOF
```

---

## 🔍 Verificação Completa

Depois de restaurar, execute:

```bash
# Ver todos os schemas
psql -U peticoesbr -d peticoesbr -h localhost -c "\dn"

# Ver todas as tabelas no schema public
psql -U peticoesbr -d peticoesbr -h localhost -c "\dt public.*"

# Contar registros
psql -U peticoesbr -d peticoesbr -h localhost <<EOF
SELECT 
  (SELECT COUNT(*) FROM public.auth_users) as usuarios,
  (SELECT COUNT(*) FROM public.tenants) as tenants,
  (SELECT COUNT(*) FROM public.petitions) as peticoes,
  (SELECT COUNT(*) FROM public.signatures) as assinaturas;
EOF
```

**Resultado esperado:**
```
 usuarios | tenants | peticoes | assinaturas 
----------+---------+----------+-------------
        3 |       2 |        4 |          11
```

---

## 🐳 Subir Aplicação

Depois que o banco estiver OK:

```bash
cd /opt/peticoesbr

# Subir containers
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## ❌ Se der erro de "relation does not exist"

Verifique qual schema o backend está usando:

```bash
# Ver logs do backend
docker logs peticoesbr-backend --tail 100

# Se aparecer "control_plane.auth_users"
# Execute:
psql -U peticoesbr -d peticoesbr -h localhost <<EOF
CREATE SCHEMA IF NOT EXISTS control_plane;
ALTER TABLE public.auth_users SET SCHEMA control_plane;
ALTER TABLE public.tenants SET SCHEMA control_plane;
ALTER TABLE public.tenant_users SET SCHEMA control_plane;
ALTER TABLE public.refresh_tokens SET SCHEMA control_plane;
EOF
```

---

## ✅ Sucesso!

Você deve conseguir acessar:

```
http://SEU_SERVIDOR_IP/
```

**Login:**
- Email: `tecnologia@wescctech.com.br`
- Senha: `admin123`

---

## 🆘 Problemas?

**Erro: "peer authentication failed"**
```bash
sudo nano /etc/postgresql/18/main/pg_hba.conf
# Mudar "peer" para "scram-sha-256" ou "md5"
sudo systemctl restart postgresql
```

**Erro: "password authentication failed"**
```bash
# Resetar senha do usuário
sudo -u postgres psql -c "ALTER USER peticoesbr PASSWORD 'SuaNovaSenha';"
```

**Ver todas as tabelas criadas:**
```bash
psql -U peticoesbr -d peticoesbr -h localhost -c "\dt+"
```
