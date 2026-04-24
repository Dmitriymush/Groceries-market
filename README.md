# Groceries Market

A grocery list management application built with **Angular 21**, **PrimeNG**, and **json-server**.

Users can log in, manage a personal grocery list (add, edit, delete items), set amounts with units, and mark items as bought. The app supports **i18n** (English / Ukrainian), **dark/light theme** with system preference detection and manual toggle, and follows enterprise Angular architecture patterns.

## Screenshots

### Light Theme

| Login | Grocery List | Add Item |
|-------|-------------|----------|
| ![Login](screenshots/01-login.png) | ![List](screenshots/02-grocery-list.png) | ![Add](screenshots/03-add-item.png) |

| Mark as Bought | Delete Confirmation |
|---------------|-------------------|
| ![Bought](screenshots/04-mark-bought.png) | ![Delete](screenshots/05-delete-confirm.png) |

### Dark Theme

| Login | Grocery List | Add Item |
|-------|-------------|----------|
| ![Dark Login](screenshots/dark-01-login.png) | ![Dark List](screenshots/dark-02-grocery-list.png) | ![Dark Add](screenshots/dark-03-add-item.png) |

| Mark as Bought | Delete Confirmation |
|---------------|-------------------|
| ![Dark Bought](screenshots/dark-04-mark-bought.png) | ![Dark Delete](screenshots/dark-05-delete-confirm.png) |

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Angular | 21.2 | Frontend framework |
| PrimeNG | 20 | UI component library (Aura theme) |
| json-server | 0.17 | Mock REST API |
| ngx-translate | 16 | i18n (EN, UA) |
| Vitest | 4 | Unit testing (69 tests) |
| Playwright | latest | E2E testing (12 tests) |
| SCSS | - | Styling with variables, mixins, theming |
| TypeScript | 5.9 | Strict mode enabled |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone <repository-url>
cd Groceries-market
npm install
npx playwright install chromium
```

### Running the Application

Start both the Angular dev server and json-server mock API:

```bash
npm run dev
```

This starts:
- Angular app at `http://localhost:4200`
- json-server API at `http://localhost:3001`

### Demo Credentials

| Username | Password |
|----------|----------|
| demo | demo123 |

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Angular + json-server concurrently |
| `npm run start` | Start Angular dev server only |
| `npm run api` | Start json-server only |
| `npm run build` | Production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run e2e` | Run E2E tests (Playwright) |
| `npm run e2e:ui` | Run E2E tests with Playwright UI |

## Project Architecture

```
src/app/
  core/                    # Singleton services, guards, interceptors
    api/                   # HTTP API layer (one class per entity)
    auth/                  # Auth service + helper
    guards/                # Route protection (auth, no-auth)
    interceptors/          # HTTP interceptors (apiUrl, auth, error)
    services/              # Business logic + ViewModel (GroceryService)
    models/                # Data interfaces
    helpers/               # Cross-cutting pure helpers
    translate/             # i18n configuration
  modules/                 # Feature modules (lazy-loaded)
    auth/                  # Login page
    groceries/             # Grocery list + CRUD components
      pages/               # Smart (container) components
      components/          # Dumb (presentational) components
      helpers/             # Module-scoped helpers
      models/              # ViewModel interfaces
  shared/                  # Reusable across modules
    components/            # Confirm dialog, page header, spinner
    pipes/                 # Strikethrough pipe
    directives/            # Auto-focus directive
    helpers/               # Validation helpers
mock-server/               # json-server seed data
e2e/                       # Playwright E2E tests
nginx/                     # Production nginx config
```

## Architecture Patterns

### SOLID Principles

| Principle | Implementation |
|-----------|---------------|
| **Single Responsibility** | One API class per entity, one service per domain, one component per UI concern |
| **Open/Closed** | Helper classes extensible via new static methods |
| **Liskov Substitution** | Dumb components interchangeable with same input/output contract |
| **Interface Segregation** | Small focused interfaces (GroceryItem, GroceryFormData, LoginRequest) |
| **Dependency Inversion** | Smart components depend on service abstractions, dumb components on inputs only |

### Signals vs RxJS

| Signals | RxJS |
|---------|------|
| Component state (loading, editing) | HTTP requests via HttpClient |
| ViewModel composition via `computed()` | Stream transformations (switchMap, catchError) |
| Service state exposure | Interceptor chains |
| Dumb component `input()` / `output()` | Error handling pipelines |

### ViewModel Pattern

The `GroceryService` owns both state and derived view data via a `computed()` ViewModel signal. Smart components consume `groceryService.vm` directly:

```typescript
// In GroceryService
readonly vm = computed<GroceryListViewModel>(() => ({
  items: GroceryViewHelper.sortByName(this._items()),
  loading: this._loading(),
  totalItems: this._items().length,
  hasItems: this._items().length > 0,
  boughtCount: GroceryViewHelper.countBought(this._items()),
  remainingCount: GroceryViewHelper.countRemaining(this._items()),
}));

