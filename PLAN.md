# PriceOS Implementation Plan

**Document date:** 2026-06-19  
**Current state:** Vite + React 19 prototype, single app, all data mocked  
**Target state:** Next.js 15 monorepo, real backend, real crawlers, production-ready

---

## Codebase Audit Summary

### What exists and works (even if mocked)

**App shell (`src/App.tsx`)**
- Global header with PriceOS branding and version badge
- Two-tab navigation: Public Platform / Admin Control
- Admin unlock modal with hardcoded passcode (`admin123` / `1234`) — purely cosmetic security
- Quick stats bar with 4 KPI cards (all static strings, not wired to any data)
- Footer with placeholder links

**Public Sandbox (`src/components/PublicSandbox.tsx`, 935 lines)**
- Landing screen with centered search input and provider pill indicators
- Simulated "crawler" loading state with animated console log output
- Product search that filters `mockCanonicalProducts` by name/brand/category
- Search results grid: product cards showing multi-provider pricing with lowest-price highlight
- Add-to-cart (adds to local state, no persistence)
- Comparison detail view (triggered per product):
  - Provider-by-provider price snapshot table
  - Canonical specs grid
  - SVG price history line chart (7 days, toggleable per provider) — hand-coded, no chart library
  - Cart split optimizer panel (calls `/api/cart/optimize` on the Express server)
  - AI recommendations panel (calls `/api/ai/recommendations` — real Gemini if key present, otherwise good hardcoded simulation)
  - LLM model playground panel (calls `/api/playground/run` — real Gemini for Gemini models, simulation for others)

**Admin Console (`src/components/AdminConsole.tsx`, 772 lines)**
- Left sidebar with 6 tabs
- Matcher Pipeline tab: shows 3 hardcoded matching tasks, approve/reject updates local state
- Provider Dials tab: toggle enable/disable on 11 providers (local state only)
- Crawl Stream Logs tab: fake terminal with static seed logs, manual inject input
- Alert Dispatches tab: shows 2 mock alerts, "Fire Signal" button appends to log
- Catalog Products tab: add-product form (saves to in-memory array, mutating the exported mock), delete product
- Configure Secrets tab: 3 fields (Gemini key, Firebase project ID, Defuddle token) — purely cosmetic, saves nothing

**Server (`server.ts`)**
- Express + Vite dev middleware combo
- `/api/health` — working
- `/api/ai/recommendations` — working (real Gemini or hardcoded simulation fallback)
- `/api/playground/run` — working (real Gemini for gemini models, simulation for rest)
- `/api/cart/optimize` — working (hardcoded item-ID matching logic, not database-driven)

**Data layer**
- 4 canonical products (2 electronics, 2 grocery)
- 11 providers typed and defined
- 6 AI models defined
- 3 matching tasks
- 2 user alerts
- All data is static module-level exports; mutations via `mockCanonicalProducts.push()` / `.splice()` are in-memory only and reset on reload

### What is visually broken or incomplete

1. **Admin passcode is insecure and self-reveals the answer** — the modal shows `Demo Passcode: admin123` in plain text on the form itself.
2. **Stats bar KPIs are hardcoded strings** — "11 Channels", "112.4K SKUs", "0.85 ms", "42,410 active" never update. Not wired to any state or API.
3. **Header telemetry pills** ("CRAWLING ACTIVE", "TYPESENSE: ACTIVE") are static spans, always green.
4. **Price chart Y-axis labels** only render min and max; no mid-range gridline labels. Tooltip on data points uses native SVG `<title>` which is browser-inconsistent.
5. **Cart optimizer** fails silently when the Express server is not running — no meaningful error state shown to the user beyond a console.error.
6. **AI recommendations panel** spinner uses `animate-spin` on a Sparkles icon — should be a proper loading indicator.
7. **Instamart** is in mock data but has no `getProviderBadge` case — falls through to the generic grey badge.
8. **Myntra, Ajio, Reliance Digital** (full names) and **OpenRouter** are in the product vision but entirely absent from mock data and UI.
9. **The "Configure Secrets" tab** stores nothing — `setGeminiKey` / `setFirebaseId` / `setDefuddleToken` update component state that is thrown away on unmount. The form submission simulates a save with a `setTimeout`.
10. **Cart item quantity controls** are missing — you can add to cart and remove entirely, but cannot decrement quantity.
11. **The comparison detail view replaces the entire PublicSandbox render** (conditional early return) rather than mounting as an overlay or route — pressing back loses the search results state.
12. **No price alert creation flow** in the public UI — alerts only appear in the admin panel as pre-seeded mock data.
13. **No AI model comparison table** in the public UI — `mockAIModels` is defined and used in the playground checkbox list, but there is no dedicated AI model comparison screen showing context window, pricing, vision/tool support, latency, and accuracy side-by-side as envisioned.
14. **`newProdCategory` select** in admin only has 3 options (Electronics, Grocery, Household) — Fashion, Beauty, Home categories absent.
15. **Product form image** is hardcoded to a single Unsplash sneaker URL for every newly added product.
16. **`firebase-applet-config.json` and `firebase-blueprint.json`** are present but the app does not import them anywhere — Firebase is not actually integrated despite being referenced in the Secrets tab.

