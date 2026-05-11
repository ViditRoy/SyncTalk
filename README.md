# SyncTalk

SyncTalk is a real-time messaging application built with Next.js, React, TypeScript, Tailwind CSS, Drizzle ORM, and SQLite/libSQL. It supports user registration, login, protected chat access, direct and group conversations, message delivery, typing indicators, presence updates, and user-controlled privacy/settings.

## Stakeholder Summary

SyncTalk demonstrates a practical collaboration product for small teams or campus communities. The application gives users a secure account, lets them create conversations, exchange messages in near real time, see participant availability, and manage communication preferences. From a stakeholder perspective, the project shows an end-to-end product flow rather than an isolated prototype: authentication, persistence, messaging, settings, and live updates are integrated into a single usable experience.

The current implementation is suitable as a portfolio, academic, or proof-of-concept system. It uses a local SQLite-compatible database for repeatable demos and straightforward setup, while the data access layer is built around Drizzle/libSQL so it can be moved toward a hosted libSQL/Turso-style deployment later.

## Core Capabilities

- Account creation with password strength validation.
- Login with server-side session persistence and protected API access.
- Salted PBKDF2 password hashing, with compatibility for older SHA-256 demo hashes.
- Direct messages between two users.
- Group conversations with membership validation.
- Message storage, retrieval, and conversation-level authorization.
- Server-sent events for live message, conversation, typing, and presence updates.
- Presence display based on active sessions and user status settings.
- User settings for notifications, sound, status, private messages, read receipts, and last activity visibility.
- Responsive UI built with Tailwind CSS and shadcn/ui-style components.

## Technical Architecture

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- React Context for chat and settings state
- shadcn/ui-style component primitives

### Backend

- Next.js API routes under `app/api`
- SQLite/libSQL client through `@libsql/client`
- Drizzle ORM schema in `lib/db/schema.ts`
- Local database at `data/syncTalk.db` by default
- Server-sent events for lightweight real-time updates

### Data Model

The database contains tables for:

- `users`
- `sessions`
- `user_settings`
- `conversations`
- `messages`

The app also retains JSON fallback helpers in `lib/db/index.ts`, but the active default path is SQLite/libSQL.

## Important Files

- `app/chat/page.tsx` - protected chat page.
- `components/chat-main.tsx` - main message view.
- `components/conversation-sidebar.tsx` - conversation list and direct/group creation.
- `components/message-input.tsx` - message composition and typing events.
- `components/presence-panel.tsx` - user status display.
- `lib/auth.ts` - password hashing, verification, and session creation.
- `lib/api-utils.ts` - API authentication helpers.
- `lib/realtime.ts` - server-sent event client registry and event publishing.
- `lib/db/schema.ts` - Drizzle table definitions.
- `lib/db/index.ts` - application database access wrapper.
- `scripts/seed.ts` - demo data seeding.
- `scripts/run-migrations.ts` - migration runner.

## Setup

Install dependencies:

```bash
pnpm install
```

Create or verify environment configuration:

```bash
DATABASE_URL=file:data/syncTalk.db
```

Run migrations:

```bash
pnpm.cmd db:migrate
```

Seed demo data:

```bash
pnpm.cmd db:seed
```

Start development server:

```bash
pnpm.cmd dev
```

On Windows PowerShell, use `pnpm.cmd` if direct `pnpm` execution is blocked by script execution policy.

## Verification

Type-check the project:

```bash
pnpm.cmd typecheck
```

Create a production build:

```bash
pnpm.cmd build
```

Check database users:

```bash
pnpm.cmd exec tsx scripts/check-users.ts
```

Check basic presence/user integrity:

```bash
pnpm.cmd exec tsx scripts/check-presence.ts
```

## Demo Accounts

Seeded demo users include:

- `alice` / `Password1!`
- `bob` / `Password2!`
- `charlie` / `Password3!`

## Current Limitations

- Real-time delivery uses in-process server-sent events, so events are not shared across multiple server instances without an external pub/sub layer.
- Sessions are stored in the application database, but there is no refresh-token flow.
- The local SQLite database is intended for development and demos; production deployment should use a managed database and environment-specific secrets.
- There is no automated browser test suite yet.
- Presence is inferred from active sessions and selected status, not from continuous device heartbeat tracking.

## Professional Presentation Notes

When presenting SyncTalk to stakeholders, frame it as a working communication platform prototype with clear product value:

- It solves a recognizable collaboration problem: quick, organized communication through direct and group messages.
- It includes product features users expect: authentication, live updates, presence, typing indicators, settings, and message history.
- It demonstrates full-stack ownership: UI, API routes, persistence, security-sensitive auth logic, and database migrations.
- It has a clear path to production hardening: hosted database, external real-time pub/sub, stronger session lifecycle management, and automated end-to-end tests.
