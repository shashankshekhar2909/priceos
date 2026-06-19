# PriceOS — Phase 1 UI TODO

Flat checklist of all frontend work to complete before the Next.js migration.  
Scope: current Vite + React 19 app only. No backend architecture changes.

---

## Bug Fixes

- [ ] Remove the hardcoded passcode hint (`Demo Passcode: admin123`) from the unlock modal — replace with a "Contact admin for access" note
- [ ] Add `instamart` case to `getProviderBadge()` in `PublicSandbox.tsx` (currently falls through to grey generic badge)
- [ ] Fix all non-existent Tailwind class suffixes: `bg-emerald-555`, `text-neutral-510`, `text-neutral-450`, `text-neutral-805`, `border-neutral-105`, `text-rose-455`, `bg-blue-105`, `text-rose-555` — replace with nearest valid Tailwind values
- [ ] Fix the "back to products" flow in comparison view — pressing Back loses the search query and filters (lift `isComparisonOpen` + `searchQuery` state to `App.tsx` or introduce React Router)
- [ ] Fix cart optimizer silent failure — show an error state card when `/api/cart/optimize` returns a non-2xx or throws a network error
- [ ] Fix `mockCanonicalProducts.push()` mutation in the admin "add product" handler — use a React state array for the product list instead of mutating the exported module constant
- [ ] Fix admin "add product" handler: newly added products use a hardcoded Unsplash sneaker image URL — add an "Image URL" text field to the form
- [ ] Add debounce to `runCartOptimization` — currently fires a fetch on every single state change that touches `cart` or `cartConstraint`
- [ ] Fix the Sparkles icon `animate-spin` used as AI loading indicator — use a proper spinner element instead
- [ ] Remove `motion` package from `package.json` (it is listed as a dependency but never imported)

---

## Missing Provider Data

- [ ] Add `myntra` provider to `mockProviders` in `mock-data.ts` (type: ECOMMERCE)
- [ ] Add `ajio` provider to `mockProviders` (type: ECOMMERCE)
- [ ] Add `openrouter` to `mockProviders` (type: AI_MODELS)
- [ ] Add `getProviderBadge()` cases for `myntra`, `ajio`, `openrouter` in `PublicSandbox.tsx`
- [ ] Add at least 1 product that includes `myntra` and `ajio` in its `priceSnapshots` (fashion category item works well)

---

## Public UI — Search & Product Cards

- [ ] Wire the 4 KPI cards in `App.tsx` stats bar to computed values:
  - "Indexed Providers" → `mockProviders.filter(p => p.enabled).length + " Channels"`
  - "Catalog Listings" → derived count from `mockCanonicalProducts.length` (or keep static but clearly label as mock)
  - "Index Latency" → keep static but add a "(simulated)" label
  - "Price Alerts Active" → `mockUserAlerts.filter(a => a.active).length + " active"`
- [ ] Make header telemetry pills ("CRAWLING ACTIVE", "TYPESENSE: ACTIVE") conditionally reflect actual server health from `/api/health` endpoint — show grey/red when server is unreachable
- [ ] Add "Out of stock" visual treatment to provider rows on product cards and in the comparison detail — currently `inStock: false` on instamart avocados is not visually differentiated
- [ ] Show discount badge on product card provider rows when `discountPercent > 0`
- [ ] Add a "Favorites" / bookmark button to product cards (local storage persistence is fine for now)

---

## Public UI — Cart

- [ ] Add quantity increment (+) and decrement (-) buttons to each cart item in the `CartOptimizer` panel
- [ ] Show per-item line total (price × quantity) in the cart items list
- [ ] Add a "Clear cart" button when cart has items
- [ ] Prevent adding duplicate items to cart without showing the count — currently silently increments quantity but the button gives no feedback; add a brief visual confirmation (e.g., button turns green for 500ms)
- [ ] Add a "BALANCED" constraint option button alongside "Min Cost" and "Min ETA" (the server already supports it)

