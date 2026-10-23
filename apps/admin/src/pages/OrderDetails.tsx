import { Button } from 'antd';
import { Link, useParams } from 'react-router-dom';
import OrderDetailsCard from '../components/OrderDetailsCard';
import AdminIcon from '../components/AdminIcon';
import PageHeading from '../components/PageHeading';

export default function OrderDetails() {
  const { id = '' } = useParams();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading icon="orders" description="اقلام، وضعیت و اسناد این سفارش.">
          جزئیات سفارش
        </PageHeading>
        <Link to="/admin/orders">
          <Button icon={<AdminIcon name="arrow" />}>بازگشت به سفارش‌ها</Button>
        </Link>
      </div>
      <div className="overflow-hidden rounded-3xl border border-[#e8ded1] bg-[#fcf9f3] shadow-sm">
        <OrderDetailsCard id={id} />
      </div>
    </div>
  );
}
