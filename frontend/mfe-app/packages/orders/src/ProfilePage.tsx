import { Link } from 'react-router-dom';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  useAppSelector,
  useGetMeQuery,
  useGetMyOrdersQuery,
} from '@sportshop/mfe-store';

export default function ProfilePage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userFromStore = useAppSelector(selectCurrentUser);
  const {
    data: userFromApi,
    isLoading: meLoading,
    isError: meError,
    refetch: refetchMe,
  } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined, { skip: !isAuthenticated });
  const user = userFromApi ?? userFromStore;

  if (meLoading && !user) return <div className="loading container">Загрузка профиля…</div>;
  if (meError && !user) {
    return (
      <div className="container">
        <div className="alert alert-error">Не удалось загрузить профиль. Войдите снова или повторите запрос.</div>
        <p>
          <button type="button" className="btn btn-outline" onClick={() => void refetchMe()}>
            Повторить
          </button>{' '}
          <Link to="/login" className="btn btn-primary">
            На страницу входа
          </Link>
        </p>
      </div>
    );
  }
  if (!user) return <div className="loading container">Загрузка профиля…</div>;

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="container">
      <h1>Профиль</h1>
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar">
            {(user.name ?? user.email ?? '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="profile-details">
            <h2>{user.name ?? '—'}</h2>
            <p className="profile-email">{user.email}</p>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
            <p className="profile-since">Клиент с {new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Заказов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalSpent.toLocaleString('ru-RU')} ₽</div>
            <div className="stat-label">Потрачено</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{deliveredCount}</div>
            <div className="stat-label">Доставлено</div>
          </div>
        </div>
        <div className="profile-section">
          <h3>Последние заказы</h3>
          {isLoading ? (
            <div className="loading">Загрузка…</div>
          ) : orders.length === 0 ? (
            <p>Заказов нет</p>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="order-card order-card-compact">
                  <div className="order-header">
                    <span className="order-id">Заказ #{order.id}</span>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </div>
                  <div className="order-footer">
                    <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    <strong>{order.total.toLocaleString('ru-RU')} ₽</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
