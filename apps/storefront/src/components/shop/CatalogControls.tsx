'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { catalogURL, param, type CatalogParams } from '@/lib/catalog/params';
import { useCommerceNavigation } from './CommerceNavigation';
const sorts = [
  ['FEATURED', 'پیشنهادی'],
  ['NEWEST', 'جدیدترین'],
  ['PRICE_ASC', 'ارزان‌ترین'],
  ['PRICE_DESC', 'گران‌ترین'],
  ['NAME_ASC', 'نام محصول'],
];
export default function CatalogControls({ path, params }: { path: string; params: CatalogParams }) {
  const [open, setOpen] = useState(false);
  const { navigate, pending } = useCommerceNavigation();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const changes = Object.fromEntries([...data].map(([key, value]) => [key, String(value)]));
    navigate(catalogURL(path, params, { ...changes, page: undefined }));
    setOpen(false);
  }
  const active = Boolean(param(params.min) || param(params.max));
  return (
    <>
      <form action={path} onSubmit={submit} className="relative mb-5 flex gap-2">
        {['sort', 'min', 'max', 'category'].map(
          (key) =>
            param(params[key]) && (
              <input key={key} type="hidden" name={key} value={param(params[key])} />
            ),
        )}
        <label className="sr-only" htmlFor="catalog-search">
          جستجوی محصولات
        </label>
        <Search
          className="pointer-events-none absolute top-3.5 right-4 text-muted-foreground"
          size={20}
        />
        <Input
          key={param(params.q)}
          id="catalog-search"
          name="q"
          defaultValue={param(params.q)}
          placeholder="جستجو در محصولات..."
          maxLength={100}
          className="rounded-3xl bg-card/80 pr-11"
        />
        <Button type="submit" disabled={pending} className="px-4">
          جستجو
        </Button>
      </form>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 px-2 font-normal text-earth"
          onClick={() => setOpen(true)}
          aria-label="فیلتر محصولات"
        >
          <SlidersHorizontal size={17} />
          فیلتر{active && <span className="size-1.5 rounded-full bg-primary" />}
        </Button>
        <form action={path} onSubmit={submit} className="flex items-center gap-2">
          {['q', 'min', 'max', 'category'].map(
            (key) =>
              param(params[key]) && (
                <input key={key} type="hidden" name={key} value={param(params[key])} />
              ),
          )}
          <label htmlFor="catalog-sort">مرتب‌سازی</label>
          <select
            id="catalog-sort"
            name="sort"
            value={param(params.sort) || 'FEATURED'}
            disabled={pending}
            onChange={(event) =>
              navigate(catalogURL(path, params, { sort: event.target.value, page: undefined }))
            }
            className="min-h-11 max-w-[130px] rounded-xl border border-border bg-card px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {sorts.map(([value, title]) => (
              <option key={value} value={value}>
                {title}
              </option>
            ))}
          </select>
          <noscript>
            <Button size="sm" type="submit">
              اعمال
            </Button>
          </noscript>
        </form>
        <Button variant="ghost" size="icon" asChild className="text-earth">
          <Link href="/favorites" aria-label="علاقه‌مندی‌ها">
            <Heart size={19} />
          </Link>
        </Button>
      </div>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="فیلتر محصولات"
        description="بازهٔ قیمت محصولات را انتخاب کنید."
      >
        <form
          key={`${param(params.min)}-${param(params.max)}`}
          action={path}
          onSubmit={submit}
          className="space-y-5"
        >
          {['q', 'sort', 'category'].map(
            (key) =>
              param(params[key]) && (
                <input key={key} type="hidden" name={key} value={param(params[key])} />
              ),
          )}
          <div>
            <label className="mb-2 block text-sm" htmlFor="min-price">
              حداقل قیمت (تومان)
            </label>
            <Input
              id="min-price"
              name="min"
              inputMode="numeric"
              defaultValue={param(params.min)}
              placeholder="مثلاً ۱۵۰۰۰۰"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm" htmlFor="max-price">
              حداکثر قیمت (تومان)
            </label>
            <Input
              id="max-price"
              name="max"
              inputMode="numeric"
              defaultValue={param(params.max)}
              placeholder="مثلاً ۳۰۰۰۰۰"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              اعمال فیلتر
            </Button>
            <Button variant="outline" asChild>
              <Link
                href={catalogURL(path, params, { min: undefined, max: undefined, page: undefined })}
                onClick={() => setOpen(false)}
              >
                پاک کردن فیلتر
              </Link>
            </Button>
          </div>
        </form>
      </Dialog>
      {pending && (
        <p role="status" className="mb-3 text-xs text-muted-foreground">
          در حال دریافت محصولات...
        </p>
      )}
    </>
  );
}
