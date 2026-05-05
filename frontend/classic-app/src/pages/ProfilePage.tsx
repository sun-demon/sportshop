import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMyOrders } from '../services/api';
import type { IOrder } from '@sportshop/shared-types';

export default function ProfilePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyOrders()
      .then(({ data }) => {
        if (!cancelled) setOrders(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return <div className="loading container">Загрузка профиля…</div>;

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const STATUS_LABELS: Record<IOrder['status'], string> = {
    pending: 'Ожидает',
    paid: 'Оплачен',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };

  return (
    <div className="container">
      <h1>Профиль</h1>
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar">{(user.name ?? user.email)[0].toUpperCase()}</div>
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
          {loading ? (
            <div className="loading">Загрузка…</div>
          ) : orders.length === 0 ? (
            <p>Заказов нет</p>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="order-card order-card-compact">
                  <div className="order-header">
                    <span className="order-id">Заказ #{order.id}</span>
                    <span className={`status-badge status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
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
