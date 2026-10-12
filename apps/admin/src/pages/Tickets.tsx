import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Modal, Select, Table, Tag, Typography } from 'antd';
import { formatDate } from '@behjati/shared';
import {
  AdminTicketsDocument,
  AdminTicketDocument,
  ReplyAdminTicketDocument,
  SetAdminTicketStatusDocument,
  type TicketStatus,
} from '../generated/graphql';
import { adminRequest } from '../lib/client';
import { useAdminQuery } from '../hooks/useAdminQuery';
import DataState from '../components/DataState';
const statuses = [
  { value: 'OPEN', label: 'منتظر پاسخ' },
  { value: 'IN_PROGRESS', label: 'در حال پیگیری' },
  { value: 'CLOSED', label: 'بسته' },
];
export default function Tickets() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TicketStatus | undefined>();
  const [id, setId] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const list = useAdminQuery(AdminTicketsDocument, { input: { page, pageSize: 20, status } });
  const detail = useAdminQuery(AdminTicketDocument, { id }, Boolean(id));
  const ticket = detail.data?.adminTicket;
  async function changeStatus(value: TicketStatus) {
    if (!ticket) return;
    setPending(true);
    setError('');
    try {
      await adminRequest(SetAdminTicketStatusDocument, {
        id,
        status: value,
        expectedUpdatedAt: ticket.updatedAt,
      });
      detail.refresh();
      list.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تغییر انجام نشد.');
      detail.refresh();
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Typography.Title level={2}>پشتیبانی و تیکت‌ها</Typography.Title>
      <Card>
        <Select
          aria-label="وضعیت تیکت"
          className="w-full sm:w-56"
          placeholder="همه وضعیت‌ها"
          allowClear
          value={status}
          options={statuses}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </Card>
      {!list.data ? (
        <DataState error={list.error} retry={list.refresh} />
      ) : (
        <Card>
          <Table
            rowKey="id"
            dataSource={list.data.adminTickets.items}
            scroll={{ x: 750 }}
            pagination={{
              current: page,
              pageSize: 20,
              total: list.data.adminTickets.total,
              showSizeChanger: false,
              onChange: setPage,
            }}
            columns={[
              { title: 'موضوع', dataIndex: 'subject' },
              { title: 'مشتری', dataIndex: 'customerName' },
              { title: 'سفارش', dataIndex: 'orderNumber' },
              {
                title: 'وضعیت',
                render: (_, row) => (
                  <Tag
                    color={
                      row.status === 'OPEN' ? 'red' : row.status === 'CLOSED' ? 'default' : 'blue'
                    }
                  >
                    {statuses.find((s) => s.value === row.status)?.label}
                  </Tag>
                ),
              },
              { title: 'آخرین تغییر', render: (_, row) => formatDate(row.updatedAt) },
              {
                title: 'عملیات',
                render: (_, row) => (
                  <Button
                    onClick={() => {
                      setId(row.id);
                      setError('');
                      form.resetFields();
                    }}
                  >
                    مشاهده و پاسخ
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      )}
      <Modal
        title={ticket?.subject ?? 'تیکت'}
        open={Boolean(id)}
        onCancel={() => {
          if (!pending) setId('');
        }}
        footer={null}
        width={760}
        destroyOnHidden
      >
        {!ticket ? (
          <DataState error={detail.error} retry={detail.refresh} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {ticket.customerName}
                {ticket.orderNumber ? ` — سفارش ${ticket.orderNumber}` : ''}
              </span>
              <Select
                aria-label="تغییر وضعیت تیکت"
                className="w-44"
                value={ticket.status}
                disabled={pending}
                options={statuses}
                onChange={(value) => void changeStatus(value)}
              />
            </div>
            <div className="flex max-h-[45dvh] flex-col gap-3 overflow-y-auto rounded-lg border border-[#e8ded1] p-3">
              {ticket.messages.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg p-3 ${item.fromSupport ? 'mr-6 bg-[#f9e8e5]' : 'ml-6 bg-[#f6f1e9]'}`}
                >
                  <p className="mb-2 text-xs text-[#7d746a]">
                    {item.fromSupport ? 'پشتیبانی' : 'مشتری'} · {formatDate(item.createdAt)}
                  </p>
                  <p className="break-words whitespace-pre-wrap">{item.body}</p>
                </div>
              ))}
            </div>
            {error && <Alert type="error" title={error} role="alert" />}
            {ticket.status === 'CLOSED' ? (
              <Alert
                type="info"
                title="تیکت بسته است. برای پاسخ‌دادن وضعیت آن را به در حال پیگیری تغییر دهید."
              />
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={async ({ body }) => {
                  setPending(true);
                  setError('');
                  try {
                    await adminRequest(ReplyAdminTicketDocument, { input: { id, body } });
                    form.resetFields();
                    detail.refresh();
                    list.refresh();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'پاسخ ارسال نشد.');
                  } finally {
                    setPending(false);
                  }
                }}
              >
                <Form.Item
                  name="body"
                  label="پاسخ پشتیبانی"
                  rules={[{ required: true, whitespace: true, message: 'پاسخ را وارد کنید.' }]}
                >
                  <Input.TextArea maxLength={4000} rows={4} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={pending}>
                  ارسال پاسخ
                </Button>
              </Form>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