### Code quality notes

- Both `PublicSandbox.tsx` and `AdminConsole.tsx` are monolithic files (935 and 772 lines). They need decomposition into smaller components before the codebase grows further.
- `server.ts` cart optimizer uses hardcoded product IDs (`if (entry.id === "airpods-pro-2")`). This will break for any product not in that list and won't scale.
- `mockCanonicalProducts.push()` in the admin "add product" handler mutates the exported array directly — a React anti-pattern that causes cross-component state bugs.
- `useEffect(() => { runCartOptimization(); }, [cart, cartConstraint])` triggers an API fetch on every render cycle that includes cart in deps, including the initial mount. No debouncing.
- The `motion` package is listed in `package.json` but never imported or used anywhere.
- `@google/genai` SDK version `2.4.0` uses `ai.models.generateContent` — this matches the v2 API shape, but should be verified against actual package exports since the SDK naming changed between versions.
- No TypeScript strict mode; `tsconfig.json` should be audited.
- No error boundaries anywhere in the component tree.
- Tailwind classes reference non-existent utility values: `bg-emerald-555`, `text-neutral-510`, `text-neutral-450`, `border-neutral-105`, `text-neutral-805` etc. — these will silently produce no styling.

---

## Phase 1: UI Completion (current Vite/React app)

**Goal:** Make the existing prototype fully functional, complete the missing public screens, decompose the monolithic components, and harden the UX. No backend changes yet — server.ts gets minor fixes only.

### 1.1 Fix broken and incomplete UI elements

- [ ] Replace hardcoded admin passcode reveal with a hint link ("Need access? Contact admin") — do not print the passcode on the form.
- [ ] Wire the 4 stats bar KPIs to computed values from `mockProviders` and `mockCanonicalProducts` instead of static strings.
- [ ] Add `instamart` case to `getProviderBadge()`.
- [ ] Add `myntra`, `ajio`, `openrouter` to `mockProviders` and give them badge cases.
- [ ] Fix the "back to products" navigation in comparison view — lift `isComparisonOpen` state up to `App.tsx` or use React Router so the search results are preserved.
- [ ] Add quantity increment/decrement controls to cart items (not just remove).
- [ ] Add a real loading spinner component for AI recommendations (not the spinning Sparkles icon).
- [ ] Add an error state card for the cart optimizer when the API call fails.
- [ ] Fix the SVG chart: add 2-3 mid-range Y-axis labels and replace `<title>` tooltips with custom SVG tooltip overlays on hover.
- [ ] Fix `newProdCategory` select to include all product categories the platform targets.
- [ ] Fix admin "add product" form to not hardcode the sneaker Unsplash image — add an image URL field.
- [ ] Remove the `motion` package from `package.json` or start actually using it for transitions.
- [ ] Audit and remove all non-existent Tailwind class suffixes (555, 510, 450, 805, 105 etc.).

### 1.2 Add missing public UI screens

