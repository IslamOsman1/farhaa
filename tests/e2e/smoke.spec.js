import { test, expect } from '@playwright/test';

const hasAdminCreds = Boolean(process.env.E2E_ADMIN_USERNAME && process.env.E2E_ADMIN_PASSWORD);

test('landing page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FARHA|فرحة/i);
});

test('admin login page loads', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.locator('form')).toBeVisible();
});

test.describe('authenticated flows', () => {
  test.skip(!hasAdminCreds, 'E2E admin credentials are not configured.');

  test('admin can log in and open openings page', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/اسم المستخدم|username|email/i).fill(process.env.E2E_ADMIN_USERNAME);
    await page.getByLabel(/كلمة المرور|password/i).fill(process.env.E2E_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /دخول|login/i }).click();
    await page.waitForURL(/\/admin/);
    await page.goto('/admin/openings');
    await expect(page.getByRole('heading', { name: /الافتتاحيات|مكتبة الافتتاحيات/i })).toBeVisible();
  });
});
