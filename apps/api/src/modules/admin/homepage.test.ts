import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultHomepage } from '@behjati/shared/homepage';
const mocks = vi.hoisted(() => ({ find: vi.fn(), update: vi.fn(), create: vi.fn() }));
vi.mock('../../database/client.js', () => {
  const homepageContent = { findUnique: mocks.find, update: mocks.update, create: mocks.create };
  return {
    db: {
      homepageContent,
      $transaction: async (run: (tx: unknown) => unknown) =>
        run({ homepageContent, $queryRaw: vi.fn() }),
    },
  };
});
import { homepageContent, saveAnnouncement } from './homepage';
const stamp = '2026-10-20T08:00:00.000Z';
beforeEach(() => vi.clearAllMocks());
describe('announcement editing', () => {
  it('reads existing homepage content without changing its hero or story', async () => {
    const legacy = { slides: defaultHomepage.slides, story: defaultHomepage.story };
    mocks.find.mockResolvedValue({ data: legacy, updatedAt: new Date(stamp) });
    const result = await homepageContent();
    expect(result.announcement.enabled).toBe(true);
    expect(result.slides).toEqual(legacy.slides);
    expect(result.story).toEqual(legacy.story);
  });
  it('updates only the announcement with optimistic concurrency', async () => {
    mocks.find.mockResolvedValue({ data: defaultHomepage, updatedAt: new Date(stamp) });
    mocks.update.mockImplementation(async ({ data }) => ({ ...data, updatedAt: new Date(stamp) }));
    await saveAnnouncement({ enabled: true, text: 'جشنوارهٔ فروش بهجتی' }, stamp);
    expect(mocks.update).toHaveBeenCalledOnce();
    const saved = mocks.update.mock.calls[0]![0].data.data;
    expect(saved.slides).toEqual(defaultHomepage.slides);
    expect(saved.story).toEqual(defaultHomepage.story);
    expect(saved.announcement.text).toBe('جشنوارهٔ فروش بهجتی');
  });
  it('rejects stale saves without overwriting content', async () => {
    mocks.find.mockResolvedValue({ data: defaultHomepage, updatedAt: new Date(stamp) });
    await expect(saveAnnouncement({ enabled: false, text: 'اطلاعیه' }, null)).rejects.toThrow();
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it('rejects blank or overlong notices before writing', async () => {
    await expect(saveAnnouncement({ enabled: true, text: '  ' }, stamp)).rejects.toThrow();
    await expect(
      saveAnnouncement({ enabled: true, text: 'آ'.repeat(181) }, stamp),
    ).rejects.toThrow();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
