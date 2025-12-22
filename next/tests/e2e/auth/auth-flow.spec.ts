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

    // Step 3: Login with the verified user (with Remember Me checked)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Email address').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByLabel('Remember me').check();
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Verify remember_me extends token lifetime (30 days = 2592000 seconds)
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(refreshToken).toBeTruthy();

    // Decode JWT payload to check expiration
    const payload = JSON.parse(atob(refreshToken!.split('.')[1]));
    const tokenLifetime = payload.exp - payload.iat;
    const expectedLifetime = 30 * 24 * 60 * 60; // 30 days in seconds

    // Token lifetime should be approximately 30 days (allow 60 seconds tolerance)
    expect(Math.abs(tokenLifetime - expectedLifetime)).toBeLessThan(60);

    // Step 4: Logout
    await logoutUser(page);

    // Step 5: Verify protected routes redirect to login when not authenticated
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
