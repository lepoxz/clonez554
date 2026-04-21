# Security & Environment Guidelines

## Environment Variables
- **Storage**: Use `.env.local` for local development. Never commit `.env.local` to git.
- **Key Variables**:
  - `CLONE282_API_KEY`: Required for catalog scraping.
  - `SEPAY_BANK`, `SEPAY_ACCOUNT_NUMBER`, `SEPAY_ACCOUNT_NAME`: Required for QR generation.
  - `SEPAY_API_TOKEN`: Required for polling transaction status.
  - `SEPAY_WEBHOOK_API_KEY`: Required for verifying incoming payment notifications.
  - `ADMIN_PASSWORD`: Used for `admin` account login.

## Authentication (In-Memory Demo)
- **Role System**: Two roles: `admin` and `user`.
- **Session**: Cookie-based (`fb88_session`), base64 encoded JSON.
- **Verification**: Use `getSession()` in server components to protect routes and `redirect` to `/login` if unauthorized.
- **Admin Access**: `/admin` and `/api/admin/*` are restricted to `role === "admin"`.

## Payment Verification (SePay)
- **Polling**: Use `/api/sepay/status?orderCode=...` to check if a specific order is paid.
- **Webhook**: `/api/sepay/webhook` handles POST requests from SePay.
- **Deduplication**: Always check for duplicate transaction IDs using global memory `Set<number>`.
- **Authorization**: Validate the `Apikey` in the `Authorization` header against `SEPAY_WEBHOOK_API_KEY`.
