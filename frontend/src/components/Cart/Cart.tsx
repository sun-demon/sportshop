import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../services/api';
import { useState } from 'react';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      await createOrder(orderItems);
      clearCart();
      navigate('/orders');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Корзина пуста</h2>
        <p className="text-gray-600">Добавьте товары из каталога</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Корзина</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-gray-600">{item.product.price} ₽</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  +
                </button>
              </div>
              <div className="text-right min-w-[100px]">
                <div className="font-bold">{item.product.price * item.quantity} ₽</div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-500 text-sm hover:underline"
                  disabled={loading}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:w-80">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Итого</h2>
            <div className="flex justify-between mb-2">
              <span>Товары ({items.reduce((sum, i) => sum + i.quantity, 0)} шт.)</span>
              <span>{total} ₽</span>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>К оплате:</span>
                <span className="text-blue-600">{total} ₽</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-6 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? 'Оформление...' : 'Оформить заказ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
