import { Link } from 'react-router-dom';
import type { IOrder } from '@sportshop/mfe-store';
import {
  selectIsAdmin,
  useAppSelector,
  useGetAllOrdersQuery,
  useGetMyOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@sportshop/mfe-store';

const STATUS_LABELS: Record<IOrder['status'], string> = {
  pending: 'Ожидает',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};
const STATUS_NEXT: Partial<Record<IOrder['status'], IOrder['status']>> = {
  pending: 'paid',
  paid: 'shipped',
  shipped: 'delivered',
};

export default function OrdersPage() {
  const isAdmin = useAppSelector(selectIsAdmin);
  const { data: myOrders = [], isLoading: loadingMy } = useGetMyOrdersQuery(undefined, { skip: isAdmin });
  const { data: allOrders = [], isLoading: loadingAll } = useGetAllOrdersQuery(undefined, { skip: !isAdmin });
  const [updateStatus] = useUpdateOrderStatusMutation();

  const orders = isAdmin ? allOrders : myOrders;
  const isLoading = isAdmin ? loadingAll : loadingMy;

  async function handleStatusChange(id: number, status: IOrder['status']) {
    try {
      await updateStatus({ id, status }).unwrap();
    } catch {
      alert('Не удалось обновить статус');
    }
  }

  return (
    <div className="container">
      <h1>{isAdmin ? 'Все заказы' : 'Мои заказы'}</h1>
      {isLoading && <div className="loading">Загрузка…</div>}
      {!isLoading && orders.length === 0 && (
        <div className="empty-message">
          <p>Заказов пока нет</p>
          <Link to="/products" className="btn btn-primary">
            Перейти в каталог
          </Link>
        </div>
      )}
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <span className="order-id">Заказ #{order.id}</span>
                {isAdmin && order.user && <span className="order-user"> — {order.user.email}</span>}
              </div>
              <span className={`status-badge status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
            </div>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <span>{item.product?.name ?? `Товар #${item.productId}`}</span>
                  <span>
                    {item.quantity} × {item.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <span className="order-total">
                Итого: <strong>{order.total.toLocaleString('ru-RU')} ₽</strong>
              </span>
              <span className="order-date">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
              {isAdmin && STATUS_NEXT[order.status] && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleStatusChange(order.id, STATUS_NEXT[order.status]!)}
                >
                  → {STATUS_LABELS[STATUS_NEXT[order.status]!]}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
