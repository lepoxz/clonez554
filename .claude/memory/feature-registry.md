# Feature Registry (Implementation History)

## Completed Features
- [x] **Catalog Scraping**: Regex-based parsing of `clone282.net` (menu and products).
- [x] **Theme System**: Dark/Light mode toggle with persistence.
- [x] **Product Pages**: Dynamic routes for product details with image whitelisting.
- [x] **SePay Integration**: QR code generation (VietQR) and transaction querying.
- [x] **Manual Auth**: Cookie-based session management, Login/Logout UI.
- [x] **Wallet System**: In-memory balance tracking, transactions log, and order creation.
- [x] **Deposit System**: Automated top-up through SePay webhooks and polling.
- [x] **Admin Dashboard**: Real-time stats, deposit management, and order tracking.
- [x] **Project Metadata**: `.claude/` structure for agent persistence.

## In Progress / Planned
- [/] **Persistance**: Moving from in-memory to a real database (SQLite or PostgreSQL).
- [ ] **Email Notifications**: Integration with SMTP or SendGrid for order confirmation.
- [ ] **SEO Enhancements**: Better meta tags for product and category pages.
