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
import PageHeading from '../components/PageHeading';
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const { message, modal } = App.useApp();
  const rows = (query.data?.adminPriceList ?? []).map((row) => saved[row.id] ?? row);
  const changes = Object.values(drafts);
  const valid = adminPriceChangesSchema.safeParse(changes);
  const visible = rows.filter(
    (row) =>
      (!onlyChanged || !!drafts[row.id]) &&
      `${row.title} ${row.weight} ${row.categoryTitle}`.includes(search.trim()),
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
    <section data-price-announcement className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading
          icon="discount"
          description="قیمت پایهٔ همهٔ کالاها را یکجا ویرایش کنید؛ همهٔ مبلغ‌ها ریال هستند."
        >
          اعلامیه قیمت
        </PageHeading>
        <Button icon={<AdminIcon name="refresh" />} disabled={pending} onClick={refresh}>
          دریافت آخرین قیمت‌ها
        </Button>
      </div>
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e6dbc9] bg-white p-3 sm:p-4">
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
          {error && (
            <Alert
              role="alert"
              type="error"
              showIcon
              title={error}
              description="تغییرهای شما حفظ شده‌اند. برای خطای ارتباط دوباره ذخیره را بزنید؛ در صورت تغییر هم‌زمان کالا، آخرین قیمت‌ها را دریافت و دوباره بررسی کنید."
            />
          )}
          <div className="overflow-hidden rounded-[24px] border border-[#e6dbc9] bg-white shadow-sm">
            <div className="hidden grid-cols-[minmax(0,1fr)_minmax(140px,.5fr)_minmax(190px,.6fr)_90px] items-center gap-4 border-b border-[#e6dbc9] bg-[#f7f1e7] px-5 py-3 text-xs font-bold text-[#796653] md:grid">
              <span>کالا</span>
              <span>قیمت فعلی (ریال)</span>
              <span>قیمت جدید (ریال)</span>
              <span>تغییر</span>
            </div>
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
                  className={`grid grid-cols-2 items-center gap-x-4 gap-y-3 border-b border-[#eee6d9] p-4 last:border-0 md:grid-cols-[minmax(0,1fr)_minmax(140px,.5fr)_minmax(190px,.6fr)_90px] md:px-5 ${draft ? 'bg-[#fff9ec]' : 'bg-white'}`}
                >
                  <div className="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1">
                    <span className="size-11 shrink-0 overflow-hidden rounded-xl bg-[#f7f1e7]">
                      <DashboardProductImage src={row.imageUrl} title={row.title} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm leading-6 font-bold">{row.title}</h2>
                      <p className="mt-1 text-[13px] text-[#857467]">
                        {row.weight} · {row.categoryTitle} {!row.isActive && <Tag>غیرفعال</Tag>}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-semibold tabular-nums">
                    <span className="mb-1 block text-[13px] font-normal text-[#857467] md:hidden">
                      قیمت فعلی
                    </span>
                    {formatAdminPrice(row.price)}
                  </div>
                  <div>
                    <label
                      htmlFor={`price-${row.id}`}
                      className="mb-1 block text-[13px] text-[#857467] md:sr-only"
                    >
                      قیمت جدید {row.title} (ریال)
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
                  <div className="col-span-2 flex items-center justify-between gap-2 text-[13px] md:col-span-1 md:flex-col md:items-start">
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
                        className="grid size-8 cursor-pointer place-items-center rounded-lg text-[#796653] hover:bg-[#f1e6d4]"
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
            <div>
              <b className="text-sm text-[#4e141c]">
                {formatNumber(changes.length)} تغییر آمادهٔ ذخیره
              </b>
              <p className="mt-1 text-[13px] text-[#857467]">
                ذخیره شامل تغییرهای پنهان‌شده با جستجو هم می‌شود. تخفیف‌ها و فاکتورهای قبلی حفظ
                می‌شوند.
              </p>
              {changes.length > 0 && !valid.success && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  قیمت‌های خالی یا نامعتبر را اصلاح کنید؛ قیمت باید مضرب ۱۰ ریال باشد. حداکثر ۵۰۰
                  تغییر در هر ثبت.
                </p>
              )}
            </div>
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
        </>
      )}
    </section>
  );
}
