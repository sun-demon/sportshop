import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectIsAuthenticated } from '../features/authSlice';
import { useGetMeQuery } from '../api/sportshopApi';

interface Props { adminOnly?: boolean; }

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector((s) => s.auth.user);
  const me = useGetMeQuery(undefined, { skip: !isAuthenticated });

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly) {
    if (me.isError) return <Navigate to="/login" replace />;
    if (me.isLoading || user === null) {
      return <div className="loading container">Проверка прав доступа…</div>;
    }
    if (user.role !== 'admin') return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
