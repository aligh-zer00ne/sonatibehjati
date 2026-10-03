import type { Coordinates } from '@behjati/shared';
export interface AddressMap {
  move(coordinates: Coordinates): void;
  destroy(): void;
}
export interface AddressMapService {
  create(
    container: HTMLElement,
    value: Coordinates,
    onChange: (value: Coordinates) => void,
    signal?: AbortSignal,
  ): Promise<AddressMap>;
  locate(): Promise<Coordinates>;
}
export const mapService: AddressMapService = {
  async create(container, value, onChange, signal) {
    const L = await import('leaflet');
    signal?.throwIfAborted();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const map = L.map(container, {
      scrollWheelZoom: false,
      zoomAnimation: !reduceMotion,
      fadeAnimation: !reduceMotion,
    }).setView([value.latitude, value.longitude], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const icon = L.icon({
      iconUrl: '/map/marker-icon.png',
      shadowUrl: '/map/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41],
    });
    const marker = L.marker([value.latitude, value.longitude], {
      icon,
      draggable: true,
      title: 'موقعیت نشانی',
    }).addTo(map);
    const pick = (latitude: number, longitude: number) => {
      const point = {
        latitude: Math.max(-90, Math.min(90, latitude)),
        longitude: ((((longitude + 180) % 360) + 360) % 360) - 180,
      };
      marker.setLatLng([point.latitude, point.longitude]);
      onChange(point);
    };
    map.on('click', (event) => pick(event.latlng.lat, event.latlng.lng));
    marker.on('dragend', () => {
      const point = marker.getLatLng();
      pick(point.lat, point.lng);
    });
    return {
      move(point) {
        marker.setLatLng([point.latitude, point.longitude]);
        map.setView([point.latitude, point.longitude], map.getZoom());
      },
      destroy() {
        map.remove();
      },
    };
  },
  locate() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation)
        return reject(new Error('مرورگر شما دریافت موقعیت را پشتیبانی نمی‌کند.'));
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        (error) =>
          reject(
            new Error(
              error.code === 1
                ? 'دسترسی به موقعیت داده نشد؛ روی نقشه انتخاب کنید یا نشانی را دستی بنویسید.'
                : 'موقعیت دریافت نشد؛ دوباره تلاش کنید یا روی نقشه انتخاب کنید.',
            ),
          ),
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
      );
    });
  },
};