**AI Model Comparison screen** (currently missing entirely)
- New tab or section in `PublicSandbox` showing a comparison table of all `mockAIModels`
- Columns: Model name, Provider, Cost per 1M prompt tokens, Cost per 1M completion tokens, Context window, Vision, Tool calling, Structured output, Reasoning, Avg latency, Accuracy index
- Sortable columns (at least by cost and latency)
- Provider filter pills (OpenAI, Anthropic, Google, Groq)
- Highlight the "best value" and "lowest latency" rows

**Price Alert creation flow** (public UI — currently zero UI for this)
- On the product comparison detail view, add a "Set Price Alert" button per provider row
- Alert creation modal: choose condition (below price / back in stock / % drop), enter target value, choose channel (Email / Telegram / Web Push), enter destination
- On submission, POST to `/api/alerts/create` (new endpoint needed in server.ts) and show confirmation
- Add a "My Alerts" section accessible from the header or a new tab

**Alternatives discovery** (currently missing)
- On the product detail/comparison view, add a "Similar Products" section below the specs table
- Show 2-3 other products from the same category with their lowest price
- Wire this to a simple category filter on `mockCanonicalProducts`

**Historical pricing expanded view**
- The current SVG chart is minimal. Add a date range selector (7D / 30D / 90D) — the mock data only has 7 days, so 30D and 90D can show "Coming soon" states
- Add a "price drop %" annotation on the chart when the price drops more than 5%

### 1.3 Decompose monolithic components

Break `PublicSandbox.tsx` into:
- `components/public/SearchLanding.tsx` — the initial empty state screen
- `components/public/SearchResults.tsx` — the results grid
- `components/public/ProductCard.tsx` — individual product card
- `components/public/ComparisonWorkspace.tsx` — the full comparison detail view
- `components/public/PriceChart.tsx` — the SVG price history chart
- `components/public/CartOptimizer.tsx` — cart panel
- `components/public/AIAdvisor.tsx` — recommendations panel
- `components/public/LLMPlayground.tsx` — model playground panel
- `components/public/AIModelComparison.tsx` — new AI model comparison table
- `components/public/AlertCreationModal.tsx` — new alert creation modal

Break `AdminConsole.tsx` into:
- `components/admin/MatcherPipeline.tsx`
- `components/admin/ProviderDials.tsx`
- `components/admin/ScraperLogs.tsx`
- `components/admin/AlertMonitor.tsx`
- `components/admin/CatalogProducts.tsx`
- `components/admin/SecretsConfig.tsx`

### 1.4 Add missing admin sections

**LLM Management tab** (in the product vision, currently absent from admin)
- List all AI providers (OpenAI, Anthropic, Google Gemini, Groq, OpenRouter)
- Per-provider: enable/disable toggle, API key input (masked), model list with enable/disable per model
- "Test connection" button that calls the playground with a trivial prompt

**Usage Analytics tab** (currently absent from admin)
- Static charts showing: searches per day, most compared products, alert triggers per day, API call volume
- Can be mocked data initially; structure should match what a real analytics API would return

**Price History Analytics tab** (currently absent from admin)
- Per-product price trend table: biggest drops, biggest increases, most volatile products
- Can be derived from `mockCanonicalProducts[].priceHistory`

### 1.5 Server fixes

- Fix cart optimizer to look up product prices from the mock data array rather than hardcoded `if (entry.id === "airpods-pro-2")` chains. Iterate `mockCanonicalProducts`, find matching product, find cheapest provider snapshot.
- Add `/api/alerts/create` POST endpoint.
- Add `/api/alerts/list` GET endpoint (returns mock alerts or a per-user list).
- Add debounce to the cart optimization call (currently fires on every state change).
- Add input validation (Zod or manual) on all API routes.

---

## Phase 2: Architecture Migration (Next.js 15 Monorepo)

**Goal:** Move from the current single Vite/Express app to the target monorepo structure. UI code written in Phase 1 is preserved and migrated — not rewritten.

### 2.1 Monorepo bootstrap

```
/apps/web          → Next.js 15 App Router (public-facing)
/apps/admin        → Next.js 15 App Router (admin panel, separate deploy)
/apps/api          → NestJS application
/packages/ui       → Shared shadcn/ui components
/packages/types    → Shared TypeScript types (migrate src/types.ts here)
/packages/shared   → Shared utilities, formatters, constants
/packages/database → Prisma schema + generated client
```

