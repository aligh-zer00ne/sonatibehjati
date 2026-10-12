import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from './AdminProvider';
export default function OwnerOnly() {
  const { admin } = useAdmin();
  return admin?.role === 'OWNER' ? <Outlet /> : <Navigate to="/admin/orders" replace />;
}
