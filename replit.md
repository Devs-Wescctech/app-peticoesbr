# Petições - Full-Stack Application

## Overview
This full-stack petition management system enables users to create and manage petitions, run email and WhatsApp campaigns, and build personalized link bio/link tree pages. It offers a comprehensive, self-hosted solution for grassroots organizing and digital advocacy, including features for signature collection, communication, and online presence management, with a vision to empower digital advocacy.

## User Preferences
- Prefer custom backend over third-party services for better control
- All code should be self-contained and runnable on Replit
- No external dependencies beyond npm packages

## System Architecture

### Technology Stack
- **Frontend**: React 18.2, Vite 6.1, React Router DOM v7, TanStack React Query v5, Radix UI, TailwindCSS, React Hook Form, Zod
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Replit-hosted Neon database)
- **Authentication**: JWT with bcrypt hashing, Multi-Tenancy
- **File Uploads**: Multer (local storage)

### UI/UX Decisions
The frontend uses Radix UI for accessible components, styled with TailwindCSS for a modern and responsive design. This includes modern login pages with animated backgrounds and glassmorphism effects, and professional confirmation dialogs for destructive actions.

### Technical Implementations & Feature Specifications
- **Multi-Tenancy**: A central `control-plane` schema manages tenants. All data tables include a `tenant_id` column for row-level tenant isolation, enforced by API middleware.
- **Super Admin System**: A dedicated super administrator with system-wide privileges can manage all tenants and users. This includes an AdminDashboard with real-time statistics, tenant management (activate/suspend/delete), and user overview.
- **Authentication & Route Protection**: JWT-based authentication with refresh token rotation is implemented, supporting email/password and ready for Google OAuth. JWTs include `tenantId` and `isSuperAdmin` flags. All private routes are protected, redirecting unauthenticated users to a dedicated login page.
- **Petition Management**: CRUD operations for petitions, including goal tracking, slug generation, and signature collection, are tenant-scoped.
- **Campaign Tools**: Creation and management of Email and WhatsApp campaigns with tenant scoping, real-time progress updates, and message templates.
- **Link Pages**: Builders for "Link Bio" and "Link Tree" pages with custom slugs, all tenant-isolated.
- **Signature Management**: Functionality for importing and managing petition signatures with tenant validation.
- **File Uploads**: Local storage for petition banners and logos.
- **API Client**: Custom fetch-based client with a Base44 wrapper for frontend-backend communication.
- **Environment Variables**: Configurable `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `VITE_BASE_URL`.

### System Design Choices
- **Idempotent Schema**: Tables use `CREATE TABLE IF NOT EXISTS` for persistence.
- **UUID Primary Keys**: All tables use UUID primary keys.
- **Stateless Authentication**: JWT tokens ensure stateless authentication for scalability, including `userId`, `email`, and `tenantId` claims.
- **Tenant Isolation Pattern**: Protected routes use `authenticate` and `requireTenant` middleware. Database queries include `WHERE tenant_id = $tenantId` clauses.
- **Security**: Fail-fast validation for environment secrets. Cross-tenant access attempts return 404. DELETE operations require authentication and tenant ownership validation.
- **Optimized Data Fetching**: TanStack React Query is used for efficient data fetching, caching, and state management.
- **Replit-Optimized Deployment**: Configured for dual workflows (backend on 3001, frontend on 5000) and uses `0.0.0.0` host for Replit's dynamic proxy.
- **Docker Migration Infrastructure**: Complete containerization setup for production deployment with Dockerfiles for backend and frontend, `docker-compose` for development and production, and automated GitHub Actions CI/CD for building and pushing images to GHCR.

### Production Deployment Architecture
- **URL Atual**: https://peticoesbr.com.br/ (domínio raiz) ou https://dev.wescctech.com.br/peticoesbr (subpath legado)
- **Database**: PostgreSQL user `sup_cristian`, database `sup_cristian`
- **Nginx Pattern**: 
  - Domínio raiz: `/etc/nginx/snippets/peticoesbr-root.conf`
  - Subpath: `/etc/nginx/snippets/peticoesbr.conf`
- **Containers**: 
  - Frontend: ghcr.io/devs-wescctech/peticoesbr-frontend (port 8080 → Nginx proxy)
  - Backend: ghcr.io/devs-wescctech/peticoesbr-backend (port 3001)
- **VITE_BASE_URL**: `/` para domínio raiz, `/peticoesbr/` para subpath
- **Public Routes**: `/p?s=slug` para petições, `/bio?slug=x` para páginas bio
- **File Uploads**: Volume mounted at `/path/to/uploads:/app/uploads`, served via Nginx proxy to backend
- **Deployment Path**: `/var/www/html/peticoesbr` contains `docker-compose.yml`, `.env`, and `uploads/` directory
- **Update Process**: `docker-compose down && docker-compose pull && docker-compose up -d`

## External Dependencies
- **PostgreSQL**: Primary database for all application data, hosted on Replit's Neon integration.
- **Multer**: Node.js middleware for handling `multipart/form-data` for file uploads.
- **bcryptjs**: Library for hashing passwords.
- **jsonwebtoken**: Library for implementing JWT-based authentication.
- **passport**: Authentication middleware for Node.js, integrated for future Google OAuth.