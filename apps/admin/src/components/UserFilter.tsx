import { useState, useEffect } from 'react';
import { Select } from 'antd';
import { AdminUsersDocument, AdminSelectedUserDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { customerName, persianDigits } from '../lib/format';
export default function UserFilter({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (value: string | null) => void;
}) {
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(term), 300);
    return () => clearTimeout(timer);
  }, [term]);
  const users = useAdminQuery(AdminUsersDocument, { input: { page: 1, pageSize: 20, search } });
  const selected = useAdminQuery(AdminSelectedUserDocument, { id: value ?? '' }, Boolean(value));
  const items = [...(users.data?.adminUsers.items ?? [])];
  if (selected.data && !items.some((user) => user.id === selected.data!.adminUser.id))
    items.unshift(selected.data.adminUser);
  return (
    <Select
      className="w-full"
      getPopupContainer={(node) => node.parentElement ?? document.body}
      aria-label="فیلتر کاربر"
      placeholder="نام یا موبایل مشتری"
      value={value || undefined}
      allowClear
      showSearch
      filterOption={false}
      onSearch={setTerm}
      loading={!users.data && !users.error}
      onChange={(value) => onChange(value ?? null)}
      options={items.map((user) => ({
        value: user.id,
        label: `${customerName(user)} — ${persianDigits(user.phone)}`,
      }))}
      notFoundContent={users.error || 'کاربری یافت نشد'}
    />
  );
}
