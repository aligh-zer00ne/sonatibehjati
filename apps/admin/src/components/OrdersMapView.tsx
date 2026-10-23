import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Spin } from 'antd';
import { createOrderMap, type OrderMapData } from '../lib/order-map';
export default function OrdersMapView({
  data,
  onProvince,
  onOrder,
}: {
  data: OrderMapData;
  onProvince: (code: string) => void;
  onOrder: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [attempt, setAttempt] = useState(0);
  const instance = useRef<Awaited<ReturnType<typeof createOrderMap>> | null>(null);
  const latest = useRef({ data, onProvince, onOrder });
  latest.current = { data, onProvince, onOrder };
  const key = String(import.meta.env.VITE_NESHAN_MAP_KEY ?? '').trim();
  useEffect(() => {
    if (!key || !container.current) return;
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError('');
    void createOrderMap(
      container.current,
      key,
      controller.signal,
      (code) => latest.current.onProvince(code),
      (id) => latest.current.onOrder(id),
      () => {
        if (active) {
          setLoading(false);
          setError('دریافت نقشهٔ نشان با مشکل روبه‌رو شد. اتصال و فعال‌بودن سرویس را بررسی کنید.');
        }
      },
      () => {
        if (active) setLoading(false);
      },
    )
      .then((map) => {
        if (!active) return map.destroy();
        instance.current = map;
        map.update(latest.current.data);
      })
      .catch(() => {
        if (active) {
          instance.current?.destroy();
          instance.current = null;
          setLoading(false);
          setError(
            'نقشهٔ نشان در این مرورگر بارگذاری نشد. نمای استان‌ها و فهرست سفارش‌ها در دسترس‌اند.',
          );
        }
      });
    return () => {
      active = false;
      controller.abort();
      instance.current?.destroy();
      instance.current = null;
    };
  }, [key, attempt]);
  useEffect(() => {
    instance.current?.update(data);
  }, [data]);
  if (!key)
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[20px] border border-dashed border-[#dbc390] bg-[#fcf8ef] p-6 text-center">
        <div>
          <p className="font-bold text-[#701e2a]">نقشهٔ نشان هنوز فعال نشده است.</p>
          <p className="mt-3 text-sm leading-8 text-[#857467]">
            نمای استان‌ها و آمار سفارش‌ها آمادهٔ استفاده است. برای نمایش نقشهٔ نشان، کلید نقشهٔ وب
            باید در تنظیمات سرور قرار بگیرد.
          </p>
        </div>
      </div>
    );
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#e8ded1] bg-[#f5f0e6]">
      <div
        ref={container}
        data-map-provider="neshan"
        role="region"
        aria-label="نقشه نشان؛ مقصد سفارش‌ها"
        className="relative z-0 h-[360px] w-full font-sans sm:h-[520px] [&_.leaflet-popup-content]:!font-sans"
      />
      {loading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/60">
          <Spin />
        </div>
      )}
      <Button className="!absolute !top-3 !right-3" onClick={() => instance.current?.reset()}>
        نمای ایران
      </Button>
      {error && (
        <Alert
          role="alert"
          type="warning"
          title={error}
          className="!rounded-none"
          action={<Button onClick={() => setAttempt((value) => value + 1)}>تلاش دوباره</Button>}
        />
      )}
    </div>
  );
}
