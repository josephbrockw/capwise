import { test, expect } from '@playwright/test';
import { generateTestUser, clearAuth } from '../helpers/auth.helpers';

/**
 * Complete Authentication Flow E2E Test
 * Tests the full user journey: register → verify → login → logout
 * Uses test mode verification (DEBUG=True only) to complete the flow
 */
test.describe('Complete Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should complete full auth flow: register -> verify -> login -> logout', async ({ page }) => {
    const testUser = generateTestUser();

    // Test 1: Registration form renders and accepts input
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Verify all form fields are present
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
    await expect(page.getByLabel(/I agree to the/i)).toBeVisible();

    // Fill and submit registration form
    await page.getByLabel('Full name').fill(testUser.name);
    await page.getByLabel('Email address').fill(testUser.email);
    await page.getByLabel('Password', { exact: true }).fill(testUser.password);
    await page.getByLabel('Confirm password').fill(testUser.password);
    await page.getByLabel(/I agree to the/i).check();
    await page.getByRole('button', { name: /create account/i }).click();

    // Verify registration submission works
    await expect(page.getByText(/check your email/i)).toBeVisible({
      timeout: 20000
    });

    // Step 2: Verify email by navigating to the verify page with test mode
    await page.goto(`/verify?testMode=true&email=${encodeURIComponent(testUser.email)}`);
    await page.waitForLoadState('networkidle');

    // Enter the test verification code (000000 works in DEBUG mode)
    await page.getByLabel('Verification Code').fill('000000');
    await page.getByRole('button', { name: /verify email/i }).click();

    // Wait for successful verification
    await expect(page.getByText(/email verified/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/all set/i)).toBeVisible();

    // Step 3: Login with the verified user
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Email address').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait and check what happened
    await page.waitForTimeout(3000);
    const currentUrl = page.url();

    // Check if we're on dashboard
    if (!currentUrl.includes('/dashboard')) {
      await page.getByText(/error|failed|invalid/i).textContent().catch(() => 'No error found');
      throw new Error(`Login did not redirect to dashboard. Current URL: ${currentUrl}`);
    }

    // Should be on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Step 4: Logout - find and click the logout button
    const logoutButton = page.getByRole('button', { name: /log out|sign out|logout/i });
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    await logoutButton.click();
    await page.waitForURL(/\/(login)?$/, { timeout: 10000 });

    // Step 5: Verify protected routes redirect to login when not authenticated
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/login/);
  });



});
