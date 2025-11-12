# Petições - React/Vite Application

## Overview
This is a React/Vite frontend application for managing petitions, campaigns, and signatures. The application uses Supabase as its backend service and includes features for:
- Creating and managing petitions
- Email and WhatsApp campaigns
- Link bio/link tree pages
- Message templates
- Signature import/management

## Project Architecture

### Technology Stack
- **Frontend Framework**: React 18.2
- **Build Tool**: Vite 6.1
- **Routing**: React Router DOM v7
- **State Management**: TanStack React Query (v5)
- **UI Components**: Radix UI + Custom components
- **Styling**: TailwindCSS with animations
- **Form Handling**: React Hook Form + Zod validation

### Backend Integration
- **Primary Backend**: Supabase (configured via proxy)
- **API Client**: Custom fetch-based client in `src/api/base44Client.js`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: Supabase instance URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
  - `VITE_SUPABASE_BUCKET`: Storage bucket name (default: "petitions")
  - `VITE_API_URL`: Custom API endpoint (optional)
  - `VITE_BASE_URL`: Base path for routing (production: `/peticoes/`, dev: `/`)

## Development Setup

### Running Locally on Replit
The application is configured to run on port 5000 with host `0.0.0.0` for Replit compatibility.

```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

This generates optimized static files in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Project Structure
```
src/
├── api/               # API client configuration
├── components/        # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   └── ui/           # Radix UI component wrappers
├── lib/              # Utility functions
├── pages/            # Application pages/routes
└── utils/            # Additional utilities
```

## Key Features
1. **Petition Management**: Create, list, view, and manage petitions with signature tracking
2. **Campaign Tools**: WhatsApp and Email campaign creation and management
3. **Link Pages**: Bio and link tree page builders
4. **Templates**: Reusable message templates for campaigns
5. **Import Tools**: Bulk signature import functionality

## Configuration Notes

### Vite Configuration
- Development uses base path `/`
- Production deployment can use `/peticoes/` via `VITE_BASE_URL` environment variable
- Server configured for Replit:
  - Host: `0.0.0.0` on port `5000`
  - `allowedHosts: true` to accept Replit's dynamic proxy domains
  - HMR (Hot Module Replacement) working correctly
- Proxy configured for `/supabase` endpoints to avoid CORS issues
- Path aliases configured for clean imports (`@`, `@components`, `@pages`, etc.)

### Router Configuration
The application uses `BrowserRouter` with a dynamic basename read from `import.meta.env.BASE_URL`, allowing it to work both in development (root path) and production (sub-path).

## Recent Changes
- **2025-11-12**: Configured for Replit environment
  - Updated Vite config to use port 5000 and host 0.0.0.0
  - Made base path configurable via environment variable (defaults to `/` in dev, can be set to `/peticoes/` for production)
  - **Added `allowedHosts: true`** to accept requests from Replit's dynamic proxy domains
  - Fixed router basename to use environment-based configuration
  - Installed all dependencies (559 packages)
  - Configured deployment as autoscale with build and preview commands
  - Created .gitignore and documentation
  - Verified application runs successfully on Replit with working HMR

## User Preferences
- None recorded yet

## Deployment

### Replit Deployment
The application is configured for autoscale deployment on Replit:
- **Build command**: `npm run build` - Generates optimized production build
- **Run command**: `npx vite preview --host 0.0.0.0 --port 5000` - Serves the production build
- **Port**: 5000 (required for Replit webview)
- **Type**: Autoscale (stateless web application)

### External Deployment (Docker/Nginx)
This project is also designed to be deployed as a Docker container with Nginx. See the original README.md for detailed Docker deployment instructions using GitHub Container Registry with the base path `/peticoes/`.
