# Backend Dockerfile - PetiçõesBR
FROM node:20-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    postgresql-client \
    curl

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci && \
    npm cache clean --force

# Copiar código fonte
COPY . .

# Criar diretório para uploads
RUN mkdir -p uploads && \
    chmod 755 uploads

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Usuário não-root para segurança
USER node

# Comando de inicialização
CMD ["node", "src/index.js"]
