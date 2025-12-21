import { test, expect } from '@playwright/test';
import { generateTestUser, clearAuth, registerUser, verifyUserEmail, logoutUser } from '../helpers/auth.helpers';

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

    // Step 1: Register a new user
    await registerUser(page, testUser);

    // Step 2: Verify email
    await verifyUserEmail(page, testUser.email);

    // Step 3: Login with the verified user
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Email address').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Step 4: Logout
    await logoutUser(page);

    // Step 5: Verify protected routes redirect to login when not authenticated
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
