import { Button } from 'antd';
import { Link, useParams } from 'react-router-dom';
import OrderDetailsCard from '../components/OrderDetailsCard';
import AdminIcon from '../components/AdminIcon';

export default function OrderDetails() {
  const { id = '' } = useParams();
  return (
    <div className="space-y-4">
      <Link to="/admin/orders">
        <Button icon={<AdminIcon name="arrow" />}>بازگشت به سفارش‌ها</Button>
      </Link>
      <div className="overflow-hidden rounded-3xl border border-[#e8ded1] bg-[#fcf9f3] shadow-sm">
        <OrderDetailsCard id={id} />
      </div>
    </div>
  );
}
