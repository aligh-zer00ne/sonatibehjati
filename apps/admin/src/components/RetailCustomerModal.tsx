import { useState } from 'react';
import { Alert, Button, Form, Input, Modal, Radio } from 'antd';
import { adminCustomerInputSchema } from '@behjati/shared/admin';
import { CreateAdminCustomerDocument } from '../generated/graphql';
import { adminRequest } from '../lib/client';
export default function RetailCustomerModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return (
    <Modal
      open
      title="افزودن مشتری"
      footer={null}
      onCancel={() => {
        if (!pending) onClose();
      }}
      destroyOnHidden
    >
      <Form
        layout="vertical"
        initialValues={{ salesChannel: 'IN_PERSON', lastName: '' }}
        onFinish={async (values) => {
          const parsed = adminCustomerInputSchema.safeParse(values);
          if (!parsed.success) {
            setError('نام و شمارهٔ موبایل معتبر وارد کنید.');
            return;
          }
          setPending(true);
          setError('');
          try {
            const d = await adminRequest(CreateAdminCustomerDocument, { input: parsed.data });
            onSaved(d.createAdminCustomer.id);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'ثبت انجام نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <Form.Item label="نام" name="firstName" rules={[{ required: true }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item label="نام خانوادگی" name="lastName">
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item label="موبایل" name="phone" rules={[{ required: true }]}>
          <Input inputMode="tel" dir="ltr" maxLength={20} />
        </Form.Item>
        <Form.Item label="منبع آشنایی / خرید" name="salesChannel">
          <Radio.Group
            options={[
              { value: 'IN_PERSON', label: 'حضوری' },
              { value: 'INSTAGRAM', label: 'اینستاگرام' },
            ]}
          />
        </Form.Item>
        {error && <Alert type="error" title={error} role="alert" />}
        <Button htmlType="submit" type="primary" loading={pending}>
          ثبت مشتری
        </Button>
      </Form>
    </Modal>
  );
}
