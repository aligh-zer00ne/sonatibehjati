import { useState } from 'react';
import { Form, Input, Button, Card, Alert, Skeleton, Typography } from 'antd';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BRAND_NAME } from '@behjati/shared';
import { adminLoginSchema } from '@behjati/shared/admin';
import { useAdmin } from '../auth/AdminProvider';
import { adminRequest } from '../lib/client';
import { AdminLoginDocument } from '../generated/graphql';
export default function Login() {
  const { admin, loading, error: sessionError, refresh, loggedIn } = useAdmin();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { from?: string } | null;
  const target = state?.from?.startsWith('/admin') ? state.from : '/admin';
  if (admin) return <Navigate to={target} replace />;
  if (loading)
    return (
      <div className="mx-auto max-w-lg p-8">
        <Skeleton active />
      </div>
    );
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(ellipse_at_top_right,#fff5e1,#f6f1e9_60%)] p-5">
      <Card className="w-full max-w-md shadow-sm">
        <img src="/images/logo-brand.png" alt={BRAND_NAME} className="mx-auto mb-5 h-24 w-auto" />
        <Typography.Title level={2}>ورود مدیر</Typography.Title>
        <Typography.Paragraph type="secondary" className="!mt-2 !mb-6">
          پنل مدیریت {BRAND_NAME}
        </Typography.Paragraph>
        {sessionError && (
          <Alert
            className="!mb-4"
            title={sessionError}
            type="error"
            action={<Button onClick={() => void refresh()}>تلاش دوباره</Button>}
          />
        )}
        <Form
          layout="vertical"
          onFinish={async (raw) => {
            if (pending) return;
            const parsed = adminLoginSchema.safeParse(raw);
            setError('');
            if (!parsed.success) {
              setError('ایمیل و رمز ورود را بررسی کنید.');
              return;
            }
            setPending(true);
            try {
              const result = await adminRequest(AdminLoginDocument, { input: parsed.data });
              loggedIn(result.adminLogin.admin);
              navigate(target, { replace: true });
            } catch (error) {
              setError(error instanceof Error ? error.message : 'ورود انجام نشد.');
            } finally {
              setPending(false);
            }
          }}
        >
          <Form.Item
            name="email"
            label="ایمیل مدیر"
            rules={[
              { required: true, message: 'ایمیل مدیر را وارد کنید.' },
              { type: 'email', message: 'ایمیل معتبر وارد کنید.' },
            ]}
          >
            <Input autoComplete="username" dir="ltr" maxLength={254} />
          </Form.Item>
          <Form.Item
            name="password"
            label="رمز ورود"
            rules={[{ required: true, message: 'رمز ورود را وارد کنید.' }]}
          >
            <Input.Password autoComplete="current-password" dir="ltr" maxLength={128} />
          </Form.Item>
          {error && <Alert className="!mb-4" title={error} type="error" showIcon role="alert" />}
          <Button type="primary" htmlType="submit" loading={pending} block>
            ورود به پنل
          </Button>
        </Form>
      </Card>
    </main>
  );
}