// In GroceryListComponent (smart)
protected readonly vm = this.groceryService.vm;
```

### Smart / Dumb Components

- **Smart (Container)**: Located in `modules/*/pages/`, inject services, own UI state signals, orchestrate CRUD
- **Dumb (Presentational)**: Located in `modules/*/components/`, receive data via `input()`, emit events via `output()`, zero service injection

### Helper Pattern

Abstract classes with static methods for pure transformations:

```typescript
export abstract class GroceryViewHelper {
  static sortByName(items: GroceryItem[]): GroceryItem[] { ... }
  static countBought(items: GroceryItem[]): number { ... }
}
```

Used at three levels: `core/helpers/` (cross-cutting), `core/auth/` (auth-specific), `modules/*/helpers/` (module-scoped).

### Optimistic Updates

Toggle bought and delete operations update the UI instantly via signal mutations, then sync with the server in the background. On error, changes are rolled back.

### Layer Separation

| Layer | Responsibility |
|-------|---------------|
| `core/api/` | Raw HTTP calls, returns `Observable<T>` |
| `core/services/` | Business logic, signal state, ViewModel |
| `core/auth/` | Auth state, token management |
| `core/guards/` | Route protection |
| `core/interceptors/` | Request/response transformation |
| `modules/*/pages/` | Smart components, UI orchestration |
| `modules/*/components/` | Dumb components, rendering |
| `shared/` | Cross-module reusable UI |

## Dark / Light Theme

- **Auto-detection**: On first visit, the theme matches your OS preference (`prefers-color-scheme`)
- **Manual toggle**: Click the moon/sun icon in the header toolbar to switch
- **Persistence**: Theme choice is saved to `localStorage` and restored on reload
- **Implementation**: PrimeNG Aura theme with `darkModeSelector: '.app-dark'` — toggling adds/removes the `.app-dark` class on `<html>`
- **ThemeService** (`core/services/theme.service.ts`): Singleton service exposing `mode` signal, `isDark()` getter, and `toggle()` method

## Interceptor Chain

1. **apiUrlInterceptor** - Prepends `environment.apiUrl` to relative API paths
2. **authInterceptor** - Attaches `Authorization: Bearer <token>` header
3. **errorInterceptor** - Handles 401 (logout + redirect) and 5xx (toast notification)

## i18n

- Languages: English (en), Ukrainian (ua)
- Language switcher in the header toolbar
- Translation files: `src/assets/i18n/en.json`, `src/assets/i18n/ua.json`
- All UI labels translated, including unit dropdown options

## Testing

### Unit Tests (Vitest)

69 tests across 22 test files covering:

- API layer (HTTP calls with `HttpTestingController`)
- Services (state transitions, ViewModel computation, optimistic updates)
- Guards (redirect behavior)
- Interceptors (token attachment, URL prepending, error handling)
- Helpers (pure function tests)
- Components (input rendering, output emission, form validation)
- Pipes and directives

```bash
npm run test
```

### E2E Tests (Playwright)

12 tests across 3 spec files:

- **auth.spec.ts**: Login form display, invalid credentials, successful login, guard redirect, logout
- **grocery-crud.spec.ts**: View list, add item, edit item, delete with confirmation
- **grocery-bought.spec.ts**: Mark as bought (strikethrough + checkbox), unmark, checkbox state

```bash
npm run e2e
```

## Production

### Build

```bash
npm run build
```

### Nginx

Production nginx config included at `nginx/nginx.conf` with SPA fallback routing and API proxy.
