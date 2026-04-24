import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { orderStore } from '../stores/OrderStore';
import type { IOrder } from '../types';

const STATUS_LABELS: Record<IOrder['status'], string> = {
  pending:   'Ожидает оплаты',
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

const STATUS_NEXT: Partial<Record<IOrder['status'], IOrder['status']>> = {
  pending: 'paid',
  paid:    'shipped',
  shipped: 'delivered',
};

type FilterStatus = 'all' | IOrder['status'];

const OrdersPage = observer(() => {
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    orderStore.fetchMe().then(() => {
      orderStore.isAdmin ? orderStore.fetchAllOrders() : orderStore.fetchMyOrders();
    });
  }, []);

  const rawList = orderStore.isAdmin ? orderStore.allOrders : orderStore.myOrders;
  const list    = filter === 'all' ? rawList : rawList.filter((o) => o.status === filter);

  async function handleStatusChange(id: number, status: IOrder['status']) {
    try { await orderStore.updateOrderStatus(id, status); }
    catch { alert('Не удалось обновить статус'); }
  }

  return (
    <div className="container">
      {/* Заголовок */}
      <div className="page-header">
        <h1>{orderStore.isAdmin ? 'Все заказы' : 'Мои заказы'}</h1>
        {!orderStore.isAdmin && (
          <Link to="/catalog" className="btn btn-primary btn-sm">+ В каталог</Link>
        )}
      </div>

      {/* Фильтр по статусу */}
      {rawList.length > 0 && (
        <div className="status-filter">
          {(['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              className={`status-filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? `Все (${rawList.length})` : `${STATUS_ICONS[s]} ${STATUS_LABELS[s]}`}
            </button>
          ))}
        </div>
      )}

      {/* Состояния */}
      {orderStore.isLoading && <div className="loading">Загрузка…</div>}

      {!orderStore.isLoading && rawList.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>Заказов пока нет</p>
          <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
        </div>
      )}

      {!orderStore.isLoading && rawList.length > 0 && list.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>Нет заказов с таким статусом</p>
        </div>
      )}

      {/* Список заказов */}
      <div className="orders-list">
        {list.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="order-number">#{order.id}</span>
                {orderStore.isAdmin && order.user && (
                  <span className="order-user">{order.user.email}</span>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              <span className={`status-badge status-${order.status}`}>
                {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status]}
              </span>
            </div>

            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <span className="order-item-name">
                    {item.product?.name ?? `Товар #${item.productId}`}
                  </span>
                  <span className="order-item-qty">{item.quantity} шт.</span>
                  <span className="order-item-price">
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <span className="order-total">
                Итого: <strong>{order.total.toLocaleString('ru-RU')} ₽</strong>
              </span>
              {orderStore.isAdmin && STATUS_NEXT[order.status] && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleStatusChange(order.id, STATUS_NEXT[order.status]!)}
                >
                  {STATUS_ICONS[STATUS_NEXT[order.status]!]} Перевести в «{STATUS_LABELS[STATUS_NEXT[order.status]!]}»
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default OrdersPage;
