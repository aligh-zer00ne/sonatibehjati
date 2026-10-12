'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate, formatNumber } from '@behjati/shared';
import { reviewInput } from '@behjati/shared/operations';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  MyProductReviewDocument,
  SubmitProductReviewDocument,
  type PublicProductReviewsQuery,
  type ReviewFieldsFragment,
} from '@/generated/graphql';
import { authRequest } from '@/lib/auth/client';
import { useAccountQuery } from '@/hooks/useAccountQuery';
import { Button } from '@/components/ui/button';
import AccountDataState from '@/components/account/AccountDataState';
function ReviewForm({
  productId,
  review,
  onSaved,
}: {
  productId: string;
  review: ReviewFieldsFragment | null;
  onSaved: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="mt-6 flex flex-col gap-4 border-t border-border pt-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        setError('');
        setSaved(false);
        const data = new FormData(event.currentTarget);
        const parsed = reviewInput.safeParse({
          productId,
          rating: Number(data.get('rating')),
          body: data.get('body'),
        });
        if (!parsed.success) {
          setError('امتیاز و متن نظر را کامل کنید.');
          return;
        }
        setPending(true);
        try {
          await authRequest(SubmitProductReviewDocument, { input: parsed.data });
          setSaved(true);
          onSaved();
        } catch (e) {
          setError(e instanceof Error ? e.message : 'نظر ثبت نشد.');
        } finally {
          setPending(false);
        }
      }}
    >
      <h3 className="font-bold">{review ? 'ویرایش نظر شما' : 'نظر شما'}</h3>
      <p className="text-xs text-muted-foreground">
        نظر پس از تأیید پشتیبانی منتشر می‌شود. ویرایش نظر منتشرشده نیز به تأیید دوباره نیاز دارد.
      </p>
      {review && (
        <p className="text-xs">
          وضعیت نظر شما:{' '}
          {review.status === 'APPROVED'
            ? 'تأییدشده'
            : review.status === 'REJECTED'
              ? 'ردشده؛ می‌توانید اصلاح کنید'
              : 'منتظر تأیید'}
        </p>
      )}
      <label className="flex flex-col gap-2">
        امتیاز
        <select
          name="rating"
          defaultValue={review?.rating ?? 5}
          className="h-11 w-44 rounded-xl border border-input bg-card px-3"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {formatNumber(value)} از ۵
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        متن نظر
        <textarea
          name="body"
          required
          minLength={3}
          maxLength={2000}
          defaultValue={review?.body ?? ''}
          rows={4}
          className="w-full rounded-xl border border-input bg-card p-3 focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      {error && (
        <p role="alert" className="text-primary">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-green-800">
          نظر شما ثبت شد و منتظر تأیید است.
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'در حال ثبت…' : review ? 'ذخیره تغییرات نظر' : 'ثبت نظر'}
      </Button>
    </form>
  );
}
export default function ProductReviews({
  initial,
  productId,
  slug,
}: {
  productId: string;
  slug: string;
  initial: PublicProductReviewsQuery['productReviews'];
}) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; data: PublicProductReviewsQuery } | null>(
    null,
  );
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const key = `${productId}:${page}:${revision}`;
  const own = useAccountQuery(MyProductReviewDocument, { productId });
  useEffect(() => {
    if (page === 1 && revision === 0) return;
    let active = true;
    void fetch(`/api/catalog/reviews?productId=${encodeURIComponent(productId)}&page=${page}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(16000),
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || body.errors || !body.data)
          throw new Error('نظرات دریافت نشد. دوباره تلاش کنید.');
        if (active) setResult({ key, data: body.data });
      })
      .catch(() => {
        if (active) setFailure({ key, message: 'نظرات دریافت نشد. دوباره تلاش کنید.' });
      });
    return () => {
      active = false;
    };
  }, [productId, page, revision, key]);
  const data =
    page === 1 && revision === 0
      ? initial
      : result?.key === key
        ? result.data.productReviews
        : null;
  const error = failure?.key === key ? failure.message : '';
  return (
    <div>
      <h2 className="font-bold">نظرات مشتریان</h2>
      {!data ? (
        <div className="mt-4">
          <AccountDataState
            error={error}
            retry={() => {
              setFailure(null);
              setRevision((value) => value + 1);
            }}
          />
        </div>
      ) : (
        <>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatNumber(data.total)} نظر تأییدشده
          </p>
          {data.items.length === 0 ? (
            <p className="mt-4">هنوز نظری برای این محصول منتشر نشده است.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {data.items.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-border bg-surface/50 p-4"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <h3 className="font-bold">{review.authorName}</h3>
                    <span className="text-amber-700" aria-label={`امتیاز ${review.rating} از ۵`}>
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                  <p className="mt-2 break-words whitespace-pre-wrap">{review.body}</p>
                </article>
              ))}
            </div>
          )}
          {data.total > 10 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                قبلی
              </Button>
              <span>صفحه {formatNumber(page)}</span>
              <Button
                variant="outline"
                disabled={page * 10 >= data.total}
                onClick={() => setPage((value) => value + 1)}
              >
                بعدی
              </Button>
            </div>
          )}
        </>
      )}
      {user ? (
        !own.data ? (
          <div className="mt-5">
            <AccountDataState error={own.error} retry={own.refresh} />
          </div>
        ) : (
          <ReviewForm
            key={user.id}
            productId={productId}
            review={own.data.myProductReview ?? null}
            onSaved={() => {
              own.refresh();
              setRevision((value) => value + 1);
            }}
          />
        )
      ) : (
        <p className="mt-6 rounded-xl bg-primary/5 p-4">
          برای ثبت نظر،{' '}
          <Link
            href={`/login?next=${encodeURIComponent(`/product/${slug}`)}`}
            className="font-bold text-primary underline"
          >
            وارد حساب کاربری شوید
          </Link>
          .
        </p>
      )}
    </div>
  );
}