- Set up pnpm workspace with `pnpm-workspace.yaml`
- Configure TypeScript project references (`tsconfig.json` at root, package-level configs)
- Configure shared ESLint + Prettier config at root
- Migrate `src/types.ts` to `/packages/types/src/index.ts`
- Set up Turborepo for parallel builds and task caching

### 2.2 Migrate public web app (`/apps/web`)

- Initialize Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- Install and configure shadcn/ui (replace hand-rolled form inputs, selects, modals)
- Install TanStack Query for server state management
- Migrate all public components from Phase 1 into the App Router structure:
  - `/` — landing + search (Server Component for initial data, Client Component for search interaction)
  - `/compare/[productId]` — product comparison detail view (eliminates the state-swap hack)
  - `/alerts` — user's active price alerts
  - `/models` — AI model comparison table
- Replace direct `/api/*` fetch calls with TanStack Query hooks pointing at the new NestJS API
- Add Next.js Image component for product images
- Add `<Suspense>` boundaries with skeleton states

### 2.3 Migrate admin panel (`/apps/admin`)

- Initialize Next.js 15 app for admin
- Auth gate using Better Auth (replaces the hardcoded passcode modal)
- Migrate all admin tabs from Phase 1 as App Router pages:
  - `/providers` — Provider Dials
  - `/matcher` — Matching Pipeline
  - `/scrapers` — Scraper Logs (switch to WebSocket or SSE for real streaming)
  - `/alerts` — Alert Monitor
  - `/catalog` — Catalog Products
  - `/llm` — LLM Management (new from Phase 1.4)
  - `/analytics` — Usage Analytics (new from Phase 1.4)
  - `/secrets` — Secrets config (now actually saves to DB/env vault)

### 2.4 Package: UI (`/packages/ui`)

- Extract reusable components that both apps share:
  - `ProviderBadge` — the colored provider label (currently duplicated in both components)
  - `PriceTag` — formatted INR price display
  - `StatusPill` — the colored status badges
  - `ConsoleLog` — the terminal-style log viewer (used in admin scrapers)
  - `StatCard` — the KPI card used in the stats bar
  - `DataTable` — sortable table component (needed for AI model comparison and admin views)

---

## Phase 3: Backend (NestJS API + Database)

**Goal:** Replace Express `server.ts` with production-grade NestJS API. Define the real database schema. All API routes from Phase 1 server fixes get proper NestJS implementations.

### 3.1 NestJS application structure (`/apps/api`)

```
src/
  modules/
    providers/     → ProviderModule: CRUD for provider configs
    products/      → ProductsModule: canonical products, price snapshots
    crawlers/      → CrawlersModule: trigger/status/logs for crawl jobs
    alerts/        → AlertsModule: user alert CRUD and dispatch
    ai/            → AIModule: LiteLLM integration, recommendations, playground
    search/        → SearchModule: Typesense integration
    auth/          → AuthModule: Better Auth integration
    analytics/     → AnalyticsModule: usage stats, price history aggregates
    matcher/       → MatcherModule: product matching tasks CRUD
  common/
    filters/       → Global exception filters
    interceptors/  → Logging, response transform
    guards/        → Auth guard, admin guard
```

### 3.2 Database schema (PostgreSQL via Prisma)

**Core tables:**
- `providers` — id, name, type, logo_url, enabled, created_at, updated_at
- `connectors` — id, provider_id, config (JSONB), active, connector_type (headless/api/rpc)
- `canonical_products` — id, sku, name, brand, category, description, image_url, specs (JSONB)
- `product_mappings` — id, canonical_product_id, provider_id, external_id, external_url
- `price_snapshots` — id, product_mapping_id, price, original_price, discount_percent, in_stock, delivery_eta, seller, captured_at
- `matching_tasks` — id, source_mapping_id, candidate_mapping_id, similarity_score, status, normalization_logs (JSONB), reviewed_by, reviewed_at
- `users` — id, email, role (USER/ADMIN), created_at (managed by Better Auth)
- `alerts` — id, user_id, canonical_product_id, condition, condition_value, channel, destination, active, created_at, last_triggered_at
- `ai_providers` — id, name, api_key_encrypted, enabled
- `ai_models` — id, ai_provider_id, model_id, display_name, cost_prompt, cost_completion, context_window, capabilities (JSONB), avg_latency, enabled
- `playground_runs` — id, user_id, prompt, models_used (JSONB), results (JSONB), created_at

