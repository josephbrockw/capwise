# E2E Tests with Playwright

This directory contains end-to-end integration tests for the BaseBuild application using [Playwright](https://playwright.dev/).

## 📁 Test Structure

```
tests/
└── e2e/
    ├── helpers/
    │   └── auth.helpers.ts      # Reusable authentication helpers
    └── auth/
        ├── registration.spec.ts  # User registration tests
        ├── login.spec.ts         # User login tests
        ├── logout.spec.ts        # User logout tests
        └── auth-flow.spec.ts     # Complete authentication flow tests
```

## 🚀 Running Tests

### Run all tests (headless, terminal output)
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### Run tests with HTML report
```bash
npm run test:e2e:html
```

### View previous test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

### Run tests matching a pattern
```bash
npx playwright test --grep "login successfully"
```

## 📝 Test Coverage

### Registration Tests (`registration.spec.ts`)
- ✅ Display registration form
- ✅ Register a new user successfully
- ✅ Show validation errors for invalid email
- ✅ Show validation errors for short password
- ✅ Show error for duplicate email
- ✅ Link to login page
- ✅ Disable submit button while processing

### Login Tests (`login.spec.ts`)
- ✅ Display login form
- ✅ Login successfully with valid credentials
- ✅ Show error for invalid credentials
- ✅ Show error for empty fields
- ✅ Link to registration page
- ✅ Password reset link
- ✅ Persist login state after page refresh
- ✅ Toggle password visibility
- ✅ Disable submit button while processing

### Logout Tests (`logout.spec.ts`)
- ✅ Display logout button when logged in
- ✅ Logout successfully and redirect to home
- ✅ Clear authentication tokens on logout
- ✅ Cannot access protected routes after logout
- ✅ Require login again after logout
- ✅ Hide logout button when not logged in
- ✅ Handle logout with expired token
- ✅ Clear user data from UI after logout
- ✅ Handle multiple rapid logout clicks

### Complete Flow Tests (`auth-flow.spec.ts`)
- ✅ Complete auth flow: register → login → logout
- ✅ Maintain separate sessions in different contexts
- ✅ Handle session timeout gracefully
- ✅ Prevent access to auth pages when logged in

## 🔧 Configuration

The Playwright configuration is defined in `playwright.config.ts` at the project root.

### Key Settings:
- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL`)
- **Browser**: Chromium (can be extended to Firefox and WebKit)
- **Retries**: 2 on CI, 0 locally
- **Trace**: Captured on first retry
- **Screenshots**: Taken on failure
- **Reporter**:
  - Local: `list` (terminal output)
  - CI: `html` + `github` (generates report without opening browser)

### Web Server
The tests automatically start the Next.js dev server before running tests:
```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
}
```

## 📚 Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { generateTestUser, clearAuth } from '../helpers/auth.helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await clearAuth(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.goto('/some-page');
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### Helper Functions

#### `generateTestUser()`
Creates a unique test user with timestamp-based email:
```typescript
const testUser = generateTestUser();
// { email: 'test.user.1234567890@example.com', password: 'TestPassword123!', name: 'Test User' }
```

#### `registerUser(page, user)`
Registers a new user via the UI:
```typescript
await registerUser(page, testUser);
```

#### `loginUser(page, email, password)`
Logs in a user via the UI:
```typescript
await loginUser(page, testUser.email, testUser.password);
```

#### `logoutUser(page)`
Logs out the current user:
```typescript
await logoutUser(page);
```

#### `clearAuth(page)`
Clears all authentication tokens:
```typescript
await clearAuth(page);
```

#### `isLoggedIn(page)`
Checks if a user is currently logged in:
```typescript
const loggedIn = await isLoggedIn(page);
```

## 🐛 Debugging

### Use Playwright Inspector
```bash
npm run test:e2e:debug
```

### View trace files
If a test fails, traces are captured. View them with:
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Run with headed browser
```bash
npm run test:e2e:headed
```

### Use UI mode for interactive debugging
```bash
npm run test:e2e:ui
```

### Generate HTML report for detailed analysis
```bash
npm run test:e2e:html
# Then view with: npm run test:e2e:report
```

## 🔍 Selectors

We use semantic selectors prioritizing accessibility:

1. **Role-based**: `page.getByRole('button', { name: /sign in/i })`
2. **Label-based**: `page.getByLabel(/email/i)`
3. **Text-based**: `page.getByText(/welcome/i)`
4. **Test IDs**: `page.getByTestId('login-form')` (when needed)

## 📊 CI/CD Integration

To run tests in CI, ensure:

1. Install dependencies: `npm ci`
2. Install Playwright browsers: `npx playwright install --with-deps`
3. Run tests: `npm run test:e2e`

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🔄 Best Practices

1. **Isolate tests**: Each test should be independent
2. **Use unique test data**: Generate unique emails/usernames with `generateTestUser()`
3. **Clean up**: Clear auth state in `beforeEach` hooks
4. **Wait for conditions**: Use `waitForURL` and `expect().toBeVisible()` instead of `waitForTimeout`
5. **Semantic selectors**: Use role and label-based selectors for better maintainability
6. **Test user flows**: Test complete user journeys, not just individual actions

## 📖 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Test Assertions](https://playwright.dev/docs/test-assertions)
