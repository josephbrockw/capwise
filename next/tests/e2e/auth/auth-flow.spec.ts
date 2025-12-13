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

    // Step 2: Verify email using test mode (only works in DEBUG)
    const verifyResponse = await page.request.post('http://localhost:8009/api/auth/verify', {
      data: {
        email: testUser.email,
        token: '000000',
        test: true
      }
    });
    console.log('Verify response status:', verifyResponse.status());

    // Step 3: Login with the verified user
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Email address').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait and check what happened
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    // Check if we're on dashboard
    if (!currentUrl.includes('/dashboard')) {
      const errorMessage = await page.getByText(/error|failed|invalid/i).textContent().catch(() => 'No error found');
      console.log('Not on dashboard. Error:', errorMessage);
      throw new Error(`Login did not redirect to dashboard. Current URL: ${currentUrl}`);
    }

    // Should be on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    console.log('Successfully logged in and on dashboard');

    // Step 4: Logout - find and click the logout button
    // Debug: List all buttons on the page
    const allButtons = await page.getByRole('button').all();
    console.log('Buttons found:', allButtons.length);
    for (const btn of allButtons) {
      const text = await btn.textContent().catch(() => '');
      console.log('Button text:', text);
    }

    // Try multiple selectors for logout
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
