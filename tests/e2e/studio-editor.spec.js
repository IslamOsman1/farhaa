import { test, expect } from '@playwright/test';

const adminUsername = process.env.E2E_ADMIN_USERNAME || process.env.ADMIN_USERNAME || '';
const adminPassword = process.env.E2E_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
const hasAdminCreds = Boolean(adminUsername && adminPassword);

async function login(page) {
  await page.goto('/admin/login');
  await page.locator('input[type="text"]').fill(adminUsername);
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.getByRole('button').filter({ hasText: /دخول|login/i }).click();
  await page.waitForURL(/\/admin\//);
}

async function createStudioSession(page) {
  await page.goto('/admin/studio/new');
  await page.getByRole('button').filter({ hasText: /استخدام هذا القالب|جارٍ الإنشاء/i }).first().click();
  await page.waitForURL(/\/admin\/studio\/[^/]+$/);
}

test.describe('studio editor', () => {
  test.skip(!hasAdminCreds, 'Admin credentials are not configured for E2E.');

  test('edits template text, adds free text, and opens clean fullscreen preview', async ({ page, context }) => {
    await login(page);
    await createStudioSession(page);

    await expect(page.getByTestId('studio-add-free-text')).toBeVisible();
    await expect(page.frameLocator('iframe').locator('[data-farha-react-text-path]').first()).toBeVisible();

    const frame = page.frameLocator('iframe');
    const firstTemplateText = frame.locator('[data-farha-react-text-path]').first();
    await firstTemplateText.click();

    const templateTextarea = page.getByTestId('studio-template-text-input');
    const updatedTemplateText = `اختبار نص القالب ${Date.now()}`;
    await templateTextarea.fill(updatedTemplateText);
    await expect(firstTemplateText).toContainText(updatedTemplateText);

    await page.getByTestId('studio-add-free-text').click();
    const freeTextValue = `اختبار نص حر ${Date.now()}`;
    const freeTextTextarea = page.getByTestId('studio-free-text-input');
    await freeTextTextarea.fill(freeTextValue);
    await expect(frame.locator('.farha-react-free__text').last()).toContainText(freeTextValue);

    await page.getByTestId('studio-delete-selected-element').click();
    await expect(frame.locator('.farha-react-free__text').filter({ hasText: freeTextValue })).toHaveCount(0);

    const sessionId = page.url().match(/\/admin\/studio\/([^/]+)$/)?.[1];
    expect(sessionId).toBeTruthy();

    const previewPage = await context.newPage();
    await previewPage.goto(`/admin/studio/${sessionId}/preview`);
    const previewFrame = previewPage.frameLocator('iframe');
    await expect(previewFrame.locator('#farha-native-overlay')).toHaveCount(0);
    await expect(previewFrame.locator('#farha-react-layer')).toHaveCount(0);
  });
});
