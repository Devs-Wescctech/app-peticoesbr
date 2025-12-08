# Prompt para Construção de Backend Node.js + Express + PostgreSQL Multi-Tenant

Use este prompt ao importar um projeto do Base44 via Git para construir o backend completo.

---

## PROMPT PARA USAR:

```
Preciso que você construa um backend completo para minha aplicação React importada do Base44. O backend deve seguir esta arquitetura:

## ARQUITETURA GERAL

### Stack Tecnológica
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL (usar DATABASE_URL do ambiente)
- **Autenticação**: JWT com access token + refresh token
- **Upload de Arquivos**: Multer (armazenamento local)
- **Módulos ES**: Usar `"type": "module"` no package.json

### Estrutura de Pastas
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Conexão PostgreSQL
│   │   ├── control-plane-schema.sql  # Schema de auth e tenants
│   │   └── schema.sql           # Schema das tabelas de dados
│   ├── middleware/
│   │   └── auth.js              # Middlewares de autenticação
│   ├── middlewares/
│   │   └── upload.js            # Configuração Multer
│   ├── routes/
│   │   ├── auth.js              # Rotas de autenticação
│   │   ├── tenants.js           # Gestão de tenants
│   │   ├── users.js             # Gestão de usuários
│   │   ├── admin.js             # Rotas super admin
│   │   ├── upload.js            # Upload de arquivos
│   │   └── [outras-rotas].js    # Rotas específicas do domínio
│   ├── utils/
│   │   ├── auth.js              # Funções JWT e bcrypt
│   │   └── initDatabase.js      # Inicialização do banco
│   └── server.js                # Entry point
├── uploads/                     # Diretório de uploads
├── package.json
└── Dockerfile
```

## SISTEMA MULTI-TENANT

### Conceito
- Um banco de dados único com isolamento por `tenant_id`
- Tabela `tenants` no control-plane gerencia organizações
- Tabela `tenant_users` mapeia usuários a múltiplos tenants
- Cada tabela de dados tem coluna `tenant_id` para isolamento

### Tabelas Control-Plane (auth/tenants)
```sql
-- tenants: Organizações/Clientes
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    database_url TEXT NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    max_petitions INTEGER DEFAULT 10,
    max_signatures INTEGER DEFAULT 1000,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

-- auth_users: Usuários autenticados (global)
CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    google_id VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

-- tenant_users: Mapeamento usuário → tenant
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- refresh_tokens: Tokens de refresh JWT
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_date TIMESTAMP DEFAULT NOW()
);
```

### Padrão para Tabelas de Dados
Todas as tabelas de negócio devem ter:
- `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- `tenant_id UUID NOT NULL` (para isolamento)
- `created_date TIMESTAMP DEFAULT NOW()`
- `updated_date TIMESTAMP DEFAULT NOW()`
- Índice em `tenant_id`

## AUTENTICAÇÃO JWT

### Estrutura do Token
```javascript
// Access Token (15 min de validade)
{
  userId: "uuid",
  email: "user@email.com",
  tenantId: "uuid" | null,  // null se não selecionou tenant
  isSuperAdmin: boolean
}

// Refresh Token (7 dias)
{
  userId: "uuid",
  type: "refresh"
}
```

### Middlewares de Auth
```javascript
// authenticate: Valida JWT e adiciona req.user
// requireTenant: Exige tenantId no token
// requireSuperAdmin: Exige isSuperAdmin = true
// optionalAuthenticate: Não bloqueia, só adiciona user se tiver token
```

### Rotas de Auth Necessárias
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login (retorna tenants do usuário)
- `POST /api/auth/refresh` - Renova access token
- `POST /api/auth/logout` - Invalida refresh token
- `GET /api/auth/me` - Dados do usuário + tenants
- `POST /api/auth/select-tenant` - Seleciona tenant e retorna novo token

## PADRÃO DE ROTAS PROTEGIDAS

### Rota Privada (tenant-scoped)
```javascript
router.get('/', authenticate, requireTenant, async (req, res) => {
  const { tenantId } = req.user;
  const result = await pool.query(
    'SELECT * FROM tabela WHERE tenant_id = $1',
    [tenantId]
  );
  res.json(result.rows);
});
```

### Rota Pública (sem auth)
```javascript
router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  const result = await pool.query(
    'SELECT * FROM tabela WHERE slug = $1',
    [slug]
  );
  res.json(result.rows[0]);
});
```

### Rota Super Admin
```javascript
router.get('/all', authenticate, requireSuperAdmin, async (req, res) => {
  // Acesso a todos os dados sem filtro de tenant
});
```

## CONFIGURAÇÃO DO SERVIDOR

### server.js
```javascript
import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDatabase } from './utils/initDatabase.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantsRouter);
// ... outras rotas

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
```

### package.json
```json
{
  "name": "app-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "body-parser": "^1.20.2",
    "cookie-parser": "^1.4.6",
    "express-session": "^1.17.3"
  }
}
```

## DOCKERFILE

```dockerfile
FROM node:20-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production=false && npm cache clean --force

COPY . .

# Permissões para uploads
RUN mkdir -p uploads && \
    chown -R node:node uploads && \
    chmod 755 uploads && \
    chown -R node:node /app

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

USER node

CMD ["node", "src/server.js"]
```

## VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```env
DATABASE_URL=postgresql://user:pass@host:5432/database
JWT_SECRET=seu-jwt-secret-seguro
JWT_REFRESH_SECRET=seu-refresh-secret-seguro
PORT=3001
NODE_ENV=production
```

## WORKFLOWS REPLIT

Configurar dois workflows:
1. **backend**: `cd backend && npm start` (porta 3001)
2. **frontend**: `npm run dev` (porta 5000)

## PADRÕES IMPORTANTES

1. **Isolamento de Dados**: Toda query de dados deve incluir `WHERE tenant_id = $tenantId`
2. **Segurança**: Tentativas de acessar dados de outro tenant retornam 404 (não 403)
3. **UUIDs**: Usar uuid_generate_v4() para todos os IDs
4. **Timestamps**: Usar triggers para updated_date automático
5. **Uploads**: Servir arquivos estáticos via Express, não nginx interno

## ANÁLISE DO FRONTEND BASE44

Antes de criar as rotas, analise o código do frontend em `src/api/` e `src/pages/` para identificar:
1. Quais entidades existem (ex: petitions, campaigns, users)
2. Quais endpoints estão sendo chamados
3. Quais campos cada entidade possui
4. Quais rotas são públicas vs privadas

Crie o schema SQL e rotas baseado nessa análise.
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar pasta `backend/` com estrutura de pastas
- [ ] Configurar `package.json` com dependências
- [ ] Criar `src/config/database.js` (conexão pg)
- [ ] Criar `src/config/control-plane-schema.sql` (auth + tenants)
- [ ] Criar `src/config/schema.sql` (tabelas de negócio com tenant_id)
- [ ] Criar `src/utils/auth.js` (funções JWT + bcrypt)
- [ ] Criar `src/utils/initDatabase.js` (executar schemas)
- [ ] Criar `src/middleware/auth.js` (authenticate, requireTenant, etc)
- [ ] Criar `src/routes/auth.js` (register, login, refresh, logout, me, select-tenant)
- [ ] Criar `src/routes/tenants.js` (CRUD tenants)
- [ ] Criar rotas específicas do domínio (ex: petitions, campaigns)
- [ ] Criar `src/server.js` (entry point)
- [ ] Criar `Dockerfile` para produção
- [ ] Configurar workflow do backend no Replit
- [ ] Testar todas as rotas
- [ ] Conectar frontend ao backend (ajustar `src/api/`)
