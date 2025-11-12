# Petições - Full-Stack Application

## Overview
This is a full-stack petition management system with React/Vite frontend and Node.js/Express/PostgreSQL backend. The application includes features for:
- Creating and managing petitions
- Email and WhatsApp campaigns
- Link bio/link tree pages
- Message templates
- Signature import/management
- File uploads (banners, logos)

## Project Architecture

### Technology Stack

#### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 6.1
- **Routing**: React Router DOM v7
- **State Management**: TanStack React Query (v5)
- **UI Components**: Radix UI + Custom components
- **Styling**: TailwindCSS with animations
- **Form Handling**: React Hook Form + Zod validation

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Replit-hosted Neon database)
- **File Uploads**: Multer (local storage in `backend/uploads/`)
- **CORS**: Enabled for frontend communication

### Backend Integration
- **Backend API**: Custom Node.js/Express REST API on port 3001
- **API Client**: Custom fetch-based client in `src/api/client.js`
- **Base44 Wrapper**: Compatibility layer in `src/api/index.js`
- **Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
  - `VITE_BASE_URL`: Base path for routing (production: `/peticoes/`, dev: `/`)

## Development Setup

### Running Locally on Replit
The application uses two workflows:
- **Backend**: Runs on port 3001 (internal API)
- **Frontend**: Runs on port 5000 (public webview)

Both workflows start automatically when you open the project.

### Manual Start
```bash
# Backend (in backend directory)
cd backend && npm start

# Frontend (in root directory)
npm run dev
```

### Build for Production
```bash
npm run build
```

This generates optimized static files in the `dist/` directory.

## Project Structure
```
.
├── backend/                # Backend Node.js/Express API
│   ├── src/
│   │   ├── server.js      # Main server file
│   │   ├── config/
│   │   │   └── schema.sql # Database schema
│   │   └── routes/        # API routes
│   │       ├── petitions.js
│   │       ├── signatures.js
│   │       ├── campaigns.js
│   │       ├── campaign-logs.js
│   │       ├── message-templates.js
│   │       ├── linkbio-pages.js
│   │       ├── linktree-pages.js
│   │       └── upload.js
│   ├── uploads/           # File storage (banners, logos)
│   └── package.json
│
├── src/                   # Frontend React application
│   ├── api/              # API client configuration
│   │   ├── client.js    # Core API client
│   │   ├── index.js     # Base44 wrapper
│   │   ├── entities.js  # Entity exports
│   │   └── integrations.js # Integration helpers
│   ├── components/       # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   └── ui/          # Radix UI component wrappers
│   ├── lib/             # Utility functions
│   ├── pages/           # Application pages/routes
│   └── utils/           # Additional utilities
│
└── package.json          # Frontend dependencies
```

## Database Schema

The PostgreSQL database includes 8 main tables with UUID primary keys:

1. **users**: User accounts for petition creators (UUID primary keys)
2. **petitions**: Petition data (title, description, goal, slug, etc.)
3. **signatures**: Individual petition signatures
4. **campaigns**: Email and WhatsApp campaigns
5. **campaign_logs**: Campaign execution logs
6. **message_templates**: Reusable message templates
7. **linkbio_pages**: Link bio pages (Instagram-style)
8. **linktree_pages**: Link tree pages (multi-link pages)

**Key Schema Features:**
- All tables use UUID primary keys with `uuid_generate_v4()` extension
- All `created_by` fields are UUID foreign keys referencing `users(id)` with `ON DELETE SET NULL`
- Schema uses `CREATE TABLE IF NOT EXISTS` for data persistence across server restarts
- Automatic schema initialization on backend startup via `backend/src/config/schema.sql`

## API Endpoints

All API endpoints are prefixed with `/api`:

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Petitions
- `GET /api/petitions` - List all petitions
- `GET /api/petitions/:id` - Get petition by ID
- `GET /api/petitions/slug/:slug` - Get petition by slug
- `POST /api/petitions` - Create new petition
- `PUT /api/petitions/:id` - Update petition
- `DELETE /api/petitions/:id` - Delete petition

