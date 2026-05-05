import { observer } from 'mobx-react-lite';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/StoreContext';

interface Props { adminOnly?: boolean; }

const ProtectedRoute = observer(({ adminOnly = false }: Props) => {
  const auth = useAuthStore();
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly) {
    if (auth.isFetchingUser || auth.user === null) {
      return <div className="loading container">Проверка прав доступа…</div>;
    }
    if (!auth.isAdmin) return <Navigate to="/" replace />;
  }
  return <Outlet />;
});

export default ProtectedRoute;
