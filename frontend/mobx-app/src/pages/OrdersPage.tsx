import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuthStore, useOrderStore } from '../stores/StoreContext';
import type { IOrder } from '../types';

const STATUS_LABELS: Record<IOrder['status'], string> = {
  pending: 'Ожидает', paid: 'Оплачен', shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменён',
};
const STATUS_NEXT: Partial<Record<IOrder['status'], IOrder['status']>> = {
  pending: 'paid', paid: 'shipped', shipped: 'delivered',
};

const OrdersPage = observer(() => {
  const auth = useAuthStore();
  const orders = useOrderStore();

  useEffect(() => {
    if (auth.isAdmin) orders.fetchAllOrders();
    else orders.fetchMyOrders();
  }, [auth.isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = auth.isAdmin ? orders.allOrders : orders.myOrders;

  return (
    <div className="container">
      <h1>{auth.isAdmin ? 'Все заказы' : 'Мои заказы'}</h1>
      {orders.isLoading && <div className="loading">Загрузка…</div>}
      {!orders.isLoading && list.length === 0 && (
        <div className="empty-message"><p>Заказов пока нет</p><Link to="/products" className="btn btn-primary">Перейти в каталог</Link></div>
      )}
      <div className="orders-list">
        {list.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <span className="order-id">Заказ #{order.id}</span>
                {auth.isAdmin && order.user && <span className="order-user"> — {order.user.email}</span>}
              </div>
              <span className={`status-badge status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
            </div>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <span>{item.product?.name ?? `Товар #${item.productId}`}</span>
                  <span>{item.quantity} × {item.price.toLocaleString('ru-RU')} ₽</span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <span className="order-total">Итого: <strong>{order.total.toLocaleString('ru-RU')} ₽</strong></span>
              <span className="order-date">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
              {auth.isAdmin && STATUS_NEXT[order.status] && (
                <button className="btn btn-outline btn-sm" onClick={() => orders.updateOrderStatus(order.id, STATUS_NEXT[order.status]!)}>
                  → {STATUS_LABELS[STATUS_NEXT[order.status]!]}
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
