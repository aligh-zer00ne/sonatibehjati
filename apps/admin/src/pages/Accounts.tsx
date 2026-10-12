import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Switch, Table, Tag, Typography, App } from 'antd';
import {
  AdminAccountsDocument,
  CreateStaffDocument,
  SetStaffActiveDocument,
  type AdminIdentityFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import DataState from '../components/DataState';
export default function Accounts() {
  const query = useAdminQuery(AdminAccountsDocument, {});
  const [form] = Form.useForm();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const { message } = App.useApp();
  async function active(admin: AdminIdentityFieldsFragment, isActive: boolean) {
    setPending(true);
    setError('');
    try {
      await adminRequest(SetStaffActiveDocument, { id: admin.id, isActive });
      query.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تغییر انجام نشد.');
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Typography.Title level={2}>کاربران پنل</Typography.Title>
      <Alert
        type="info"
        title="مدیر به همهٔ بخش‌ها دسترسی دارد. همکار فقط محصولات، سفارش‌ها، پشتیبانی، نظرات و رمز حساب خودش را مدیریت می‌کند."
      />
      {error && <Alert type="error" title={error} role="alert" />}
      <Card title="تعریف همکار">
        <Form
          form={form}
          layout="vertical"
          onFinish={async (input) => {
            setPending(true);
            setError('');
            try {
              await adminRequest(CreateStaffDocument, { input });
              form.resetFields();
              query.refresh();
              void message.success('حساب همکار ساخته شد.');
            } catch (e) {
              setError(e instanceof Error ? e.message : 'حساب ساخته نشد.');
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="grid gap-x-5 sm:grid-cols-2">
            <Form.Item
              name="email"
              label="ایمیل همکار"
              rules={[{ required: true, type: 'email', message: 'ایمیل معتبر وارد کنید.' }]}
            >
              <Input dir="ltr" maxLength={254} autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="password"
              label="رمز اولیه (حداقل ۱۲ نویسه)"
              rules={[
                { required: true, min: 12, max: 128, message: 'رمز باید ۱۲ تا ۱۲۸ نویسه باشد.' },
              ]}
            >
              <Input.Password dir="ltr" autoComplete="new-password" maxLength={128} />
            </Form.Item>
          </div>
          <Button type="primary" htmlType="submit" loading={pending}>
            ساخت حساب همکار
          </Button>
        </Form>
      </Card>
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <Card>
          <Table
            rowKey="id"
            dataSource={query.data.adminAccounts}
            scroll={{ x: 520 }}
            pagination={false}
            columns={[
              { title: 'ایمیل', dataIndex: 'email' },
              {
                title: 'دسترسی',
                render: (_, row) => (
                  <Tag color={row.role === 'OWNER' ? 'red' : 'blue'}>
                    {row.role === 'OWNER' ? 'مدیر' : 'همکار'}
                  </Tag>
                ),
              },
              {
                title: 'فعال',
                render: (_, row) => (
                  <Switch
                    checked={row.isActive}
                    disabled={pending || row.role === 'OWNER'}
                    onChange={(value) => void active(row, value)}
                  />
                ),
              },
            ]}
          />
        </Card>
      )}
    </>
  );
}
