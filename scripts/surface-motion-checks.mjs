import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

export async function verifySurfaceMotion(page, surface, { tilt = false, ambient = false } = {}) {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await surface.scrollIntoViewIfNeeded();
  await surface.hover({ position: { x: 24, y: 28 } });
  await expect
    .poll(() => surface.evaluate((el) => el.style.getPropertyValue('--surface-glow')))
    .toBe('1');
  const glow = surface.locator('[data-surface-glow]').first();
  assert.notEqual(await glow.evaluate((el) => getComputedStyle(el).backgroundImage), 'none');
  if (tilt) {
    assert.notEqual(
      await surface.evaluate((el) => el.style.getPropertyValue('--surface-ry')),
      '0deg',
    );
    assert.notEqual(await surface.evaluate((el) => getComputedStyle(el).transform), 'none');
  }
  if (ambient) {
    await expect(surface.locator('[data-ambient-backdrop]')).toHaveAttribute('data-active', 'true');
    assert.notEqual(
      await surface
        .locator('[data-ambient-layer]')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
      'none',
    );
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(surface.locator('[data-ambient-backdrop]')).toHaveAttribute(
      'data-active',
      'false',
    );
    assert.equal(
      await surface
        .locator('[data-ambient-layer]')
        .first()
        .evaluate((el) => getComputedStyle(el).animationPlayState),
      'paused',
    );
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(surface.locator('[data-ambient-backdrop]')).toHaveAttribute('data-active', 'true');
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await surface.hover({ position: { x: 30, y: 32 } });
  await expect
    .poll(() => surface.evaluate((el) => el.style.getPropertyValue('--surface-glow')))
    .toBe('');
  await expect(glow).toBeHidden();
  if (tilt) assert.equal(await surface.evaluate((el) => getComputedStyle(el).transform), 'none');
  if (ambient)
    assert.equal(
      await surface
        .locator('[data-ambient-layer]')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
      'none',
    );

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Touch lighting must not prevent a click or native scrolling, and must clear after release.
  const allowed = await surface.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return el.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerType: 'touch',
        clientX: r.left + 30,
        clientY: r.top + 35,
      }),
    );
  });
  assert.ok(allowed);
  await expect
    .poll(() => surface.evaluate((el) => el.style.getPropertyValue('--surface-glow')))
    .toBe('1');
  assert.equal(await surface.evaluate((el) => el.style.getPropertyValue('--surface-ry')), '0deg');
  await surface.dispatchEvent('pointerup', { pointerType: 'touch' });
  await expect
    .poll(() => surface.evaluate((el) => el.style.getPropertyValue('--surface-glow')))
    .toBe('');
  await surface.hover({ position: { x: 24, y: 28 } });
  await surface.dispatchEvent('pointercancel', { pointerType: 'touch' });
  await expect
    .poll(() => surface.evaluate((el) => el.style.getPropertyValue('--surface-glow')))
    .toBe('');
  await expect.poll(() => surface.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
}
