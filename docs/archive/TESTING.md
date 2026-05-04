# Test Suite Documentation

## Overview

Comprehensive test coverage for the Academic CMS project, including:
- CMS Frontend (React components + utilities) - **21 tests passing**
- Worker API (Cloudflare Worker configuration) - **3 tests passing**

**Total: 24 tests passing ✅**

---

## CMS Frontend Tests

### Setup

Tests use **Vitest** + **React Testing Library** for component and unit testing.

```bash
cd cms
npm test          # Watch mode
npm run test:run  # Run once
npm run test:ui   # UI mode
npm run test:coverage # With coverage report
```

### Test Results

✅ **All 21 tests passing**

**Test Coverage:**
- ✅ API Token Management (3 tests)
- ✅ BibTeX Parser (5 tests)
- ✅ Slugify Utility (8 tests)
- ✅ Login Component (5 tests)

### Test Files

#### `src/lib/api.test.js`
Tests for authentication token management:
- `getToken()` - Retrieves JWT from sessionStorage
- `clearToken()` - Removes JWT from sessionStorage
- Token presence validation

#### `src/lib/bibtex.test.js`
Tests for BibTeX parsing:
- Single entry parsing
- Multiple authors
- Entry type mapping (article → Journal Article, etc.)
- Slug generation (year-author-title format)
- Missing fields handling

#### `src/lib/frontmatter.test.js`
Tests for URL slug generation:
- Lowercase conversion
- Space to hyphen replacement
- Special character removal
- **German umlaut handling** (ä→ae, ö→oe, ü→ue, ß→ss)
- Multiple space normalization
- Trimming
- Number handling

#### `src/screens/Login.test.jsx`
Tests for Login component:
- Form rendering
- Password input handling
- Form submission
- Error handling
- Loading states

---

## Worker API Tests

### Setup

Tests use **Vitest** for Worker smoke tests and configuration validation.

```bash
cd worker
npm test          # Watch mode
npm run test:run  # Run once
```

### Test Results

✅ **All 3 tests passing**

**Test Coverage:**
- ✅ Worker Configuration (1 test)
- ✅ Environment Variables (1 test)
- ✅ Content Type Mapping (1 test)

### Test Files

#### `src/index.test.js`
Smoke tests for Worker configuration:
- **Worker module import** - Verifies no syntax errors in Worker code
- **Environment variables** - Validates required env var names
- **Content type mapping** - Verifies content folder path constants

**Note:** Full integration tests for API endpoints (authentication, CRUD operations, GitHub API integration) require the Cloudflare Workers test environment setup. These smoke tests verify the Worker code is valid and can be loaded without errors.

---

## Configuration

### CMS Vitest Config (`cms/vite.config.js`)

```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.js',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
  }
}
```

### Worker Vitest Config (`worker/vitest.config.js`)

```javascript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
```

---

## Test Coverage Goals

### Current Coverage
- ✅ Utility functions: 100%
- ✅ API client: Core functions covered
- ✅ BibTeX parser: Full coverage
- ✅ Worker: Smoke tests and configuration validation
- ⚠️ React components: Login only (1/9 components)

### Next Steps
1. Add tests for remaining CMS components:
   - Dashboard
   - ContentList
   - Editor (Milkdown integration)
   - PublicationForm
   - BibTeXImport
   - MediaLibrary
   - ProfileEditor
2. Add Worker integration tests using Cloudflare Workers test environment:
   - Authentication endpoint tests
   - CRUD operations for content types
   - GitHub API integration tests
3. Add integration tests for full workflows
4. Add E2E tests for critical paths

---

## Writing New Tests

### Component Test Template

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Utility Test Template

```javascript
import { describe, it, expect } from 'vitest'
import { myFunction } from './myUtility'

describe('myFunction', () => {
  it('handles basic input', () => {
    expect(myFunction('input')).toBe('expected')
  })

  it('handles edge cases', () => {
    expect(myFunction('')).toBe('')
    expect(myFunction(null)).toBe(null)
  })
})
```

### Worker Smoke Test Template

```javascript
import { describe, it, expect } from 'vitest'

describe('Worker Configuration', () => {
  it('Worker module can be imported', async () => {
    const workerModule = await import('./index.js')
    expect(workerModule).toBeDefined()
    expect(workerModule.default).toBeDefined()
  })

  it('validates configuration constants', () => {
    const CONFIG = {
      someKey: 'someValue'
    }
    expect(CONFIG.someKey).toBe('someValue')
  })
})
```

**Note:** For full Worker integration tests, set up the Cloudflare Workers test environment:

```javascript
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import worker from './index'

describe('GET /api/example', () => {
  it('returns expected data', async () => {
    const request = new Request('http://example.com/api/example', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer test-token' }
    })

    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(200)
  })
})
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test-cms:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd cms && npm install && npm run test:run

  test-worker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd worker && npm install && npm run test:run
```

---

## Dependencies

### CMS Testing Stack
- `vitest@^4.1.4` - Test runner
- `@testing-library/react@^16.3.2` - Component testing
- `@testing-library/jest-dom@^6.9.1` - DOM matchers
- `@testing-library/user-event@^14.6.1` - User interaction simulation
- `jsdom@^29.0.2` - DOM environment
- `@vitest/ui@^4.1.4` - Interactive test UI

### Worker Testing Stack
- `vitest@^4.1.4` - Test runner
- `@cloudflare/vitest-pool-workers@^0.14.3` - Worker test environment

---

## Troubleshooting

### Common Issues

**Issue:** Tests fail with "sessionStorage is not defined"
**Solution:** Ensure `src/test/setup.js` is properly configured in vite.config.js

**Issue:** Worker tests can't find Cloudflare bindings
**Solution:** Check `wrangler.toml` path in `vitest.config.js`

**Issue:** React component tests fail to render
**Solution:** Wrap components in `<BrowserRouter>` when using React Router

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Cloudflare Workers Testing](https://developers.cloudflare.com/workers/testing/vitest-integration/)
