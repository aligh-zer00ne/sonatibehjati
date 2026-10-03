'use client';
import { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mapService, type AddressMap as MapHandle } from '@/lib/maps/adapter';
import type { Coordinates } from '@behjati/shared';
export default function AddressMap({
  value,
  onChange,
}: {
  value: Coordinates | null;
  onChange: (value: Coordinates) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapHandle | null>(null);
  const change = useRef(onChange);
  const coordinates = useRef(value);
  coordinates.current = value;
  change.current = onChange;
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const abort = new AbortController();
    if (container.current)
      void mapService
        .create(
          container.current,
          coordinates.current ?? { latitude: 32.31, longitude: 54.01 },
          (point) => change.current(point),
          abort.signal,
        )
        .then((handle) => {
          if (cancelled) handle.destroy();
          else {
            map.current = handle;
            if (coordinates.current) handle.move(coordinates.current);
          }
        })
        .catch(() => {
          if (!cancelled) setError('نقشه دریافت نشد؛ نشانی را دستی وارد کنید.');
        });
    return () => {
      cancelled = true;
      abort.abort();
      map.current?.destroy();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    if (value) map.current?.move(value);
  }, [value]);
  return (
    <div className="space-y-3">
      <p className="text-xs leading-7 text-muted-foreground">
        موقعیت را روی نقشه انتخاب کنید یا نشانگر را جابه‌جا کنید. انتخاب موقعیت اختیاری است.
      </p>
      <div
        ref={container}
        role="region"
        aria-label="نقشه انتخاب موقعیت نشانی"
        dir="ltr"
        className="relative z-0 h-64 w-full overflow-hidden rounded-2xl border border-border bg-surface"
      />
      <Button
        type="button"
        variant="outline"
        disabled={locating}
        onClick={async () => {
          setLocating(true);
          setError('');
          try {
            onChange(await mapService.locate());
          } catch (error) {
            setError(error instanceof Error ? error.message : 'موقعیت دریافت نشد.');
          } finally {
            setLocating(false);
          }
        }}
      >
        <LocateFixed size={18} />
        {locating ? 'در حال دریافت موقعیت...' : 'موقعیت فعلی من'}
      </Button>
      {value && (
        <p className="flex items-center gap-2 text-xs text-earth">
          <MapPin size={16} />
          موقعیت انتخاب شد
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
