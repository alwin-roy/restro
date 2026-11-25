import assert from 'node:assert/strict';
import { chromium } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width === 390 });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://localhost:3200/', { waitUntil: 'networkidle' });
    const offers = page.locator('.offers-section');
    await offers.scrollIntoViewIfNeeded();
    await offers.hover();
    const active = page.locator('.offer-frame[aria-hidden=false]');
    for (let index = 1; index <= 5; index++) {
      await page.getByRole('button', { name: new RegExp(`Show promotion ${index}:`) }).click();
      await active.locator('.offer-image-wrap').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const image = document.querySelector('.offer-frame[aria-hidden=false] .offer-image');
        return image?.getAnimations().some(animation => animation.playState === 'running');
      });
      assert.ok(await active.locator('img').evaluate(image => image.complete && image.naturalWidth > 0));
      assert.equal(await page.locator('.offer-frame[aria-hidden=true] .offer-image').evaluateAll(images => images.reduce((sum, image) => sum + image.getAnimations().length, 0)), 0);
      await page.waitForTimeout(2100);
      assert.equal(await active.locator('.offer-image').evaluate(image => getComputedStyle(image).opacity), '1');
      assert.equal(await active.locator('.offer-cta').evaluate(element => getComputedStyle(element).opacity), '1');
    }
    // Last -> first uses a clone; its replacement should continue, rather than replay.
    if (width > 600) await page.getByRole('button', { name: 'Next promotion', exact: true }).click();
    else {
      const media = active.locator('.offer-image-wrap');
      await media.scrollIntoViewIfNeeded();
      const box = await media.boundingBox();
      await page.mouse.move(box.x + box.width * .75, box.y + box.height * .5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * .25, box.y + box.height * .5, { steps: 8 });
      await page.mouse.up();
    }
    await page.waitForTimeout(800);
    assert.equal(await active.getAttribute('aria-label'), '1 of 5');
    const time = await active.locator('.offer-image').evaluate(image => image.getAnimations()[0]?.currentTime);
    assert.ok(time >= 500, `Clone continuity was lost: ${time}`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    assert.equal(await active.locator('.offer-image').evaluate(image => image.getAnimations().length), 0);
    await page.getByRole('button', { name: /Show promotion 4:/ }).click();
    assert.equal(await active.locator('.offer-image').evaluate(image => image.getAnimations().length), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('All five photo reveals, finite completion, inactive slides, clone continuity, reduced motion and desktop/mobile layouts passed.');
} finally { await browser.close(); }
