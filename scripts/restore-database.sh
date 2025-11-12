#!/bin/bash

set -e

echo "🔧 PetiçõesBR - Script de Restauração do Banco de Dados"
echo "========================================================="

# Verificar se DATABASE_URL está definido
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não está definido!"
    echo "Execute: export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Extrair informações do DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\(.*\)/\1/p' | cut -d'?' -f1)

echo "📊 Configuração do Banco:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Definir PGPASSWORD para conexão sem prompt
export PGPASSWORD=$DB_PASS

# Verificar conexão
echo "🔍 Testando conexão..."
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
    echo "❌ Erro: Não foi possível conectar ao PostgreSQL!"
    exit 1
fi
echo "✅ Conexão OK!"
echo ""

# Limpar banco se já existir
echo "🧹 Limpando banco de dados existente..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
DROP SCHEMA IF EXISTS public CASCADE;
DROP SCHEMA IF EXISTS control_plane CASCADE;
CREATE SCHEMA public;
CREATE SCHEMA control_plane;
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL ON SCHEMA control_plane TO $DB_USER;
EOF

echo "✅ Banco limpo!"
echo ""

# Restaurar backup
BACKUP_FILE="database-backup/peticoesbr_backup_20251112_183849.sql.gz"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Erro: Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "📥 Restaurando backup..."
gunzip -c $BACKUP_FILE | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME 2>&1 | grep -v "^$"

echo ""
echo "✅ Backup restaurado com sucesso!"
echo ""

# Verificar dados
echo "🔍 Verificando dados importados:"
echo ""

echo "👥 Usuários (auth_users):"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT email, is_super_admin FROM public.auth_users;"

echo ""
echo "🏢 Tenants:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT name, status FROM public.tenants;"

echo ""
echo "📋 Petições:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT title, slug FROM public.petitions LIMIT 5;"

echo ""
echo "✅ RESTAURAÇÃO CONCLUÍDA!"
echo ""
echo "🔐 Credenciais de teste:"
echo "  Super Admin: tecnologia@wescctech.com.br / admin123"
echo "  Tenant 2: user@tenant2.com / demo123"
echo "  Teste: teste@teste / teste123"
echo ""
