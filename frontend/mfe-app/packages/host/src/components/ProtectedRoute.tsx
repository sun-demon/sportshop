import { observer } from 'mobx-react-lite';
import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../stores/authStore';

interface Props {
  adminOnly?: boolean;
}

const ProtectedRoute = observer(({ adminOnly = false }: Props) => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !authStore.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
});

export default ProtectedRoute;
