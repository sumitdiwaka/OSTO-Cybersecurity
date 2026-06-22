# Engineering Notes

## Architectural decisions

The assignment doesn't mandate a framework, but requirement #6 (public
boards need to look right as link previews and be indexable) effectively
rules out a plain client-rendered SPA — a crawler or link-unfurler that
doesn't execute JS can't see per-page Open Graph tags generated client-side.
That pushed the framework choice to **Next.js (App Router)**, which gives:

- Server-rendered public pages with real per-board metadata (`generateMetadata`)
- Route Handlers, which double as the mock backend — no second repo/process
- File-based routing that makes the public/private split visible in the
  folder structure itself, not just in code

The app is split into two structurally separate trees:

- `src/app/(app)/...` — everything behind auth (workspaces, boards, the
  board view). Gated centrally by `src/proxy.ts` (Next 16 renamed
  `middleware.ts` → `proxy.ts`; same behavior), which runs before any
  matched route renders. One check, not one-per-page.
- `src/app/public/board/[boardId]/...` — explicitly outside that group and
  excluded from the proxy matcher, so it has zero auth dependency by
  construction rather than by a remembered `if (isPublic)` somewhere.

The mock backend (`src/lib/server/store.ts`) is an in-memory array-based
store, not a database. Every route handler talks to it through named
functions (`getBoard`, `createTask`, `updateTask`, ...) rather than
touching arrays directly, and it injects artificial network latency
(180–500ms) on every read. That last part is deliberate: it makes loading
states something you actually see and have to handle, not a state that
only theoretically exists.

## State management

Server data and UI data are kept in two different places on purpose:

- **Server state** (session, workspaces, boards, tasks, activity) lives in
  **TanStack Query**. It owns caching, loading/error flags, and — for
  mutations — optimistic updates with rollback.
- **UI-only state** (current workspace id, which modal is open, whether
  the activity panel is collapsed, the session-expired flag) lives in a
  small **Zustand** store (`src/store/useAppStore.ts`).

The reason for the split: putting server data into a client store and then
keeping it in sync with the network is a common source of bugs (stale
caches, race conditions on refetch). React Query already solves that, so
Zustand's job is deliberately narrow. Redux wasn't used at all — for a
store this small it would be the kind of over-engineering the brief
explicitly warns against.

One more detail: the **URL, not Zustand, is the source of truth** for
"which workspace/board am I looking at" (`/w/[workspaceId]/board/[boardId]`).
That's what makes refresh, back/forward, and sharing a link all work for
free. `WorkspaceLayout` just mirrors the URL param into Zustand for the
rare component that needs it without being underneath that route segment.

## Data fetching strategy

There's one chokepoint for HTTP: `src/lib/api/client.ts`. It standardizes
headers, credentials, and — importantly — the error shape: every failed
call throws a typed `ApiError` with a `status` and a `code`, and a 401
specifically dispatches a global `taskflow:session-expired` event rather
than being handled ad hoc wherever it happened to occur. `useAuth` listens
for that event once and drives the session-expired modal from it.

On top of that, `src/lib/api/endpoints.ts` is a typed 1:1 mapping to the
mock API surface described in the assignment (`/login`, `/workspaces`,
`/boards`, `/board/:id`, `/task`, `/task/:id`, plus a couple of additions —
`/activity` and `/workspaces/:id/members` — needed to support the activity
feed and assignee picker). Nothing above this layer calls `fetch` directly.

`src/hooks/*` wrap those endpoints in React Query. The mutation hooks
(`useTaskMutations`) all follow the same pattern: snapshot the current
board from the cache, apply an optimistic version immediately, roll back
on error, invalidate on settle. This is what makes drag-and-drop feel
instant despite the simulated latency — without it, every drop would visibly
wait on the network before the card moved.

The activity feed (`useActivity`) polls `/api/activity` every 4 seconds via
`refetchInterval` rather than using WebSockets. See trade-offs below for why.

## Component organization

```
components/
  ui/        Button, Input, Modal, Badge, Avatar, Skeleton/EmptyState/ErrorState
  layout/    Navbar, WorkspaceSwitcher
  auth/      LoginForm, SessionExpiredModal
  board/     BoardView, Column, TaskCard, TaskModal
  activity/  ActivityFeed
  public/    (the public board page is mostly self-contained; styling is
             shared with the rest of the app via the same Tailwind tokens)
```

`components/ui` is intentionally "dumb" — no data fetching, no app-specific
logic, just props in / markup out. That's what makes it reusable on both
the authenticated board view and the public page without modification.
Every feature component, in turn, owns its own data hooks rather than
receiving data from a distant parent — `Column` and `TaskCard` are mostly
presentational, but `BoardView` itself calls `useBoard`/`useTaskMutations`
directly rather than a page component fetching and drilling props down
several levels.

Every screen that touches the network follows the same loading → error →
empty → content branching, using the same three primitives
(`Skeleton`, `ErrorState`, `EmptyState`) instead of each screen inventing
its own.

