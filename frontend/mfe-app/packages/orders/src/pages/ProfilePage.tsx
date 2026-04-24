import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { orderStore } from '../stores/OrderStore';
import type { IOrder } from '../types';

const STATUS_LABELS: Record<IOrder['status'], string> = {
  pending:   'Ожидает',
  paid:      'Оплачен',
  shipped:   'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const STATUS_ICONS: Record<IOrder['status'], string> = {
  pending:   '🕐',
  paid:      '💳',
  shipped:   '🚚',
  delivered: '✅',
  cancelled: '❌',
};

const ProfilePage = observer(() => {
  useEffect(() => {
    orderStore.fetchMe();
    orderStore.fetchMyOrders();
  }, []);

  const user = orderStore.user;
  if (!user) return <div className="loading">Загрузка профиля…</div>;

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <div className="container">
      <h1>Профиль</h1>

      <div className="profile-layout">

        {/* ── Карточка пользователя ── */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">{initials}</div>
          <div className="profile-hero-info">
            <h2>{user.name ?? '—'}</h2>
            <p className="profile-email">✉️ {user.email}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
              <span className="profile-since">
                Клиент с {new Date(user.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Статистика ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🛍️</div>
            <div className="stat-value">{orderStore.myOrders.length}</div>
            <div className="stat-label">Всего заказов</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">{orderStore.totalSpent.toLocaleString('ru-RU')} ₽</div>
            <div className="stat-label">Потрачено</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{orderStore.deliveredCount}</div>
            <div className="stat-label">Доставлено</div>
          </div>
        </div>

        {/* ── Последние заказы ── */}
        <div className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Последние заказы</h3>
            <Link to="/orders" className="btn btn-outline btn-sm">Все заказы →</Link>
          </div>

          {orderStore.isLoading && <div className="loading">Загрузка…</div>}

          {!orderStore.isLoading && orderStore.myOrders.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>Заказов пока нет</p>
              <Link to="/catalog" className="btn btn-primary btn-sm">Перейти в каталог</Link>
            </div>
          )}

          <div className="orders-list">
            {orderStore.myOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="order-card order-card-compact">
                <div className="order-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="order-number">#{order.id}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <span className={`status-badge status-${order.status}`}>
                    {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Товары заказа */}
                <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: '6px 0' }}>
                  {order.items.map((item) => (
                    <span key={item.id} style={{ marginRight: 8 }}>
                      {item.product?.name ?? `Товар #${item.productId}`} ×{item.quantity}
                    </span>
                  ))}
                </div>

                <div className="order-footer">
                  <strong>{order.total.toLocaleString('ru-RU')} ₽</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
});

export default ProfilePage;
