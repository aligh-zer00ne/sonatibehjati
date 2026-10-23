import { useNavigate, useParams } from 'react-router-dom';
import Orders from './Orders';

export default function OrderDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  return (
    <Orders
      key={id}
      initialOrderId={id}
      onInitialClose={() => navigate('/admin/orders', { replace: true })}
    />
  );
}
