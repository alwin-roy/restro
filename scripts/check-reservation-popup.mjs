import assert from 'node:assert/strict';
import { chromium } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://localhost:3200/', { waitUntil: 'domcontentloaded' });
    const scene = page.locator('.reservation-scene');
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    assert.equal(await page.locator('.reservation-card').count(), 1);
    assert.equal(await page.getByRole('form', { name: 'BOOK YOUR TABLE' }).count(), 0);
    if (width === 1440) await scene.screenshot({ path: 'node_modules/.cache/visualizations/restro-reservation-live.png' });
    const trigger = scene.getByRole('button', { name: 'Reserve a Table' });
    await trigger.click();
    const modal = page.locator('.reservation-booking-dialog');
    assert.equal(await modal.evaluate(element => element.open), true);
    assert.equal(await modal.locator('input[name=fullName]').evaluate(element => element === document.activeElement), true);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden');
    await modal.getByRole('button', { name: 'Close reservation form' }).focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await modal.evaluate(element => element.contains(document.activeElement)), true);
    await modal.getByRole('button', { name: 'Request Reservation' }).click();
    assert.equal(await modal.locator('input[name=fullName]').getAttribute('aria-invalid'), 'true');
    await modal.locator('input[name=fullName]').fill('Alex Guest');
    await modal.locator('input[name=email]').fill('alex@example.com');
    const tomorrow = await modal.locator('input[name=date]').evaluate(input => {
      const date = new Date(input.min + 'T12:00:00Z');
      date.setUTCDate(date.getUTCDate() + 1);
      return date.toISOString().slice(0, 10);
    });
    await modal.locator('input[name=date]').fill(tomorrow);
    await modal.getByRole('button', { name: 'Choose reservation time' }).click();
    assert.equal(await page.locator('.reservation-clock-dialog').evaluate(element => element.open), true);
    await page.keyboard.press('Escape');
    assert.equal(await modal.evaluate(element => element.open), true);
    assert.equal(await page.locator('.reservation-clock-dialog').evaluate(element => element.open), false);
    await modal.getByRole('button', { name: 'Choose reservation time' }).click();
    await page.locator('.reservation-clock-dialog').getByRole('button', { name: 'Confirm', exact: true }).click();
    await modal.getByRole('button', { name: 'Request Reservation' }).click();
    assert.equal(await modal.getByText('Reservation preview ready. Nothing has been sent or saved.').count(), 1);
    assert.equal(await modal.evaluate(element => element.scrollWidth > element.clientWidth), false);
    if (width === 390) await modal.screenshot({ path: 'node_modules/.cache/visualizations/restro-reservation-popup-mobile.png' });
    await page.keyboard.press('Escape');
    assert.equal(await modal.evaluate(element => element.open), false);
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden');
    await trigger.click();
    assert.equal(await modal.locator('input[name=fullName]').inputValue(), 'Alex Guest');
    await modal.getByRole('button', { name: 'Close reservation form' }).click();
    await trigger.click();
    await page.mouse.click(2, 2);
    assert.equal(await modal.evaluate(element => element.open), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await scene.evaluate(element => element.getAnimations({ subtree: true }).length), 0);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('Reservation scene, existing form validation/preview, nested clock, focus containment/return, Escape/close/backdrop, reopen, scroll lock, reduced motion and 1440/390/320px layouts passed.');
} finally { await browser.close(); }
