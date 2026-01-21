import { test, expect } from '@playwright/test';
import { clearAuth, loginUser, logoutUser, setupAuthenticatedUser, TestUser } from '../helpers/auth.helpers';

/**
 * Settings Page E2E Test
 * Tests user profile and password change functionality
 */
test.describe('Settings Page', () => {
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should handle profile and password changes', async ({ page }) => {
    // Create a fresh test user for this test
    testUser = await setupAuthenticatedUser(page);
    const originalPassword = testUser.password;
    const newPassword = 'NewPassword456!';

    // Navigate to settings page
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    // Verify we're on the settings page
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();

    // Step 1: Attempt name change with empty fields -> should show validation or no change
    await page.getByLabel('First Name').fill('');
    await page.getByLabel('Last Name').fill('');
    await page.getByRole('button', { name: /save changes/i }).click();

    // Step 2: Successfully change name
    const newFirstName = 'Granny';
    const newLastName = 'Weatherwax';

    await page.getByLabel('First Name').fill(newFirstName);
    await page.getByLabel('Last Name').fill(newLastName);
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify success message
    await expect(page.getByText(/profile updated successfully/i)).toBeVisible({ timeout: 10000 });

    // Step 3: Attempt password change with wrong current password -> error shown
    await page.getByRole('tab', { name: /password/i }).click();

    await page.getByLabel('Current Password').fill('wrongpassword');
    await page.getByLabel('New Password', { exact: true }).fill(newPassword);
    await page.getByLabel('Confirm New Password').fill(newPassword);
    await page.getByRole('button', { name: /change password/i }).click();

    // Verify error message
    await expect(page.getByText(/current password is incorrect/i)).toBeVisible({ timeout: 10000 });

    // Step 4: Successfully change password
    await page.getByLabel('Current Password').fill(originalPassword);
    await page.getByLabel('New Password', { exact: true }).fill(newPassword);
    await page.getByLabel('Confirm New Password').fill(newPassword);
    await page.getByRole('button', { name: /change password/i }).click();

    // Verify success message
    await expect(page.getByText(/password changed successfully/i)).toBeVisible({ timeout: 10000 });

    // Step 5: Logout
    await logoutUser(page);

    // Step 6: Login with new password
    await loginUser(page, testUser.email, newPassword);

    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