### Signatures
- `GET /api/signatures` - List signatures (supports `?petition_id=X`)
- `GET /api/signatures/:id` - Get signature by ID
- `POST /api/signatures` - Create signature
- `PUT /api/signatures/:id` - Update signature
- `DELETE /api/signatures/:id` - Delete signature

### Campaigns
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Campaign Logs
- `GET /api/campaign-logs` - List logs (supports `?campaign_id=X`)
- `GET /api/campaign-logs/:id` - Get log by ID
- `POST /api/campaign-logs` - Create log
- `PUT /api/campaign-logs/:id` - Update log
- `DELETE /api/campaign-logs/:id` - Delete log

### Message Templates
- `GET /api/message-templates` - List templates
- `GET /api/message-templates/:id` - Get template by ID
- `POST /api/message-templates` - Create template
- `PUT /api/message-templates/:id` - Update template
- `DELETE /api/message-templates/:id` - Delete template

### LinkBio Pages
- `GET /api/linkbio-pages` - List bio pages
- `GET /api/linkbio-pages/:id` - Get bio page by ID
- `GET /api/linkbio-pages/slug/:slug` - Get bio page by slug
- `POST /api/linkbio-pages` - Create bio page
- `PUT /api/linkbio-pages/:id` - Update bio page
- `DELETE /api/linkbio-pages/:id` - Delete bio page

### LinkTree Pages
- `GET /api/linktree-pages` - List tree pages
- `GET /api/linktree-pages/:id` - Get tree page by ID
- `GET /api/linktree-pages/slug/:slug` - Get tree page by slug
- `POST /api/linktree-pages` - Create tree page
- `PUT /api/linktree-pages/:id` - Update tree page
- `DELETE /api/linktree-pages/:id` - Delete tree page

### File Upload
- `POST /api/upload` - Upload file (multipart/form-data)
- `GET /uploads/:filename` - Serve uploaded file

## Key Features
1. **Petition Management**: Create, list, view, and manage petitions with signature tracking
2. **Campaign Tools**: WhatsApp and Email campaign creation and management
3. **Link Pages**: Bio and link tree page builders with slug-based routing
4. **Templates**: Reusable message templates for campaigns
5. **Import Tools**: Bulk signature import functionality
6. **File Storage**: Local file uploads for petition banners and logos

## Configuration Notes

### Vite Configuration
- Development uses base path `/`
- Production deployment can use `/peticoes/` via `VITE_BASE_URL` environment variable
- Server configured for Replit:
  - Host: `0.0.0.0` on port `5000`
  - `allowedHosts: true` to accept Replit's dynamic proxy domains
  - HMR (Hot Module Replacement) working correctly
- Proxy configured for `/api` endpoints to backend (port 3001)
- Path aliases configured for clean imports (`@`, `@components`, `@pages`, etc.)

### Router Configuration
The application uses `BrowserRouter` with a dynamic basename read from `import.meta.env.BASE_URL`, allowing it to work both in development (root path) and production (sub-path).

### Backend Configuration
- **Port**: 3001 (internal, not exposed to public)
- **CORS**: Enabled for all origins (configure for production)
- **Database**: Auto-initialized on startup
- **File Storage**: `backend/uploads/` directory
- **Static Files**: Served via `/uploads` endpoint

## Recent Changes

### 2025-11-12: Real-Time Campaign Progress Updates
- **Added auto-refresh polling**: Campaign pages now poll every 3 seconds when campaigns are "enviando" (sending)
- **Database updates during send**: Campaigns update counters every 5 messages for real-time visibility
- **Smart polling**: Only polls when active campaigns exist, stops when all campaigns are idle
- **Files modified**: WhatsAppCampaigns.jsx, EmailCampaigns.jsx, CreateWhatsAppCampaign.jsx, CreateEmailCampaign.jsx
- **Result**: Campaign cards now show live progress (sent_count, success_count, failed_count) without manual refresh

