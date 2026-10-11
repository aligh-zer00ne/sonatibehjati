import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'antd';
import { adminPromotionInputSchema } from '@behjati/shared/admin';
import { formatNumber } from '@behjati/shared';
import { SetAdminPromotionDocument, type AdminProductFieldsFragment } from '../generated/graphql';
import { adminRequest } from '../lib/client';
import PromotionFields, { promotionFormValues, promotionFormInput } from './PromotionFields';
export default function PromotionEditor({
  products,
  onCancel,
  onSaved,
}: {
  products: AdminProductFieldsFragment[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return (
    <Modal
      open
      title={`تخفیف / جشنواره برای ${formatNumber(products.length)} محصول`}
      footer={null}
      onCancel={() => {
        if (!pending) onCancel();
      }}
      closable={!pending}
      maskClosable={!pending}
    >
      <Alert
        type="info"
        showIcon
        className="!mb-4"
        title="قیمت اصلی محصولات حفظ می‌شود؛ تخفیف فقط در بازهٔ انتخابی اعمال خواهد شد."
      />
      <Form
        layout="vertical"
        initialValues={promotionFormValues()}
        onFinish={async (raw) => {
          if (pending) return;
          const parsed = adminPromotionInputSchema.safeParse(promotionFormInput(raw));
          if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'اطلاعات تخفیف را بررسی کنید.');
            return;
          }
          setPending(true);
          setError('');
          try {
            await adminRequest(SetAdminPromotionDocument, {
              input: parsed.data,
              products: products.map(({ id, updatedAt }) => ({ id, expectedUpdatedAt: updatedAt })),
            });
            onSaved();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'ذخیره تخفیف انجام نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <PromotionFields />
        {error && <Alert type="error" role="alert" title={error} className="!mb-4" />}
        <Button type="primary" htmlType="submit" loading={pending}>
          اعمال روی محصولات انتخاب‌شده
        </Button>
      </Form>
    </Modal>
  );
}