**Search index (Typesense):**
- `products` collection — sku, name, brand, category, description, specs, min_price, max_price, provider_ids

**Cache (Redis):**
- Price snapshots keyed by `price:${productId}:${providerId}` with 15-minute TTL
- Search results keyed by query hash with 5-minute TTL
- Cart optimization results keyed by cart hash with 1-minute TTL

### 3.3 API endpoints (NestJS controllers)

```
GET    /api/v1/health
GET    /api/v1/products/search?q=&category=&providers=
GET    /api/v1/products/:id
GET    /api/v1/products/:id/prices           → current snapshots across all providers
GET    /api/v1/products/:id/history          → price history (7d/30d/90d)
GET    /api/v1/products/:id/alternatives     → similar products same category
POST   /api/v1/cart/optimize
POST   /api/v1/alerts                        → create alert
GET    /api/v1/alerts                        → list user's alerts (auth required)
DELETE /api/v1/alerts/:id
POST   /api/v1/ai/recommendations
POST   /api/v1/ai/playground
GET    /api/v1/ai/models                     → list available AI models
GET    /api/v1/providers                     → list providers
PATCH  /api/v1/providers/:id                 → enable/disable (admin)
GET    /api/v1/admin/matcher/tasks           → pending matching tasks (admin)
PATCH  /api/v1/admin/matcher/tasks/:id       → approve/reject (admin)
GET    /api/v1/admin/scrapers/logs           → SSE stream of scraper logs (admin)
POST   /api/v1/admin/scrapers/trigger        → manually trigger a crawl (admin)
GET    /api/v1/admin/analytics/usage
GET    /api/v1/admin/analytics/prices
POST   /api/v1/admin/catalog                 → add product (admin)
DELETE /api/v1/admin/catalog/:id             → delete product (admin)
GET    /api/v1/admin/alerts                  → all user alerts (admin)
POST   /api/v1/admin/alerts/:id/test         → fire test signal (admin)
POST   /api/v1/admin/llm/providers/:id/test  → test LLM API key (admin)
```

### 3.4 LiteLLM integration (`/packages/llm`)

- Wrap LiteLLM to provide a unified interface for all AI providers
- Config-driven: which providers are enabled comes from the database `ai_models` table
- Implement cost tracking: log every call with token counts and estimated cost to `playground_runs`
- Use LiteLLM's proxy server mode for the multi-model playground to avoid managing per-provider SDK initialization

---

## Phase 4: Real Integrations (Crawlers, Search, Alerts, Auth)

**Goal:** Replace all mocked data with real crawled data. Wire up search, alerts, and authentication.

### 4.1 Crawlers (`/services/crawler`)

One crawler service per provider type, orchestrated by BullMQ:

**Quick Commerce crawlers:**
- `blinkit-crawler` — targets Blinkit's internal JSON-RPC/REST API endpoints
- `zepto-crawler` — targets Zepto's API
- `instamart-crawler` — targets Swiggy Instamart endpoints

**E-Commerce crawlers:**
- `amazon-crawler` — Playwright-based headless browser; handle pagination, CAPTCHA rotation, proxy rotation
- `flipkart-crawler` — Playwright-based; Flipkart has a semi-public product API for some categories
- `croma-crawler` — Playwright-based
- `myntra-crawler` — Playwright-based; targets fashion category
- `ajio-crawler` — Playwright-based
- `reliance-digital-crawler` — Playwright-based

**Crawler architecture:**
- Each crawler outputs normalized `PriceSnapshot` objects to BullMQ queue `price-ingestion`
- `/services/price-tracker` consumes `price-ingestion`, upserts into `price_snapshots` table, and checks alert thresholds
- `/services/product-matcher` runs cosine/Jaccard similarity + LLM verification on new products, creates `matching_tasks`

