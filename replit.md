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
- **Multi-Tenancy**: Central `control-plane` schema manages tenants and authentication, with each tenant having its own isolated schema.
- **Authentication**: JWT-based authentication with refresh token rotation, supporting email/password and ready for Google OAuth. Includes role-based access control (owner, admin, member) per tenant.
- **Petition Management**: CRUD operations for petitions, including goal tracking, slug generation, and signature collection.
- **Campaign Tools**: Creation and management of Email and WhatsApp campaigns, with real-time progress updates and message templates.
- **Link Pages**: Dedicated builders for "Link Bio" (e.g., Instagram-style) and "Link Tree" (multi-link) pages with custom slugs.
- **Signature Management**: Functionality for importing and managing petition signatures.
- **File Uploads**: Local storage for petition banners and logos.
- **API Client**: Custom fetch-based client with a Base44 wrapper for frontend-backend communication.
- **Environment Variables**: Configurable `DATABASE_URL` and `VITE_BASE_URL` for flexible deployment.

### System Design Choices
- **Idempotent Schema**: All tables use `CREATE TABLE IF NOT EXISTS` for data persistence across server restarts.
- **UUID Primary Keys**: All tables utilize UUID primary keys with `uuid_generate_v4()`.
- **Stateless Authentication**: JWT tokens ensure stateless authentication for scalability.
- **Optimized Data Fetching**: TanStack React Query is used for efficient data fetching, caching, and state management, with careful handling of `initialData` to prevent stale data.
- **Replit-Optimized Deployment**: Configured for dual workflows (backend on 3001, frontend on 5000) and uses `0.0.0.0` host and `allowedHosts: true` for Replit's dynamic proxy.

## External Dependencies
- **PostgreSQL**: Primary database for all application data, hosted on Replit's Neon integration.
- **Multer**: Node.js middleware for handling `multipart/form-data`, used for file uploads.
- **bcryptjs**: Library for hashing passwords.
- **jsonwebtoken**: Library for implementing JWT-based authentication.
- **passport**: (Installed, ready for Google OAuth integration) Authentication middleware for Node.js.