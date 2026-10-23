import type { TextAreaRef } from 'antd/es/input/TextArea';
import { useRef, useState } from 'react';
import { useBeforeUnload } from 'react-router-dom';
import { Alert, App, Button, Input, Popconfirm, Radio } from 'antd';
import {
  defaultMessageTemplates,
  messageTemplatesSchema,
  messageVariables,
  renderMessage,
  variablesFor,
  type MessageKind,
  type MessageTemplate,
} from '@behjati/shared/message-templates';
import {
  AdminMessageTemplatesDocument,
  SaveAdminMessageTemplatesDocument,
  type MessageTemplateSettingsFieldsFragment,
} from '../generated/graphql';
import { adminRequest } from '../lib/client';
import { useAdminQuery } from '../hooks/useAdminQuery';
import PageHeading from '../components/PageHeading';
import AdminIcon from '../components/AdminIcon';
import DataState from '../components/DataState';

function Editor({
  initial,
  refresh,
}: {
  initial: MessageTemplateSettingsFieldsFragment;
  refresh: () => void;
}) {
  const [items, setItems] = useState<MessageTemplate[]>(initial.items);
  const [saved, setSaved] = useState(JSON.stringify(initial.items));
  const [version, setVersion] = useState(initial.updatedAt);
  const [active, setActive] = useState(initial.items[0]?.id ?? '');
  const [kind, setKind] = useState<MessageKind>(initial.items[0]?.kind ?? 'PAYMENT');
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const lock = useRef(false);
  const textarea = useRef<TextAreaRef>(null);
  const { message, modal } = App.useApp();
  const dirty = saved !== JSON.stringify(items);
  const current = items.find((v) => v.id === active);
  const update = (value: Partial<MessageTemplate>) =>
    setItems((all) => all.map((v) => (v.id === active ? { ...v, ...value } : v)));
  useBeforeUnload((e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  const preview = renderMessage(current?.body ?? '', {
    نام_مشتری: 'علی محمدی',
    نام_فروشگاه: initial.storeName,
    مبلغ: '۲٬۵۰۰٬۰۰۰ ریال',
    لینک_پرداخت: 'https://sonatibehjati.ir/pay/…',
    شماره_سفارش: '۱۲۳',
    روش_ارسال: 'تیپاکس',
    کد_رهگیری: '123456789012',
  });
  const save = async () => {
    if (lock.current) return;
    const parsed = messageTemplatesSchema.safeParse(items);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'قالب‌ها را بررسی کنید.');
      return;
    }
    lock.current = true;
    setPending(true);
    setError('');
    try {
      const data = (
        await adminRequest(SaveAdminMessageTemplatesDocument, {
          items: parsed.data,
          expectedUpdatedAt: version,
        })
      ).saveAdminMessageTemplates;
      setItems(data.items);
      setSaved(JSON.stringify(data.items));
      setVersion(data.updatedAt);
      void message.success('قالب پیام‌ها ذخیره شد.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ذخیره انجام نشد.');
    } finally {
      lock.current = false;
      setPending(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Radio.Group
          value={kind}
          onChange={(e) => {
            const value = e.target.value as MessageKind;
            setKind(value);
            setActive(items.find((v) => v.kind === value)?.id ?? '');
          }}
          optionType="button"
          options={[
            { value: 'PAYMENT', label: 'لینک پرداخت' },
            { value: 'SHIPPING', label: 'ارسال سفارش' },
          ]}
        />
        <Button
          disabled={pending || items.length >= 50}
          icon={<AdminIcon name="plus" />}
          onClick={() => {
            const entry = {
              ...defaultMessageTemplates.find((v) => v.kind === kind)!,
              id: crypto.randomUUID(),
              title: 'قالب جدید',
            };
            setItems((all) => [...all, entry]);
            setActive(entry.id);
          }}
        >
          قالب جدید
        </Button>
      </div>
      <nav aria-label="قالب‌های پیام" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items
          .filter((v) => v.kind === kind)
          .map((v) => (
            <button
              disabled={pending}
              key={v.id}
              type="button"
              aria-pressed={active === v.id}
              onClick={() => setActive(v.id)}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e6dbc9] bg-white p-3 text-start aria-pressed:border-[#b78343] aria-pressed:bg-[#faf0de]"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#701e2a] text-[#f6dfa0]">
                <AdminIcon name={kind === 'PAYMENT' ? 'link' : 'truck'} />
              </span>
              <span className="min-w-0">
                <b className="block text-base text-[#4e141c]">{v.title || 'بدون عنوان'}</b>
                <span className="mt-1 line-clamp-2 text-[13px] leading-6 text-[#796653]">
                  {v.body}
                </span>
              </span>
            </button>
          ))}
      </nav>
      {!current ? (
        <Alert type="info" title="یک قالب جدید بسازید." />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
          <section className="min-w-0 space-y-4 rounded-[24px] border border-[#e6dbc9] bg-white p-4 sm:p-5">
            <label className="block space-y-2 font-bold">
              عنوان قالب
              <Input
                aria-label="عنوان قالب"
                maxLength={80}
                value={current.title}
                disabled={pending}
                onChange={(e) => update({ title: e.target.value })}
              />
            </label>
            <label className="block space-y-2 font-bold">
              متن پیام
              <Input.TextArea
                ref={textarea}
                aria-label="متن قالب"
                value={current.body}
                maxLength={1600}
                showCount
                disabled={pending}
                autoSize={{ minRows: 7, maxRows: 15 }}
                className="!text-[15px] !leading-8"
                onChange={(e) => update({ body: e.target.value })}
              />
            </label>
            <div className="flex flex-wrap gap-2 pt-3" aria-label="جای‌گذارهای پیام">
              {variablesFor(kind).map((key) => (
                <Button
                  key={key}
                  disabled={pending}
                  onClick={() => {
                    const field = textarea.current?.resizableTextArea?.textArea;
                    const start = field?.selectionStart ?? current.body.length;
                    const end = field?.selectionEnd ?? start;
                    const token = `{${key}}`;
                    update({
                      body: current.body.slice(0, start) + token + current.body.slice(end),
                    });
                    requestAnimationFrame(() => {
                      field?.focus();
                      field?.setSelectionRange(start + token.length, start + token.length);
                    });
                  }}
                >
                  {messageVariables[key]}
                </Button>
              ))}
            </div>
            <Popconfirm
              title="این قالب حذف شود؟"
              okText="حذف"
              cancelText="انصراف"
              onConfirm={() => {
                const next = items.filter((v) => v.id !== active);
                setItems(next);
                setActive(next.find((v) => v.kind === kind)?.id ?? '');
              }}
            >
              <Button danger disabled={pending} icon={<AdminIcon name="trash" />}>
                حذف قالب
              </Button>
            </Popconfirm>
          </section>
          <aside className="min-w-0 rounded-[24px] border border-[#e6dbc9] bg-[#faf6ee] p-4 lg:sticky lg:top-36">
            <h2 className="mb-3 flex items-center gap-2 font-extrabold">
              <AdminIcon name="phone" /> پیش‌نمایش پیام
            </h2>
            <div
              data-message-preview
              className="rounded-2xl rounded-tr-sm bg-[#701e2a] p-4 text-[15px] leading-8 whitespace-pre-wrap text-[#fff5e1] [overflow-wrap:anywhere]"
            >
              {preview}
            </div>
            <p className="mt-3 text-[13px] leading-6 text-[#796653]">
              اطلاعات بالا نمونه‌اند. هنگام ارسال، مشخصات واقعی مشتری و سفارش جای‌گذاری می‌شوند.
            </p>
          </aside>
        </div>
      )}
      {error && <Alert type="error" role="alert" title={error} />}
      <footer className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dcc69f] bg-white/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="text-sm text-[#796653]">
          {dirty ? 'تغییرها هنوز ذخیره نشده‌اند' : `${items.length} قالب ذخیره‌شده`}
        </p>
        <div className="flex min-w-0 flex-wrap gap-2">
          <Button
            disabled={pending}
            onClick={() =>
              dirty
                ? modal.confirm({
                    title: 'ویرایش‌ها کنار گذاشته شوند؟',
                    okText: 'دریافت نسخه جدید',
                    cancelText: 'ادامه ویرایش',
                    onOk: refresh,
                  })
                : refresh()
            }
          >
            دریافت نسخه جدید
          </Button>
          <Button
            type="primary"
            loading={pending}
            disabled={!dirty}
            icon={<AdminIcon name="check" />}
            onClick={() => void save()}
          >
            ذخیره قالب‌ها
          </Button>
        </div>
      </footer>
    </div>
  );
}
export default function MessageTemplates() {
  const query = useAdminQuery(AdminMessageTemplatesDocument, {});
  return (
    <>
      <PageHeading
        icon="message"
        description="قالب‌های قابل انتخاب برای لینک پرداخت و اطلاع‌رسانی ارسال؛ پیامک از گوشی شما باز می‌شود."
      >
        قالب پیام‌ها
      </PageHeading>
      {query.data ? (
        <Editor
          key={query.data.adminMessageTemplates.updatedAt ?? 'default'}
          initial={query.data.adminMessageTemplates}
          refresh={query.refresh}
        />
      ) : (
        <DataState error={query.error} retry={query.refresh} />
      )}
    </>
  );
}
