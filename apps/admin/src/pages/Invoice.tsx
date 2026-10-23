import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Modal } from 'antd';
import { formatNumber } from '@behjati/shared';
import type { AdminOrderFieldsFragment } from '../generated/graphql';
import AdminIcon from '../components/AdminIcon';
import InvoiceSheet, { invoiceFormats, type InvoiceFormat } from '../components/InvoiceSheet';
import PrintSheet from '../components/PrintSheet';

function preferredFormat(): InvoiceFormat {
  try {
    const saved = localStorage.getItem('behjati-invoice-format');
    if (saved === 'A4' || saved === 'A5' || saved === 'THERMAL') return saved;
  } catch {
    /* Printing remains available when storage is disabled. */
  }
  return 'A5';
}

export default function Invoice({
  order,
  onClose,
}: {
  order: AdminOrderFieldsFragment;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<InvoiceFormat>(preferredFormat);
  const [returnFocus] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  const [zoom, setZoom] = useState<number | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const canvas = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const printLock = useRef(false);
  const paperWidth = (invoiceFormats[format].width * 96) / 25.4;
  const fit = Math.max(0.1, Math.min(1, (canvasWidth - 40) / paperWidth));
  const scale = zoom ?? fit;
  const thermal = format === 'THERMAL';
  // Custom roll size uses both lengths: CSS does not support `80mm auto`.
  const rollHeight = Math.max(100, Math.ceil((sheetHeight * 25.4) / 96));
  const pageSize = thermal ? `80mm ${rollHeight}mm` : `${format} portrait`;
  const margin = thermal ? '4mm' : format === 'A4' ? '12mm' : '8mm';

  useEffect(
    () => () => {
      requestAnimationFrame(() => {
        if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      });
    },
    [returnFocus],
  );
  useEffect(() => {
    const oldTitle = document.title;
    document.title = `فاکتور-${order.number}-سنتی-بهجتی`;
    return () => {
      document.title = oldTitle;
    };
  }, [order.number]);
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const width = canvas.current?.clientWidth ?? 0;
      const height = paper.current?.offsetHeight ?? 0;
      // The screen canvas is hidden during printing. Keep its last real dimensions
      // so entering print media cannot collapse the dynamically sized receipt.
      if (width > 0) setCanvasWidth(width);
      if (height > 0) setSheetHeight(height);
    });
    if (canvas.current) observer.observe(canvas.current);
    if (paper.current) observer.observe(paper.current);
    return () => observer.disconnect();
  }, []);

  const print = async () => {
    if (printLock.current) return;
    printLock.current = true;
    setPending(true);
    setError('');
    try {
      await document.fonts.ready;
      await Promise.all(
        Array.from(
          document.querySelectorAll<HTMLImageElement>('[data-invoice-sheet] img'),
          (image) => image.decode(),
        ),
      );
      // Wait for font/image layout and the measured roll height to reach PrintSheet.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      window.print();
    } catch {
      setError('تصاویر یا فونت فاکتور آماده نشد. اتصال را بررسی کنید و دوباره چاپ را بزنید.');
    } finally {
      printLock.current = false;
      setPending(false);
    }
  };
  const changeFormat = (next: InvoiceFormat) => {
    setFormat(next);
    setZoom(null);
    try {
      localStorage.setItem('behjati-invoice-format', next);
    } catch {
      /* Optional preference. */
    }
  };
  return (
    <Modal
      open
      title={<span className="sr-only">فاکتور سفارش {formatNumber(order.number)}</span>}
      footer={null}
      closable={false}
      keyboard={!pending}
      onCancel={onClose}
      width="100%"
      className="!top-0 !m-0 !max-w-none !pb-0"
      classNames={{
        root: 'print:!hidden',
        wrapper: '!p-0',
        header: '!m-0 !p-0',
        container: '!h-dvh !rounded-none !p-0 !bg-[#eee9e0]',
        body: '!h-full',
      }}
      destroyOnHidden
      transitionName=""
    >
      <section data-invoice-workspace dir="rtl" className="flex h-dvh min-w-0 flex-col">
        <header className="shrink-0 border-b border-[#b78343]/40 bg-[linear-gradient(110deg,#671e2a,#2c0d13)] px-4 py-3 text-[#fff5e1] shadow-lg sm:px-6">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#f6dfa0,#c49536)] text-[#4e141c]">
                <AdminIcon name="print" width={26} height={26} />
              </span>
              <div>
                <h1 className="text-base font-extrabold">پیش‌نمایش چاپ</h1>
                <p className="mt-1 text-xs text-[#eed8c6]">
                  فاکتور سفارش {formatNumber(order.number)} · همهٔ مبالغ به ریال
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 max-[420px]:w-full">
              <Button
                type="primary"
                icon={<AdminIcon name="print" />}
                loading={pending}
                onClick={() => void print()}
                className="!border-0 !bg-[linear-gradient(135deg,#f6dfa0,#c49536)] !font-bold !text-[#39270c] max-[420px]:!flex-1"
              >
                چاپ / ذخیره PDF
              </Button>
              <Button
                aria-label="بستن پیش‌نمایش چاپ"
                title="بازگشت به سفارش"
                disabled={pending}
                onClick={onClose}
                icon={<AdminIcon name="close" />}
                className="!border-white/25 !bg-white/10 !text-white"
              />
            </div>
          </div>
        </header>
        <div className="shrink-0 border-b border-[#ddd1c0] bg-[#fffdf9] px-3 py-3 sm:px-6">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label="قالب فاکتور"
              className="grid w-full grid-cols-3 gap-1.5 rounded-2xl bg-[#f2ebe0] p-1.5 sm:w-auto sm:gap-2"
            >
              {(Object.keys(invoiceFormats) as InvoiceFormat[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={format === key}
                  disabled={pending}
                  onClick={() => changeFormat(key)}
                  className="min-h-11 cursor-pointer rounded-xl px-2 py-2 text-[12px] font-bold text-[#796653] transition-colors aria-pressed:bg-white aria-pressed:text-[#4e141c] aria-pressed:shadow-sm sm:min-w-32 sm:px-4 sm:text-sm"
                >
                  {invoiceFormats[key].label}
                </button>
              ))}
            </div>
            <div
              role="group"
              aria-label="بزرگ‌نمایی پیش‌نمایش"
              className="flex items-center gap-1 rounded-xl border border-[#e1d6c5] bg-white p-1"
            >
              <Button
                type="text"
                aria-label="کوچک‌نمایی"
                disabled={scale <= 0.25}
                onClick={() => setZoom(Math.max(0.25, Math.round((scale - 0.1) * 100) / 100))}
                className="!size-9 !text-lg"
              >
                −
              </Button>
              <output
                aria-label="درصد بزرگ‌نمایی"
                className="w-12 text-center text-xs font-bold tabular-nums"
              >
                {formatNumber(Math.round(scale * 100))}٪
              </output>
              <Button
                type="text"
                aria-label="بزرگ‌نمایی"
                disabled={scale >= 1.5}
                onClick={() => setZoom(Math.min(1.5, Math.round((scale + 0.1) * 100) / 100))}
                className="!size-9"
                icon={<AdminIcon name="plus" width={17} />}
              />
              <button
                type="button"
                aria-pressed={zoom === null}
                onClick={() => setZoom(null)}
                className="min-h-9 cursor-pointer rounded-lg border-s border-[#e1d6c5] px-3 text-xs font-semibold text-[#4e141c]"
              >
                اندازهٔ مناسب
              </button>
            </div>
          </div>
          <p className="mx-auto mt-2 max-w-[1600px] text-[11px] leading-5 text-[#857467]">
            {invoiceFormats[format].description} ·{' '}
            {thermal
              ? 'کاغذ ۸۰ میلی‌متری، مقیاس ۱۰۰٪ و حاشیهٔ چاپگر را بررسی کنید.'
              : 'اندازهٔ کاغذ را مطابق قالب انتخاب و سربرگ و پابرگ مرورگر را خاموش کنید.'}{' '}
            برای PDF، در پنجرهٔ چاپ «Save as PDF» را انتخاب کنید.
          </p>
          {error && <Alert role="alert" type="error" title={error} className="!mt-2" />}
        </div>
        <div
          ref={canvas}
          data-invoice-canvas
          dir="ltr"
          tabIndex={0}
          aria-label="کاغذ پیش‌نمایش؛ قابل پیمایش"
          className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain bg-[radial-gradient(#b9a58e50_0.7px,transparent_0.7px)] bg-[size:18px_18px]"
        >
          <div className="grid min-h-full min-w-full w-max justify-items-center px-5 py-6 sm:py-8">
            <div
              style={{ width: paperWidth * scale, height: sheetHeight * scale }}
              className="relative shrink-0"
            >
              <div
                ref={paper}
                data-invoice
                style={{ transform: `scale(${scale})`, width: paperWidth }}
                className="absolute top-0 left-0 origin-top-left bg-white shadow-[0_10px_40px_#42231226]"
              >
                <InvoiceSheet order={order} format={format} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <PrintSheet size={pageSize} margin={margin}>
        <InvoiceSheet order={order} format={format} />
      </PrintSheet>
    </Modal>
  );
}
