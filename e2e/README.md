# Playwright E2E Tests

This directory contains end-to-end tests for the Axiqra application using Playwright.

## Directory Structure

```
e2e/
├── pages/                 # Page Object Models
│   ├── index.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── SearchPage.ts
│   ├── SolutionsPage.ts
│   └── TraceNewPage.ts
├── d09-login.spec.ts      # Login/Register E2E tests
├── d10-search.spec.ts      # Search E2E tests
├── d11-trace-submit.spec.ts # Trace submission E2E tests
├── d12-solution.spec.ts    # Solution view E2E tests
├── playwright.config.ts    # Playwright configuration
├── fixtures.ts             # Test fixtures and utilities
└── README.md              # This file
```

## Prerequisites

1. **Install dependencies**:
   ```bash
   cd axiqra-app
   npm install
   npx playwright install
   ```

2. **Start the dev server**:
   ```bash
   npm run dev
   ```
   Or in CI mode, the playwright config will automatically start the server.

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npx playwright test e2e/d09-login.spec.ts
```

### Run with UI (headed mode)
```bash
npx playwright test --headed
```

### Run specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=mobile-chrome
```

### Run tests with debug mode
```bash
npx playwright test --debug
```

### Run tests in CI mode
```bash
CI=true npm run test:e2e
```

## Test Files

### D09: Login/Register Flow (`d09-login.spec.ts`)

**Test Cases:**
- User registration (valid, invalid email, password mismatch, terms required)
- User login (valid, invalid credentials, empty fields)
- Login button loading state
- Navigation between login and register pages
- Authenticated user redirection

### D10: Search Flow (`d10-search.spec.ts`)

**Test Cases:**
- Search input and button display
- Search with valid/invalid queries
- Search result filtering (status, tech stack, risk level)
- Combined filters
- No results handling
- Create seed button visibility
- Edge cases (long queries, rapid requests)

### D11: Trace Submission (`d11-trace-submit.spec.ts`)

**Test Cases:**
- Access control (authenticated/unauthenticated)
- All 9 form blocks display
- Fill individual blocks
- Forward steps management
- Auto-save draft
- Clear draft
- Submit with validation
- Desensitization preview

### D12: Solution View (`d12-solution.spec.ts`)

**Test Cases:**
- Solutions list display
- Filter controls visibility
- Solution cards with badges
- Filtering by status/tech stack/risk level
- Solution detail navigation
- Status badge display
- Risk badge display
- Pagination

## Page Object Models

### LoginPage
```typescript
const loginPage = new LoginPage(page);
await loginPage.login(email, password);
```

### RegisterPage
```typescript
const registerPage = new RegisterPage(page);
await registerPage.register(email, username, password, confirmPassword);
```

### SearchPage
```typescript
const searchPage = new SearchPage(page);
await searchPage.search('query');
await searchPage.applyStatusFilter('published');
```

### TraceNewPage
```typescript
const tracePage = new TraceNewPage(page);
await tracePage.fillTaskGoal('Deploy app');
await tracePage.addForwardStep('Build', 'npm run build', 'Success');
await tracePage.submit();
```

### SolutionsPage
```typescript
const solutionsPage = new SolutionsPage(page);
await solutionsPage.expectSolutionsLoaded();
await solutionsPage.clickSolutionCard('Solution Title');
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:5173` | Application base URL |
| `CI` | `false` | Enable CI mode (skip dev server) |

## Test Reports

- **HTML Report**: `e2e/test-results/index.html`
- **Screenshots**: `e2e/test-results/screenshots/` (on failure)
- **Videos**: `e2e/test-results/videos/` (on failure)
- **Traces**: `e2e/test-results/traces/` (first retry)

## Continuous Integration

The tests are configured to run in CI with:

1. No dev server (server must be provided externally)
2. Retries enabled (2 retries per test)
3. Screenshots and videos on failure
4. Single worker for consistent results

Example CI configuration:
```yaml
- name: Run E2E Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm run test:e2e
  env:
    CI: true
    BASE_URL: ${{ env.DEPLOY_URL }}
```

## Troubleshooting

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify database connectivity

### Authentication tests fail
- Ensure test user exists in test database
- Check API endpoints are accessible
- Verify CORS configuration

### Visual differences
- Update screenshots with: `npx playwright test --update-snapshots`
- Check for CSS regressions
