# Coding Standards & Project Scope

## Project Scope
- **Core**: Single Next.js 15 App Router application.
- **Frontend**: All runnable code is at the root.
- **Backend**: The `backend/` directory is currently a placeholder for future work.
- **Data Source**: Product data is scraped from `clone282.net`.

## Essential Commands
- **Install**: `npm install`
- **Development**: `npm run dev` (Currently running on port **3006**)
- **Linting**: `npm run lint`
- **Type Checking**: `npx tsc --noEmit`
- **Production Build**: `npm run build`

## Architecture Patterns
- **Directory Structure**:
  - `app/`: App Router routes and layouts.
  - `components/`: React components (organized by feature like `home/` or `ui/`).
  - `services/`: Business logic, API clients, and data parsing.
  - `public/`: Static assets.
- **Data Fetching**:
  - Use `unstable_cache` for remote catalog data.
  - Prefer server-side fetching for SEO and performance.
- **State Management**:
  - Auth and Wallet state is currently **in-memory** (using global variables) and resets on server restart.

## Coding Rules
- **TypeScript**: Always use TypeScript with proper interfaces for API responses.
- **Next.js 15**: Use the latest App Router patterns (e.g., `await searchParams`).
- **Data Parsing**: Centralize all HTML scraping and regex parsing in `services/catalog-data.ts`.
- **File Organization**: Keep logic in services rather than duplicating it in API routes or components.
