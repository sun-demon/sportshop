import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/authStore';
import client from '../api/client';

interface IOrder {
  id: number;
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Ожидает',
  paid:      'Оплачен',
  shipped:   'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const HomePage = observer(() => {
  const [orders, setOrders]   = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!authStore.isAuthenticated || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    client.get<IOrder[]>('/orders/my')
      .then((r) => setOrders(r.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authStore.isAuthenticated]);

  const user = authStore.user;

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <h1>Добро пожаловать в Sportshop</h1>
          <p>Лучшие спортивные товары по доступным ценам</p>
          {authStore.isAuthenticated ? (
            <Link to="/catalog" className="btn btn-primary btn-lg">
              Перейти в каталог
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary btn-lg">Войти</Link>
              <Link to="/register" className="btn btn-outline btn-lg"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Контент для авторизованных */}
      {authStore.isAuthenticated && (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 40 }}>
          <div className="home-grid">

            {/* Мини-профиль */}
            <div className="home-card">
              <div className="home-card-header">
                <span>👤</span>
                <h3>Профиль</h3>
              </div>
              {user ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div className="profile-avatar" style={{ width: 52, height: 52, fontSize: '1.4rem' }}>
                      {(user.name ?? user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.name ?? '—'}</div>
                      <div style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <span className={`role-badge role-${user.role}`} style={{ marginLeft: 0, marginTop: 4, display: 'inline-block' }}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                    Клиент с {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </>
              ) : (
                <div className="loading" style={{ padding: '16px 0' }}>Загрузка…</div>
              )}
              <Link to="/profile" className="btn btn-outline btn-full btn-sm">
                Открыть профиль →
              </Link>
            </div>

            {/* Последние заказы */}
            <div className="home-card">
              <div className="home-card-header">
                <span>📦</span>
                <h3>Последние заказы</h3>
              </div>

              {loading && <div className="loading" style={{ padding: '16px 0' }}>Загрузка…</div>}

              {!loading && orders.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: 16 }}>
                  Заказов пока нет
                </p>
              )}

              {orders.map((order) => (
                <div key={order.id} className="home-order-row">
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '.9rem' }}>Заказ #{order.id}</span>
                    <span className={`status-badge status-${order.status}`} style={{ marginLeft: 8 }}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '.85rem', color: 'var(--text-muted)' }}>
                    <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    <strong style={{ color: 'var(--text)' }}>{order.total.toLocaleString('ru-RU')} ₽</strong>
                  </div>
                </div>
              ))}

              <Link to="/orders" className="btn btn-outline btn-full btn-sm" style={{ marginTop: 8 }}>
                Все заказы →
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
});

export default HomePage;
