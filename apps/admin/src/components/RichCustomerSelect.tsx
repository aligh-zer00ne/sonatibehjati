import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { AdminOrderCustomersDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { customerName, persianDigits } from '../lib/format';
import AdminIcon from './AdminIcon';
import { Money } from './Money';
import AccountStatus from './AccountStatus';
type Customer = {
  id: string;
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  accountBalance?: number;
};
export default function RichCustomerSelect({
  value,
  onChange,
  disabled,
  id,
  selected,
}: {
  value?: string;
  onChange?: (id: string) => void;
  disabled?: boolean;
  id?: string;
  selected?: Customer | null;
}) {
  const [term, setTerm] = useState(''),
    [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(term), 250);
    return () => clearTimeout(timer);
  }, [term]);
  const query = useAdminQuery(AdminOrderCustomersDocument, {
    input: { search, page: 1, pageSize: 20 },
  });
  const users: Customer[] = [...(query.data?.adminOrderCustomers.items ?? [])];
  if (selected && !users.some((u) => u.id === selected.id)) users.unshift(selected);
  return (
    <Select
      id={id}
      aria-label="جستجوی مشتری"
      value={value || undefined}
      onChange={onChange}
      disabled={disabled}
      showSearch
      filterOption={false}
      onSearch={setTerm}
      loading={query.refreshing}
      placeholder="جستجو با نام یا شماره موبایل…"
      className="!h-[52px] w-full"
      notFoundContent={
        query.error
          ? 'دریافت مشتریان انجام نشد. دوباره جستجو کنید.'
          : query.refreshing
            ? 'در حال جستجو…'
            : 'مشتری پیدا نشد.'
      }
      options={users.map((u) => ({
        value: u.id,
        label: `${customerName(u)} · ${u.phone}`,
        user: u,
      }))}
      optionRender={(option) => {
        const u = option.data.user;
        return (
          <div className="flex min-h-16 items-center gap-3 py-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#f6dfa0,#c49536)] text-[#76100b]">
              <AdminIcon name="person" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold">{customerName(u)}</p>
              <p className="mt-1 text-xs text-[#857467]">
                <bdi>{persianDigits(u.phone)}</bdi>
              </p>
            </div>
            {u.accountBalance !== undefined && (
              <div className="shrink-0 text-xs">
                <AccountStatus balance={u.accountBalance} amount={false} />
                <Money compact amount={Math.abs(u.accountBalance)} />
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