### 4.2 Scheduler (`/services/scheduler`)

- BullMQ repeatable jobs for each crawler (configurable cron per provider)
- Default schedule: Quick Commerce every 15 minutes, E-Commerce every 2 hours
- Admin can override schedule per provider via admin panel

### 4.3 Typesense search (`/packages/search`)

- Typesense collection schema for canonical products
- Index sync: whenever a `canonical_products` row is created/updated, sync to Typesense
- Public search API routes proxy to Typesense with field whitelisting
- Implement multi-search for cross-category results

### 4.4 Price alerts (`/services/alerts`)

- Alert engine: after each price snapshot ingestion, compare new price against all active alerts for that product
- When threshold is met: push notification job to BullMQ queue `alert-dispatch`
- Alert dispatch service:
  - EMAIL channel: SendGrid or Resend integration
  - TELEGRAM channel: Telegram Bot API
  - WEB_PUSH channel: Web Push (VAPID keys)
- Log every dispatch to `alerts.last_triggered_at` and create an alert history record

### 4.5 Authentication (`/packages/auth`)

- Better Auth with PostgreSQL adapter
- Public web: email/password + Google OAuth
- Admin: email/password only, role check against `users.role === 'ADMIN'`
- Replace the current passcode modal with proper session-based auth

---

## Phase 5: Production (Docker, Monitoring, CI/CD)

**Goal:** Make the platform deployable and observable.

### 5.1 Docker Compose (`/infrastructure/docker`)

```yaml
services:
  web:          # Next.js public app
  admin:        # Next.js admin app
  api:          # NestJS API
  crawler:      # Crawler service (runs all provider crawlers)
  scheduler:    # BullMQ scheduler
  alerts:       # Alert dispatch service
  postgres:     # PostgreSQL 16
  redis:        # Redis 7 (queue + cache)
  typesense:    # Typesense 27
  nginx:        # Reverse proxy
  grafana:      # Dashboards
  prometheus:   # Metrics collection
  otel-collector: # OpenTelemetry collector
```

### 5.2 Nginx (`/infrastructure/nginx`)

- Route `/` and `/models`, `/alerts`, `/compare/*` to `web` service
- Route `/admin/*` to `admin` service
- Route `/api/*` to `api` service
- SSL termination (Let's Encrypt via certbot sidecar)
- Rate limiting on `/api/ai/*` routes

### 5.3 OpenTelemetry + Grafana monitoring

- Instrument NestJS API with `@opentelemetry/sdk-node`
- Traces: every API request, crawler run, alert dispatch
- Metrics: price snapshot throughput, crawler success/failure rates, API latency p50/p95/p99, alert queue depth
- Grafana dashboards:
  - System health overview
  - Crawler status per provider
  - Price intelligence metrics (products indexed, snapshots per hour)
  - Alert dispatch success rate
  - LLM usage and cost

### 5.4 CI/CD (GitHub Actions)

- On PR: `pnpm lint && pnpm typecheck && pnpm test`
- On merge to main: build Docker images, push to registry, deploy to staging
- On tag: deploy to production
- Secrets management: GitHub Actions secrets for API keys, Doppler or AWS SSM for runtime secrets

### 5.5 Environment configuration

```
# /apps/api
DATABASE_URL=
REDIS_URL=
TYPESENSE_HOST=
TYPESENSE_API_KEY=
BETTER_AUTH_SECRET=
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
SENDGRID_API_KEY=
TELEGRAM_BOT_TOKEN=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# /apps/web
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_TYPESENSE_HOST=
NEXT_PUBLIC_TYPESENSE_SEARCH_KEY=
```

---

## Phase Dependencies

```
Phase 1 (UI Completion)     → no dependencies, start now
Phase 2 (Next.js migration) → requires Phase 1 complete
Phase 3 (NestJS backend)    → can start in parallel with Phase 2
Phase 4 (Real integrations) → requires Phase 3 complete
Phase 5 (Production)        → requires Phase 3 + 4 substantially complete
```

Recommended team split: one developer on Phase 2 (frontend migration), one on Phase 3 (backend), both joining for Phase 4 and 5.
