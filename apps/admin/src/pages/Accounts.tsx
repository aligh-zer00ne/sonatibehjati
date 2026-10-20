import AdminIcon from '../components/AdminIcon';
import RecordCards from '../components/RecordCards';
import { adminSections, type AdminPermission } from '@behjati/shared/permissions';
import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Switch,
  Tag,
  Typography,
  App,
  Checkbox,
  Modal,
} from 'antd';
import {
  AdminAccountsDocument,
  CreateStaffDocument,
  SetStaffActiveDocument,
  SetStaffPermissionsDocument,
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
  const [editing, setEditing] = useState<AdminIdentityFieldsFragment | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const options = adminSections.map((section) => ({
    label: section.label,
    value: section.permission,
  }));
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
        title="مدیر به همهٔ بخش‌ها دسترسی دارد. بخش‌های مجاز هر همکار را انتخاب کنید. مدیریت کاربران پنل فقط در اختیار مدیر است؛ تغییر رمز شخصی همیشه در دسترس است."
      />
      {error && <Alert type="error" title={error} role="alert" />}
      <Card title="تعریف همکار">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ permissions: [] }}
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
          <Form.Item name="permissions" label="بخش‌های مجاز همکار">
            <Checkbox.Group
              options={options}
              className="!grid !w-full gap-3 sm:grid-cols-2 lg:grid-cols-3"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={pending}>
            ساخت حساب همکار
          </Button>
        </Form>
      </Card>
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <RecordCards
          rowKey="id"
          icon="shield"
          label="فهرست کاربران پنل"
          dataSource={query.data.adminAccounts}
          pagination={false}
          columns={[
            { title: 'ایمیل', dataIndex: 'email' },
            {
              title: 'بخش‌های مجاز',
              render: (_, row) =>
                row.role === 'OWNER' ? (
                  'همه بخش‌ها'
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {row.permissions.length
                      ? row.permissions.map((permission) => (
                          <Tag key={permission}>
                            {options.find((option) => option.value === permission)?.label}
                          </Tag>
                        ))
                      : 'هنوز بخشی انتخاب نشده'}
                  </div>
                ),
            },
            {
              title: 'ویرایش دسترسی',
              render: (_, row) =>
                row.role === 'STAFF' && (
                  <Button
                    icon={<AdminIcon name="shield" width={17} height={17} />}
                    onClick={() => {
                      setEditing(row);
                      setPermissions(row.permissions);
                    }}
                  >
                    تعیین دسترسی‌ها
                  </Button>
                ),
            },
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
                  aria-label={`فعال بودن ${row.email}`}
                  checked={row.isActive}
                  disabled={pending || row.role === 'OWNER'}
                  onChange={(value) => void active(row, value)}
                />
              ),
            },
          ]}
        />
      )}
      <Modal
        open={!!editing}
        title={`دسترسی‌های ${editing?.email ?? ''}`}
        onCancel={() => !pending && setEditing(null)}
        confirmLoading={pending}
        okText="ذخیره دسترسی‌ها"
        cancelText="انصراف"
        onOk={async () => {
          if (!editing || pending) return;
          setPending(true);
          setError('');
          try {
            await adminRequest(SetStaffPermissionsDocument, { id: editing.id, permissions });
            query.refresh();
            setEditing(null);
            void message.success('دسترسی‌ها ذخیره شد؛ همکار باید دوباره وارد شود.');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'دسترسی ذخیره نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <p className="mb-4">
          بخش‌های قابل دسترسی را انتخاب کنید. تغییرات پس از ذخیره اعمال می‌شوند.
        </p>
        <Checkbox.Group
          value={permissions}
          onChange={(value) => setPermissions(value as AdminPermission[])}
          options={options}
          className="!grid !w-full gap-3 sm:grid-cols-2"
        />
        {error && <Alert type="error" title={error} className="!mt-4" />}
      </Modal>
    </>
  );
}
