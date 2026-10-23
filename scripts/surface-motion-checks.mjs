import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

export async function verifyCardFeedback(page, card) {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(2, 2);
  const resting = await card.evaluate((el) => ({
    border: getComputedStyle(el).borderTopColor,
    shadow: getComputedStyle(el).boxShadow,
  }));
  await card.hover({ position: { x: 25, y: 55 } });
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el).borderTopColor))
    .not.toBe(resting.border);
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el).boxShadow))
    .not.toBe(resting.shadow);
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el, '::after').opacity)).toBe('1');
  const icon = card.locator('[data-card-icon]').first();
  if (await icon.count()) {
    await expect
      .poll(() =>
        icon.evaluate((el) => {
          const s = getComputedStyle(el);
          return s.transform !== 'none' || s.rotate !== 'none' || s.scale !== 'none';
        }),
      )
      .toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect
      .poll(() =>
        icon.evaluate((el) => {
          const s = getComputedStyle(el);
          return s.transform === 'none' && s.rotate === 'none' && s.scale === 'none';
        }),
      )
      .toBe(true);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.move(2, 2);
  const control = card.locator('button, a, input').first();
  if (await card.evaluate((el) => el.matches('a,button'))) await card.focus();
  else if (await control.count()) await control.focus();
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el).borderTopColor))
    .toBe('rgb(166, 64, 78)');
}

export async function verifySurfaceMotion(page, surface, { tilt = false, ambient = false } = {}) {
  if (ambient) return verifyParticleNetwork(page, surface);
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

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await surface.hover({ position: { x: 30, y: 32 } });
  await expect
    .poll(() => surface.evaluate((el) => el.style.getPropertyValue('--surface-glow')))
    .toBe('');
  await expect(glow).toBeHidden();
  if (tilt) assert.equal(await surface.evaluate((el) => getComputedStyle(el).transform), 'none');

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

async function verifyParticleNetwork(page, surface) {
  const canvas = surface.locator('canvas[data-ambient-backdrop]');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await surface.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute('data-network-state', 'running');
  const initial = await canvas.evaluate((el) => el.toDataURL());
  await expect.poll(() => canvas.evaluate((el) => el.toDataURL())).not.toBe(initial);
  const before = await canvas.boundingBox();
  await surface.hover({ position: { x: 36, y: 40 } });
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-network-links')))
    .toBeGreaterThan(0);
  assert.equal(await surface.evaluate((el) => getComputedStyle(el).transform), 'none');
  assert.equal(await canvas.evaluate((el) => getComputedStyle(el).transform), 'none');
  assert.equal(await surface.evaluate((el) => el.style.getPropertyValue('--surface-dx')), '');
  const after = await canvas.boundingBox();
  assert.ok(
    Math.abs(before.x - after.x) < 1 && Math.abs(before.y - after.y) < 1,
    'The colored surface/canvas must not translate with the pointer',
  );
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(canvas).toHaveAttribute('data-network-state', 'paused');
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(canvas).toHaveAttribute('data-network-state', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(canvas).toHaveAttribute('data-network-state', 'static');
  const still = await canvas.evaluate((el) => el.toDataURL());
  await surface.hover({ position: { x: 50, y: 45 } });
  await page.waitForTimeout(180);
  assert.equal(await canvas.evaluate((el) => el.toDataURL()), still);
  await expect(canvas).toHaveAttribute('data-network-links', '0');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  assert.ok(
    await surface.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          pointerType: 'touch',
          clientX: r.left + 36,
          clientY: r.top + 40,
        }),
      );
    }),
  );
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-network-links')))
    .toBeGreaterThan(0);
  await surface.dispatchEvent('pointerup', { pointerType: 'touch' });
  await expect(canvas).toHaveAttribute('data-network-links', '0');
  await surface.hover({ position: { x: 36, y: 40 } });
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-network-links')))
    .toBeGreaterThan(0);
  await surface.dispatchEvent('pointercancel', { pointerType: 'touch' });
  await expect(canvas).toHaveAttribute('data-network-links', '0');
}
