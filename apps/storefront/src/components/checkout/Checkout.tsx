'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Plus, Pencil, Trash2, ShoppingBag, RefreshCw } from 'lucide-react';
import { formatPrice, formatNumber, createOrderInputSchema } from '@behjati/shared';
import { shippingMethods, shippingMethodLabels, type ShippingMethod } from '@behjati/shared/sales';
import {
  MyAddressesDocument,
  DeleteCheckoutAddressDocument,
  CheckoutQuoteDocument,
  CreateCheckoutOrderDocument,
  RecoverCheckoutOrderDocument,
  type CheckoutAddressFragment,
  type CheckoutQuoteQuery,
} from '@/generated/graphql';
import { authRequest, AuthRequestError } from '@/lib/auth/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCart } from '@/stores/cart';
import { useCartHydrated } from '@/hooks/use-cart-hydrated';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import AddressForm from './AddressForm';
type Quote = CheckoutQuoteQuery['checkoutQuote'];
function removeOrderedItems(items: { productId: string; quantity: number }[]) {
  const purchased = Object.fromEntries(items.map((item) => [item.productId, item.quantity]));
  useCart.setState((state) => ({
    items: Object.fromEntries(
      Object.entries(state.items)
        .map(([id, quantity]) => [id, Math.max(0, quantity - (purchased[id] ?? 0))])
        .filter(([, quantity]) => Number(quantity) > 0),
    ),
  }));
}
export default function Checkout() {
  const { user, loading, error: authError, refresh } = useAuth();
  const router = useRouter();
  const hydrated = useCartHydrated();
  const cart = useCart((state) => state.items);
  const itemsKey = JSON.stringify(
    Object.entries(cart)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([productId, quantity]) => ({ productId, quantity })),
  );
  const [addresses, setAddresses] = useState<CheckoutAddressFragment[]>([]);
  const [addressId, setAddressId] = useState('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('POST');
  const [editing, setEditing] = useState<CheckoutAddressFragment | null | undefined>(undefined);
  const [addressLoading, setAddressLoading] = useState(true);
  const [error, setError] = useState('');
  const [discount, setDiscount] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteKey, setQuoteKey] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [retry, setRetry] = useState(0);
  const [pending, setPending] = useState(false);
  const inputKey = JSON.stringify({
    shippingMethod,
    addressId,
    items: JSON.parse(itemsKey),
    discountCode: appliedDiscount,
  });
  const currentQuote = quoteKey === inputKey ? quote : null;
  useEffect(() => {
    if (!loading && !authError && !user) router.replace('/login?next=%2Fcheckout');
  }, [user, loading, authError, router]);
  const load = useCallback(async () => {
    setAddressLoading(true);
    setError('');
    try {
      const stored = sessionStorage.getItem('behjati-checkout-request');
      if (stored && user) {
        let previous;
        try {
          previous = JSON.parse(stored);
        } catch {
          sessionStorage.removeItem('behjati-checkout-request');
        }
        if (previous?.fingerprint && previous?.requestId) {
          let fingerprint;
          try {
            fingerprint = JSON.parse(previous.fingerprint);
          } catch {
            sessionStorage.removeItem('behjati-checkout-request');
          }
          if (fingerprint?.userId === user.id) {
            const input = Object.fromEntries(
              Object.entries(fingerprint).filter(([key]) => key !== 'userId'),
            );
            const parsed = createOrderInputSchema.safeParse({
              ...input,
              requestId: previous.requestId,
            });
            if (parsed.success) {
              const result = await authRequest(RecoverCheckoutOrderDocument, {
                requestId: parsed.data.requestId,
              });
              if (result.orderByRequestId) {
                removeOrderedItems(parsed.data.items);
                sessionStorage.removeItem('behjati-checkout-request');
                router.replace(`/checkout/order/${result.orderByRequestId.id}`);
                return;
              }
            }
          }
        }
      }
      const result = await authRequest(MyAddressesDocument, {});
      setAddresses(result.myAddresses);
      setAddressId((id) =>
        result.myAddresses.some((address) => address.id === id)
          ? id
          : (result.myAddresses[0]?.id ?? ''),
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'نشانی‌ها دریافت نشدند.');
    } finally {
      setAddressLoading(false);
    }
  }, [user, router]);
  useEffect(() => {
    if (user) void load();
  }, [user, load]);
  useEffect(() => {
    let active = true;
    if (!user || !addressId || !Object.keys(cart).length || !hydrated || editing !== undefined) {
      setQuote(null);
      return;
    }
    setQuoting(true);
    setError('');
    void authRequest(CheckoutQuoteDocument, { input: JSON.parse(inputKey) })
      .then((result) => {
        if (active) {
          setQuote(result.checkoutQuote);
          setQuoteKey(inputKey);
        }
      })
      .catch((error) => {
        if (active) {
          setQuote(null);
          setError(error instanceof Error ? error.message : 'خلاصه دریافت نشد.');
        }
      })
      .finally(() => {
        if (active) setQuoting(false);
      });
    return () => {
      active = false;
    };
  }, [user, addressId, cart, hydrated, editing, inputKey, retry]);
  async function submit() {
    if (!currentQuote || pending || quoting) return;
    setPending(true);
    setError('');
    const input = { ...JSON.parse(inputKey), expectedTotal: currentQuote.total };
    const fingerprint = JSON.stringify({ userId: user?.id, ...input });
    let requestId = crypto.randomUUID();
    try {
      const previous = JSON.parse(sessionStorage.getItem('behjati-checkout-request') ?? 'null');
      if (previous?.fingerprint === fingerprint && typeof previous.requestId === 'string')
        requestId = previous.requestId;
      sessionStorage.setItem(
        'behjati-checkout-request',
        JSON.stringify({ fingerprint, requestId }),
      );
      const result = await authRequest(CreateCheckoutOrderDocument, {
        input: { ...input, requestId },
      });
      sessionStorage.removeItem('behjati-checkout-request');
      removeOrderedItems(input.items);
      router.replace(`/checkout/order/${result.createOrder.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'سفارش ثبت نشد.');
      if (
        error instanceof AuthRequestError &&
        ['PRICE_CHANGED', 'INVALID_DISCOUNT', 'PRODUCT_UNAVAILABLE', 'REQUEST_CONFLICT'].includes(
          error.code,
        )
      ) {
        setQuote(null);
        setRetry((value) => value + 1);
      }
    } finally {
      setPending(false);
    }
  }
  if (loading || !hydrated)
    return <Skeleton className="h-80 rounded-3xl" aria-label="در حال آماده‌سازی سفارش" />;
  if (authError)
    return (
      <EmptyState title="نشست دریافت نشد" description={authError}>
        <Button onClick={() => void refresh()}>تلاش دوباره</Button>
      </EmptyState>
    );
  if (!user) return <p role="status">در حال رفتن به صفحهٔ ورود...</p>;
  if (!Object.keys(cart).length)
    return (
      <EmptyState
        title="سبد خرید شما خالی است"
        description="برای ثبت سفارش، ابتدا محصولی به سبد اضافه کنید."
        icon={<ShoppingBag />}
      >
        <Button asChild className="mt-4">
          <Link href="/shop">مشاهده محصولات</Link>
        </Button>
      </EmptyState>
    );
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Card className="space-y-5 rounded-3xl bg-card/90 p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">
          <MapPin className="text-primary" size={22} />
          ۱. نشانی تحویل
        </h2>
        {addressLoading ? (
          <Skeleton className="h-28 rounded-2xl" />
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`rounded-2xl border p-4 transition-colors ${address.id === addressId ? 'border-primary bg-primary/5' : 'border-border bg-surface/40'}`}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="delivery-address"
                    value={address.id}
                    checked={addressId === address.id}
                    disabled={pending}
                    onChange={() => setAddressId(address.id)}
                    className="mt-1 size-5 shrink-0 accent-primary"
                  />
                  <span className="min-w-0">
                    <b>
                      {address.title}
                      {address.isDefault ? ' · پیش‌فرض' : ''}
                    </b>
                    <span className="mt-1 block break-words text-sm text-earth">
                      {address.province}، {address.city}، {address.postalAddress}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {address.recipientName} · <bdi dir="ltr">{address.recipientPhone}</bdi>
                    </span>
                  </span>
                </label>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => setEditing(address)}
                    aria-label={`ویرایش ${address.title}`}
                  >
                    <Pencil size={15} />
                    ویرایش
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    aria-label={`حذف ${address.title}`}
                    onClick={async () => {
                      setPending(true);
                      setError('');
                      try {
                        await authRequest(DeleteCheckoutAddressDocument, { id: address.id });
                        await load();
                      } catch (error) {
                        setError(error instanceof Error ? error.message : 'نشانی حذف نشد.');
                      } finally {
                        setPending(false);
                      }
                    }}
                  >
                    <Trash2 size={15} />
                    حذف
                  </Button>
                </div>
              </div>
            ))}
            {!addresses.length && (
              <p className="text-sm text-muted-foreground">
                برای دریافت سفارش، نشانی خود را اضافه کنید.
              </p>
            )}
            {editing === undefined && (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setEditing(null)}
              >
                <Plus size={18} />
                افزودن نشانی
              </Button>
            )}
          </div>
        )}
        {editing !== undefined && (
          <AddressForm
            key={editing?.id ?? 'new'}
            address={editing ?? undefined}
            phone={user.phone}
            onCancel={() => setEditing(undefined)}
            onSaved={(address) => {
              setEditing(undefined);
              setAddressId(address.id);
              void load();
            }}
          />
        )}
        <fieldset className="space-y-3 border-t border-border pt-5" disabled={pending}>
          <legend className="px-1 text-base font-bold">روش ارسال سفارش</legend>
          <div className="grid grid-cols-3 gap-2">
            {shippingMethods.map((method) => (
              <label
                key={method}
                className={`flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border px-2 py-3 text-sm font-semibold ${shippingMethod === method ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface/30'}`}
              >
                <input
                  type="radio"
                  name="shipping-method"
                  value={method}
                  checked={shippingMethod === method}
                  onChange={() => setShippingMethod(method)}
                  className="size-4 shrink-0 accent-primary"
                />
                {shippingMethodLabels[method]}
              </label>
            ))}
          </div>
          <p className="text-xs leading-6 text-muted-foreground">
            هزینهٔ ارسال بر اساس وزن کل بسته و تعرفهٔ محصولات، در خلاصهٔ سفارش محاسبه می‌شود.
          </p>
        </fieldset>
      </Card>
      <Card className="space-y-5 rounded-3xl bg-card/90 p-5 sm:p-7 lg:sticky lg:top-6">
        <h2 className="text-xl font-extrabold">۲. خلاصهٔ سفارش</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedDiscount(discount.trim().toUpperCase());
            setRetry((value) => value + 1);
          }}
        >
          <label htmlFor="checkout-discount" className="mb-2 block text-sm font-bold">
            کد تخفیف
          </label>
          <div className="flex gap-2">
            <Input
              id="checkout-discount"
              dir="ltr"
              maxLength={50}
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              placeholder="کد تخفیف"
              disabled={pending}
            />
            <Button type="submit" variant="outline" disabled={pending || !addressId}>
              اعمال
            </Button>
          </div>
          {appliedDiscount && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={pending}
              onClick={() => {
                setDiscount('');
                setAppliedDiscount('');
              }}
            >
              حذف کد تخفیف
            </Button>
          )}
        </form>
        {quoting && (
          <p role="status" className="text-sm text-earth">
            در حال محاسبهٔ مبلغ سفارش...
          </p>
        )}
        {currentQuote && !quoting && (
          <>
            <ul className="divide-y divide-border">
              {currentQuote.items.map((line) => (
                <li key={line.productId} className="flex justify-between gap-3 py-3 text-sm">
                  <span>
                    {line.title}
                    <small className="mt-1 block text-muted-foreground">
                      {line.weight} · {formatNumber(line.quantity)} عدد
                    </small>
                  </span>
                  <b className="shrink-0">{formatPrice(line.lineTotal)}</b>
                </li>
              ))}
            </ul>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt>روش ارسال</dt>
                <dd>{shippingMethodLabels[shippingMethod]}</dd>
              </div>
              {[
                ['جمع محصولات', currentQuote.subtotal],
                ['تخفیف', currentQuote.discount],
                ['هزینهٔ ارسال', currentQuote.shipping],
                ['مبلغ نهایی', currentQuote.total],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={`flex justify-between gap-3 ${label === 'مبلغ نهایی' ? 'border-t border-border pt-4 font-extrabold text-primary' : ''}`}
                >
                  <dt>{label}</dt>
                  <dd>{formatPrice(Number(value))}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {!addressId && (
          <p className="text-sm text-muted-foreground">
            پس از انتخاب نشانی، مبلغ ارسال و سفارش نمایش داده می‌شود.
          </p>
        )}
        {error && (
          <div role="alert" className="rounded-xl bg-primary/5 p-3 text-sm text-primary">
            <p>{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                void load();
                setRetry((value) => value + 1);
              }}
            >
              <RefreshCw size={15} />
              دریافت دوباره
            </Button>
          </div>
        )}
        <Button
          className="w-full"
          disabled={!currentQuote || pending || quoting || editing !== undefined}
          onClick={() => void submit()}
        >
          {pending ? 'در حال ثبت سفارش...' : 'ثبت سفارش'}
        </Button>
        <p className="text-xs leading-7 text-muted-foreground">
          پس از ثبت سفارش می‌توانید پرداخت را از درگاه سامان انجام دهید. سفارش فقط پس از تأیید
          پرداخت توسط بانک، پرداخت‌شده محسوب می‌شود.
        </p>
        <Link href="/cart" className="block min-h-11 text-center text-sm text-earth">
          بازگشت به سبد خرید
        </Link>
      </Card>
    </div>
  );
}
