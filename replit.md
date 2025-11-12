# Petições - Full-Stack Application

## Overview
This is a full-stack petition management system designed to empower users to create and manage petitions, run email and WhatsApp campaigns, and build personalized link bio/link tree pages. The project aims to provide a comprehensive, self-hosted solution for grassroots organizing and digital advocacy, offering robust features for signature collection, communication, and online presence management.

## User Preferences
- Prefer custom backend over third-party services for better control
- All code should be self-contained and runnable on Replit
- No external dependencies beyond npm packages

## System Architecture

### Technology Stack
- **Frontend**: React 18.2, Vite 6.1, React Router DOM v7, TanStack React Query v5, Radix UI, TailwindCSS, React Hook Form, Zod
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Replit-hosted Neon database)
- **Authentication**: JWT with bcrypt hashing, Multi-Tenancy (Database-per-tenant with control-plane)
- **File Uploads**: Multer (local storage)

### UI/UX Decisions
The frontend utilizes Radix UI for accessible and customizable components, styled with TailwindCSS for a modern and responsive design.

### Technical Implementations & Feature Specifications
- **Multi-Tenancy**: Central `control-plane` schema manages tenants and authentication. All data tables include `tenant_id` column for row-level tenant isolation.
- **Tenant Data Isolation** (Implemented Nov 12, 2025): All API routes enforce tenant scoping via `authenticate` and `requireTenant` middleware. Every CRUD operation filters data by `tenant_id` from JWT token. Signatures validate tenant ownership via JOIN with petitions table. Cross-tenant access returns 404.
- **Super Admin System** (Implemented Nov 12, 2025): Dedicated super administrator with system-wide privileges via `is_super_admin` boolean field in `auth_users` table. Super admin account (tecnologia@wescctech.com.br) has elevated access to manage all tenants and users. JWT includes `isSuperAdmin` flag for authorization. Protected routes use `requireSuperAdmin` middleware. Admin panel at `/AdminDashboard` with real-time statistics, tenant management (activate/suspend/delete), and user overview.
- **Authentication & Route Protection** (Implemented Nov 12, 2025): JWT-based authentication with refresh token rotation, supporting email/password and ready for Google OAuth. JWT tokens include `tenantId` claim extracted from `tenant_users` table. Includes role-based access control (owner, admin, member) per tenant. All private routes protected with `PrivateRoute` component that redirects unauthenticated users to `/Login`. Public routes (PetitionLanding, p, bio, Login) remain accessible without authentication. Logout functionality available in sidebar. Environment variables `JWT_SECRET` and `JWT_REFRESH_SECRET` are required at startup (fail-fast validation).
- **Petition Management**: CRUD operations for petitions with tenant scoping, including goal tracking, slug generation, and signature collection. All petitions are isolated by tenant_id.
- **Campaign Tools**: Creation and management of Email and WhatsApp campaigns with tenant scoping, real-time progress updates and message templates. All campaigns isolated by tenant_id.
- **Link Pages**: Dedicated builders for "Link Bio" (e.g., Instagram-style) and "Link Tree" (multi-link) pages with custom slugs. All link pages isolated by tenant_id.
- **Signature Management**: Functionality for importing and managing petition signatures with tenant validation via petition ownership (JOIN-based).
- **File Uploads**: Local storage for petition banners and logos.
- **API Client**: Custom fetch-based client with a Base44 wrapper for frontend-backend communication.
- **Environment Variables**: Configurable `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `VITE_BASE_URL` for flexible deployment.

### System Design Choices
- **Idempotent Schema**: All tables use `CREATE TABLE IF NOT EXISTS` for data persistence across server restarts.
- **UUID Primary Keys**: All tables utilize UUID primary keys with `uuid_generate_v4()`.
- **Stateless Authentication**: JWT tokens ensure stateless authentication for scalability. Tokens include `userId`, `email`, and `tenantId` claims.
- **Tenant Isolation Pattern**: All protected routes use `authenticate` + `requireTenant` middleware chain. Database queries include `WHERE tenant_id = $tenantId` clause. Related tables (signatures, campaign_logs) validate tenant ownership via JOINs with parent tables.
- **Security**: Fail-fast validation for required environment secrets. All tenant-bound routes return 404 for cross-tenant access attempts. DELETE operations require both authentication and tenant ownership validation.
- **Optimized Data Fetching**: TanStack React Query is used for efficient data fetching, caching, and state management, with careful handling of `initialData` to prevent stale data.
- **Replit-Optimized Deployment**: Configured for dual workflows (backend on 3001, frontend on 5000) and uses `0.0.0.0` host and `allowedHosts: true` for Replit's dynamic proxy.

## Recent Changes

### November 12, 2025 - Complete Super Admin Management Panel Implementation
- **Backend APIs Expansion** - Complete CRUD functionality for system management:
  - User Management: `POST /api/admin/users` (create), `PUT /api/admin/users/:id` (update), `DELETE /api/admin/users/:id` (delete)
  - Tenant Management: `POST /api/admin/tenants` (create), `PUT /api/admin/tenants/:id` (update with limits)
  - Tenant-User Assignment: `GET/POST/PUT/DELETE /api/admin/tenant-users` for linking users to tenants with roles
  - Protection: Super admin can delete any user except tecnologia@wescctech.com.br (self-protection)
  - Security: All routes protected with `requireSuperAdmin` middleware, bcrypt password hashing, input validation
- **AdminDashboard Complete Rewrite** - Modern tabbed interface with full CRUD operations:
  - 4 tabs: Dashboard (statistics), Usuários (user management), Tenants (organization management), Atribuições (user-tenant assignments)
  - User Management: Create/edit/delete users, toggle super admin status, manage verification
  - Tenant Management: Create/edit/delete tenants, configure plans (free/pro/enterprise), set limits (petitions/signatures/campaigns), status control
  - Assignment Management: Link users to tenants with roles (owner/admin/member), view all assignments, remove assignments
  - Modal-based workflows using Radix UI Dialog components
  - Enhanced error handling: detects 403 from all endpoints, not just stats
- **System Architecture**: Super admin (tecnologia@wescctech.com.br) has exclusive control over tenant creation, user creation, and all system assignments. Regular tenant admins can only manage their own tenant data.

### November 12, 2025 - Modern Login UI & Route Protection Implementation
- Created modern split-screen Login page (`/Login`) with:
  - Responsive design: split-screen on desktop, stacked on mobile
  - Animated gradient background with floating orbs
  - Glassmorphism effects and smooth transitions
  - Feature showcase on left panel (desktop)
  - Clean, minimalist form on right panel
  - Loading states with spinner animation
  - Error states with shake animation
  - Demo credentials displayed in styled cards
- Implemented `PrivateRoute` component to protect all authenticated routes
- Added automatic redirection: unauthenticated users → Login, authenticated users → Dashboard
- Added Logout button in sidebar with token cleanup
- Updated Layout to exclude Login from sidebar/navigation
- All private routes now require authentication before access
- Public routes (PetitionLanding, /p, /bio, Login) remain accessible without authentication

### November 12, 2025 - Super Admin System Implementation
- Added `is_super_admin` boolean field to `auth_users` table
- Created super admin account: tecnologia@wescctech.com.br with system-wide privileges
- Implemented `requireSuperAdmin` middleware for protecting admin-only routes
- Built comprehensive admin API at `/api/admin/*`:
  - `GET /api/admin/stats`: System-wide statistics (tenants, users, petitions, signatures, campaigns)
  - `GET /api/admin/tenants`: List all tenants with user/petition counts
  - `PUT /api/admin/tenants/:id/status`: Update tenant status (active/suspended/cancelled)
  - `DELETE /api/admin/tenants/:id`: Delete tenant and all associated data
  - `GET /api/admin/users`: List all users with tenant associations
- Created AdminDashboard frontend component (`/AdminDashboard`) with:
  - Real-time system statistics dashboard
  - Tenant management table with activate/suspend/delete actions
  - User overview with super admin badges and verification status
  - Responsive design with Radix UI components
- Updated JWT authentication to include `isSuperAdmin` flag in token claims
- Fixed auth.js to fetch `is_super_admin` field during login
- Tested and verified super admin access control: Only tecnologia@wescctech.com.br can access admin routes

### November 12, 2025 - Tenant Data Isolation Implementation
- Added `tenant_id` columns to all data tables (petitions, campaigns, message_templates, linkbio_pages, linktree_pages, campaign_logs)
- Migrated existing data to default tenant (4 petitions, 1 campaign, 1 linkbio page)
- Updated all API routes with tenant scoping:
  - `petitions.js`: All CRUD operations filter by tenant_id
  - `campaigns.js`: All CRUD operations filter by tenant_id (fixed critical security bug in DELETE endpoint)
  - `message_templates.js`: All CRUD operations filter by tenant_id
  - `linkbio-pages.js`: All CRUD operations filter by tenant_id
  - `linktree-pages.js`: All CRUD operations filter by tenant_id
  - `signatures.js`: All CRUD operations validate tenant via JOIN with petitions table
- Tested and verified tenant isolation: Tenant 2 cannot access Tenant 1 data (returns 404)
- Security improvements: Removed hardcoded JWT secrets, implemented fail-fast environment variable validation

## External Dependencies
- **PostgreSQL**: Primary database for all application data, hosted on Replit's Neon integration.
- **Multer**: Node.js middleware for handling `multipart/form-data`, used for file uploads.
- **bcryptjs**: Library for hashing passwords.
- **jsonwebtoken**: Library for implementing JWT-based authentication.
- **passport**: (Installed, ready for Google OAuth integration) Authentication middleware for Node.js.