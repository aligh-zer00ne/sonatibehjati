declare module '@neshan-maps-platform/leaflet' {
  import type * as Leaflet from 'leaflet';
  const sdk: Omit<typeof Leaflet, 'map'> & {
    map(
      container: HTMLElement,
      options: Leaflet.MapOptions & {
        key: string;
        maptype: string;
        poi: boolean;
        traffic: boolean;
      },
    ): Leaflet.Map;
  };
  export default sdk;
}
