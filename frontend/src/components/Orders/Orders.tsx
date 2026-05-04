import { useEffect, useState } from 'react';
import { getMyOrders } from '../../services/api';
import type { IOrder } from '@sportshop/shared-types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export default function Orders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">У вас пока нет заказов</h2>
        <p className="text-gray-600">Перейдите в каталог и сделайте первый заказ</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-gray-500 text-sm">Заказ #{order.id}</span>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">{order.total} ₽</div>
                <div className="text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>Товар #{item.productId} × {item.quantity}</span>
                    <span>{item.price} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
