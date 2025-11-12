# 🔐 Credenciais de Acesso - Sistema PetiçõesBR

## 👤 Usuários Disponíveis

### 🛡️ Super Admin (Acesso Total ao Sistema)
- **Email:** `tecnologia@wescctech.com.br`
- **Senha:** `admin123`
- **Permissões:** Acesso completo ao painel administrativo e ao tenant padrão
- **Tenant:** Tenant Padrão

### 👥 Usuário Tenant 2
- **Email:** `user@tenant2.com`
- **Senha:** `demo123`
- **Permissões:** Acesso ao Tenant 2
- **Tenant:** Tenant 2

### 🧪 Usuário de Teste
- **Email:** `teste@teste`
- **Senha:** `teste123`
- **Permissões:** Acesso ao Tenant Padrão
- **Tenant:** Tenant Padrão

---

## 🔑 Como Fazer Login

1. Acesse a página de login: `/Login`
2. Digite o email e senha de um dos usuários acima
3. Clique em "Entrar no Sistema"
4. Você será redirecionado para o Dashboard

---

## 🎯 Funcionalidades por Tipo de Usuário

### Super Admin
- ✅ Acesso ao **Painel Administrativo** (`/AdminDashboard`)
- ✅ Gestão de todos os usuários do sistema
- ✅ Gestão de todos os tenants (organizações)
- ✅ Atribuir usuários a tenants
- ✅ Criar, editar e excluir petições
- ✅ Gerenciar campanhas
- ✅ Visualizar todas as estatísticas

### Usuários Regulares
- ✅ Criar, editar e excluir petições (do seu tenant)
- ✅ Gerenciar campanhas (do seu tenant)
- ✅ Visualizar assinaturas
- ✅ Criar páginas Link Bio e Link Tree
- ❌ Não tem acesso ao painel administrativo

---

## 🔐 Segurança

- Todas as senhas são hasheadas com **bcrypt**
- Autenticação via **JWT** (tokens de acesso e refresh)
- Multi-tenancy com **isolamento completo de dados**
- Tokens expiram após 1 hora (acesso) e 7 dias (refresh)

---

## 📝 Notas Importantes

- O sistema utiliza **multi-tenancy** - cada organização tem seus dados isolados
- O **Super Admin** é o único que pode criar novos tenants e usuários
- Usuários regulares só podem acessar dados do seu próprio tenant
- As credenciais acima foram atualizadas em **12/11/2025**

---

**⚠️ IMPORTANTE:** Não compartilhe estas credenciais em ambientes de produção. 
Estas são credenciais de **desenvolvimento/teste** apenas.
