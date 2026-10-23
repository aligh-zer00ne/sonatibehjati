import { useState } from 'react';
import { Alert, App, Button, Dropdown, Input, Select } from 'antd';
import {
  renderMessage,
  type MessageKind,
  type messageVariables,
} from '@behjati/shared/message-templates';
import { AdminMessageTemplatesDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import AdminIcon from './AdminIcon';
import RecordDialog from './RecordDialog';
import DataState from './DataState';
import { smsHref } from '../lib/customer-messages';

type Props = {
  kind: MessageKind;
  values: Partial<Record<keyof typeof messageVariables, string>>;
  phone?: string;
  onClose: () => void;
};
export default function CustomerMessage({ kind, values, phone = '', onClose }: Props) {
  const query = useAdminQuery(AdminMessageTemplatesDocument, {});
  const [selected, setSelected] = useState('');
  const [edited, setEdited] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);
  const { message } = App.useApp();
  const templates = query.data?.adminMessageTemplates.items.filter((v) => v.kind === kind) ?? [];
  const template = templates.find((v) => v.id === selected) ?? templates[0];
  const text =
    edited ??
    renderMessage(template?.body ?? '', {
      ...values,
      نام_فروشگاه: query.data?.adminMessageTemplates.storeName ?? '',
    });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      void message.success('متن کامل پیام و لینک یا رهگیری کپی شد.');
    } catch {
      setFallback(true);
    }
  };
  const share = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ text });
    } catch (e) {
      if (!(e instanceof Error && e.name === 'AbortError'))
        void message.error('اشتراک‌گذاری باز نشد؛ از گزینه‌های پیام‌رسان استفاده کنید.');
    }
  };
  return (
    <RecordDialog
      title={kind === 'PAYMENT' ? 'ارسال لینک پرداخت' : 'پیام ارسال سفارش'}
      subtitle="قالب را انتخاب کنید؛ متن آماده را از گوشی یا پیام‌رسان بفرستید."
      icon="message"
      onClose={onClose}
      width={650}
    >
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : !template ? (
        <Alert
          type="info"
          title="برای این پیام قالبی تعریف نشده است."
          description="از مدیریت ← قالب پیام‌ها، یک قالب اضافه کنید."
        />
      ) : (
        <div className="space-y-4">
          <label className="block space-y-2 text-sm font-bold">
            قالب پیام
            <Select
              aria-label="قالب پیام"
              className="!w-full"
              value={template.id}
              options={templates.map((v) => ({ value: v.id, label: v.title }))}
              onChange={(id) => {
                setSelected(id);
                setEdited(null);
              }}
            />
          </label>
          {phone && (
            <p className="rounded-xl bg-[#faf6ee] px-3 py-2 text-sm">
              گیرنده: <bdi>{phone}</bdi>
            </p>
          )}
          <div className="rounded-2xl border border-[#e4d3b3] bg-[#faf6ee] p-3">
            <Input.TextArea
              aria-label="متن آماده پیام"
              value={text}
              maxLength={3000}
              autoSize={{ minRows: 5, maxRows: 12 }}
              showCount
              onChange={(e) => setEdited(e.target.value)}
              className="!border-0 !bg-transparent !text-[15px] !leading-8"
            />
          </div>
          {fallback && (
            <Alert
              type="info"
              title="دسترسی کپی در این مرورگر بسته است؛ متن بالا را انتخاب و کپی کنید."
            />
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            {smsHref(phone, text) && (
              <Button
                type="primary"
                href={smsHref(phone, text)}
                disabled={!text.trim()}
                icon={<AdminIcon name="message" />}
              >
                باز کردن پیامک گوشی
              </Button>
            )}
            <Button
              onClick={() => void copy()}
              disabled={!text.trim()}
              icon={<AdminIcon name="copy" />}
            >
              {kind === 'PAYMENT' ? 'کپی لینک با متن قالب' : 'کپی متن و رهگیری'}
            </Button>
            {typeof navigator.share === 'function' && (
              <Button
                onClick={() => void share()}
                disabled={!text.trim()}
                icon={<AdminIcon name="share" />}
              >
                ارسال در پیام‌رسان
              </Button>
            )}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'whatsapp',
                    label: (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
                      >
                        واتساپ
                      </a>
                    ),
                  },
                  {
                    key: 'telegram',
                    label: (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://t.me/share/url?url=${encodeURIComponent(kind === 'PAYMENT' ? (values.لینک_پرداخت ?? '') : '')}&text=${encodeURIComponent(kind === 'PAYMENT' && values.لینک_پرداخت ? text.replace(values.لینک_پرداخت, '').trim() : text)}`}
                      >
                        تلگرام
                      </a>
                    ),
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button disabled={!text.trim()} icon={<AdminIcon name="share" />}>
                پیام‌رسان‌ها
              </Button>
            </Dropdown>
          </div>
          <p className="text-[13px] leading-6 text-[#796653]">
            ارسال نهایی در برنامهٔ گوشی انجام می‌شود؛ باز کردن برنامه، تأیید ارسال پیام نیست.
          </p>
        </div>
      )}
    </RecordDialog>
  );
}
