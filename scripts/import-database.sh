#!/bin/bash

# Script de Import do Banco de Dados PostgreSQL
# PetiçõesBR - Restaura backup completo

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}PetiçõesBR - Database Import${NC}"
echo -e "${GREEN}======================================${NC}"

# Verificar se arquivo de backup foi fornecido
if [ -z "$1" ]; then
    echo -e "${RED}ERRO: Arquivo de backup não fornecido!${NC}"
    echo -e "\nUso: $0 <arquivo_backup.sql[.gz]>"
    echo -e "\nExemplo:"
    echo -e "  $0 ./database-backup/peticoesbr_backup_20250112_120000.sql"
    echo -e "  $0 ./database-backup/peticoesbr_backup_20250112_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}ERRO: Arquivo não encontrado: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Arquivo de backup: ${GREEN}$BACKUP_FILE${NC}"

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERRO: DATABASE_URL não está definida!${NC}"
    echo "Execute: export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL encontrada${NC}"

# Extrair informações da DATABASE_URL
DB_INFO=$(echo $DATABASE_URL | sed -e 's|postgresql://||' -e 's|?.*||')
DB_USER=$(echo $DB_INFO | cut -d: -f1)
DB_PASS=$(echo $DB_INFO | cut -d: -f2 | cut -d@ -f1)
DB_HOST=$(echo $DB_INFO | cut -d@ -f2 | cut -d: -f1)
DB_PORT=$(echo $DB_INFO | cut -d: -f3 | cut -d/ -f1)
DB_NAME=$(echo $DB_INFO | cut -d/ -f2)

echo -e "\n${YELLOW}Informações do Banco:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Exportar senha para psql
export PGPASSWORD="$DB_PASS"

echo -e "\n${RED}⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER todos os dados atuais!${NC}"
echo -e "${YELLOW}Pressione CTRL+C para cancelar ou ENTER para continuar...${NC}"
read

echo -e "\n${YELLOW}Restaurando banco de dados...${NC}"

# Verificar se arquivo está compactado
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}Descompactando e restaurando...${NC}"
    gunzip -c "$BACKUP_FILE" | psql \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      -d "$DB_NAME" \
      -v ON_ERROR_STOP=1
else
    echo -e "${YELLOW}Restaurando arquivo SQL...${NC}"
    psql \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      -d "$DB_NAME" \
      -v ON_ERROR_STOP=1 \
      -f "$BACKUP_FILE"
fi

# Limpar variável de senha
unset PGPASSWORD

echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}Import concluído com sucesso!${NC}"
echo -e "${GREEN}======================================${NC}"
