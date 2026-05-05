import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuthStore, useOrderStore } from '../stores/StoreContext';

const ProfilePage = observer(() => {
  const auth = useAuthStore();
  const orders = useOrderStore();

  useEffect(() => {
    auth.fetchMe();
    orders.fetchMyOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const user = auth.user;
  if (!user) return <div className="loading container">Загрузка профиля…</div>;

  return (
    <div className="container">
      <h1>Профиль</h1>
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar">{(user.name ?? user.email ?? '?').slice(0, 1).toUpperCase()}</div>
          <div className="profile-details">
            <h2>{user.name ?? '—'}</h2>
            <p className="profile-email">{user.email}</p>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
            <p className="profile-since">Клиент с {new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{orders.myOrders.length}</div><div className="stat-label">Заказов</div></div>
          <div className="stat-card"><div className="stat-value">{orders.totalSpent.toLocaleString('ru-RU')} ₽</div><div className="stat-label">Потрачено</div></div>
          <div className="stat-card"><div className="stat-value">{orders.deliveredCount}</div><div className="stat-label">Доставлено</div></div>
        </div>
        <div className="profile-section">
          <h3>Последние заказы</h3>
          {orders.isLoading ? <div className="loading">Загрузка…</div>
            : orders.myOrders.length === 0 ? <p>Заказов нет</p>
            : (
              <div className="orders-list">
                {orders.myOrders.slice(0, 3).map((order) => (
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
});

export default ProfilePage;
