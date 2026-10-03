import { describe, expect, it, vi } from 'vitest';
import { NominatimGeocodingService } from './geocoding.js';
describe('reverse location adapter', () => {
  it('identifies the application and caches repeated coordinates', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ display_name: 'اردکان، خیابان نمونه' })));
    const service = new NominatimGeocodingService('https://store.example', fetcher);
    const point = { latitude: 32.31, longitude: 54.01 };
    expect(await service.reverse(point)).toBe('اردکان، خیابان نمونه');
    expect(await service.reverse(point)).toBe('اردکان، خیابان نمونه');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]?.[1]?.headers).toMatchObject({
      'User-Agent': 'SonatiBehjati/0.1 (https://store.example)',
    });
  });
  it('does not substitute an address when the service fails', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 503 }));
    await expect(
      new NominatimGeocodingService('https://store.example', fetcher).reverse({
        latitude: 32,
        longitude: 54,
      }),
    ).rejects.toThrow();
  });
});
