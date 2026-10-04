import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Alert, Button, Skeleton } from 'antd';
import { useAdmin } from './AdminProvider';
export default function ProtectedAdmin() {
  const { admin, loading, error, refresh } = useAdmin();
  const location = useLocation();
  if (error)
    return (
      <div className="mx-auto max-w-lg p-6">
        <Alert
          type="error"
          title={error}
          showIcon
          action={<Button onClick={() => void refresh()}>تلاش دوباره</Button>}
        />
      </div>
    );
  if (loading)
    return (
      <div className="p-8">
        <Skeleton active />
      </div>
    );
  if (!admin)
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  return <Outlet key={admin.id} />;
}
