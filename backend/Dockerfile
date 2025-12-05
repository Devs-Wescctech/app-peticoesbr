# Backend Dockerfile - PetiçõesBR
FROM node:20-slim AS base

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install --production=false && \
    npm cache clean --force

# Copiar código fonte
COPY . .

# Criar diretório para uploads com permissões corretas para usuário node
RUN mkdir -p uploads && \
    chown -R node:node uploads && \
    chmod 755 uploads

# Garantir que todo o diretório app pertença ao node
RUN chown -R node:node /app

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Usuário não-root para segurança
USER node

# Comando de inicialização
CMD ["node", "src/server.js"]
