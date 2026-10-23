import { useRef, useState } from 'react';
import { useBeforeUnload } from 'react-router-dom';
import { Alert, App, Button, Input, Tag } from 'antd';
import { formatNumber } from '@behjati/shared';
import { adminPriceChangesSchema } from '@behjati/shared/admin';
import {
  AdminPriceListDocument,
  SetAdminPricesDocument,
  type AdminPriceItemFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import { formatAdminPrice } from '../lib/money';
import { MoneyInput } from '../components/Money';
import AmbientBackdrop from '../components/AmbientBackdrop';
import AdminIcon from '../components/AdminIcon';
import DashboardProductImage from '../components/DashboardProductImage';
import DataState from '../components/DataState';

type Draft = { id: string; price: number | null; expectedUpdatedAt: string };
export default function PriceAnnouncement() {
  const query = useAdminQuery(AdminPriceListDocument, {});
  const [saved, setSaved] = useState<Record<string, AdminPriceItemFieldsFragment>>({});
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [search, setSearch] = useState('');
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [category, setCategory] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const { message, modal } = App.useApp();
  const rows = (query.data?.adminPriceList ?? []).map((row) => saved[row.id] ?? row);
  const changes = Object.values(drafts);
  const valid = adminPriceChangesSchema.safeParse(changes);
  const categories = [...new Set(rows.map((row) => row.categoryTitle))];
  const prices = new Map(rows.map((row) => [row.id, row.price]));
  const increases = changes.filter(
    (draft) => draft.price != null && draft.price > (prices.get(draft.id) ?? 0),
  ).length;
  const decreases = changes.filter(
    (draft) => draft.price != null && draft.price < (prices.get(draft.id) ?? 0),
  ).length;
  const fold = (value: string) =>
    value
      .normalize('NFKC')
      .replace(/[يى]/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/‌/g, ' ')
      .toLocaleLowerCase('fa-IR');
  const visible = rows.filter(
    (row) =>
      (!onlyChanged || !!drafts[row.id]) &&
      (!category || row.categoryTitle === category) &&
      fold(`${row.title} ${row.weight} ${row.categoryTitle}`).includes(fold(search.trim())),
  );
  useBeforeUnload((event) => {
    if (changes.length) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  const reset = () => {
    setDrafts({});
    setSaved({});
    setError('');
    query.refresh();
  };
  const refresh = () => {
    if (!changes.length) return reset();
    modal.confirm({
      title: 'تغییرهای ذخیره‌نشده کنار گذاشته شوند؟',
      content: 'قیمت‌های فعلی دوباره از فروشگاه دریافت می‌شوند.',
      okText: 'دریافت قیمت‌ها',
      cancelText: 'ادامهٔ ویرایش',
      onOk: reset,
    });
  };
  const save = async () => {
    if (lock.current || !valid.success) return;
    lock.current = true;
    setPending(true);
    setError('');
    try {
      const result = await adminRequest(SetAdminPricesDocument, { items: valid.data });
      setSaved((previous) => ({
        ...previous,
        ...Object.fromEntries(result.setAdminPrices.map((row) => [row.id, row])),
      }));
      setDrafts({});
      void message.success(`قیمت ${formatNumber(result.setAdminPrices.length)} محصول ذخیره شد.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ذخیره انجام نشد.');
    } finally {
      lock.current = false;
      setPending(false);
    }
  };
  return (
    <section data-price-announcement className="space-y-3">
      <header className="relative isolate overflow-hidden rounded-[26px] border border-[#a45d61]/40 bg-[linear-gradient(125deg,#701e2a,#300c14)] p-4 text-[#fff5e1] sm:p-4">
        <AmbientBackdrop />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-13 shrink-0 place-items-center rounded-2xl border border-[#f5d88f]/40 bg-[#f5d88f]/15 text-[#f5d88f]">
              <AdminIcon name="discount" width={28} />
            </span>
            <div>
              <p className="mb-1 text-[13px] font-semibold text-[#f2d6a2]">
                قیمت‌گذاری سریع فروشگاه
              </p>
              <h1 className="text-2xl font-extrabold">اعلامیه قیمت</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
            <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
              <b className="text-lg text-[#f5d88f]">{formatNumber(rows.length)}</b> کالا
            </span>
            <span className="rounded-xl border border-[#f5d88f]/40 bg-[#f5d88f]/15 px-3 py-2">
              <b className="text-lg text-[#f5d88f]">{formatNumber(changes.length)}</b> تغییر
            </span>
            <span className="rounded-xl border border-white/15 px-3 py-2">مبالغ به ریال</span>
          </div>
          <Button
            icon={<AdminIcon name="refresh" />}
            disabled={pending}
            onClick={refresh}
            aria-label="دریافت آخرین قیمت‌ها"
            className="!border-white/25 !bg-white/10 !text-[#fff5e1]"
          >
            <span className="hidden sm:inline">دریافت آخرین قیمت‌ها</span>
          </Button>
        </div>
      </header>
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e6dbc9] bg-white p-3 shadow-[0_5px_18px_#62452f08] sm:p-4">
            <Input
              aria-label="جستجوی اعلامیه قیمت"
              prefix={<AdminIcon name="search" width={19} />}
              placeholder="جستجوی نام کالا، وزن یا دسته…"
              maxLength={100}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="!w-full sm:!w-80"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#796653]">
              <span>
                {formatNumber(visible.length)} از {formatNumber(rows.length)} محصول
              </span>
              <button
                type="button"
                aria-pressed={onlyChanged}
                onClick={() => setOnlyChanged((v) => !v)}
                className="min-h-10 cursor-pointer rounded-xl border border-[#e6dbc9] px-3 font-semibold aria-pressed:border-[#b78343] aria-pressed:bg-[#f8efd9] aria-pressed:text-[#4e141c]"
              >
                فقط تغییرکرده‌ها ({formatNumber(changes.length)})
              </button>
            </div>
          </div>
          <nav
            aria-label="دسته‌های اعلامیه قیمت"
            className="flex max-w-full gap-2 overflow-x-auto pb-1"
          >
            {['', ...categories].map((name) => (
              <button
                type="button"
                key={name}
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#e6dbc9] bg-white px-4 text-sm font-semibold text-[#796653] transition-colors hover:border-[#b78343] aria-pressed:border-[#701e2a] aria-pressed:bg-[#701e2a] aria-pressed:text-[#fff5e1]"
              >
                {name || 'همهٔ دسته‌ها'}
                <span className="rounded-full bg-current/10 px-1.5 text-[13px]">
                  {formatNumber(
                    name ? rows.filter((row) => row.categoryTitle === name).length : rows.length,
                  )}
                </span>
              </button>
            ))}
          </nav>
          {error && (
            <Alert
              role="alert"
              type="error"
              showIcon
              title={error}
              description="تغییرهای شما حفظ شده‌اند. برای خطای ارتباط دوباره ذخیره را بزنید؛ در صورت تغییر هم‌زمان کالا، آخرین قیمت‌ها را دریافت و دوباره بررسی کنید."
            />
          )}
          <div data-price-grid className="grid items-start gap-2.5 xl:grid-cols-2 2xl:grid-cols-3">
            {!visible.length && (
              <p className="p-8 text-center text-sm text-[#857467]">
                محصولی با این شرایط پیدا نشد.
              </p>
            )}
            {visible.map((row) => {
              const draft = drafts[row.id];
              const value = draft ? draft.price : row.price;
              const diff = value == null ? null : value - row.price;
              return (
                <div
                  key={row.id}
                  data-price-row={row.id}
                  role="group"
                  aria-label={row.title}
                  className={`grid grid-cols-[minmax(0,1fr)_minmax(130px,1fr)] items-center gap-x-3 gap-y-2 rounded-2xl border border-[#e6dbc9] p-3 shadow-sm ${draft ? 'border-s-[3px] border-s-[#c69b48] bg-[#fff9ec]' : 'border-s-[3px] border-s-transparent bg-white'}`}
                >
                  <div className="col-span-2 flex min-w-0 items-center gap-3">
                    <DashboardProductImage src={row.imageUrl} title={row.title} />
                    <div className="min-w-0">
                      <h2 className="text-base leading-7 font-extrabold text-[#4e141c]">
                        {row.title}
                      </h2>
                      <p className="text-[13px] text-[#857467]">
                        {row.weight} · {row.categoryTitle} {!row.isActive && <Tag>غیرفعال</Tag>}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums text-[#796653]">
                    <span className="mb-1 block text-[13px] font-normal text-[#857467]">
                      قیمت فعلی
                    </span>
                    {formatAdminPrice(row.price)}
                  </div>
                  <div>
                    <label
                      htmlFor={`price-${row.id}`}
                      className="mb-1 block text-[13px] text-[#857467]"
                    >
                      قیمت جدید (ریال)<span className="sr-only">؛ {row.title}</span>
                    </label>
                    <MoneyInput
                      id={`price-${row.id}`}
                      value={value}
                      disabled={pending}
                      compact
                      onChange={(price) =>
                        setDrafts((previous) => {
                          const next = { ...previous };
                          if (price === row.price) delete next[row.id];
                          else
                            next[row.id] = {
                              id: row.id,
                              price,
                              expectedUpdatedAt: draft?.expectedUpdatedAt ?? row.updatedAt,
                            };
                          return next;
                        })
                      }
                    />
                  </div>
                  <div
                    className={`col-span-2 flex items-center justify-between gap-2 border-t border-dashed border-[#e6dbc9] pt-1 text-[13px] ${draft ? '' : 'hidden'}`}
                  >
                    <span
                      className={
                        diff != null && diff !== 0 ? 'font-bold text-[#701e2a]' : 'text-[#9d8a76]'
                      }
                    >
                      {diff == null
                        ? 'مبلغ را وارد کنید'
                        : diff === 0
                          ? 'بدون تغییر'
                          : `${diff > 0 ? '+' : '−'}${formatAdminPrice(Math.abs(diff))}`}
                    </span>
                    {draft && (
                      <button
                        type="button"
                        aria-label={`برگرداندن قیمت ${row.title}`}
                        disabled={pending}
                        className="grid size-11 cursor-pointer place-items-center rounded-lg text-[#796653] hover:bg-[#f1e6d4]"
                        onClick={() =>
                          setDrafts((previous) => {
                            const next = { ...previous };
                            delete next[row.id];
                            return next;
                          })
                        }
                      >
                        <AdminIcon name="refresh" width={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dcc69f] bg-[#fffdf9]/95 p-4 shadow-[0_6px_30px_#4e141c20] backdrop-blur-sm">
            <div className="min-w-0 flex-1">
              <b className="text-sm text-[#4e141c] sm:text-base">
                {formatNumber(changes.length)} تغییر آمادهٔ ذخیره
              </b>
              <p className="mt-1 hidden text-[13px] text-[#857467] sm:block">
                ذخیره شامل تغییرهای پنهان‌شده با جستجو هم می‌شود. تخفیف‌ها و فاکتورهای قبلی حفظ
                می‌شوند.
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[#857467] sm:hidden">
                همهٔ تغییرها ذخیره می‌شوند.
              </p>
              {changes.length > 0 && !valid.success && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  قیمت‌های خالی یا نامعتبر را اصلاح کنید؛ قیمت باید مضرب ۱۰ ریال باشد. حداکثر ۵۰۰
                  تغییر در هر ثبت.
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {changes.length > 0 && (
                <span className="hidden text-[13px] text-[#796653] sm:inline">
                  {formatNumber(increases)} افزایش · {formatNumber(decreases)} کاهش
                </span>
              )}
              <Button
                type="primary"
                icon={<AdminIcon name="check" />}
                loading={pending}
                disabled={!valid.success}
                onClick={() => void save()}
              >
                ذخیرهٔ {formatNumber(changes.length)} قیمت
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
