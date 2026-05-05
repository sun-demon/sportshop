import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { createOrder } from '../../services/api';
import { useState } from 'react';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Корзина</h1>
        <div className="empty-cart">
          <p>Корзина пуста</p>
          <Link to="/products" className="btn btn-primary">
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Корзина</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="cart-item">
              <div className="cart-item-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder small">🏋️</div>
                )}
              </div>
              <div className="cart-item-info">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">{product.price.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="cart-item-controls">
                <button type="button" className="qty-btn" disabled={loading} onClick={() => updateQuantity(product.id, quantity - 1)}>
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button type="button" className="qty-btn" disabled={loading || quantity >= product.stock} onClick={() => updateQuantity(product.id, quantity + 1)}>
                  +
                </button>
              </div>
              <div className="cart-item-subtotal">{(product.price * quantity).toLocaleString('ru-RU')} ₽</div>
              <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={() => removeFromCart(product.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Итого</h2>
          <div className="cart-total">
            <span>Сумма:</span>
            <strong>{total.toLocaleString('ru-RU')} ₽</strong>
          </div>
          <button type="button" className="btn btn-primary btn-full" disabled={loading} onClick={handleCheckout}>
            {loading ? 'Оформление…' : 'Оформить заказ'}
          </button>
          <button type="button" className="btn btn-outline btn-full" disabled={loading} onClick={() => clearCart()}>
            Очистить корзину
          </button>
        </div>
      </div>
    </div>
  );
}