---

## Public UI — Comparison Detail View

- [ ] Add a "Set Price Alert" button to each provider row in the pricing snapshot table
- [ ] Build `AlertCreationModal` component:
  - Condition dropdown: "Price drops below ₹X" / "Back in stock" / "Price drops by X%"
  - Channel selector: Email / Telegram / Web Push
  - Destination input (email address or Telegram handle)
  - Submit calls `/api/alerts/create` (new endpoint) and shows success confirmation
- [ ] Add a "Similar Products" section below the specs table:
  - Filter `mockCanonicalProducts` by same category as selected product, exclude selected product itself
  - Show up to 3 results as compact cards with lowest price
- [ ] Improve SVG price history chart:
  - Add 2 mid-range Y-axis gridlines with labels (not just min/max)
  - Replace `<title>` native tooltip with a custom SVG overlay tooltip that renders on `onMouseEnter` of each data point circle
  - Add a visible "price drop" annotation (downward arrow icon + % label) when price drops ≥ 5% between consecutive days
- [ ] Add date range selector to chart: "7D" (active), "30D" (coming soon), "90D" (coming soon) — show disabled state for unavailable ranges

---

## Public UI — AI Model Comparison (new screen)

- [ ] Create `components/public/AIModelComparison.tsx`
- [ ] Add it as a new tab in the main `PublicSandbox` navigation (alongside or below the search flow)
- [ ] Table columns: Model Name, Provider, Context Window, Input Cost ($/1M), Output Cost ($/1M), Vision, Tool Calling, Structured Output, Reasoning, Avg Latency (ms), Accuracy Score
- [ ] Highlight the row with the lowest input cost with a "Best Value" badge
- [ ] Highlight the row with the lowest avg latency with a "Fastest" badge
- [ ] Add provider filter pills at the top (OpenAI, Anthropic, Google, Groq — toggleable)
- [ ] Make table sortable by clicking column headers (client-side sort, at minimum for Cost and Latency)
- [ ] Add `openrouter` models to `mockAIModels` (add at least 2 open-source models served via OpenRouter)
- [ ] Add Claude 3.5 Haiku and Claude 3 Opus to `mockAIModels` (currently only Sonnet is present)
- [ ] Add `gpt-4o-mini` and `o1-mini` for completeness

---

## Public UI — My Alerts (new section)

- [ ] Add a "Alerts" entry point in the public UI (header link or tab)
- [ ] Create `components/public/MyAlerts.tsx` that displays `mockUserAlerts`
- [ ] Each alert row shows: product image, product name, condition description, channel badge, destination, active toggle
- [ ] Add a "Delete alert" button per row
- [ ] Add empty state when no alerts exist ("No active price alerts. Set one from a product comparison.")

---

## Admin UI — Missing Tabs

- [ ] Add "LLM Management" tab to `AdminConsole.tsx` left sidebar
  - List AI providers from `mockProviders` where `type === "AI_MODELS"`
  - Per provider: name, logo, enable/disable toggle, API key input (masked), a "Test Connection" button that fires a minimal playground call
  - List models per provider with individual enable/disable toggles
- [ ] Add "Usage Analytics" tab to `AdminConsole.tsx`
  - Show 3 mock stat cards: Total searches (24h), AI recommendations generated (24h), Alerts dispatched (24h)
  - Show a simple bar chart (can be CSS-based or the same SVG approach as the price chart) for search volume by hour
- [ ] Add "Price Analytics" tab to `AdminConsole.tsx`
  - Table: product name, current min price, 7-day price change (absolute + %), biggest single-day drop
  - Derive from `mockCanonicalProducts[].priceHistory` — this data is already available

---

## Admin UI — Existing Tab Improvements