## Trade-offs and assumptions

- **Mock auth, not real auth.** The "JWT" is a hand-rolled token (HMAC-
  signed via Web Crypto, not an actual JWT library), and passwords are
  compared in plaintext against a hardcoded fixture. That's appropriate
  for "implement a basic login flow using mock APIs" — a real version
  would use something like Auth.js, bcrypt for password hashing, and
  short-lived access tokens with refresh rotation.
- **In-memory store, not a database.** Data resets on server restart and
  wouldn't survive a serverless cold start in production. Acceptable
  because the assignment asks for a frontend with mock APIs, not a
  persistence layer — and because every route handler depends only on
  `store.ts`'s function signatures, swapping in Postgres/Prisma later is a
  contained change, not a rewrite.
- **Polling instead of WebSockets for "real-time."** No socket server to
  run, works unmodified behind any proxy or serverless host, and at the
  scale implied here (a handful of teammates on one board) a few seconds
  of staleness is a reasonable price for that simplicity. This is the
  first thing I'd swap out if board size or team size grew — noted as a
  "what I'd do with more time" below rather than skipped silently.
- **Status is independent of column placement.** The brief lists "status"
  as task metadata but also structures boards as user-named Kanban columns
  ("Backlog", "Reported", ...). Rather than force-deriving status from
  whichever column a card sits in, I modeled them as separate fields —
  column position is spatial/workflow organization the team controls
  (free text), status is a fixed-enum tag independent of it. The trade-off
  is that dragging a card to "Done" doesn't auto-set status to `done`; an
  explicit edit does. I think this is the more honest model of how teams
  actually use boards (a card can sit in a "Blocked" column without its
  status meaning anything different), but it's a real assumption worth
  flagging.
- **Session TTL defaults to 30 minutes** (configurable via
  `SESSION_TTL_MS`) — long enough to not be annoying, short enough to be
  a meaningful demonstration. Since waiting 30 minutes to show "handles
  session expiration gracefully" isn't practical in a review, there's also
  a "Simulate expired session" button in the navbar that triggers the
  exact same expiry path on demand. It's clearly labeled as a demo
  affordance and isn't something a production build would ship.
- **Authorization is enforced server-side, not just hidden in the UI.**
  Every board/task/activity endpoint checks workspace membership and
  returns 403 if the requester isn't a member — even though the UI
  wouldn't normally surface another workspace's data anyway. Treated as a
  real boundary, not a cosmetic one.

## Public page considerations

This was the part of the brief I spent the most deliberate effort on,
since "looks fine when you click it yourself" and "looks fine when Slack
unfurls it" are different bars to clear.

- The public board route (`src/app/public/board/[boardId]/page.tsx`) is a
  **Server Component** — no `"use client"`, no required hydration to see
  content. A crawler or unfurler gets full HTML on the first response.
- `generateMetadata` builds **per-board** Open Graph and Twitter Card tags
  from the real board title/description, not a static fallback image/text
  shared by every link.
- `opengraph-image.tsx` generates a **real, board-specific preview image**
  at request time (via `next/og`), rather than reusing one generic banner
  for every shared link.
- The board's structure is also exposed to automated systems as
  **JSON-LD** (`schema.org/ItemList`), separately from the visual HTML —
  "communicate content structure... to automated systems" read as a
  distinct requirement from "looks good to humans," so I treated it as one.
- `robots.ts` and `sitemap.ts` make indexing **opt-in per board**: only
  boards with `isPublic: true` are ever listed or allowed, the rest of the
  app defaults to `noindex` globally, and that default is only overridden
  on the public board route itself.
- A board that exists but isn't public 404s at its `/public/board/:id`
  URL (custom not-found page) instead of returning a "this board is
  private" message — the latter would confirm the board's existence to an
  unauthenticated prober, which is its own small information leak.
- The public page deliberately does **not** poll for live updates the way
  the authenticated board view does. It's meant to be fast, cacheable, and
  safe to embed/link externally; "accurate as of last fetch" is the right
  freshness model for that, not "live-collaborating," which is what the
  authenticated view is for.

## Optional enhancements implemented

- **Optimistic updates** across every task mutation, including drag-and-
  drop — implemented because it was needed for drag-and-drop to feel
  acceptable given the simulated network latency, not skipped as "nice to
  have."
- **Dynamic per-board Open Graph image generation.**
- **Server-side authorization** on every mutating endpoint, not just reads.

## What I'd do with more time

- Swap polling for WebSockets/SSE once team/board size justifies the
  added infrastructure.
- Undo/redo for task actions — the optimistic-update snapshots already
  taken in `useTaskMutations` would make this a relatively contained
  extension rather than a new system.
- Advanced filtering/search across a board (by assignee, priority, text).
- Swap `store.ts`'s in-memory arrays for Postgres + Prisma behind the same
  function signatures.
- Real auth (Auth.js) and password hashing if this ever needed to hold
  real user data instead of a fixture.
