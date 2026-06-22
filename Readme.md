# TaskFlow — Multi-Workspace Task Board

A frontend engineering assignment implementing a multi-workspace task board with shareable public views.

**Tech stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · TanStack Query · Zustand · dnd-kit · Framer Motion

---

## Quick start

Requires **Node.js 20+**

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

No database, no environment variables needed — everything runs locally out of the box.

---

## Demo accounts

Click any account on the login screen to auto-fill, or use these directly:

| Email | Password | Workspaces |
|---|---|---|
| `alice@taskflow.dev` | `password123` | Product Engineering, Marketing |
| `bilal@taskflow.dev` | `password123` | Product Engineering only |
| `priya@taskflow.dev` | `password123` | Product Engineering, Marketing |

---

## Key features to try

| Feature | How to try it |
|---|---|
| **Drag & drop** | Drag any task card across columns or reorder within a column |
| **Real-time activity** | Move a task — the activity panel updates within ~4s (polling) |
| **Public shareable view** | Visit `/public/board/b1` while logged out — no auth needed |
| **Open Graph image** | Visit `/public/board/b1/opengraph-image` directly |
| **Session expiry** | Click "Simulate expired session" in the navbar |
| **Cross-workspace scoping** | Log in as Bilal — he sees only 1 workspace, not Alice's 2 |
| **Private board protection** | Visit `/public/board/b2` — it 404s because that board is private |
| **Sitemap / robots** | Visit `/sitemap.xml` and `/robots.txt` |

---

## Scripts

```bash
npm run dev      # development server (with hot reload)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```

---

## Project structure

```
src/
├── app/
│   ├── (app)/                    # Auth-protected area
│   │   ├── workspaces/           # Workspace picker
│   │   └── w/[workspaceId]/      # Boards list + board view
│   ├── public/board/[boardId]/   # Public SSR board page + OG image
│   ├── api/                      # Mock REST API (Next.js route handlers)
│   └── login/                    # Login page
├── components/
│   ├── ui/                       # Button, Input, Modal, Badge, Avatar, etc.
│   ├── layout/                   # Navbar, WorkspaceSwitcher
│   ├── auth/                     # LoginForm, SessionExpiredModal
│   ├── board/                    # BoardView, Column, TaskCard, TaskModal
│   └── activity/                 # ActivityFeed
├── hooks/                        # React Query hooks (one per resource)
├── lib/
│   ├── server/                   # store.ts (mock DB) + auth.ts — server only
│   ├── api/                      # Typed fetch client + endpoint functions
│   └── types.ts                  # Shared domain types
├── store/                        # Zustand — UI state only
└── proxy.ts                      # Route protection (Next.js 16 middleware)
```

---

## Environment variables (all optional)

Copy `.env.example` to `.env.local` to override defaults:

```bash
# Absolute base URL for OG tags and sitemap (default: http://localhost:3000)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Session TTL in ms (default: 1800000 = 30 minutes)
# Set lower to quickly demo session expiry, e.g. 60000 = 1 minute
SESSION_TTL_MS=1800000

# HMAC secret for signing session tokens (change for any real deployment)
SESSION_SECRET=taskflow-dev-secret-do-not-use-in-prod
```

---

## Notes

- Data is **in-memory only** — resets on server restart. This is intentional for a mock-API assignment; see `ENGINEERING_NOTES.md` for the swap-in path to a real database.
- The "Simulate expired session" button in the navbar is a **demo affordance** — it triggers the exact same flow as a real timeout without having to wait 30 minutes.