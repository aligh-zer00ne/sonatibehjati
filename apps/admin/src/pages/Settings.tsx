import { useState } from 'react';
import { Typography, Card, Form, Input, Button, Alert, App } from 'antd';
import { adminPasswordChangeSchema } from '@behjati/shared/admin';
import { useAdmin } from '../auth/AdminProvider';
import { adminRequest } from '../lib/client';
import { ChangeAdminPasswordDocument } from '../generated/graphql';
import AdminIcon from '../components/AdminIcon';
export default function Settings() {
  const { admin, passwordChanged } = useAdmin();
  const { message } = App.useApp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return (
    <>
      <Typography.Title level={2}>تنظیمات حساب مدیر</Typography.Title>
      <Card
        title={
          <span className="flex items-center gap-2">
            <AdminIcon name="shield" />
            تغییر رمز عبور
          </span>
        }
        className="max-w-2xl"
      >
        <p className="mb-4 text-xs text-[#7d746a]">
          حساب: <bdi>{admin?.email}</bdi>
        </p>
        <Alert
          type="info"
          showIcon
          className="mb-5"
          title="پس از تغییر رمز، همهٔ نشست‌های این حساب بسته می‌شوند و باید با رمز جدید وارد شوید."
        />
        <Form
          layout="vertical"
          onFinish={async (raw) => {
            if (pending) return;
            const parsed = adminPasswordChangeSchema.safeParse({
              currentPassword: raw.currentPassword,
              newPassword: raw.newPassword,
            });
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message ?? 'رمز را بررسی کنید.');
              return;
            }
            setPending(true);
            setError('');
            try {
              await adminRequest(ChangeAdminPasswordDocument, { input: parsed.data });
              void message.success('رمز تغییر کرد. با رمز جدید وارد شوید.');
              passwordChanged();
            } catch (error) {
              setError(error instanceof Error ? error.message : 'رمز تغییر نکرد.');
            } finally {
              setPending(false);
            }
          }}
        >
          <Form.Item
            name="currentPassword"
            label="رمز فعلی"
            rules={[{ required: true, message: 'رمز فعلی را وارد کنید.' }]}
          >
            <Input.Password autoComplete="current-password" dir="ltr" maxLength={128} />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="رمز جدید"
            rules={[
              { required: true, message: 'رمز جدید را وارد کنید.' },
              { min: 12, message: 'رمز جدید حداقل ۱۲ نویسه باشد.' },
            ]}
            extra="حداقل ۱۲ و حداکثر ۱۲۸ نویسه"
          >
            <Input.Password autoComplete="new-password" dir="ltr" maxLength={128} />
          </Form.Item>
          <Form.Item
            name="confirmation"
            label="تکرار رمز جدید"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'رمز را تکرار کنید.' },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  value === getFieldValue('newPassword')
                    ? Promise.resolve()
                    : Promise.reject(new Error('تکرار رمز با رمز جدید یکسان نیست.')),
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" dir="ltr" maxLength={128} />
          </Form.Item>
          {error && <Alert role="alert" type="error" title={error} className="mb-4" />}
          <Button type="primary" htmlType="submit" loading={pending}>
            تغییر رمز و خروج از نشست‌ها
          </Button>
        </Form>
      </Card>
    </>
  );
}
