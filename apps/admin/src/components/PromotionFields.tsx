import { Form, Input, InputNumber } from 'antd';
import CalendarPicker from './CalendarPicker';
export function promotionFormValues(
  product?: {
    discountPercent?: number | null;
    discountTitle?: string | null;
    discountStartsAt?: string | null;
    discountEndsAt?: string | null;
  } | null,
) {
  return {
    discountPercent: product?.discountPercent ?? null,
    discountTitle: product?.discountTitle ?? '',
    discountStartsAt: product?.discountStartsAt ?? new Date().toISOString(),
    discountEndsAt: product?.discountEndsAt ?? new Date(Date.now() + 7 * 86400000).toISOString(),
  };
}
export function promotionFormInput(raw: Record<string, unknown>) {
  const percent = typeof raw.discountPercent === 'number' ? raw.discountPercent : null;
  return {
    discountPercent: percent,
    discountTitle: percent && typeof raw.discountTitle === 'string' ? raw.discountTitle : null,
    discountStartsAt:
      percent && typeof raw.discountStartsAt === 'string' ? raw.discountStartsAt : null,
    discountEndsAt: percent && typeof raw.discountEndsAt === 'string' ? raw.discountEndsAt : null,
  };
}
export default function PromotionFields() {
  const percent = Form.useWatch('discountPercent');
  return (
    <div className="grid gap-x-5 sm:grid-cols-2">
      <Form.Item name="discountPercent" label="درصد تخفیف (برای حذف، خالی بگذارید)">
        <InputNumber aria-label="درصد تخفیف" min={1} max={99} precision={0} className="!w-full" />
      </Form.Item>
      <Form.Item name="discountTitle" label="عنوان جشنواره (اختیاری)">
        <Input maxLength={80} disabled={!percent} />
      </Form.Item>
      <Form.Item name="discountStartsAt" label="شروع تخفیف">
        <CalendarPicker withTime disabled={!percent} />
      </Form.Item>
      <Form.Item name="discountEndsAt" label="پایان تخفیف">
        <CalendarPicker withTime disabled={!percent} />
      </Form.Item>
    </div>
  );
}