### 2025-11-12: React Query Cache Fixes - Auto-Refresh Lists & Campaign Logs
- **Fixed list auto-refresh**: Changed PetitionsList.jsx queryKey from ["petitions-publicadas"] to ["petitions"] to match mutation invalidations
- **Removed all initialData**: Eliminated 12+ instances of `initialData: []` that prevented immediate data fetching
- **Fixed campaign logs display**: Removed initialData from CampaignLogsModal.jsx to enable log loading
- **Result**: Lists now update automatically after create/delete operations without requiring F5 refresh
- **Files affected**: PetitionsList.jsx, CampaignLogsModal.jsx, WhatsAppCampaigns.jsx, EmailCampaigns.jsx, CreateWhatsAppCampaign.jsx, CreateEmailCampaign.jsx, MessageTemplates.jsx, LinkTreePages.jsx, ImportSignatures.jsx, WhatsAppSender.jsx, EmailSender.jsx, LinkTreeView.jsx
- **Best practice**: Never use `initialData` with React Query as it blocks fresh fetches and causes stale data

### 2025-11-12: Final UUID Schema Migration & Data Persistence Fix
- **Fixed critical data persistence issue**: Removed DROP TABLE CASCADE statements that were deleting all data on server restart
- **Implemented idempotent schema**: All tables now use CREATE TABLE IF NOT EXISTS for data persistence
- **UUID foreign keys**: All created_by fields now properly reference users(id) with ON DELETE SET NULL
- **Users route added**: Full CRUD operations for user management
- **Database recreated**: Fresh tables with correct UUID schema and foreign key constraints
- **Zero Supabase references**: Confirmed complete removal via codebase search
- **Removed Supabase proxy**: Cleaned up vite.config.js proxy configuration
- **Updated PetitionsList.jsx**: Now uses base44 API wrapper instead of Supabase
- **Both workflows running**: Backend (port 3001) and Frontend (port 5000) operational
- **Dashboard loading**: Verified application loads correctly with empty database

### 2025-11-12: Complete Supabase → Node.js/Express Migration
- **Removed all Supabase dependencies** from frontend and backend
- **Created custom Node.js/Express backend** with full REST API
- **Implemented PostgreSQL schema** with 8 tables (users, petitions, signatures, campaigns, campaign_logs, message_templates, linkbio_pages, linktree_pages)
- **Added file upload functionality** using Multer (local storage)
- **Updated frontend API client** to use new backend
- **Fixed critical routing bug**: Slug routes now registered before /:id routes
- **Configured dual workflows**: Backend (port 3001) + Frontend (port 5000)
- **All 19 pages and components** updated to use new base44 API wrapper
- **Database initialization** automatic on backend startup
- **Testing**: Backend health check passing, frontend loading correctly

### 2025-11-12: Initial Replit Configuration
- Updated Vite config to use port 5000 and host 0.0.0.0
- Made base path configurable via environment variable
- Added `allowedHosts: true` to accept Replit's dynamic proxy domains
- Fixed router basename to use environment-based configuration
- Installed all frontend dependencies (559 packages)
- Created .gitignore and documentation
- Verified application runs successfully on Replit with working HMR

## User Preferences
- Prefer custom backend over third-party services for better control
- All code should be self-contained and runnable on Replit
- No external dependencies beyond npm packages

## Deployment

### Replit Deployment
The application is configured for VM deployment on Replit:
- **Frontend workflow**: Serves React app on port 5000 (webview)
- **Backend workflow**: API server on port 3001 (internal)
- **Database**: PostgreSQL (Replit-hosted Neon)
- **File Storage**: Local filesystem (`backend/uploads/`)
- **Type**: VM (stateful, maintains uploaded files)

**Note**: For production, consider:
1. Using cloud storage (S3, Cloudflare R2) for uploaded files
2. Configuring CORS to restrict origins
3. Adding authentication/authorization
4. Setting up proper error logging and monitoring
5. Using environment variables for sensitive configuration

### External Deployment (Docker/Nginx)
This project can also be deployed as separate containers:
- Frontend: Static build served via Nginx
- Backend: Node.js container with volume for uploads
- Database: PostgreSQL container or managed service
