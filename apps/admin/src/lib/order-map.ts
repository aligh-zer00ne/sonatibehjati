import { formatAdminPrice as formatPrice } from './money';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import type { AdminOrderSummaryFieldsFragment } from '../generated/graphql';
import { amountToPersianWords } from './numbers';
import { customerName } from './format';
export interface OrderMapAdapter {
  create(
    container: HTMLElement,
    orders: AdminOrderSummaryFieldsFragment[],
    onOpen: (id: string) => void,
    signal: AbortSignal,
  ): Promise<{ destroy: () => void }>;
}
export const orderMapAdapter: OrderMapAdapter = {
  async create(container, orders, onOpen, signal) {
    const L = await import('leaflet');
    signal.throwIfAborted();
    const map = L.map(container, {
      center: [32.31, 54.01],
      zoom: 11,
      // Leaflet's deferred zoom callback can outlive a map removed during order selection.
      zoomAnimation: false,
      fadeAnimation: !matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    const icon = L.icon({
      iconUrl: '/map/marker-icon.png',
      shadowUrl: '/map/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    const positions: Array<[number, number]> = [];
    for (const order of orders) {
      if (order.address.latitude == null || order.address.longitude == null) continue;
      const point: [number, number] = [order.address.latitude, order.address.longitude];
      positions.push(point);
      const popup = document.createElement('div');
      popup.dir = 'rtl';
      for (const text of [
        `سفارش ${formatNumber(order.number)}`,
        customerName(order.user),
        formatPrice(order.total),
        amountToPersianWords(order.total * 10, 'ریال'),
        orderStatusLabels[order.status],
        [order.address.province, order.address.city, order.address.postalAddress]
          .filter(Boolean)
          .join('، '),
      ]) {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        popup.append(paragraph);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'جزئیات سفارش';
      button.className = 'min-h-11 rounded-lg border border-slate-300 px-3 font-bold';
      button.addEventListener('click', () => onOpen(order.id));
      popup.append(button);
      L.marker(point, { icon, title: `سفارش ${formatNumber(order.number)}`, keyboard: true })
        .addTo(map)
        .bindPopup(popup);
    }
    if (positions.length)
      map.fitBounds(L.latLngBounds(positions), { padding: [35, 35], maxZoom: 14, animate: false });
    return { destroy: () => map.remove() };
  },
};
