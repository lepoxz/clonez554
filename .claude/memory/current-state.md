# Current Operational State

## Active Environment
- **Dev Port**: **3006** (Original 3001 is often busy).
- **Host**: `0.0.0.0`
- **Node Version**: Check via `node -v` (Standard for Next.js 15).

## Known Issues & Limitations
- **Data Freshness**: Cache TTL is 300s. Refresh `/api/catalog/products?reset=1` (if implemented) to force update.
- **Persistence**: All data in `globalThis.__` stores resets when the process restarts. Keep this in mind when testing payments.
- **Port Conflict**: If port 3006 is busy, check `netstat -ano | findstr :3006`.

## Recent Changes
- **Context System**: Created the `.claude/` directory structure for project memory and rules.
- **Documentation**: Migrated `AGENTS.md` and `CLAUDE.md` to the new centralized system.
- **UI Update**: Changed Admin list in `home-content.tsx` to a single entry: "Admin Anh Quân".
- **Feature Completion**: Finalized SePay, Auth, and Wallet integration for the initial release.
- **Dev Env**: Dev server successfully moved to port **3006** to avoid EADDRINUSE errors.
