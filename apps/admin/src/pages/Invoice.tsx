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
  const [notice, setNotice] = useState('پیش‌نمایش آماده است.');
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
    canvas.current?.scrollTo({ top: 0, left: 0 });
    setNotice('پیش‌نمایش آماده است.');
    setFormat(next);
    setZoom(null);
    try {
      localStorage.setItem('behjati-invoice-format', next);
    } catch {
      /* Optional preference. */
    }
  };
  const exportFile = async (share = false) => {
    if (printLock.current) return;
    printLock.current = true;
    setPending(true);
    setError('');
    setNotice('در حال آماده‌سازی فایل…');
    try {
      const sheet = paper.current?.querySelector<HTMLElement>('[data-invoice-sheet]');
      if (!sheet) throw new Error('فاکتور آماده نیست.');
      const { invoiceFile, downloadInvoice } = await import('../lib/invoice-file');
      const file = await invoiceFile(sheet, `فاکتور-${order.number}-سنتی-بهجتی`, pageSize, margin);
      if (share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `فاکتور ${order.number}` });
          setNotice('فایل برای اشتراک‌گذاری آماده شد.');
          return;
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') {
            setNotice('اشتراک‌گذاری لغو شد.');
            return;
          }
        }
      }
      downloadInvoice(file);
      setNotice(
        share
          ? 'اشتراک مستقیم در این مرورگر در دسترس نیست؛ فایل مستقل فاکتور ذخیره شد.'
          : 'فایل مستقل فاکتور ذخیره شد؛ می‌توانید آن را در مرورگر باز و چاپ کنید.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فایل آماده نشد.');
    } finally {
      printLock.current = false;
      setPending(false);
    }
  };
  const toolClass =
    '!h-10 !rounded-xl !border-white/25 !bg-white/10 !px-3 !text-[#fff5e1] hover:!bg-white/20';
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
        <header
          role="toolbar"
          aria-label="ابزار پیش‌نمایش چاپ"
          className="shrink-0 border-b border-[#b78343]/50 bg-[linear-gradient(110deg,#671e2a,#2c0d13)] px-3 py-3 text-[#fff5e1] shadow-lg sm:px-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#f6dfa0,#c49536)] text-[#4e141c]">
                <AdminIcon name="print" width={24} />
              </span>
              <div>
                <h1 className="text-sm leading-6 font-extrabold">پیش‌نمایش چاپ</h1>
                <p className="text-[11px] text-[#eed8c6]">
                  فاکتور {formatNumber(order.number)} · ریال
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 max-[640px]:order-3 max-[640px]:w-full max-[640px]:justify-between">
              <div
                role="group"
                aria-label="قالب فاکتور"
                className="flex gap-0.5 rounded-full border border-white/20 bg-white/10 p-1"
              >
                {(Object.keys(invoiceFormats) as InvoiceFormat[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-label={invoiceFormats[key].label}
                    aria-pressed={format === key}
                    disabled={pending}
                    onClick={() => changeFormat(key)}
                    className="min-h-9 cursor-pointer rounded-full px-2.5 text-[12px] font-bold text-[#f2d6a2] aria-pressed:bg-[#f5daa0] aria-pressed:text-[#3f2618]"
                  >
                    {key === 'THERMAL' ? '۸ سانتی' : key}
                  </button>
                ))}
              </div>
              <div
                role="group"
                aria-label="بزرگ‌نمایی پیش‌نمایش"
                className="flex items-center rounded-full border border-white/20 bg-white/10 p-1"
                dir="ltr"
              >
                <button
                  type="button"
                  aria-label="کوچک‌نمایی"
                  disabled={scale <= 0.25}
                  onClick={() => setZoom(Math.max(0.25, Math.round((scale - 0.1) * 100) / 100))}
                  className="grid size-8 cursor-pointer place-items-center rounded-full hover:bg-white/10 disabled:opacity-40"
                >
                  <AdminIcon name="minus" width={16} />
                </button>
                <button
                  type="button"
                  aria-label="اندازهٔ مناسب"
                  title="جا شدن در عرض صفحه"
                  aria-pressed={zoom === null}
                  onClick={() => setZoom(null)}
                  className="min-h-8 min-w-12 cursor-pointer rounded-full px-1 text-[12px] font-bold"
                >
                  <output aria-label="درصد بزرگ‌نمایی">
                    {formatNumber(Math.round(scale * 100))}٪
                  </output>
                </button>
                <button
                  type="button"
                  aria-label="بزرگ‌نمایی"
                  disabled={scale >= 1.5}
                  onClick={() => setZoom(Math.min(1.5, Math.round((scale + 0.1) * 100) / 100))}
                  className="grid size-8 cursor-pointer place-items-center rounded-full hover:bg-white/10 disabled:opacity-40"
                >
                  <AdminIcon name="plus" width={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                aria-label="چاپ / ذخیره PDF"
                icon={<AdminIcon name="print" width={19} />}
                loading={pending}
                onClick={() => void print()}
                className="!h-10 !rounded-xl !border-0 !bg-[linear-gradient(135deg,#f6dfa0,#c49536)] !px-4 !font-bold !text-[#39270c]"
              >
                چاپ
              </Button>
              <Button
                aria-label="ذخیره PDF"
                title="ذخیره PDF از پنجرهٔ چاپ مرورگر"
                icon={<AdminIcon name="pdf" width={18} />}
                disabled={pending}
                onClick={() => {
                  setNotice('برای ذخیرهٔ PDF، در پنجرهٔ چاپ مقصد Save as PDF را انتخاب کنید.');
                  void print();
                }}
                className={toolClass}
              >
                <span className="hidden min-[900px]:inline">PDF</span>
              </Button>
              <Button
                aria-label="ذخیره فایل فاکتور"
                title="ذخیره فایل مستقل HTML"
                icon={<AdminIcon name="file" width={18} />}
                disabled={pending}
                onClick={() => void exportFile()}
                className={toolClass}
              >
                <span className="hidden min-[1100px]:inline">ذخیره فایل</span>
              </Button>
              <Button
                aria-label="اشتراک فایل فاکتور"
                title="اشتراک فایل فاکتور"
                icon={<AdminIcon name="share" width={18} />}
                disabled={pending}
                onClick={() => void exportFile(true)}
                className={toolClass}
              >
                <span className="hidden min-[1100px]:inline">ارسال</span>
              </Button>
              <Button
                aria-label="بستن پیش‌نمایش چاپ"
                title="بازگشت به سفارش"
                disabled={pending}
                onClick={onClose}
                icon={<AdminIcon name="close" width={19} />}
                className="!size-10 !rounded-full !border-white/25 !bg-white/10 !text-white"
              />
            </div>
          </div>
        </header>
        {error && (
          <Alert role="alert" type="error" title={error} className="!shrink-0 !rounded-none" />
        )}
        <div
          ref={canvas}
          data-invoice-canvas
          dir="ltr"
          tabIndex={0}
          aria-label="کاغذ پیش‌نمایش؛ قابل پیمایش"
          className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain bg-[radial-gradient(#a48b7350_0.8px,transparent_0.8px)] bg-[size:18px_18px]"
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
                className="absolute top-0 left-0 origin-top-left bg-white shadow-[0_2px_4px_#42231218,0_20px_50px_-15px_#42231250]"
              >
                <InvoiceSheet order={order} format={format} />
              </div>
            </div>
          </div>
        </div>
        <footer
          className="flex shrink-0 items-center gap-2 border-t border-[#ded3c2] bg-[#fffdf9] px-4 py-2 text-[11px] leading-5 text-[#857467]"
          role="status"
        >
          <span
            className={`size-2 shrink-0 rounded-full ${pending ? 'bg-[#c49536]' : 'bg-[#40815d]'}`}
          />
          <span>{notice}</span>
          <span className="ms-auto hidden whitespace-nowrap sm:inline">
            {invoiceFormats[format].description}
          </span>
        </footer>
      </section>
      <PrintSheet size={pageSize} margin={margin}>
        <InvoiceSheet order={order} format={format} />
      </PrintSheet>
    </Modal>
  );
}
