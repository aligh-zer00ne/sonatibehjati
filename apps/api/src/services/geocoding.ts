import type { Coordinates, GeocodingService } from './contracts.js';
export class NominatimGeocodingService implements GeocodingService {
  private cache = new Map<string, { value: string | null; until: number }>();
  private tail: Promise<unknown> = Promise.resolve();
  private lastRequest = 0;
  private queued = 0;
  constructor(
    private origin: string,
    private fetcher: typeof fetch = fetch,
  ) {}
  async reverse(coordinates: Coordinates) {
    const key = `${coordinates.latitude.toFixed(5)},${coordinates.longitude.toFixed(5)}`;
    const cached = this.cache.get(key);
    if (cached && cached.until > Date.now()) return cached.value;
    if (this.queued >= 5) throw new Error('Geocoding unavailable');
    this.queued++;
    const job = this.tail.then(async () => {
      const cached = this.cache.get(key);
      if (cached && cached.until > Date.now()) return cached.value;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, 1100 - (Date.now() - this.lastRequest))),
      );
      this.lastRequest = Date.now();
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.search = new URLSearchParams({
        lat: String(coordinates.latitude),
        lon: String(coordinates.longitude),
        format: 'jsonv2',
        'accept-language': 'fa',
      }).toString();
      const response = await this.fetcher(url, {
        headers: { 'User-Agent': `SonatiBehjati/0.1 (${this.origin})`, Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
        redirect: 'error',
      });
      if (!response.ok) throw new Error('Geocoding unavailable');
      const data: unknown = await response.json();
      const value =
        typeof data === 'object' &&
        data !== null &&
        'display_name' in data &&
        typeof data.display_name === 'string'
          ? data.display_name.slice(0, 1000)
          : null;
      if (this.cache.size >= 1000) this.cache.delete(this.cache.keys().next().value!);
      this.cache.set(key, { value, until: Date.now() + 86400000 });
      return value;
    });
    this.tail = job.catch(() => {});
    try {
      return await job;
    } finally {
      this.queued--;
    }
  }
}
