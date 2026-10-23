import PageHeading from '../components/PageHeading';
import { useState } from 'react';
import { Alert, App, Button, Card, Form, Input, Switch } from 'antd';
import { announcementSchema } from '@behjati/shared/homepage';
import {
  AdminAnnouncementDocument,
  SaveAnnouncementDocument,
  type AdminAnnouncementQuery,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import DataState from '../components/DataState';
import AdminIcon from '../components/AdminIcon';

function Editor({ initial }: { initial: AdminAnnouncementQuery['adminHomepageContent'] }) {
  const [form] = Form.useForm();
  const [version, setVersion] = useState(initial.updatedAt);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const text = Form.useWatch('text', form) ?? initial.announcement.text;
  const { message } = App.useApp();
  return (
    <Card title="متن نوار بالای سایت" className="max-w-3xl">
      <div className="mb-5 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#701734] px-4 py-3 text-center text-sm font-medium text-white">
        <AdminIcon name="truck" className="shrink-0" />
        <span className="[overflow-wrap:anywhere]">{text}</span>
      </div>
      <Form
        form={form}
        layout="vertical"
        initialValues={initial.announcement}
        onFinish={async (raw) => {
          const parsed = announcementSchema.safeParse(raw);
          if (!parsed.success) {
            setError('متن نوار باید بین ۱ تا ۱۸۰ نویسه باشد.');
            return;
          }
          setPending(true);
          setError('');
          try {
            const result = await adminRequest(SaveAnnouncementDocument, {
              input: parsed.data,
              expectedUpdatedAt: version,
            });
            setVersion(result.saveAnnouncement.updatedAt);
            void message.success('نوار اطلاع‌رسانی سایت ذخیره شد.');
          } catch (error) {
            setError(error instanceof Error ? error.message : 'تغییرات ذخیره نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <Form.Item name="enabled" label="نمایش نوار در سایت" valuePropName="checked">
          <Switch disabled={pending} />
        </Form.Item>
        <Form.Item
          name="text"
          label="متن اطلاع‌رسانی"
          rules={[{ required: true, whitespace: true }]}
          extra="برای مناسبت‌ها، جشنواره‌ها و اطلاع‌رسانی فروشگاه؛ متن ساده نمایش داده می‌شود."
        >
          <Input.TextArea
            maxLength={180}
            showCount
            autoSize={{ minRows: 2, maxRows: 4 }}
            disabled={pending}
          />
        </Form.Item>
        {error && <Alert type="error" title={error} role="alert" className="!mb-4" />}
        <Button
          htmlType="submit"
          type="primary"
          loading={pending}
          icon={<AdminIcon name="edit" width={18} height={18} />}
        >
          ذخیره نوار اطلاع‌رسانی
        </Button>
      </Form>
    </Card>
  );
}
export default function Announcement() {
  const query = useAdminQuery(AdminAnnouncementDocument, {});
  return (
    <>
      <PageHeading icon="review" description="ویرایش پیام مناسبت‌ها و جشنواره‌ها در بالای فروشگاه.">
        نوار اطلاع‌رسانی سایت
      </PageHeading>
      {query.data ? (
        <Editor
          key={query.data.adminHomepageContent.updatedAt ?? 'default'}
          initial={query.data.adminHomepageContent}
        />
      ) : (
        <DataState error={query.error} retry={query.refresh} />
      )}
    </>
  );
}
