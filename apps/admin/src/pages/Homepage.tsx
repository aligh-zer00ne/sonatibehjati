import { useId, useRef, useState } from 'react';
import { Alert, App, Button, Card, Form, Input, Typography } from 'antd';
import { defaultHomepage, homepageSchema, type HomepageValues } from '@behjati/shared/homepage';
import {
  AdminHomepageContentDocument,
  SaveHomepageContentDocument,
  type HomepageContentFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest, uploadAdminImage } from '../lib/client';
import DataState from '../components/DataState';

function ImageField({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="space-y-2">
      {value && (
        <img
          src={value}
          alt={label}
          className="h-32 w-full rounded-lg bg-[#f6f1e9] object-contain"
        />
      )}
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label={`آپلود ${label}`}
        className="!hidden"
        disabled={pending}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setPending(true);
          setError('');
          try {
            onChange?.(await uploadAdminImage(file, 'homepage'));
          } catch (e) {
            setError(e instanceof Error ? e.message : 'آپلود انجام نشد.');
          } finally {
            setPending(false);
            event.target.value = '';
          }
        }}
      />
      <Button loading={pending} onClick={() => input.current?.click()}>
        انتخاب {label}
      </Button>
      {error && <Alert title={error} type="error" role="alert" />}
    </div>
  );
}
function Editor({ initial }: { initial: HomepageContentFieldsFragment }) {
  const [form] = Form.useForm<HomepageValues>();
  const [version, setVersion] = useState(initial.updatedAt);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const { message } = App.useApp();
  const textField = (path: (string | number)[], label: string, max: number, multiline = false) => (
    <Form.Item
      name={path}
      label={label}
      rules={[
        {
          required: ['title', 'alt', 'action', 'mobileAction', 'href', 'label'].includes(
            String(path.at(-1)),
          ),
          message: `${label} را وارد کنید.`,
        },
      ]}
    >
      {multiline ? (
        <Input.TextArea maxLength={max} autoSize={{ minRows: 3, maxRows: 8 }} />
      ) : (
        <Input maxLength={max} />
      )}
    </Form.Item>
  );
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={homepageSchema.parse(initial)}
      onValuesChange={() => setDirty(true)}
      onFinish={async (raw) => {
        if (pending) return;
        const parsed = homepageSchema.safeParse(raw);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? 'محتوا را بررسی کنید.');
          return;
        }
        setPending(true);
        setError('');
        try {
          const result = await adminRequest(SaveHomepageContentDocument, {
            input: parsed.data,
            expectedUpdatedAt: version,
          });
          setVersion(result.saveHomepageContent.updatedAt);
          setDirty(false);
          void message.success('محتوای صفحه اصلی ذخیره شد.');
        } catch (e) {
          setError(e instanceof Error ? e.message : 'محتوا ذخیره نشد.');
        } finally {
          setPending(false);
        }
      }}
    >
      <Alert
        type="info"
        className="!mb-5"
        title="تصاویر JPG، PNG یا WebP تا ۸ مگابایت انتخاب کنید. تغییرات پس از ذخیره در صفحه اصلی نمایش داده می‌شوند."
      />
      <Form.List name="slides">
        {(fields, { add, remove, move }) => (
          <div className="space-y-5">
            {fields.map((field, index) => (
              <Card
                key={field.key}
                title={`اسلاید ${index + 1}`}
                extra={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={index === 0 || pending}
                      onClick={() => move(index, index - 1)}
                    >
                      بالاتر
                    </Button>
                    <Button
                      disabled={index === fields.length - 1 || pending}
                      onClick={() => move(index, index + 1)}
                    >
                      پایین‌تر
                    </Button>
                    <Button
                      danger
                      disabled={fields.length <= 1 || pending}
                      onClick={() => remove(field.name)}
                    >
                      حذف اسلاید
                    </Button>
                  </div>
                }
              >
                <div className="grid gap-x-5 sm:grid-cols-2">
                  <Form.Item
                    name={[field.name, 'src']}
                    label="عکس دسکتاپ"
                    rules={[{ required: true }]}
                  >
                    <ImageField label={`عکس دسکتاپ اسلاید ${index + 1}`} />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'mobileSrc']}
                    label="عکس موبایل"
                    rules={[{ required: true }]}
                  >
                    <ImageField label={`عکس موبایل اسلاید ${index + 1}`} />
                  </Form.Item>
                  {textField([field.name, 'label'], 'نام اسلاید', 60)}
                  {textField([field.name, 'alt'], 'توضیح تصویر', 200)}
                  {textField([field.name, 'eyebrow'], 'متن بالای عنوان', 80)}
                  {textField([field.name, 'title'], 'عنوان', 60)}
                  {textField([field.name, 'subtitle'], 'زیرعنوان', 100)}
                  {textField([field.name, 'href'], 'پیوند دکمه', 200)}
                  {textField([field.name, 'action'], 'متن دکمه دسکتاپ', 60)}
                  {textField([field.name, 'mobileAction'], 'متن دکمه موبایل', 60)}
                </div>
                {textField([field.name, 'description'], 'متن اسلاید', 400, true)}
              </Card>
            ))}
            <Button
              disabled={fields.length >= 8 || pending}
              onClick={() =>
                add({ ...defaultHomepage.slides[0], label: `اسلاید ${fields.length + 1}` })
              }
            >
              افزودن اسلاید
            </Button>
          </div>
        )}
      </Form.List>
      <Card className="!mt-6" title="درباره ما">
        <div className="grid gap-x-5 sm:grid-cols-2">
          <Form.Item name={['story', 'src']} label="عکس دسکتاپ درباره ما">
            <ImageField label="عکس دسکتاپ درباره ما" />
          </Form.Item>
          <Form.Item name={['story', 'mobileSrc']} label="عکس موبایل درباره ما">
            <ImageField label="عکس موبایل درباره ما" />
          </Form.Item>
          {textField(['story', 'alt'], 'توضیح تصویر درباره ما', 200)}
          {textField(['story', 'title'], 'عنوان درباره ما', 100)}
          {textField(['story', 'subtitle'], 'زیرعنوان درباره ما', 100)}
          {textField(['story', 'location'], 'متن موقعیت', 100)}
          {textField(['story', 'action'], 'متن دکمه دسکتاپ درباره ما', 60)}
          {textField(['story', 'mobileAction'], 'متن دکمه موبایل درباره ما', 60)}
          {textField(['story', 'href'], 'پیوند دکمه درباره ما', 200)}
        </div>
        {textField(['story', 'description'], 'متن درباره ما', 1500, true)}
      </Card>
      {error && <Alert className="!mt-5" title={error} type="error" role="alert" />}
      <div className="sticky bottom-0 z-10 mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-[#e8ded1] bg-[#fffdf9] p-4">
        <Button type="primary" htmlType="submit" loading={pending}>
          ذخیره هیروسکشن و درباره ما
        </Button>
        <a
          href={import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
        >
          مشاهده سایت
        </a>
        <span className="text-xs text-[#7d746a]">
          {dirty ? 'تغییرات ذخیره نشده' : 'محتوای فعلی'}
        </span>
      </div>
    </Form>
  );
}
export default function Homepage() {
  const query = useAdminQuery(AdminHomepageContentDocument, {});
  return (
    <>
      <Typography.Title level={2}>مدیریت هیروسکشن و درباره ما</Typography.Title>
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
