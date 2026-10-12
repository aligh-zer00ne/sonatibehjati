import { adminLanding } from '@behjati/shared/permissions';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from './AdminProvider';
export default function OwnerOnly() {
  const { admin } = useAdmin();
  return admin?.role === 'OWNER' ? (
    <Outlet />
  ) : (
    <Navigate to={admin ? adminLanding(admin) : '/login'} replace />
  );
}
