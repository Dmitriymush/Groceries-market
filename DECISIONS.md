# Architectural Decisions

This document captures the key trade-offs and reasoning behind the technical choices in this project.

---

## 1. Signals over NgRx for State Management

**Decision:** Use Angular Signals + `computed()` instead of NgRx or any external state library.

**Why:** For an application of this scope — a single-entity CRUD list — NgRx introduces ceremony that doesn't pay for itself: action files, reducer boilerplate, effect classes, selector files. Signals give me reactive, fine-grained state with zero extra dependencies. The `GroceryService.vm` computed signal derives the entire view model (sorted items, counts, loading state) in one place, which is easy to read and easy to test.

**Trade-off I accept:** If this app grew to manage multiple entities with cross-cutting concerns (e.g., shared shopping lists, user preferences, notification settings), I'd migrate to NgRx SignalStore for its entity adapters and DevTools. Signals don't give me time-travel debugging, but for a grocery list, `console.log` is enough.

---

## 2. Smart/Dumb Component Pattern

**Decision:** Strict separation between container ("smart") and presentational ("dumb") components.

**Why:** `GroceryListComponent` (smart) orchestrates all service calls and state. `GroceryItemComponent`, `GroceryTableComponent`, and `GroceryFormDialogComponent` (dumb) receive data via `input()` and emit events via `output()` — zero injected services.

This makes the dumb components trivially testable (no TestBed providers needed beyond the component itself) and reusable. If I wanted to render the same grocery item in a "Recently Bought" sidebar, I'd just drop in `<app-grocery-item>` with different data.

**Trade-off I accept:** The smart component file gets longer because it handles all the wiring. For this app size, that's a net win over distributing logic across many files.

---

## 3. Adding Authentication (Even Though Not Required)

**Decision:** Implement token-based auth with guards, interceptors, and session persistence.

**Why:** A grocery list without auth is a toy. Adding auth let me demonstrate interceptor chains (URL prefixing → token injection → error handling), functional route guards, and the kind of layered security architecture real Angular apps need. The `AuthInterceptor` attaches the token, the `ErrorInterceptor` catches 401s and forces logout — this is how production apps work.

**Trade-off I accept:** The mock auth (json-server matching username/password) is obviously not secure. In production, I'd use an OAuth2/OIDC provider. But the architectural patterns (interceptors, guards, token storage) transfer directly.

---

## 4. json-server as Mock API (Not In-Memory)

**Decision:** Use `json-server` running on port 3001 instead of Angular's `HttpClientInMemoryWebApiModule`.

**Why:** In-memory web API intercepts `HttpClient` at the Angular level — it never hits the network. That means interceptors don't fire, CORS issues don't surface, and the dev experience doesn't match production. json-server gives me a real HTTP server with proper request/response cycles, so my interceptors, error handling, and network behavior are exercised during development.

**Trade-off I accept:** Requires running two processes (`ng serve` + `json-server`). I mitigated this with `concurrently` in the `dev` script so `npm run dev` starts both.

---

## 5. Optimistic Updates for Toggle and Delete

**Decision:** Update the UI signal immediately, then sync with the server. Rollback on error.

**Why:** Marking an item as "bought" should feel instant. Waiting 200-400ms for a server round-trip makes the checkbox feel laggy. The optimistic pattern updates the signal immediately and only rolls back if the PATCH fails. For delete, I remove the item from the array first and reload on error.

**Trade-off I accept:** There's a brief window where the UI and server are out of sync. For a grocery list, this is fine. For financial transactions, I'd use pessimistic updates with a loading spinner on the specific row.

---

## 6. WebSocket Mock for Real-Time Sync

**Decision:** Simulate WebSocket-based real-time updates using RxJS `Subject` + `interval` rather than running an actual WebSocket server.

**Why:** I wanted to demonstrate the real-time sync pattern (connection lifecycle, event-driven UI updates, reconnection logic) without adding a WebSocket server dependency. The `GroceryWebSocketService` uses the same observable-based API that a real WebSocket integration would (`events$` observable, `connectionStatus` signal), so swapping in a real `WebSocket` or Socket.IO client later is a drop-in replacement.

**Trade-off I accept:** The simulated events are random — they don't reflect actual data changes. In production, the server would push events from other clients. But the consumption pattern in `GroceryService` (subscribe → update signal → show notification) is identical.

---

## 7. Service Worker for Offline Support

**Decision:** Custom service worker with IndexedDB storage instead of `@angular/service-worker`.

**Why:** Angular's built-in service worker (`ngsw`) is great for asset caching and push notifications, but it doesn't handle custom offline data strategies. I needed IndexedDB for storing grocery items and a mutation queue for replaying failed writes. Writing a custom service worker let me implement cache-first for assets and network-first-with-fallback for API calls — exactly the strategy a grocery list needs (always show something, sync when possible).

**Trade-off I accept:** I lose `ngsw`'s automatic versioning and update checks. For this app, a manual cache-busting strategy via hashed filenames (already provided by Angular's production build) is sufficient.

---

## 8. Vitest over Jest/Karma

**Decision:** Use Vitest for unit testing instead of the traditional Karma + Jasmine or Jest setup.

**Why:** Vitest runs on the same Vite-based build pipeline that Angular 21 uses, so there's no duplicate compilation step. Tests start in under 1 second versus Karma's 5-10 second browser launch. The API is Jest-compatible (`describe`, `it`, `expect`, `vi.fn()`), so the migration cost is zero.

**Trade-off I accept:** Vitest + jsdom doesn't execute tests in a real browser. For DOM-heavy tests, I rely on Playwright E2E tests to catch browser-specific issues.

---

## 9. i18n with ngx-translate (Runtime) over Angular i18n (Build-Time)

**Decision:** Use `@ngx-translate/core` for runtime language switching instead of Angular's built-in i18n.

**Why:** Angular's official i18n compiles separate bundles per locale — great for SEO, but it means you can't switch languages without a full page reload and serving a different build. For a grocery list app where a Ukrainian user might switch to English mid-session, runtime translation via `ngx-translate` is the right UX.

**Trade-off I accept:** Runtime translation is slightly slower (JSON file load + pipe evaluation) and doesn't benefit from build-time optimization. For 44 translation keys, the performance difference is unmeasurable.

---

## 10. Abstract Helper Classes with Static Methods

**Decision:** Use `abstract class` with static methods for pure utility functions instead of standalone functions or injectable services.

**Why:** Grouping related pure functions under a namespace (`FormatHelper.formatAmount()`, `GroceryViewHelper.sortByName()`) improves discoverability and makes imports cleaner. The `abstract` keyword prevents instantiation — these are pure function namespaces, not services.

**Trade-off I accept:** Some would argue standalone exported functions are more tree-shakeable. In practice, Angular's build optimizer handles both cases, and the namespace grouping is worth it for readability.
