import { useState } from 'react';
import { Button, Modal } from 'antd';
import AdminIcon from './AdminIcon';
export default function ProductPreview({ slug, isActive }: { slug: string; isActive: boolean }) {
  const [open, setOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const origin =
    import.meta.env.VITE_STOREFRONT_URL ??
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : 'https://sonatibehjati.ir');
  const url = new URL(`/product/${encodeURIComponent(slug)}`, origin).href;
  return (
    <>
      <Button
        icon={<AdminIcon name="eye" width={17} height={17} />}
        disabled={!isActive}
        title={!isActive ? 'برای نمایش در سایت، محصول باید فعال باشد.' : undefined}
        onClick={() => {
          setRevision((value) => value + 1);
          setOpen(true);
        }}
      >
        مشاهده در سایت
      </Button>
      <Modal
        title="پیش‌نمایش محصول در سایت"
        open={open}
        onCancel={() => setOpen(false)}
        width="min(1200px, 96vw)"
        destroyOnHidden
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button onClick={() => setRevision((value) => value + 1)}>تازه‌سازی</Button>
            <Button href={url} target="_blank" rel="noopener noreferrer">
              باز کردن در تب جدید
            </Button>
            <Button onClick={() => setOpen(false)}>بستن</Button>
          </div>
        }
      >
        <p className="mb-3 text-sm text-[#7d746a]">
          نسخهٔ ذخیره‌شدهٔ محصول در فروشگاه نمایش داده می‌شود.
        </p>
        <iframe
          key={revision}
          title="صفحه محصول در فروشگاه"
          src={`${url}?preview=${revision}`}
          className="h-[70dvh] w-full rounded-lg border border-[#e8ded1]"
        />
      </Modal>
    </>
  );
}
