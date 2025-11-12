# 🚀 PetiçõesBR - Sistema de Gestão de Petições

Sistema completo de gestão de petições com arquitetura multi-tenant, campanhas automatizadas e páginas personalizadas.

---

## ✨ Funcionalidades

### 📝 Gestão de Petições
- Criação e gerenciamento de petições ilimitadas
- Sistema de metas e acompanhamento de progresso
- Coleta de assinaturas com validação
- Páginas públicas personalizadas para cada petição
- Upload de imagens (banner e logo)

### 📧 Campanhas Automatizadas
- **Email**: Envio massivo de emails para apoiadores
- **WhatsApp**: Campanhas via WhatsApp com links personalizados
- Templates de mensagens reutilizáveis
- Logs detalhados de envios

### 🌐 Páginas Personalizadas
- **Link Bio**: Páginas estilo Instagram (@seu.perfil)
- **Link Tree**: Múltiplos links organizados
- Slugs personalizados e URLs amigáveis

### 🔐 Multi-Tenancy
- Isolamento completo de dados por organização
- Sistema de controle de acesso (Owner, Admin, Member)
- Super Admin com acesso total ao sistema
- Autenticação JWT com refresh tokens

### 👤 Super Admin
- Painel exclusivo para `tecnologia@wescctech.com.br`
- Gestão completa de tenants e usuários
- Estatísticas do sistema em tempo real
- Criação e gerenciamento de organizações

---

## 🏗️ Arquitetura

### Stack Tecnológico

**Frontend:**
- React 18.2 + Vite 6.1
- TailwindCSS + Radix UI
- React Router v7
- TanStack React Query v5
- React Hook Form + Zod

**Backend:**
- Node.js + Express.js
- PostgreSQL 18 (Drizzle ORM)
- JWT Authentication
- Multer (uploads)

**DevOps:**
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- GitHub Container Registry (GHCR)
- Nginx (production)

### Estrutura do Projeto

```
peticoesbr/
├── backend/               # API Node.js + Express
│   ├── src/
│   │   ├── index.js      # Entry point
│   │   ├── server.js     # Express app
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation
│   │   └── utils/        # Helpers
│   ├── Dockerfile        # Backend container
│   └── package.json
│
├── src/                  # Frontend React
│   ├── api/             # API client
│   ├── components/      # React components
│   ├── pages/           # Page components
│   └── App.jsx
│
├── shared/              # Código compartilhado
│   └── schema.ts        # Drizzle schema (PostgreSQL)
│
├── scripts/             # Utilitários
│   ├── export-database.sh
│   └── import-database.sh
│
├── database-backup/     # Backups do banco
│
├── .github/
│   └── workflows/
│       └── docker-publish.yml  # CI/CD automático
│
├── docker-compose.yml         # Dev local
├── docker-compose.prod.yml    # Produção
├── Dockerfile                 # Frontend container
├── DEPLOY.md                  # Guia completo de deploy
└── README.md                  # Este arquivo
```

---

## 🚀 Deploy para Produção

### Opção 1: Deploy Rápido (GitHub → GHCR → Servidor)

1. **Push para GitHub:**
```bash
git push origin main
```

2. **Aguardar GitHub Actions:**
   - Acesse: https://github.com/SEU-USUARIO/peticoesbr/actions
   - Aguarde build das imagens Docker
   - Imagens criadas automaticamente no GHCR

3. **No Servidor:**
```bash
# Pull e iniciar
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Opção 2: Deploy Completo

**Consulte o [DEPLOY.md](DEPLOY.md)** para guia completo passo a passo incluindo:
- Configuração do servidor
- Instalação do PostgreSQL 18
- Migração do banco de dados
- Configuração de domínio e SSL
- Troubleshooting

---

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 18
- Git

### Setup Rápido

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/peticoesbr.git
cd peticoesbr

# Instalar dependências
npm install
cd backend && npm install && cd ..

# Configurar variáveis de ambiente
cp .env.example .env
cp backend/.env.example backend/.env

# Editar .env com suas credenciais
nano .env
nano backend/.env

# Criar banco de dados
createdb peticoesbr

# Push schema para o banco
cd backend
npm run db:push
cd ..

# Iniciar backend
cd backend
npm start  # Roda na porta 3001

# Iniciar frontend (em outro terminal)
npm run dev  # Roda na porta 5000
```

Acesse: `http://localhost:5000`

### Com Docker (Desenvolvimento)

```bash
# Subir tudo (PostgreSQL + Backend + Frontend)
docker compose up -d

# Ver logs
docker compose logs -f

# Parar
docker compose down
```

---

## 📊 Banco de Dados

### Export

```bash
# Exportar banco completo
./scripts/export-database.sh

# Arquivos gerados em database-backup/
```

### Import

```bash
# Restaurar backup
export DATABASE_URL="postgresql://user:pass@host:5432/db"
./scripts/import-database.sh database-backup/backup.sql.gz
```

### Migração de Schema

```bash
# Após alterar shared/schema.ts
cd backend
npm run db:push

# Forçar (se houver conflitos)
npm run db:push --force
```

---

## 🔑 Credenciais Padrão

**Super Admin:**
- Email: `tecnologia@wescctech.com.br`
- Senha: `admin123`
- Acesso: Painel Admin em `/AdminDashboard`

**Usuário Tenant 2:**
- Email: `user@tenant2.com`
- Senha: `demo123`

**Usuário Teste:**
- Email: `teste@teste`
- Senha: `teste123`

⚠️ **IMPORTANTE:** Altere estas senhas em produção!

---

## 📦 Imagens Docker (GHCR)

Após push para GitHub, as imagens são automaticamente criadas em:

```
ghcr.io/SEU-USUARIO/peticoesbr-backend:latest
ghcr.io/SEU-USUARIO/peticoesbr-frontend:latest
```

### Tags disponíveis:
- `latest` - última versão da branch main
- `main` - branch main
- `v1.0.0` - versões específicas (git tags)
- `sha-abc123` - por commit

---

## 🔧 Variáveis de Ambiente

### Backend (.env)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/database
JWT_SECRET=secret_key_32_chars_min
JWT_REFRESH_SECRET=refresh_secret_32_chars_min
NODE_ENV=production
PORT=3001
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3001/api
```

**Produção:**
```bash
VITE_API_URL=https://api.seudominio.com/api
```

Consulte `.env.example` e `backend/.env.example` para referência completa.

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📝 Licença

Desenvolvido por **Wescctech** - Todos os direitos reservados © 2025

---

## 🆘 Suporte

- **Documentação:** [DEPLOY.md](DEPLOY.md)
- **Issues:** https://github.com/SEU-USUARIO/peticoesbr/issues
- **Email:** tecnologia@wescctech.com.br

---

## 🎯 Roadmap

- [ ] OAuth Google (código já preparado)
- [ ] Integração com serviços de email (SendGrid, Mailgun)
- [ ] Integração com WhatsApp Business API
- [ ] Analytics e métricas avançadas
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] API pública para integrações
- [ ] App Mobile (React Native)

---

**Feito com ❤️ pela Wescctech**
