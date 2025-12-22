import { Page, expect } from '@playwright/test';

/**
 * Helper functions for authentication flows
 */

export interface TestUser {
  email: string;
  password: string;
  name: string;
}

/**
 * Generate a unique test user with timestamp
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    email: `test.user.${timestamp}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
  };
}

/**
 * Register a new user via the UI
 */
export async function registerUser(page: Page, user: TestUser) {
  await page.goto('/register');

  // Wait for form to be ready
  await page.waitForLoadState('networkidle');

  // Fill registration form with exact label text
  await page.getByLabel('Full name').fill(user.name);
  await page.getByLabel('Email address').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByLabel('Confirm password').fill(user.password);

  // Check terms checkbox
  await page.getByLabel(/I agree to the/i).check();

  // Submit form
  await page.getByRole('button', { name: /create account/i }).click();

  // Wait for success indication (increased timeout for Docker environment)
  await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 30000 });
}

/**
 * Login a user via the UI
 */
export async function loginUser(page: Page, email: string, password: string, rememberMe: boolean = false) {
  await page.goto('/login');

  // Wait for form to be ready
  await page.waitForLoadState('networkidle');

  // Fill login form with exact label text
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);

  // Check remember me if requested
  if (rememberMe) {
    await page.getByLabel('Remember me').check();
  }

  // Submit form
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for redirect to dashboard (increased timeout for slower backends)
  try {
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  } catch {
    // Capture what's on the page if login fails
    const url = page.url();
    const errorMsg = await page.getByText(/error|failed|invalid/i).textContent().catch(() => null);
    throw new Error(`Login failed. Current URL: ${url}. Error message: ${errorMsg || 'none'}`);
  }
}

/**
 * Logout a user via the UI (uses avatar dropdown)
 */
export async function logoutUser(page: Page) {
  const avatarDropdown = page.locator('nav [aria-haspopup="menu"]').first();
  await expect(avatarDropdown).toBeVisible({ timeout: 10000 });
  await avatarDropdown.click();

  const logoutButton = page.getByRole('button', { name: /logout/i });
  await expect(logoutButton).toBeVisible({ timeout: 5000 });
  await logoutButton.click();

  await page.waitForURL(/\/(login)?$/, { timeout: 10000 });
}

/**
 * Verify a user's email using test mode (DEBUG=True only)
 */
export async function verifyUserEmail(page: Page, email: string) {
  await page.goto(`/verify?testMode=true&email=${encodeURIComponent(email)}`);
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Verification Code').fill('000000');
  await page.getByRole('button', { name: /verify email/i }).click();

  await expect(page.getByText(/email verified/i)).toBeVisible({ timeout: 10000 });
}

/**
 * Complete setup: register, verify, and login a new user
 * Returns the test user credentials for use in tests
 */
export async function setupAuthenticatedUser(page: Page): Promise<TestUser> {
  const testUser = generateTestUser();

  await registerUser(page, testUser);
  await verifyUserEmail(page, testUser.email);
  await loginUser(page, testUser.email, testUser.password);

  return testUser;
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  await page.goto('/dashboard');

  // If redirected to login, user is not logged in
  const url = page.url();
  return !url.includes('/login');
}

/**
 * Clear all auth tokens from localStorage
 */
export async function clearAuth(page: Page) {
  // Clear cookies at context level
  await page.context().clearCookies();

  // Clear storage using context API (no navigation needed)
  await page.context().clearPermissions();

  // If page has a document, clear storage
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch {
    // Page might not have a document yet, which is fine
    // Storage will be empty when page loads
  }
}
