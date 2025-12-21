import { test, expect } from '@playwright/test';
import { clearAuth, loginUser, logoutUser } from '../helpers/auth.helpers';

const TEST_USER = {
  email: 'esme@lancre.gov',
  password: 'testpass123',
};

/**
 * Settings Page E2E Test
 * Tests user profile and password change functionality using existing test user
 */
test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should handle profile and password changes', async ({ page }) => {
    const originalPassword = TEST_USER.password;
    const newPassword = 'NewPassword456!';

    // Login with existing test user
    await loginUser(page, TEST_USER.email, originalPassword);

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
    await loginUser(page, TEST_USER.email, newPassword);

    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Cleanup: Reset password back to original for future test runs
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /password/i }).click();

    await page.getByLabel('Current Password').fill(newPassword);
    await page.getByLabel('New Password', { exact: true }).fill(originalPassword);
    await page.getByLabel('Confirm New Password').fill(originalPassword);
    await page.getByRole('button', { name: /change password/i }).click();

    await expect(page.getByText(/password changed successfully/i)).toBeVisible({ timeout: 10000 });
  });
});
