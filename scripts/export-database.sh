#!/bin/bash

# Script de Export do Banco de Dados PostgreSQL
# PetiçõesBR - Exporta schema + dados completos

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}PetiçõesBR - Database Export${NC}"
echo -e "${GREEN}======================================${NC}"

# Diretório de backup
BACKUP_DIR="./database-backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/peticoesbr_backup_${TIMESTAMP}.sql"

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

echo -e "\n${YELLOW}Verificando conexão com banco de dados...${NC}"

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERRO: DATABASE_URL não está definida!${NC}"
    echo "Execute: export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL encontrada${NC}"

# Extrair informações da DATABASE_URL
# Formato: postgresql://user:password@host:port/database
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

# Exportar senha para pg_dump
export PGPASSWORD="$DB_PASS"

echo -e "\n${YELLOW}Exportando banco de dados...${NC}"

# Fazer backup completo (schema + dados)
pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  --create \
  --inserts \
  --no-owner \
  --no-acl \
  -f "$BACKUP_FILE"

# Limpar variável de senha
unset PGPASSWORD

# Verificar se backup foi criado
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "\n${GREEN}✓ Backup criado com sucesso!${NC}"
    echo -e "  Arquivo: ${GREEN}$BACKUP_FILE${NC}"
    echo -e "  Tamanho: ${GREEN}$BACKUP_SIZE${NC}"
    
    # Criar também uma versão compactada
    echo -e "\n${YELLOW}Compactando backup...${NC}"
    gzip -c "$BACKUP_FILE" > "${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN}✓ Backup compactado criado!${NC}"
    echo -e "  Arquivo: ${GREEN}${BACKUP_FILE}.gz${NC}"
    echo -e "  Tamanho: ${GREEN}$COMPRESSED_SIZE${NC}"
    
    # Criar arquivo com apenas o schema (sem dados)
    echo -e "\n${YELLOW}Criando backup apenas do schema...${NC}"
    SCHEMA_FILE="${BACKUP_DIR}/peticoesbr_schema_${TIMESTAMP}.sql"
    export PGPASSWORD="$DB_PASS"
    pg_dump \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      -d "$DB_NAME" \
      --schema-only \
      --clean \
      --if-exists \
      --no-owner \
      --no-acl \
      -f "$SCHEMA_FILE"
    unset PGPASSWORD
    
    echo -e "${GREEN}✓ Schema exportado!${NC}"
    echo -e "  Arquivo: ${GREEN}$SCHEMA_FILE${NC}"
    
    echo -e "\n${GREEN}======================================${NC}"
    echo -e "${GREEN}Export concluído com sucesso!${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo -e "\nArquivos criados:"
    echo -e "  1. ${GREEN}$BACKUP_FILE${NC} (Completo - SQL)"
    echo -e "  2. ${GREEN}${BACKUP_FILE}.gz${NC} (Completo - Compactado)"
    echo -e "  3. ${GREEN}$SCHEMA_FILE${NC} (Apenas Schema)"
    
else
    echo -e "\n${RED}ERRO: Falha ao criar backup!${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Para restaurar em outro servidor:${NC}"
echo -e "  gunzip -c ${BACKUP_FILE}.gz | psql -h HOST -U USER -d DATABASE"
echo -e "\nOu usando o arquivo descompactado:"
echo -e "  psql -h HOST -U USER -d DATABASE < $BACKUP_FILE"
