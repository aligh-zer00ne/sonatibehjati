import { formatNumber } from '@behjati/shared';
import type { AdminOrdersMapQuery, AdminOrderSummaryFieldsFragment } from '../generated/graphql';
import { customerName } from './format';
import '@neshan-maps-platform/leaflet/dist/leaflet.css';
import type { GridLayer, Marker } from 'leaflet';
type Data = AdminOrdersMapQuery['adminOrdersMap'];
export type OrderMapData = {
  provinces: Data['provinces'];
  orders: Data['items'];
  province: string;
  selectedId?: string;
};
export async function createOrderMap(
  container: HTMLElement,
  key: string,
  signal: AbortSignal,
  onProvince: (code: string) => void,
  onOrder: (id: string) => void,
  onError: () => void,
  onReady: () => void,
) {
  const { default: sdk } = await import('@neshan-maps-platform/leaflet');
  signal.throwIfAborted();
  const map = sdk.map(container, {
    key,
    maptype: 'dreamy',
    poi: false,
    traffic: false,
    center: [32.5, 54],
    zoom: 5,
    minZoom: 4,
    maxZoom: 18,
    scrollWheelZoom: false,
  });
  const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }));
  resize.observe(container);
  let markers: Marker[] = [];
  let changingMarkers = false;
  map.on('layerremove', ({ layer }) => {
    if (!changingMarkers && markers.includes(layer as Marker)) onError();
  });
  const loadTimer = setTimeout(onError, 12000);
  const ready = () => {
    clearTimeout(loadTimer);
    onReady();
  };
  const watchLayer = (layer: GridLayer) => {
    if (typeof layer.getTileSize !== 'function') return;
    layer.on('tileerror', onError);
    layer.on('tileload', ready);
  };
  map.eachLayer((layer) => watchLayer(layer as GridLayer));
  map.on('layeradd', ({ layer }) => watchLayer(layer as GridLayer));
  const reset = () =>
    map.fitBounds(
      [
        [24.5, 44],
        [40, 63.5],
      ],
      { padding: [25, 25], animate: false },
    );
  let lastFocus = '';
  const point = (order: AdminOrderSummaryFieldsFragment) =>
    order.address.latitude != null &&
    order.address.longitude != null &&
    Math.abs(order.address.latitude) <= 85 &&
    Math.abs(order.address.longitude) <= 180
      ? ([order.address.longitude, order.address.latitude] as [number, number])
      : null;
  return {
    update(data: OrderMapData) {
      changingMarkers = true;
      const focused = container.contains(document.activeElement)
        ? (document.activeElement as HTMLElement).dataset.mapItem
        : undefined;
      markers.forEach((marker) => marker.remove());
      markers = [];
      const provinces = data.provinces.filter(
        (p) => p.locatedCount && p.latitude != null && p.longitude != null && p.code !== 'unknown',
      );
      if (!data.selectedId)
        for (const p of provinces) {
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.mapItem = p.code;
          button.dir = 'rtl';
          button.setAttribute('aria-label', `${p.name}: ${formatNumber(p.count)} سفارش`);
          button.className =
            'min-h-11 cursor-pointer rounded-full border-2 border-white bg-[#701e2a] px-3 py-2 font-sans text-sm font-extrabold text-white shadow-lg';
          button.textContent = `${p.name} · ${formatNumber(p.count)}`;
          button.onclick = () => onProvince(p.code);
          markers.push(
            sdk
              .marker([p.latitude!, p.longitude!], {
                icon: sdk.divIcon({
                  html: button,
                  className: '!border-0 !bg-transparent',
                  iconSize: undefined,
                }),
                keyboard: false,
              })
              .addTo(map),
          );
        }
      for (const order of data.orders) {
        const coordinates = point(order);
        if (!coordinates) continue;
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.mapItem = order.id;
        button.dir = 'rtl';
        button.setAttribute('aria-label', `نمایش موقعیت سفارش ${formatNumber(order.number)}`);
        button.className = `grid min-h-10 min-w-10 cursor-pointer place-items-center rounded-full border-2 border-white px-2 font-sans text-xs font-extrabold shadow-lg ${data.selectedId === order.id ? 'bg-[#701e2a] text-white' : 'bg-[#edc16c] text-[#39270c]'}`;
        button.textContent = formatNumber(order.number);
        button.onclick = () => onOrder(order.id);
        const popup = document.createElement('div');
        popup.dir = 'rtl';
        popup.className = 'font-sans text-sm leading-7';
        const title = document.createElement('strong');
        title.textContent = `سفارش ${formatNumber(order.number)}`;
        const name = document.createElement('p');
        name.textContent = customerName(order.user);
        const address = document.createElement('p');
        address.textContent = [
          order.address.province,
          order.address.city,
          order.address.postalAddress,
        ]
          .filter(Boolean)
          .join('، ');
        popup.append(title, name, address);
        markers.push(
          sdk
            .marker([coordinates[1], coordinates[0]], {
              icon: sdk.divIcon({
                html: button,
                className: '!border-0 !bg-transparent',
                iconSize: undefined,
              }),
              keyboard: false,
              zIndexOffset: data.selectedId === order.id ? 1000 : 0,
            })
            .bindPopup(popup)
            .addTo(map),
        );
      }
      if (focused)
        [...container.querySelectorAll<HTMLElement>('[data-map-item]')]
          .find((element) => element.dataset.mapItem === focused)
          ?.focus({ preventScroll: true });
      const selected = data.orders.find((order) => order.id === data.selectedId);
      changingMarkers = false;
      const province = data.provinces.find((p) => p.code === data.province);
      const focus = `${data.province}:${data.selectedId || ''}`;
      if (focus === lastFocus) return;
      lastFocus = focus;
      if (selected && point(selected)) {
        const [lng, lat] = point(selected)!;
        map.setView([lat, lng], 12, { animate: false });
      } else if (province?.locatedCount && province.longitude != null && province.latitude != null)
        map.setView([province.latitude, province.longitude], 7, { animate: false });
      else reset();
    },
    reset,
    destroy() {
      changingMarkers = true;
      clearTimeout(loadTimer);
      resize.disconnect();
      markers.forEach((marker) => marker.remove());
      map.remove();
    },
  };
}
