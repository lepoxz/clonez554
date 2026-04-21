# AI Agent Project Introduction

Welcome to the **FB88 MMO** repository. This project is a specialized e-commerce platform for MMO (Massively Multiplayer Online) game resources and accounts.

## Core Concepts
The platform acts as a proxy for `clone282.net`, providing a premium, mobile-optimized experience with integrated local payment (SePay).

## Tech Stack
- **Framework**: Next.js 15 (App Router).
- **Language**: TypeScript.
- **Styling**: Vanilla CSS.
- **Data Flow**: Scrape → Cache → Render.
- **Persistence**: Temporary In-memory (Global variables).

## Key Components
- **Catalog**: Live scraping and filtering of accounts.
- **Checkout**: SePay QR generation and status polling.
- **Deposit**: Wallet top-up system via SePay.
- **Auth**: Simple cookie-based session system.
- **Admin**: Dashboard to monitor transactions and user balances.

## Onboarding for Agents
- Read `.claude/rules/standard.md` for technical constraints.
- Check `.claude/memory/feature-registry.md` to see what's already built.
- Update `.claude/memory/current-state.md` if you find new environment constraints.
- Use the template in `.claude/memory/template.md` to record your actions.
