# Frontend Dockerfile - PetiçõesBR (Multi-stage build)

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument para configurar base URL
ARG VITE_BASE_URL=/peticoesbr/

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci && \
    npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação com base URL configurável
ENV VITE_BASE_URL=${VITE_BASE_URL}
RUN npm run build

# Stage 2: Production com Nginx
FROM nginx:1.27-alpine

# Copiar build do frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY ./.docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]