- [ ] Fix "Configure Secrets" tab — the form currently saves nothing; at minimum, save values to `localStorage` under a namespaced key and reload them on mount (a real vault comes in Phase 3, but localStorage is better than the current no-op)
- [ ] Add "Myntra", "Ajio", "OpenRouter" to the Providers Dials tab (they're in the vision but not in `mockProviders` yet — covered above under missing provider data)
- [ ] Add a "Connector count" tooltip on each provider card explaining what the SKU count represents
- [ ] Add scraper log level color coding: ERROR lines in red, WARNING in amber, SUCCESS/APPROVED in green, INFO in default — extend the current conditional class logic in `ScraperLogs`
- [ ] Add "Clear logs" button to the scraper logs terminal
- [ ] Alert Dispatches tab: show the alert `condition` label properly — currently only shows "Drop Below ₹X" regardless of the actual `Alert.condition` value; handle `BACK_IN_STOCK` and `PRICE_DROP_PERCENT` cases

---

## Component Decomposition

- [ ] Extract `SearchLanding` from `PublicSandbox.tsx` (the empty state + centered search input section)
- [ ] Extract `SearchResults` from `PublicSandbox.tsx` (the results grid + header)
- [ ] Extract `ProductCard` from `PublicSandbox.tsx` (individual product card in results grid)
- [ ] Extract `ComparisonWorkspace` from `PublicSandbox.tsx` (the full comparison detail view — the early-return branch)
- [ ] Extract `PriceChart` from `ComparisonWorkspace` (the SVG line chart)
- [ ] Extract `CartOptimizer` from `ComparisonWorkspace` (cart panel)
- [ ] Extract `AIAdvisor` from `ComparisonWorkspace` (recommendations panel)
- [ ] Extract `LLMPlayground` from `ComparisonWorkspace` (model playground panel)
- [ ] Extract `MatcherPipeline` from `AdminConsole.tsx`
- [ ] Extract `ProviderDials` from `AdminConsole.tsx`
- [ ] Extract `ScraperLogs` from `AdminConsole.tsx`
- [ ] Extract `AlertMonitor` from `AdminConsole.tsx`
- [ ] Extract `CatalogProducts` from `AdminConsole.tsx`
- [ ] Extract `SecretsConfig` from `AdminConsole.tsx`
- [ ] Create a shared `ProviderBadge` component — `getProviderBadge()` is currently copy-pasted into `PublicSandbox.tsx` and needs to be accessible from the new comparison components too

---

## Mock Data Expansion

- [ ] Add `mockAIModels` entries for: Claude 3.5 Haiku, Claude 3 Opus, GPT-o1-mini, 2 OpenRouter models (e.g., Mistral 7B Instruct, DeepSeek R1)
- [ ] Add at least 2 more canonical products to give the search demo more variety:
  - A fashion item (e.g., Nike Air Max) with Myntra + Ajio + Amazon snapshots
  - A household item (e.g., Prestige Electric Kettle) with Amazon + Flipkart + Croma snapshots
- [ ] Expand `mockUserAlerts` to include a `BACK_IN_STOCK` and a `PRICE_DROP_PERCENT` type alert (to exercise the admin display fixes)

---

## Server Fixes (Phase 1 scope only)

- [ ] Refactor `/api/cart/optimize` to derive prices from `mockCanonicalProducts` array rather than the `if (entry.id === "airpods-pro-2")` hardcoded chain — so it works for any product in the catalog
- [ ] Add `/api/alerts/create` POST endpoint (saves to an in-memory array; returns the created alert)
- [ ] Add `/api/alerts/list` GET endpoint (returns the in-memory alert array)
- [ ] Add basic input validation to all POST endpoints (check required fields, return 400 with message on missing data)

---

## Notes

- Do not start the Next.js migration (Phase 2) until all items in this TODO are checked off, or a conscious decision is made to defer specific items to post-migration.
- Items marked as "coming soon" in the UI (30D/90D chart ranges) should show a visually disabled state — not throw errors or silently do nothing.
- All mock API calls should have a consistent error handling pattern established before decomposition so it does not need to be retrofitted into every extracted component.
