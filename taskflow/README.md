# TaskFlow

A multi-workspace task board with shareable public views, built for the
Frontend Engineering Assignment. Next.js 16 (App Router) + TypeScript +
Tailwind CSS, with a mocked backend (Next.js Route Handlers + an in-memory
store) so the whole thing runs with zero external services.

See **[ENGINEERING_NOTES.md](./ENGINEERING_NOTES.md)** for architecture,
state management, data-fetching, and trade-off decisions — that document
is the main thing worth reading alongside the code.

## Run it locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment
variables are required to run locally — see `.env.example` if you want to
customize the session length or site URL.

### Demo accounts

The login screen has one-click-to-fill demo accounts, or use these directly
(password is the same for all three):

| Email                  | Password      | Workspaces                          |
| ----------------------- | ------------- | ------------------------------------ |
| `alice@taskflow.dev`    | `password123` | Product Engineering, Marketing       |
| `bilal@taskflow.dev`    | `password123` | Product Engineering                  |
| `priya@taskflow.dev`    | `password123` | Product Engineering, Marketing       |

### Trying the public/shareable view

Open the **Q3 Roadmap** board (Product Engineering workspace) and click
"Copy public link" — or just visit `/public/board/b1` directly, logged out.
It's server-rendered, has a real Open Graph image and JSON-LD, and is
listed in `/sitemap.xml`. `/public/board/b2` (Bug Triage) is intentionally
*not* public and will 404 on that route, to show the public/private
distinction is enforced per-board.

### Trying session expiry

There's a "Simulate expired session" button in the navbar (a deliberate
demo affordance — see ENGINEERING_NOTES.md) that triggers the same flow a
real timeout would, without making you wait. The real TTL defaults to 30
minutes and is configurable via `SESSION_TTL_MS` in `.env.local`.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Project structure

```
src/
  app/
    (app)/                  # authenticated area (auth-gated by proxy.ts)
      workspaces/           # workspace picker
      w/[workspaceId]/      # boards list + board view, scoped to a workspace
    public/board/[boardId]/ # public, unauthenticated, SSR'd board view
    api/                    # mock REST API (route handlers)
    login/
  components/                # organized by feature: ui, layout, auth, board, activity, public
  hooks/                      # React Query hooks (one per resource) + mutations
  lib/
    server/                   # store.ts (mock DB) + auth.ts — server-only
    api/                      # typed fetch client + endpoint functions
    types.ts                  # shared domain types
  store/useAppStore.ts        # Zustand — UI state only
  proxy.ts                    # route protection (Next.js 16's middleware replacement)
```
