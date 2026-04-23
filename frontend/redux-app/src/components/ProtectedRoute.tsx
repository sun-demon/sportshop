import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectIsAuthenticated } from '../features/authSlice';

interface Props { adminOnly?: boolean; }

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector((s) => s.auth.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
